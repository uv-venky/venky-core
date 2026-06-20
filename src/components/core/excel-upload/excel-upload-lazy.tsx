/* Copyright (c) 2024-present VENKY Corp. */
'use client';

import clsx from 'clsx';
import type React from 'react';
import { memo, useState } from 'react';
import { type FileRejection, useDropzone } from 'react-dropzone';
import { processCSV } from '@/components/core/excel-upload/processCSV';
import { processExcel } from '@/components/core/excel-upload/processExcel';
import { useEvent } from '@/components/core/hooks/useEvent';
import { showError } from '@/components/core/common/Notification';
import { getErrorMessage, UserError } from '@/lib/core/common/error';
import { cn } from '@/lib/utils';
import type { ExcelUploadProps } from '@/components/core/excel-upload/types';
import type { Row } from '@/lib/core/common/ds/types/filter';

function ExcelUpload<T extends object>(props: ExcelUploadProps<T>) {
  const {
    className,
    store,
    maxRows,
    callbackFunction,
    defaultFunction,
    dateFormat,
    dateTimeFormat,
    ref,
    onComplete,
    onError,
  } = props;
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useEvent(async <F extends File>(acceptedFiles: F[], fileRejections: FileRejection[]) => {
    try {
      if (fileRejections.length) {
        setFile(null);
        if (fileRejections.length > 1 || acceptedFiles.length) {
          throw new UserError('You must upload only a single file!');
        } else {
          const f = fileRejections[0];
          throw new UserError(`${f.file.name} is rejected! ${f.errors.map((e) => e.message).join(', ')}!`);
        }
      } else if (store && acceptedFiles.length === 1) {
        await store.init();

        const attrs = store.attributes();
        const pkAttrs = store.pkAttributes();
        let records: Row<T>[] = [];
        const f = acceptedFiles[0];

        if (f.name.endsWith('.xlsx') || f.name.endsWith('.xls')) {
          records = await processExcel<T>({
            attrs,
            dateFormat,
            dateTimeFormat,
            defaultFunction,
            file: f,
            maxRows,
            pkAttrs,
          });
        } else if (f.name.endsWith('.csv')) {
          records = await processCSV<T>({
            attrs,
            dateFormat,
            dateTimeFormat,
            defaultFunction,
            file: f,
            maxRows,
            pkAttrs,
          });
        } else {
          throw new Error(`File ${f.name} is not a valid Excel or CSV file!`);
        }
        setFile(f);
        if (callbackFunction) {
          const result = await callbackFunction<T>({
            records,
            fileName: f.name,
            fileType: f.type,
            fileSize: f.size,
          });
          if (result.status === 'SUCCESS') {
            if (Array.isArray(result.result)) {
              store.createNewBulk(result.result as T[], true);
              onComplete?.();
            } else {
              throw new UserError(
                `Developer Error: Callback function ${callbackFunction} must return an array of records! Instead it returned ${JSON.stringify(
                  result.result,
                )}`,
              );
            }
          } else if (result.status === 'ERROR') {
            throw new UserError(result.error || 'File upload failed during callback processing.');
          }
        } else {
          store.createNewBulk(records as T[], true);
          onComplete?.();
        }
      }
    } catch (e) {
      const err = getErrorMessage(e);
      showError(err);
      setFile(null);
      onError?.(err);
    }
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: !store,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
  });

  return (
    <div ref={ref} className={clsx('flex w-full flex-1 items-center gap-2', className)}>
      <div
        {...getRootProps()}
        className={clsx(
          'relative flex min-h-[35px] w-full cursor-pointer items-center justify-start overflow-hidden rounded-md border-2 border-divider border-dashed bg-accent p-2',
          {
            'border-green-500': isDragActive,
            'border-green-200': !!file,
          },
        )}
      >
        <input data-testid="excel-upload-input" {...getInputProps()} />
        <div className={cn('flex w-full items-center justify-center text-center text-green-400 text-sm')}>
          {isDragActive ? 'Drop it now...' : 'Drag and drop an Excel or CSV file here...'}
        </div>
      </div>
    </div>
  );
}

export default memo(ExcelUpload) as <T extends object>(props: ExcelUploadProps<T>) => React.ReactNode;
