/* Copyright (c) 2024-present Venky Corp. */

import type { eventWithTime } from '@rrweb/types';

/**
 * Get the total duration of a recording in milliseconds.
 */
export function getRecordingDuration(events: eventWithTime[]): number {
  if (events.length < 2) return 0;
  return events[events.length - 1].timestamp - events[0].timestamp;
}

/**
 * Trim rrweb events to a time window.
 *
 * @param events  Full event buffer
 * @param startMs Start offset in ms from the first event
 * @param endMs   End offset in ms from the first event
 * @returns Trimmed events including the nearest FullSnapshot before startMs
 *
 * The rrweb player needs a FullSnapshot (type 2) to initialize the DOM.
 * This function finds the last FullSnapshot at or before `startMs` and
 * includes it (plus its preceding Meta event, type 4) so the player
 * can rebuild the DOM state at the trim start.
 */
export function trimEvents(events: eventWithTime[], startMs: number, endMs: number): eventWithTime[] {
  if (events.length < 2) return events;

  const baseTimestamp = events[0].timestamp;
  const absStart = baseTimestamp + startMs;
  const absEnd = baseTimestamp + endMs;

  // Find the last FullSnapshot (type 2) at or before absStart
  let anchorIdx = -1;
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].type === 2 && events[i].timestamp <= absStart) {
      anchorIdx = i;
      break;
    }
  }

  // If no FullSnapshot found before start, use the first FullSnapshot in the buffer
  if (anchorIdx === -1) {
    for (let i = 0; i < events.length; i++) {
      if (events[i].type === 2) {
        anchorIdx = i;
        break;
      }
    }
  }

  // Still no FullSnapshot — return events in the window as-is
  if (anchorIdx === -1) {
    return events.filter((e) => e.timestamp >= absStart && e.timestamp <= absEnd);
  }

  // Include the Meta event (type 4) that precedes the FullSnapshot
  const metaIdx = anchorIdx > 0 && events[anchorIdx - 1].type === 4 ? anchorIdx - 1 : -1;

  const result: eventWithTime[] = [];

  // Add Meta event if found
  if (metaIdx >= 0) {
    result.push(events[metaIdx]);
  }

  // Add the anchor FullSnapshot
  result.push(events[anchorIdx]);

  // Add all events from the anchor onwards (up to absEnd)
  // Include events between anchor and absStart to preserve DOM state at trim start
  for (let i = anchorIdx + 1; i < events.length; i++) {
    if (events[i].timestamp > absEnd) break;
    result.push(events[i]);
  }

  // Rebase timestamps so the first event starts at 0.
  // Without this, the player sees a gap between the anchor FullSnapshot
  // (which may be seconds before the trim start) and the first real event,
  // resulting in dead playback time with no cursor/mutations.
  if (result.length > 0) {
    const offset = result[0].timestamp;
    return result.map((e) => ({ ...e, timestamp: e.timestamp - offset }));
  }

  return result;
}
