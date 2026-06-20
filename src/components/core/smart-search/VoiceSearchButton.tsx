/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Loader2Icon, MicIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceSearchButtonProps {
  isListening: boolean;
  isProcessing?: boolean;
  isSupported: boolean;
  disabled?: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Mic toggle for natural-language search. Presentational only — voice state and
 * transcription live in `useNaturalLanguageSearch`. Renders nothing when the
 * Web Speech API is unavailable (e.g. iOS), so typed NL search still works.
 */
export function VoiceSearchButton({
  isListening,
  isProcessing,
  isSupported,
  disabled,
  onToggle,
  className,
}: VoiceSearchButtonProps) {
  if (!isSupported) return null;

  const icon = isProcessing ? (
    <Loader2Icon className="animate-spin" size={14} />
  ) : (
    <MicIcon className={cn(isListening && 'text-red-500')} size={14} />
  );

  return (
    <Button
      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
      data-tip={isListening ? 'Stop listening' : 'Voice input'}
      className={cn(
        'aspect-square h-8 rounded-lg p-1 transition-colors hover:bg-accent',
        isListening && 'bg-red-500/10 hover:bg-red-500/20',
        className,
      )}
      data-testid="voice-search-button"
      disabled={disabled || isProcessing}
      onClick={(event) => {
        event.preventDefault();
        onToggle();
      }}
      type="button"
      variant="ghost"
    >
      {icon}
    </Button>
  );
}
