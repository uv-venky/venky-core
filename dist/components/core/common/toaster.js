'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { Toaster } from '../../../components/ui/sonner';
import { useClientSessionSnapshot } from '../../../components/core/hooks/useClientSessionSnapshot';
export default function ToasterComponent() {
    const { settings } = useClientSessionSnapshot();
    return (_jsx(Toaster, { richColors: true, closeButton: true, position: settings.notificationLocation ?? 'bottom-right', className: "pointer-events-auto" }));
}
//# sourceMappingURL=toaster.js.map