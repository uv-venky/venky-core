import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Slider } from './slider';

interface AvatarUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (dataUrl: string) => Promise<void> | void;
  initialImage?: string | null;
}

export default function AvatarUploadDialog({ open, onOpenChange, onSave, initialImage }: AvatarUploadDialogProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage ?? null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

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
    if (!ctx) return;
    const sx = (offsetX - position.x) / scale;
    const sy = (offsetY - position.y) / scale;
    const scaleX = img.naturalWidth / containerRect.width;
    const scaleY = img.naturalHeight / containerRect.height;
    ctx.drawImage(
      img,
      sx * scaleX,
      sy * scaleY,
      (cropSize / scale) * scaleX,
      (cropSize / scale) * scaleY,
      0,
      0,
      cropSize,
      cropSize,
    );
    const dataUrl = canvas.toDataURL('image/png');
    await onSave(dataUrl);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Upload Avatar</DialogTitle>
        </DialogHeader>
        {!imageSrc && (
          <div
            {...getRootProps()}
            className="flex h-40 cursor-pointer items-center justify-center rounded-md border border-dashed p-4 text-sm"
          >
            <input {...getInputProps()} />
            {isDragActive ? 'Drop the files here...' : 'Drag and drop an image here, or click to select'}
          </div>
        )}
        {imageSrc && (
          <div className="flex flex-col items-center gap-4">
            <div ref={containerRef} className="relative h-72 w-72 overflow-hidden rounded-md">
              <TransformWrapper
                minScale={1}
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
                <TransformComponent>
                  {/** biome-ignore lint/performance/noImgElement: it's ok here */}
                  <img ref={imgRef} src={imageSrc} alt="Avatar" className="select-none" draggable={false} />
                </TransformComponent>
              </TransformWrapper>
              <div
                className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-primary"
                aria-hidden="true"
              />
            </div>
            <Slider min={1} max={3} step={0.1} value={[scale]} onValueChange={(v) => setScale(v[0])} />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {imageSrc && <Button onClick={handleSave}>Save</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
