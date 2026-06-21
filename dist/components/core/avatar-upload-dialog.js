import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Slider } from '../../components/ui/slider';
import { Loader2Icon } from 'lucide-react';
export default function AvatarUploadDialog({ open, onOpenChange, onSave, initialImage }) {
    // console.log({ open, initialImage });
    const [imageSrc, setImageSrc] = useState(initialImage ?? null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);
    const imgRef = useRef(null);
    const transformRef = useRef(null);
    const [isSaving, setIsSaving] = useState(false);
    const onDrop = useCallback((files) => {
        const file = files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setImageSrc(e.target.result);
                }
            };
            reader.readAsDataURL(file);
        }
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'image/*': [] },
    });
    useEffect(() => {
        if (!open) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
            setImageSrc(initialImage ?? null);
        }
    }, [open, initialImage]);
    const handleSave = async () => {
        if (!imageSrc || !containerRef.current || !imgRef.current)
            return;
        setIsSaving(true);
        try {
            const img = imgRef.current;
            await img.decode();
            const containerRect = containerRef.current.getBoundingClientRect();
            const cropSize = containerRect.width;
            const canvas = document.createElement('canvas');
            canvas.width = cropSize;
            canvas.height = cropSize;
            const ctx = canvas.getContext('2d');
            if (!ctx)
                return;
            const scaleX = cropSize / img.naturalWidth;
            const x = -position.x / scale / scaleX;
            const y = -position.y / scale / scaleX;
            const w = cropSize / scale / scaleX;
            const h = cropSize / scale / scaleX;
            ctx.clearRect(0, 0, cropSize, cropSize);
            ctx.drawImage(img, x, y, w, h, 0, 0, cropSize, cropSize);
            const dataUrl = canvas.toDataURL('image/png');
            await onSave(dataUrl);
            onOpenChange(false);
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleSliderChange = (v) => {
        setScale(v[0]);
        if (transformRef.current) {
            transformRef.current.setTransform(position.x, position.y, v[0], 200);
        }
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "flex min-w-[800px] flex-col gap-4", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Upload Avatar" }) }), !imageSrc && (_jsxs("div", { ...getRootProps(), className: "flex h-40 cursor-pointer items-center justify-center rounded-md border border-dashed p-4 text-sm", "data-testid": "avatar-dropzone", children: [_jsx("input", { ...getInputProps(), "data-testid": "avatar-file-input" }), isDragActive ? 'Drop the files here...' : 'Drag and drop an image here, or click to select'] })), imageSrc && (_jsxs("div", { ...getRootProps(), className: "flex flex-col items-center gap-4", children: [_jsxs("div", { ref: containerRef, className: "relative h-72 w-72 overflow-hidden rounded-md", children: [_jsx(TransformWrapper, { ref: transformRef, minScale: 1, centerOnInit: true, maxScale: 3, initialScale: 1, onZoomStop: (ref) => setScale(ref.state.scale), onPanningStop: (ref) => setPosition({
                                        x: ref.state.positionX,
                                        y: ref.state.positionY,
                                    }), onTransformed: (ref) => {
                                        setScale(ref.state.scale);
                                        setPosition({
                                            x: ref.state.positionX,
                                            y: ref.state.positionY,
                                        });
                                    }, children: _jsx(TransformComponent, { wrapperClass: "h-72! w-72!", children: imageSrc && (_jsx("img", { ref: imgRef, src: imageSrc, alt: "Avatar", width: 288, height: 288, className: "select-none", draggable: false })) }) }), _jsx("div", { className: "pointer-events-none absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-primary", "aria-hidden": "true" })] }), _jsx(Slider, { min: 1, max: 3, step: 0.1, value: [scale], onValueChange: handleSliderChange })] })), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), "data-testid": "avatar-cancel", children: "Cancel" }), imageSrc && (_jsxs(Button, { disabled: isSaving, onClick: handleSave, "data-testid": "avatar-save", children: [isSaving && _jsx(Loader2Icon, {}), " Save"] }))] })] }) }));
}
//# sourceMappingURL=avatar-upload-dialog.js.map