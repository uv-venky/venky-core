/* Copyright (c) 2024-present VENKY Corp. */
'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import { memo, Suspense } from 'react';
import ExcelUploadLazy from '../../../components/core/excel-upload/excel-upload-lazy';
function ExcelUpload(props) {
  return _jsx(Suspense, {
    fallback: _jsx('div', { children: 'Loading ClientSideExcelUploadLazy...' }),
    children: _jsx(ExcelUploadLazy, { ...props }),
  });
}
export default memo(ExcelUpload);
//# sourceMappingURL=excel-upload.js.map
