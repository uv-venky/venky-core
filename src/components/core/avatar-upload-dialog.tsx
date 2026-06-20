import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Loader2Icon } from 'lucide-react';

interface AvatarUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (dataUrl: string) => Promise<void> | void;
  initialImage?: string | null;
}

export default function AvatarUploadDialog({ open, onOpenChange, onSave, initialImage }: AvatarUploadDialogProps) {
  // console.log({ open, initialImage });
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage ?? null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImageSrc(e.target.result as string);
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
    if (!imageSrc || !containerRef.current || !imgRef.current) return;
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
      if (!ctx) return;

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
    } finally {
      setIsSaving(false);
    }
  };

  const handleSliderChange = (v: number[]) => {
    setScale(v[0]);
    if (transformRef.current) {
      transformRef.current.setTransform(position.x, position.y, v[0], 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex min-w-[800px] flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Upload Avatar</DialogTitle>
        </DialogHeader>
        {!imageSrc && (
          <div
            {...getRootProps()}
            className="flex h-40 cursor-pointer items-center justify-center rounded-md border border-dashed p-4 text-sm"
            data-testid="avatar-dropzone"
          >
            <input {...getInputProps()} data-testid="avatar-file-input" />
            {isDragActive ? 'Drop the files here...' : 'Drag and drop an image here, or click to select'}
          </div>
        )}
        {imageSrc && (
          <div {...getRootProps()} className="flex flex-col items-center gap-4">
            <div ref={containerRef} className="relative h-72 w-72 overflow-hidden rounded-md">
              <TransformWrapper
                ref={transformRef}
                minScale={1}
                centerOnInit
                maxScale={3}
                initialScale={1}
                onZoomStop={(ref) => setScale(ref.state.scale)}
                onPanningStop={(ref) =>
                  setPosition({
                    x: ref.state.positionX,
                    y: ref.state.positionY,
                  })
                }
                onTransformed={(ref) => {
                  setScale(ref.state.scale);
                  setPosition({
                    x: ref.state.positionX,
                    y: ref.state.positionY,
                  });
                }}
              >
                <TransformComponent wrapperClass="h-72! w-72!">
                  {imageSrc && (
                    // biome-ignore lint/performance/noImgElement: framework-agnostic, no next/image
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      alt="Avatar"
                      width={288}
                      height={288}
                      className="select-none"
                      draggable={false}
                    />
                  )}
                </TransformComponent>
              </TransformWrapper>
              <div
                className="pointer-events-none absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-primary"
                aria-hidden="true"
              />
            </div>
            <Slider min={1} max={3} step={0.1} value={[scale]} onValueChange={handleSliderChange} />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="avatar-cancel">
            Cancel
          </Button>
          {imageSrc && (
            <Button disabled={isSaving} onClick={handleSave} data-testid="avatar-save">
              {isSaving && <Loader2Icon />} Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
