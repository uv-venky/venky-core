/* Copyright (c) 2024-present Venky Corp. */

export type RecurrenceType = 'once' | 'daily' | 'weekly' | 'monthly' | 'annually';

/**
 * Calculates the next run date based on recurrence type, day, and time.
 */
export function calculateNextRunAt(
  recurrenceType: RecurrenceType,
  recurrenceDay: string | null | undefined,
  recurrenceTime: string,
): Date {
  const now = new Date();
  const [hours, minutes, seconds] = recurrenceTime.split(':').map(Number);
  const targetTime = new Date(now);
  targetTime.setHours(hours || 9, minutes || 0, seconds || 0, 0);

  let nextRun: Date;

  switch (recurrenceType) {
    case 'once': {
      if (!recurrenceDay) {
        // If no day specified, run tomorrow at the specified time
        nextRun = new Date(targetTime);
        nextRun.setDate(nextRun.getDate() + 1);
      } else {
        // Parse YYYY-MM-DD format
        const [year, month, day] = recurrenceDay.split('-').map(Number);
        nextRun = new Date(year, month - 1, day, hours, minutes, seconds);
        // If the date is in the past, set it to tomorrow
        if (nextRun.getTime() < now.getTime()) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
      }
      break;
    }
    case 'daily': {
      nextRun = new Date(targetTime);
      // If time has passed today, schedule for tomorrow
      if (nextRun.getTime() <= now.getTime()) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;
    }
    case 'weekly': {
      if (!recurrenceDay) {
        // Default to Monday if no day specified
        nextRun = new Date(targetTime);
        const daysUntilMonday = (1 + 7 - nextRun.getDay()) % 7 || 7;
        nextRun.setDate(nextRun.getDate() + daysUntilMonday);
      } else {
        const dayMap: Record<string, number> = {
          Monday: 1,
          Tuesday: 2,
          Wednesday: 3,
          Thursday: 4,
          Friday: 5,
          Saturday: 6,
          Sunday: 0,
        };
        const targetDay = dayMap[recurrenceDay] ?? 1;
        nextRun = new Date(targetTime);
        const currentDay = nextRun.getDay();
        let daysToAdd = (targetDay + 7 - currentDay) % 7;
        // If it's the same day but time has passed, schedule for next week
        if (daysToAdd === 0 && nextRun.getTime() <= now.getTime()) {
          daysToAdd = 7;
        }
        nextRun.setDate(nextRun.getDate() + daysToAdd);
      }
      break;
    }
    case 'monthly': {
      nextRun = new Date(targetTime);
      const dayOfMonth = recurrenceDay ? Number.parseInt(recurrenceDay, 10) : 1;
      // Move to the specified day of next month
      nextRun.setDate(1);
      nextRun.setMonth(nextRun.getMonth() + 1);
      const lastDayOfMonth = new Date(nextRun.getFullYear(), nextRun.getMonth() + 1, 0).getDate();
      nextRun.setDate(Math.min(dayOfMonth, lastDayOfMonth));
      // If date has passed this month, we already set it to next month
      if (nextRun.getTime() <= now.getTime()) {
        // Set to month after next
        nextRun.setMonth(nextRun.getMonth() + 1);
        const lastDayOfMonth2 = new Date(nextRun.getFullYear(), nextRun.getMonth() + 1, 0).getDate();
        nextRun.setDate(Math.min(dayOfMonth, lastDayOfMonth2));
      } else {
        // Check if we can schedule this month
        const thisMonth = new Date(targetTime);
        thisMonth.setDate(
          Math.min(dayOfMonth, new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0).getDate()),
        );
        if (thisMonth.getTime() > now.getTime()) {
          nextRun = thisMonth;
        }
      }
      break;
    }
    case 'annually': {
      if (!recurrenceDay) {
        // Default to January 1st if no day specified
        nextRun = new Date(targetTime);
        nextRun.setMonth(0, 1);
        if (nextRun.getTime() <= now.getTime()) {
          nextRun.setFullYear(nextRun.getFullYear() + 1);
        }
      } else {
        // Parse MM-DD format
        const [month, day] = recurrenceDay.split('-').map(Number);
        nextRun = new Date(targetTime);
        nextRun.setMonth(month - 1, day);
        if (nextRun.getTime() <= now.getTime()) {
          nextRun.setFullYear(nextRun.getFullYear() + 1);
        }
      }
      break;
    }
    default:
      nextRun = new Date(targetTime);
      nextRun.setDate(nextRun.getDate() + 1);
  }

  return nextRun;
}
