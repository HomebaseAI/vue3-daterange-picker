import { dateFormat, getWeek, DEFAULT_i18n, type DateValue } from './dateformat.js';

const DEFAULT_LOCALE = {
  direction: 'ltr',
  format: 'mm/dd/yyyy',
  separator: ' - ',
  applyLabel: 'Apply',
  cancelLabel: 'Cancel',
  weekLabel: 'W',
  customRangeLabel: 'Custom Range',
  daysOfWeek: DEFAULT_i18n.dayNames.slice(0, 7).map(d => d.substring(0, 2)),
  monthNames: DEFAULT_i18n.monthNames.slice(0, 12),
  firstDay: 0
};

// NOTE(dylhack): this is the same as DEFAULT_LOCALE, but all are optional
export type LocaleOptions = {
  direction?: typeof DEFAULT_LOCALE.direction;
  format?: typeof DEFAULT_LOCALE.format;
  separator?: typeof DEFAULT_LOCALE.separator;
  applyLabel?: typeof DEFAULT_LOCALE.applyLabel;
  cancelLabel?: typeof DEFAULT_LOCALE.cancelLabel;
  weekLabel?: typeof DEFAULT_LOCALE.weekLabel;
  customRangeLabel?: typeof DEFAULT_LOCALE.customRangeLabel;
  daysOfWeek?: typeof DEFAULT_LOCALE.daysOfWeek;
  monthNames?: typeof DEFAULT_LOCALE.monthNames;
  firstDay?: typeof DEFAULT_LOCALE.firstDay;
};

const dateUtil = {
  isSame: (date1: DateValue, date2: DateValue, granularity?: string) => {
    const dt1 = new Date(date1 ?? 0);
    const dt2 = new Date(date2 ?? 0);
    if (granularity === 'date') {
      dt1.setHours(0, 0, 0, 0);
      dt2.setHours(0, 0, 0, 0);
    }
    return dt1.getTime() === dt2.getTime()
  },
  daysInMonth: (year: number, month: number) => {
    return new Date(year, month, 0).getDate()
  },
  weekNumber: (date: Date) => {
    return getWeek(date)
  },
  format: (date: DateValue, mask: string) => {
    const formatter = dateFormat();
    return formatter(date, mask);
  },
  nextMonth: (date: Date) => {
    let nextMonthDate = new Date(date.getTime())
    nextMonthDate.setDate(1)
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1)
    return nextMonthDate
  },
  prevMonth: (date: Date) => {
    let prevMonthDate = new Date(date.getTime())
    prevMonthDate.setDate(1)
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1)
    return prevMonthDate
  },
  validateDateRange: (newDate: Date, min?: Date, max?: Date) => {
    if (max && newDate.getTime() > max.getTime()) {
      return max;
    }

    if (min && newDate.getTime() < min.getTime()) {
      return min;
    }

    return newDate;
  },
  localeData: (options?: LocaleOptions) => {
    return { ...DEFAULT_LOCALE, ...(options ?? {}) }
  },
  yearMonth: (date: Date) => {
    let month = date.getMonth() + 1
    return date.getFullYear() + (month < 10 ? '0' : '') + month
  },
  isValidDate: (d: Date | number) => {
    return d instanceof Date || !isNaN(d);
  }
}

export type DateUtil = typeof dateUtil;

export default dateUtil
