import { useCallback } from 'react';
import { useClientSessionSnapshot } from '@/components/core/hooks/useClientSessionSnapshot';
import { parse, format } from 'date-fns';
import { isEmpty } from '@/lib/core/common/isEmpty';
import { maskDate } from '@/components/core/utils/demoMask';

const DEFAULT_DATE_FORMAT = 'MM/dd/yyyy';
const DEFAULT_TIME_FORMAT = '12h';
export const ISO_DATE_FORMAT = 'yyyy-MM-dd';

export function useUserDateFormat() {
  const { settings } = useClientSessionSnapshot();
  return settings.dateFormat ?? DEFAULT_DATE_FORMAT;
}

export function useUserDateTimeFormat() {
  const { settings } = useClientSessionSnapshot();
  const dateFormat = settings.dateFormat ?? DEFAULT_DATE_FORMAT;
  const timeFormat = settings.timeFormat ?? DEFAULT_TIME_FORMAT;
  return timeFormat === '24h' ? `${dateFormat} HH:mm` : `${dateFormat} hh:mm a`;
}

export function useConvertISOToLocalString() {
  const dateFormat = useUserDateFormat();
  const dateTimeFormat = useUserDateTimeFormat();
  return useCallback(
    (value?: string | null, showTime = false) => {
      if (isEmpty(value)) {
        return '';
      }
      let date: Date;
      if (value.length === 10) {
        date = parse(value, ISO_DATE_FORMAT, new Date());
      } else {
        date = new Date(value);
      }
      const formatted = showTime ? format(date, dateTimeFormat) : format(date, dateFormat);
      return maskDate(formatted);
    },
    [dateFormat, dateTimeFormat],
  );
}

export function useConvertLocalToISOString() {
  const dateFormat = useUserDateFormat();
  const dateTimeFormat = useUserDateTimeFormat();
  return useCallback(
    (value?: string | null, showTime = false) => {
      if (isEmpty(value)) {
        return '';
      }
      let date: Date;
      if (showTime) {
        date = parse(value, dateTimeFormat, new Date());
      } else {
        date = parse(value, dateFormat, new Date());
      }
      if (showTime) {
        return date.toISOString();
      }
      return date.toISOString().split('T')[0];
    },
    [dateFormat, dateTimeFormat],
  );
}
