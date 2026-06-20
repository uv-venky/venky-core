/* Copyright (c) 2024-present VENKY Corp. */
'use client';

import type React from 'react';
import { memo, Suspense } from 'react';
import type { ExcelUploadProps } from '@/components/core/excel-upload/types';
import ExcelUploadLazy from '@/components/core/excel-upload/excel-upload-lazy';

function ExcelUpload<T extends object>(props: ExcelUploadProps<T>) {
  return (
    <Suspense fallback={<div>Loading ClientSideExcelUploadLazy...</div>}>
      <ExcelUploadLazy {...props} />
    </Suspense>
  );
}

export default memo(ExcelUpload) as <T extends object>(props: ExcelUploadProps<T>) => React.ReactNode;
