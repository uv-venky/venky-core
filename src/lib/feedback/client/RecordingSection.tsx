'use client';
/* Copyright (c) 2024-present Venky Corp. */

import { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import type { eventWithTime } from '@rrweb/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popup } from '@/components/core/page/popup';
import { formatTime } from '../common/formatTime';
import { getRecordingDuration, trimEvents } from './trimEvents';
import { SessionPlayer } from '../admin/SessionPlayer';

interface RecordingSectionProps {
  events: unknown[];
  trimStart: number;
  trimEnd: number;
  onTrimChange: (start: number, end: number) => void;
  includeRecording: boolean;
  onIncludeRecordingChange: (include: boolean) => void;
}

export function RecordingSection({
  events,
  trimStart,
  trimEnd,
  onTrimChange,
  includeRecording,
  onIncludeRecordingChange,
}: RecordingSectionProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [committedTrimStart, setCommittedTrimStart] = useState(trimStart);
  const [committedTrimEnd, setCommittedTrimEnd] = useState(trimEnd);

  const totalDuration = useMemo(() => getRecordingDuration(events as eventWithTime[]), [events]);
  const trimmedDuration = trimEnd - trimStart;

  const trimmedEvents = useMemo(() => {
    if (events.length < 2) return [];
    return trimEvents(events as eventWithTime[], committedTrimStart, committedTrimEnd);
  }, [events, committedTrimStart, committedTrimEnd]);

  if (events.length < 2 || totalDuration <= 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={includeRecording}
            onCheckedChange={(checked) => onIncludeRecordingChange(checked === true)}
            id="include-recording"
          />
          <label htmlFor="include-recording" className="cursor-pointer font-medium text-sm">
            Session Recording
          </label>
        </div>
        {includeRecording && (
          <span className="text-muted-foreground text-xs">
            {formatTime(trimmedDuration)} of {formatTime(totalDuration)}
          </span>
        )}
      </div>

      {includeRecording && (
        <>
          <Button variant="outline" size="sm" className="w-fit gap-1.5" onClick={() => setShowPreview(true)}>
            <Eye className="h-3.5 w-3.5" />
            Preview & Trim
          </Button>

          {showPreview && (
            <Popup
              title={`Recording Preview — ${formatTime(trimmedDuration)} of ${formatTime(totalDuration)}`}
              onClose={() => setShowPreview(false)}
              width={typeof window !== 'undefined' ? window.innerWidth : 1200}
              height={typeof window !== 'undefined' ? window.innerHeight : 800}
              minWidth={600}
              minHeight={400}
              resizable
              bodyClassName="flex flex-col gap-0 p-0"
            >
              <div className="min-h-0 flex-1 overflow-hidden">
                {trimmedEvents.length >= 2 && (
                  <SessionPlayer
                    events={trimmedEvents}
                    autoPlay
                    className="h-full"
                    trimStart={trimStart}
                    trimEnd={trimEnd}
                    trimMax={totalDuration}
                    onTrimChange={(start, end) => onTrimChange(start, end)}
                    onTrimCommit={(start, end) => {
                      setCommittedTrimStart(start);
                      setCommittedTrimEnd(end);
                    }}
                  />
                )}
              </div>
            </Popup>
          )}
        </>
      )}
    </div>
  );
}
