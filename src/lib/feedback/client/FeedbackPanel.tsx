'use client';
/* Copyright (c) 2024-present Venky Corp. */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bug, CheckCircle, ChevronLeft, Lightbulb, MessageSquare, RefreshCw, Video, X } from 'lucide-react';
import type { eventWithTime } from '@rrweb/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FEEDBACK_TYPES, type FeedbackType } from '../common/types';
import { blobToDataUrl } from './screenshot';
import { useFeedback, useFeedbackRequired } from './useFeedback';
import { AnnotationEditor } from './AnnotationEditor';
import { RecordingSection } from './RecordingSection';
import { DiagnosticsPreview } from './DiagnosticsPreview';
import { getRecordingDuration } from './trimEvents';

type PanelStep = 'type-select' | 'form' | 'submitting' | 'success';

interface TypeOption {
  type: FeedbackType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const TYPE_OPTIONS: TypeOption[] = [
  {
    type: FEEDBACK_TYPES.bug,
    label: 'Bug Report',
    description: 'Something is broken or not working as expected',
    icon: <Bug className="h-5 w-5 text-destructive" />,
  },
  {
    type: FEEDBACK_TYPES.feature_request,
    label: 'Feature Request',
    description: 'Suggest a new feature or improvement',
    icon: <Lightbulb className="h-5 w-5 text-amber-500" />,
  },
  {
    type: FEEDBACK_TYPES.feedback,
    label: 'General Feedback',
    description: 'Share your thoughts or suggestions',
    icon: <MessageSquare className="h-5 w-5 text-blue-500" />,
  },
];

export function FeedbackPanel() {
  const ctx = useFeedback();
  if (!ctx) return null;
  return <FeedbackPanelInner />;
}

function FeedbackPanelInner() {
  const { config, isOpen, selectedType, close, submit, captureScreenshot, getFrozenEvents, isRecording } =
    useFeedbackRequired();

  const [step, setStep] = useState<PanelStep>('type-select');
  const [formType, setFormType] = useState<FeedbackType | null>(selectedType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshotBlob, setScreenshotBlob] = useState<Blob | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [annotationBlob, setAnnotationBlob] = useState<Blob | null>(null);
  const [showAnnotation, setShowAnnotation] = useState(false);
  const showAnnotationRef = useRef(false);
  const setShowAnnotationSafe = useCallback((val: boolean) => {
    showAnnotationRef.current = val;
    setShowAnnotation(val);
  }, []);
  const [annotationCount, setAnnotationCount] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Opt-out controls
  const [includeScreenshot, setIncludeScreenshot] = useState(true);
  const [includeRecording, setIncludeRecording] = useState(true);
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);

  // Trim controls
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  const triggerScreenshot = useCallback(async () => {
    setIsCapturing(true);
    const feedbackEls = document.querySelectorAll('.feedback-block') as NodeListOf<HTMLElement>;
    const overlayEl = document.querySelector('[data-vaul-overlay]') as HTMLElement | null;

    try {
      feedbackEls.forEach((el) => {
        el.style.visibility = 'hidden';
      });
      if (overlayEl) overlayEl.style.visibility = 'hidden';

      await new Promise((r) => setTimeout(r, 100));

      const blob = await captureScreenshot();
      setScreenshotBlob(blob);
      const url = await blobToDataUrl(blob);
      setScreenshotUrl(url);
      setAnnotationBlob(null);
    } catch (err) {
      console.error('Screenshot capture failed:', err);
    } finally {
      feedbackEls.forEach((el) => {
        el.style.visibility = '';
      });
      if (overlayEl) overlayEl.style.visibility = '';
      setIsCapturing(false);
    }
  }, [captureScreenshot]);

  // Reset state when panel opens/closes
  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      setIncludeScreenshot(true);
      setIncludeRecording(true);

      // Compute default trim values from frozen events
      if (isRecording) {
        const events = getFrozenEvents();
        if (events.length >= 2) {
          const duration = getRecordingDuration(events as eventWithTime[]);
          setTrimStart(Math.max(0, duration - 2 * 60 * 1000)); // last 2 minutes
          setTrimEnd(duration);
        }
      }

