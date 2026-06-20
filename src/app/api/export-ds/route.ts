import { newClient } from '@/lib/core/server/db';
import QueryStream from 'pg-query-stream';
import { stringify } from 'csv-stringify';
import { Readable, Transform, Writable } from 'node:stream';
import { format } from 'date-fns';
import { QueryBuilder } from '@/lib/core/server/ds/QueryBuilder';
import type { Query } from '@/lib/core/common/ds/types/filter';
import { getDataSource } from '@/lib/server/ds/defs/ds';
import logger from '@/lib/core/server/logger';
import { auth } from '@/auth';
import { isAbortedRequestError } from '@/lib/core/common/error';
import ExcelJS from 'exceljs';
import { PassThrough } from 'node:stream';
import { formatExportMetadata } from './export-metadata';

const THIN_BORDER = {
  top: { style: 'thin' as const },
  left: { style: 'thin' as const },
  bottom: { style: 'thin' as const },
  right: { style: 'thin' as const },
};

const HEADER_FILL = {
  type: 'pattern' as const,
  pattern: 'solid' as const,
  fgColor: { argb: 'FF475569' },
};

const HEADER_FONT = {
  bold: true,
  color: { argb: 'FFFFFFFF' },
  size: 11,
};

const METADATA_FILL = {
  type: 'pattern' as const,
  pattern: 'solid' as const,
  fgColor: { argb: 'FFF1F5F9' },
};

const METADATA_FONT = {
  size: 10,
  color: { argb: 'FF64748B' },
};

function styleHeaderRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.border = THIN_BORDER;
    cell.alignment = { vertical: 'middle' as const };
  });
}

function styleMetadataRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = METADATA_FILL;
    cell.font = METADATA_FONT;
  });
}

function styleDataRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.border = THIN_BORDER;
  });
}

