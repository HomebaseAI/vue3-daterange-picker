import DateRangePicker from './DateRangePicker.vue';

export * from './dateformat';
export { default as CalendarTime } from './components/CalendarTime.vue';
export { default as CalendarRanges } from './components/CalendarRanges.vue';
export type {  
  DateRange,
  Classes,
  Ranges,
  DatePickerValue,
  TogglePickerFn,
  DateFormatFn,
  CalculatePosFn,
} from './DateRangePicker.vue';
export type { DateUtil, LocaleOptions } from './dateUtil';

export default DateRangePicker;