      if (selectedType) {
        setFormType(selectedType);
        setStep('form');
        triggerScreenshot();
      } else {
        setStep('type-select');
        setFormType(null);
      }
    } else {
      const t = setTimeout(() => {
        setStep('type-select');
        setFormType(null);
        setTitle('');
        setDescription('');
        setScreenshotBlob(null);
        setScreenshotUrl(null);
        setAnnotationBlob(null);
        setShowAnnotationSafe(false);
        setSubmitError(null);
        setIncludeScreenshot(true);
        setIncludeRecording(true);
        setTrimStart(0);
        setTrimEnd(0);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, selectedType, triggerScreenshot, isRecording, getFrozenEvents, setShowAnnotationSafe]);

  const handleTypeSelect = useCallback(
    async (type: FeedbackType) => {
      setFormType(type);
      setStep('form');
      await triggerScreenshot();
    },
    [triggerScreenshot],
  );

  const handleBack = useCallback(() => {
    setStep('type-select');
    setFormType(null);
    setTitle('');
    setDescription('');
    setScreenshotBlob(null);
    setScreenshotUrl(null);
    setAnnotationBlob(null);
    setShowAnnotationSafe(false);
    setSubmitError(null);
  }, [setShowAnnotationSafe]);

  const handleAnnotationSave = useCallback(
    async (blob: Blob) => {
      setAnnotationBlob(blob);
      const url = await blobToDataUrl(blob);
      setScreenshotUrl(url);
      setShowAnnotationSafe(false);
    },
    [setShowAnnotationSafe],
  );

  const handleSubmit = useCallback(async () => {
    if (!formType || !title.trim()) return;
    setStep('submitting');
    setSubmitError(null);
    try {
      await submit({
        type: formType,
        title: title.trim(),
        description: description.trim() || undefined,
        screenshotBlob: annotationBlob ?? screenshotBlob ?? undefined,
        annotationBlob: annotationBlob ?? undefined,
        includeScreenshot,
        includeRecording,
        includeDiagnostics,
        trimWindow: includeRecording ? { startMs: trimStart, endMs: trimEnd } : undefined,
      });
      setStep('success');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStep('form');
    }
  }, [
    formType,
    title,
    description,
    annotationBlob,
    screenshotBlob,
    submit,
    includeScreenshot,
    includeRecording,
    includeDiagnostics,
    trimStart,
    trimEnd,
  ]);

  const enabledTypes = config.widget.types;
  const filteredOptions = TYPE_OPTIONS.filter((o) => enabledTypes.includes(o.type));

  return (
    <>
      {/* Annotation editor shown as full-screen overlay — rendered alongside the Drawer to avoid unmounting it */}
      {showAnnotation && screenshotUrl && (
        <AnnotationEditor
          screenshotDataUrl={screenshotUrl}
          onSave={handleAnnotationSave}
          onCancel={() => setShowAnnotationSafe(false)}
          annotationCount={annotationCount}
          onAnnotationCountChange={setAnnotationCount}
        />
      )}
      <Drawer
        open={isOpen}
        onOpenChange={(open) => {
          if (!open && !showAnnotationRef.current) close();
        }}
        direction="right"
      >
        <DrawerContent
          className={cn(
            'feedback-block flex w-full max-w-[600px] flex-col overflow-hidden sm:w-[600px]! sm:max-w-[600px]!',
            showAnnotation && 'invisible',
          )}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onInteractOutside={(e) => {
            if (showAnnotation) e.preventDefault();
          }}
          overlayProps={{
            className: cn('feedback-block', showAnnotation && 'pointer-events-none invisible'),
            onPointerDown: (e) => e.stopPropagation(),
          }}
        >
          <DrawerHeader className="border-b pb-3">
            <div className="flex items-center gap-2">
              {step === 'form' && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="mr-1 flex h-7 w-7 items-center justify-center rounded hover:bg-accent"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              <DrawerTitle className="flex-1 text-base">
                {step === 'type-select' && 'Send Feedback'}
                {step === 'form' && (formType ? TYPE_OPTIONS.find((o) => o.type === formType)?.label : 'Send Feedback')}
                {step === 'submitting' && 'Submitting…'}
                {step === 'success' && 'Thank You!'}
              </DrawerTitle>

              {isRecording && step !== 'success' && (
                <Badge variant="destructive" className="ml-auto gap-1 text-xs">
                  <Video className="h-3 w-3" />
                  Recording
                </Badge>
              )}

              <DrawerClose asChild>
                <button type="button" className="flex h-7 w-7 items-center justify-center rounded hover:bg-accent">
                  <X className="h-4 w-4" />
                </button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          {/* Type selection */}
          {step === 'type-select' && (
            <div className="flex flex-col gap-2 p-4">
              {filteredOptions.map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => handleTypeSelect(option.type)}
                  className="flex items-start gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent"
                >
                  <div className="mt-0.5 shrink-0">{option.icon}</div>
                  <div>
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="mt-0.5 text-muted-foreground text-xs">{option.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Form */}
          {step === 'form' && (
            <>
              <div className="flex flex-1 flex-col overflow-y-auto">
                <div className="flex flex-col gap-4 p-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="feedback-title" className="font-medium text-sm">
                      Title <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="feedback-title"
                      placeholder="Brief summary of the issue"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="feedback-description" className="font-medium text-sm">
                      Description
                    </label>
                    <Textarea
                      id="feedback-description"
                      placeholder="Provide more details…"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="h-28"
                    />
                  </div>

                  {/* Screenshot section with opt-out */}
                  {formType && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={includeScreenshot}
                            onCheckedChange={(checked) => setIncludeScreenshot(checked === true)}
                            id="include-screenshot"
                          />
                          <label htmlFor="include-screenshot" className="cursor-pointer font-medium text-sm">
                            Screenshot
                          </label>
                        </div>
                        {includeScreenshot && (
                          <div className="flex items-center gap-1">
                            {screenshotUrl && (
                              <Button variant="ghost" size="xs" onClick={() => setShowAnnotationSafe(true)}>
                                Annotate
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={triggerScreenshot}
                              disabled={isCapturing}
                              className="gap-1"
                            >
                              <RefreshCw className={cn('h-3 w-3', isCapturing && 'animate-spin')} />
                              {screenshotUrl ? 'Retake' : 'Capture'}
                            </Button>
                          </div>
                        )}
                      </div>

                      {includeScreenshot && (
                        <>
                          {isCapturing && (
                            <div className="flex h-24 items-center justify-center rounded-md border bg-muted text-muted-foreground text-xs">
                              Capturing screenshot…
                            </div>
                          )}

                          {!isCapturing && screenshotUrl && (
                            <div className="relative overflow-hidden rounded-md border">
                              {/* biome-ignore lint/performance/noImgElement: data URL blob, not a remote image */}
                              <img src={screenshotUrl} alt="Screenshot preview" className="w-full object-contain" />
                              {annotationBlob && (
                                <Badge variant="secondary" className="absolute right-2 bottom-2 text-xs">
                                  Annotated
                                </Badge>
                              )}
                            </div>
                          )}

                          {!isCapturing && !screenshotUrl && (
                            <div className="flex h-24 items-center justify-center rounded-md border bg-muted text-muted-foreground text-xs">
                              No screenshot captured
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Recording section with preview, trim, and opt-out */}
                  {formType && isRecording && (
                    <RecordingSection
                      events={getFrozenEvents()}
                      trimStart={trimStart}
                      trimEnd={trimEnd}
                      onTrimChange={(start, end) => {
                        setTrimStart(start);
                        setTrimEnd(end);
                      }}
                      includeRecording={includeRecording}
                      onIncludeRecordingChange={setIncludeRecording}
                    />
                  )}

                  {/* Diagnostics opt-out + preview */}
                  {formType && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={includeDiagnostics}
                          onCheckedChange={(checked) => setIncludeDiagnostics(checked === true)}
                          id="include-diagnostics"
                        />
                        <label htmlFor="include-diagnostics" className="cursor-pointer text-sm">
                          Include diagnostic info
                        </label>
                        <span className="text-muted-foreground text-xs">(logs, network, store state)</span>
                      </div>
                      {includeDiagnostics && <DiagnosticsPreview />}
                    </div>
                  )}

                  {submitError && (
                    <p className="rounded-md bg-destructive/10 px-3 py-2 text-destructive text-sm">{submitError}</p>
                  )}
                </div>
              </div>
              {/* Footer */}
              <DrawerFooter className="border-t">
                <div className="flex flex-col gap-2">
                  <p className="text-center text-muted-foreground text-xs">
                    This report may include a screenshot, recording, and diagnostic data to help us diagnose issues.
                  </p>
                  <Button className="w-full" onClick={handleSubmit} disabled={!title.trim()}>
                    Submit Feedback
                  </Button>
                </div>
              </DrawerFooter>
            </>
          )}

          {/* Submitting */}
          {step === 'submitting' && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-muted-foreground">
              <RefreshCw className="h-8 w-8 animate-spin" />
              <p className="text-sm">Submitting your feedback…</p>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <div>
                <p className="font-semibold">Feedback submitted!</p>
                <p className="mt-1 text-muted-foreground text-sm">
                  Thanks for helping us improve. We&apos;ll look into it soon.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={close}>
                Close
              </Button>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
