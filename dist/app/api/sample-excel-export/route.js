import { newClient } from '../../../lib/core/server/db';
import QueryStream from 'pg-query-stream';
import logger from '../../../lib/core/server/logger';
import ExcelJS from 'exceljs';
import { Readable, PassThrough } from 'node:stream';
import { RolesDS } from '../../../lib/server/ds/defs/core/RolesDS';
import { auth } from '../../../auth';
import { QueryBuilder } from '../../../lib/core/server/ds/QueryBuilder';
import { isAbortedRequestError } from '../../../lib/core/common/error';
export async function POST(req) {
  const session = await auth();
  if (!session) {
    return Response.json({ status: 'ERROR', message: 'Not authenticated' }, { status: 401 });
  }
  let query;
  try {
    query = await req.json();
  } catch (error) {
    if (isAbortedRequestError(error)) {
      // Return empty response for aborted requests - no logging needed
      return new Response(null, { status: 499 }); // 499 Client Closed Request
    }
    logger.error('Failed to parse request body:', error);
    return Response.json({ status: 'ERROR', message: 'Invalid request body' }, { status: 400 });
  }
  const client = await newClient();
  logger.setContext('apiName', 'sample-excel-export');
  if (logger.debugEnabled) {
    logger.debug('Export query', query);
  }
  try {
    const qb = new QueryBuilder(RolesDS, session);
    qb.applyQuery(query);
    qb.skipPagination = true;
    const sql = qb.getQuery();
    const params = qb.getParams();
    if (process.env.NODE_ENV === 'development') {
      logger.info(`excel-export sql: ${sql}`);
      logger.info(`excel-export params: ${params}`);
    }
    const qs = new QueryStream(sql, params); // customize your query
    const dbStream = client.query(qs);
    const passThrough = new PassThrough();
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: passThrough,
    });
    const sheet = workbook.addWorksheet(`Deal Types ${new Date().toLocaleString()}`, {
      views: [{ state: 'frozen', ySplit: 1 }],
      pageSetup: {
        orientation: 'landscape',
      },
    });
    const columns = [
      {
        header: 'Role Name',
        key: 'roleName',
        width: 32,
      },
      { header: 'Role Code', key: 'roleCode', width: 12 },
    ];
    sheet.columns = columns;
    dbStream.on('data', (row) => {
      sheet.addRow(row).commit();
    });
    dbStream.on('error', (err) => {
      logger.error('DB stream error:', err);
      passThrough.destroy(err);
      client.release();
    });
    dbStream.on('end', async () => {
      await workbook.commit();
      client.release();
    });
    // Convert Node stream -> Web ReadableStream
    const webStream = Readable.toWeb(passThrough);
    return new Response(webStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="export.xlsx"',
      },
    });
  } catch (err) {
    client.release();
    logger.error('Unexpected error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
/*
  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/excel-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // any filters you need, e.g. startDate, endDate
        } satisfies Query<DealTypes>),
      });

      if (!res.ok) {
        console.error('Export failed', await res.text());
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'export.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  <Button
    data-tip="Download data to Excel"
    variant="outline"
    size="icon"
    disabled={loading}
    onClick={handleDownload}
  >
    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DownloadIcon className="h-4 w-4" />}
  </Button>
*/
//# sourceMappingURL=route.js.map