type Payload = {
  datasourceId: string;
  query: Query<any>;
  columns?: { code: string; label?: string }[];
  format?: 'csv' | 'xlsx';
  includeMetadata?: boolean;
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ status: 'ERROR', message: 'Not authenticated' }, { status: 401 });
  }

  let body: Payload;

  try {
    body = (await req.json()) as Payload;
  } catch (error) {
    if (isAbortedRequestError(error)) {
      // Return empty response for aborted requests - no logging needed
      return new Response(null, { status: 499 }); // 499 Client Closed Request
    }
    logger.error('Failed to parse request body:', error);
    return Response.json({ status: 'ERROR', message: 'Invalid request body' }, { status: 400 });
  }

  const { datasourceId, query, columns, format: exportFormat = 'csv', includeMetadata = false } = body;
  const client = await newClient();

  logger.setContext('apiName', 'export-ds');
  logger.setContext('dataSource', datasourceId);

  try {
    const ds = getDataSource<any>(datasourceId);
    if (!ds) {
      return Response.json({ status: 'ERROR', message: `Data source ${datasourceId} not found!` }, { status: 404 });
    }
    const qb = new QueryBuilder(ds, session);
    let q = { ...query } as Query<any>;
    if (ds.preQuery) {
      q = await ds.preQuery({ query: q, session, client });
    }
    if (columns?.length && !ds.postQuery && !q.groupBy?.length && !q.aggregate?.length) {
      q.select = columns.map((c) => c.code) as string[];
    }
    qb.applyQuery(q);
    qb.skipPagination = true;
    let sql = qb.getQuery();
    let params = qb.getParams();
    if (ds.preQuery2) {
      ({ sql, params } = ds.preQuery2({
        query: q,
        sql,
        params,
        session,
        client,
      }));
    }
    if (logger.debugEnabled) {
      logger.debug('Export SQL', { sql, params });
    }
    const qs = new QueryStream(sql, params);
    const dbStream = client.query(qs);

    const transformStream = new Transform({
      objectMode: true,
      async transform(this: Transform, row, _enc, callback) {
        try {
          let processedRow = row;
          if (ds.postQuery) {
            const rows = await ds.postQuery({
              rows: [row],
              query: q,
              session,
              client,
            });
            if (rows.length === 0) {
              callback();
              return;
            }
            const [first, ...rest] = rows;
            rest.forEach((r: unknown) => {
              this.push(r);
            });
            processedRow = first;
          }

          // Process all keys in the row (not just ds.attributes)
          for (const key in processedRow) {
            const val = processedRow[key];

            // Format dates
            if (val instanceof Date) {
              processedRow[key] = format(val, 'yyyy-MM-dd');
            }

            // Convert booleans to string
            if (typeof val === 'boolean') {
              processedRow[key] = val ? 'true' : 'false';
            }
          }

          callback(null, processedRow);
        } catch (err) {
          callback(err as Error);
        }
      },
    });

    if (exportFormat === 'xlsx') {
      const passThrough = new PassThrough();
      const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
        stream: passThrough,
        useStyles: true,
      });
      const sheet = workbook.addWorksheet('Export', {
        views: [{ state: 'frozen', ySplit: includeMetadata ? 6 : 1 }],
      });
      const excelColumns = columns?.length ? columns.map((c) => ({ header: c.label ?? c.code, key: c.code })) : [];

      if (includeMetadata) {
        const exportedAt = new Date();
        const exportedBy = session.user.name ?? session.user.userName;
        const metadataLines = formatExportMetadata({
          datasourceId,
          exportedAt,
          exportedBy,
          filters: q.filters,
        });
        for (const line of metadataLines) {
          const metaRow = sheet.addRow([line]);
          styleMetadataRow(metaRow);
          metaRow.commit();
        }
        sheet.addRow([]).commit();
      }

      if (excelColumns.length) {
        const headerRow = sheet.addRow(excelColumns.map((c) => c.header));
        styleHeaderRow(headerRow);
        headerRow.commit();
      }

      const excelWritable = new Writable({
        objectMode: true,
        write(row: Record<string, unknown>, _enc, callback) {
          if (excelColumns.length) {
            const values = excelColumns.map((c) => {
              const v = row[c.key];
              return v === null || v === undefined ? '' : v;
            });
            const dataRow = sheet.addRow(values);
            styleDataRow(dataRow);
            dataRow.commit();
          } else {
            const dataRow = sheet.addRow(row);
            styleDataRow(dataRow);
            dataRow.commit();
          }
          callback();
        },
      });

      excelWritable.on('finish', () => {
        workbook.commit();
      });

      dbStream.on('error', (err) => {
        logger.error('DB stream error:', err);
        excelWritable.destroy(err);
        passThrough.destroy(err);
        client.release();
      });
      dbStream.on('end', () => {
        client.release();
      });

      dbStream.pipe(transformStream).pipe(excelWritable);
      const webStream = Readable.toWeb(passThrough) as globalThis.ReadableStream<Uint8Array>;

      return new Response(webStream, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="export.xlsx"',
        },
      });
    }

    const csvStream = stringify({
      header: true,
      columns: columns?.length ? columns.map((c) => ({ key: c.code, header: c.label ?? c.code })) : undefined,
      cast: {
        boolean: (value) => (value ? 'true' : 'false'),
      },
    });

    dbStream.on('error', (err) => {
      logger.error('DB stream error:', err);
      csvStream.destroy(err);
      client.release();
    });
    dbStream.on('end', () => {
      client.release();
    });

    let csvOutput: globalThis.ReadableStream<Uint8Array>;
    if (includeMetadata) {
      const exportedAt = new Date();
      const exportedBy = session.user.name ?? session.user.userName;
      const metadataLines = formatExportMetadata({
        datasourceId,
        exportedAt,
        exportedBy,
        filters: q.filters,
      })
        .map((l) => `# ${l}`)
        .join('\n')
        .concat('\n\n');
      let first = true;
      const prependTransform = new Transform({
        transform(chunk: Buffer, _enc, callback) {
          if (first) {
            first = false;
            this.push(Buffer.from(metadataLines, 'utf-8'));
          }
          this.push(chunk);
          callback();
        },
      });
      csvStream.pipe(prependTransform);
      csvOutput = Readable.toWeb(prependTransform) as globalThis.ReadableStream<Uint8Array>;
    } else {
      csvOutput = Readable.toWeb(csvStream) as globalThis.ReadableStream<Uint8Array>;
    }

    dbStream.pipe(transformStream).pipe(csvStream);

    return new Response(csvOutput, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="export.csv"',
      },
    });
  } catch (err) {
    client.release();
    logger.error('Unexpected error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export const runtime = 'nodejs';
