import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Slider } from './slider';
export default function AvatarUploadDialog({ open, onOpenChange, onSave, initialImage }) {
    const [imageSrc, setImageSrc] = useState(initialImage ?? null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);
    const imgRef = useRef(null);
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
        const img = imgRef.current;
        await img.decode();
        const containerRect = containerRef.current.getBoundingClientRect();
        const cropSize = 256;
        const offsetX = (containerRect.width - cropSize) / 2;
        const offsetY = (containerRect.height - cropSize) / 2;
        const canvas = document.createElement('canvas');
        canvas.width = cropSize;
        canvas.height = cropSize;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const sx = (offsetX - position.x) / scale;
        const sy = (offsetY - position.y) / scale;
        const scaleX = img.naturalWidth / containerRect.width;
        const scaleY = img.naturalHeight / containerRect.height;
        ctx.drawImage(img, sx * scaleX, sy * scaleY, (cropSize / scale) * scaleX, (cropSize / scale) * scaleY, 0, 0, cropSize, cropSize);
        const dataUrl = canvas.toDataURL('image/png');
        await onSave(dataUrl);
        onOpenChange(false);
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "flex flex-col gap-4", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Upload Avatar" }) }), !imageSrc && (_jsxs("div", { ...getRootProps(), className: "flex h-40 cursor-pointer items-center justify-center rounded-md border border-dashed p-4 text-sm", children: [_jsx("input", { ...getInputProps() }), isDragActive ? 'Drop the files here...' : 'Drag and drop an image here, or click to select'] })), imageSrc && (_jsxs("div", { className: "flex flex-col items-center gap-4", children: [_jsxs("div", { ref: containerRef, className: "relative h-72 w-72 overflow-hidden rounded-md", children: [_jsx(TransformWrapper, { minScale: 1, maxScale: 3, initialScale: 1, onZoomStop: (ref) => setScale(ref.state.scale), onPanningStop: (ref) => setPosition({
                                        x: ref.state.positionX,
                                        y: ref.state.positionY,
                                    }), onTransformed: (ref) => {
                                        setScale(ref.state.scale);
                                        setPosition({
                                            x: ref.state.positionX,
                                            y: ref.state.positionY,
                                        });
                                    }, children: _jsx(TransformComponent, { children: _jsx("img", { ref: imgRef, src: imageSrc, alt: "Avatar", className: "select-none", draggable: false }) }) }), _jsx("div", { className: "pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-primary", "aria-hidden": "true" })] }), _jsx(Slider, { min: 1, max: 3, step: 0.1, value: [scale], onValueChange: (v) => setScale(v[0]) })] })), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }), imageSrc && _jsx(Button, { onClick: handleSave, children: "Save" })] })] }) }));
}
//# sourceMappingURL=avatar-upload-dialog.js.map