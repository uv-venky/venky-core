export type RecurrenceType = 'once' | 'daily' | 'weekly' | 'monthly' | 'annually';
/**
 * Calculates the next run date based on recurrence type, day, and time.
 */
export declare function calculateNextRunAt(recurrenceType: RecurrenceType, recurrenceDay: string | null | undefined, recurrenceTime: string): Date;
//# sourceMappingURL=schedule-utils.d.ts.map