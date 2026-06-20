'use client';
/* Copyright (c) 2024-present Venky Corp. */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Minus, RotateCcw, RotateCw, Square, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type DrawingTool = 'rectangle' | 'arrow' | 'text' | 'redact';

const COLORS = [
  { name: 'red', value: '#ef4444' },
  { name: 'yellow', value: '#eab308' },
  { name: 'green', value: '#22c55e' },
  { name: 'blue', value: '#3b82f6' },
] as const;

interface Point {
  x: number;
  y: number;
}

interface AnnotationEditorProps {
  screenshotDataUrl: string;
  onSave: (blob: Blob) => void;
  onCancel: () => void;
  /** Starting annotation number (continues from previous session) */
  annotationCount: number;
  /** Called when annotation count changes so parent can persist it */
  onAnnotationCountChange: (count: number) => void;
}

export function AnnotationEditor({
  screenshotDataUrl,
  onSave,
  onCancel,
  annotationCount,
  onAnnotationCountChange,
}: AnnotationEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTool, setActiveTool] = useState<DrawingTool>('rectangle');
  const [activeColor, setActiveColor] = useState<string>(COLORS[0].value);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textInput, setTextInput] = useState<{
    x: number;
    y: number;
    value: string;
    side: 'right' | 'left';
    circleX: number;
    circleY: number;
  } | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const startPointRef = useRef<Point | null>(null);
  const snapshotsRef = useRef<ImageData[]>([]);
  const redoStackRef = useRef<ImageData[]>([]);
  const annotationCountRef = useRef(annotationCount);
  const updateAnnotationCount = useCallback(
    (newCount: number) => {
      annotationCountRef.current = newCount;
      onAnnotationCountChange(newCount);
    },
    [onAnnotationCountChange],
  );
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load screenshot onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;

      // Size canvas to fit viewport while maintaining aspect ratio
      const maxW = window.innerWidth * 0.9;
      const maxH = window.innerHeight * 0.82;
      const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = screenshotDataUrl;
  }, [screenshotDataUrl]);

  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    snapshotsRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    // New action invalidates the redo stack
    redoStackRef.current.length = 0;
  }, []);

  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || snapshotsRef.current.length === 0) return;
    // Save current state to redo stack before restoring
    redoStackRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    const prev = snapshotsRef.current.pop();
    if (prev) ctx.putImageData(prev, 0, 0);
  }, []);

  const redo = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || redoStackRef.current.length === 0) return;
    // Save current state to undo stack before restoring redo
    snapshotsRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    const next = redoStackRef.current.pop();
    if (next) ctx.putImageData(next, 0, 0);
  }, []);

  const getCanvasPoint = useCallback((e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const drawNumberedCircle = useCallback(
    (ctx: CanvasRenderingContext2D, pt: Point, num: number) => {
      const radius = 14;
      // Draw filled circle
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = activeColor;
      ctx.fill();
      ctx.closePath();
      // Draw number in white
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(num), pt.x, pt.y);
      // Reset alignment for other drawing operations
      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';
    },
    [activeColor],
  );

  const drawArrow = useCallback(
    (ctx: CanvasRenderingContext2D, from: Point, to: Point) => {
      const headLen = 18;
      const angle = Math.atan2(to.y - from.y, to.x - from.x);

      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(to.x - headLen * Math.cos(angle - Math.PI / 6), to.y - headLen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(to.x - headLen * Math.cos(angle + Math.PI / 6), to.y - headLen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    },
    [activeColor],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      // Capture pointer to ensure we get all move/up events even if cursor leaves canvas
      (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const pt = getCanvasPoint(e);

      if (activeTool === 'text') {
        // Draw a numbered circle at the click point, then show text input beside it
        saveSnapshot();
        const num = annotationCountRef.current + 1;
        updateAnnotationCount(num);
        drawNumberedCircle(ctx, pt, num);

        // Determine which side to place the text input — flip to left if near right edge
        const circleRadius = 14;
        const textGap = 6;
        const textInputWidth = 200;
        const nearRightEdge = pt.x + circleRadius + textGap + textInputWidth > canvas.width;
        const side: 'left' | 'right' = nearRightEdge ? 'left' : 'right';

        const inputX =
          side === 'right' ? pt.x + circleRadius + textGap : pt.x - circleRadius - textGap - textInputWidth;

        setTextInput({ x: inputX, y: pt.y - 8, value: '', side, circleX: pt.x, circleY: pt.y });
        requestAnimationFrame(() => textInputRef.current?.focus());
        return;
      }

      saveSnapshot();
      setIsDrawing(true);
      startPointRef.current = pt;
    },
    [activeTool, getCanvasPoint, saveSnapshot, drawNumberedCircle, updateAnnotationCount],
  );

  const commitText = useCallback(() => {
    if (!textInput) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    if (textInput.value.trim()) {
      // Draw the text label next to the numbered circle (already drawn on canvas)
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = activeColor;
      ctx.textBaseline = 'middle';

      if (textInput.side === 'left') {
        // Draw text to the left of the circle, right-aligned
        ctx.textAlign = 'end';
        ctx.fillText(textInput.value, textInput.circleX - 20, textInput.circleY);
      } else {
        // Draw text to the right of the circle
        ctx.textAlign = 'start';
        ctx.fillText(textInput.value, textInput.circleX + 20, textInput.circleY);
      }

      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';
    } else {
      // No text entered — undo the circle that was already drawn
      undo();
      updateAnnotationCount(Math.max(0, annotationCountRef.current - 1));
    }
    setTextInput(null);
  }, [textInput, activeColor, undo, updateAnnotationCount]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !startPointRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const snapshots = snapshotsRef.current;
      if (snapshots.length === 0) return;

      // Restore last snapshot to preview shape
      const lastSnap = snapshots[snapshots.length - 1];
      ctx.putImageData(lastSnap, 0, 0);

      const start = startPointRef.current;
      const curr = getCanvasPoint(e);

      if (activeTool === 'rectangle') {
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(start.x, start.y, curr.x - start.x, curr.y - start.y);
      } else if (activeTool === 'arrow') {
        drawArrow(ctx, start, curr);
      } else if (activeTool === 'redact') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(start.x, start.y, curr.x - start.x, curr.y - start.y);
      }
    },
    [isDrawing, activeTool, activeColor, getCanvasPoint, drawArrow],
  );

  const onPointerUp = useCallback(() => {
    setIsDrawing(false);
    startPointRef.current = null;
  }, []);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) onSave(blob);
    }, 'image/png');
  }, [onSave]);

  return (
    <div className="feedback-block fixed inset-0 z-[9999] flex flex-col bg-black/90">
      {/* Toolbar */}
      <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 shadow-md">
        <span className="mr-2 font-medium text-sm text-zinc-300">Tools</span>

        {/* Tool buttons */}
        <button
          type="button"
          title="Rectangle"
          onClick={() => setActiveTool('rectangle')}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded text-zinc-300 transition-colors hover:bg-zinc-700',
            activeTool === 'rectangle' && 'bg-zinc-600 text-white',
          )}
        >
          <Square className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Arrow"
          onClick={() => setActiveTool('arrow')}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded text-zinc-300 transition-colors hover:bg-zinc-700',
            activeTool === 'arrow' && 'bg-zinc-600 text-white',
          )}
        >
          <Minus className="h-4 w-4 rotate-[-45deg]" />
        </button>
        <button
          type="button"
          title="Text"
          onClick={() => setActiveTool('text')}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded text-zinc-300 transition-colors hover:bg-zinc-700',
            activeTool === 'text' && 'bg-zinc-600 text-white',
          )}
        >
          <Type className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Redact"
          onClick={() => setActiveTool('redact')}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded text-zinc-300 transition-colors hover:bg-zinc-700',
            activeTool === 'redact' && 'bg-zinc-600 text-white',
          )}
        >
          <span className="font-bold text-xs">R</span>
        </button>

        <div className="mx-2 h-6 w-px bg-zinc-700" />

        {/* Color picker */}
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              onClick={() => setActiveColor(c.value)}
              className={cn(
                'h-5 w-5 rounded-full border-2 transition-transform hover:scale-110',
                activeColor === c.value ? 'scale-110 border-white' : 'border-transparent',
              )}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>

        <div className="mx-2 h-6 w-px bg-zinc-700" />

        {/* Undo / Redo */}
        <button
          type="button"
          title="Undo"
          onClick={undo}
          className="flex h-8 w-8 items-center justify-center rounded text-zinc-300 transition-colors hover:bg-zinc-700"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Redo"
          onClick={redo}
          className="flex h-8 w-8 items-center justify-center rounded text-zinc-300 transition-colors hover:bg-zinc-700"
        >
          <RotateCw className="h-4 w-4" />
        </button>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-zinc-300 hover:text-white">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Done
          </Button>
        </div>
      </div>

      {/* Canvas area */}
      <div ref={containerRef} className="relative flex flex-1 items-center justify-center overflow-auto p-4">
        <canvas
          ref={canvasRef}
          className="cursor-crosshair rounded shadow-2xl"
          style={{ touchAction: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
        {/* Inline text input — positioned over the canvas relative to the canvas element */}
        {textInput &&
          canvasRef.current &&
          (() => {
            const canvasRect = canvasRef.current.getBoundingClientRect();
            const containerRect = containerRef.current?.getBoundingClientRect();
            if (!containerRect) return null;
            // Offset: canvas position relative to container
            const offsetX = canvasRect.left - containerRect.left;
            const offsetY = canvasRect.top - containerRect.top;

            return (
              <input
                ref={textInputRef}
                type="text"
                value={textInput.value}
                onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitText();
                  if (e.key === 'Escape') {
                    undo();
                    updateAnnotationCount(Math.max(0, annotationCountRef.current - 1));
                    setTextInput(null);
                  }
                }}
                onBlur={commitText}
                className="absolute border-none bg-transparent outline-none"
                style={{
                  left: offsetX + textInput.x,
                  top: offsetY + textInput.y,
                  color: activeColor,
                  font: 'bold 16px sans-serif',
                  width: 200,
                  textAlign: textInput.side === 'left' ? 'right' : 'left',
                }}
                placeholder="Type here..."
              />
            );
          })()}
      </div>
    </div>
  );
}
