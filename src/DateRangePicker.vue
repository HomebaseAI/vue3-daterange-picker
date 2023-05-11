<template>
  <div class="vue-daterange-picker" :class="{ inline: opens === 'inline' }">
    <div :class="controlContainerClass" @click="onClickPicker" ref="toggle">
      <!--
        Allows you to change the input which is visible before the picker opens

        @param {Date} startDate - current startDate
        @param {Date} endDate - current endDate
        @param {object} ranges - object with ranges
        @param {string} rangeText - the calculated rangeText string
      -->
      <slot name="input" :startDate="start" :endDate="end" :ranges="ranges" :rangeText="rangeText">
        <i class="glyphicon glyphicon-calendar fa fa-calendar"></i>&nbsp;
        <span>{{ rangeText }}</span>
        <b class="caret"></b>
      </slot>
    </div>
    <transition name="slide-fade" mode="out-in">
      <div class="daterangepicker ltr" :class="pickerStyles" v-if="open || opens === 'inline'" v-append-to-body
        ref="dropdown">

        <!--
          Optional header slot (same props as footer) @see footer slot for documentation
        -->
        <slot name="header" :rangeText="rangeText" :locale="locale" :clickCancel="clickCancel" :clickApply="clickApply"
          :in_selection="in_selection" :autoApply="autoApply">
        </slot>

        <div class="calendars">
          <!--
            Allows you to change the range

            @param {Date} startDate - current startDate
            @param {Date} endDate - current endDate
            @param {object} ranges - object with ranges
            @param {Fn} clickRange(dateRange) - call to select the dateRange - any two date objects or an object from tha ranges array
          -->
          <slot name="ranges" :startDate="start" :endDate="end" :ranges="ranges" :clickRange="clickRange"
            v-if="showRanges">
            <CalendarRanges @clickRange="clickRange" @showCustomRange="showCustomRangeCalendars = true"
              :always-show-calendars="alwaysShowCalendars" :locale-data="locale" :ranges="ranges"
              :selected="{ startDate: start, endDate: end }"></CalendarRanges>
          </slot>

          <div class="calendars-container" v-if="showCalendars">
            <div class="drp-calendar col left" :class="{ single: datePickerType }">
              <div class="daterangepicker_input d-none d-sm-block" v-if="false">
                <input class="input-mini form-control" type="text" name="daterangepicker_start" :value="startText" />
                <i class="fa fa-calendar glyphicon glyphicon-calendar"></i>
              </div>
              <div class="calendar-table">
                <Calendar :monthDate="monthDate" :locale-data="locale" v-model:start="start" v-model:end="end" :minDate="min"
                  :maxDate="max" :show-dropdowns="showDropdowns" @change-month="changeLeftMonth"
                  :date-format="dateFormatFn" @dateClick="dateClick" @hoverDate="hoverDate"
                  :showWeekNumbers="showWeekNumbers">
                  <slot name="date" slot="date-slot" slot-scope="data" v-bind="$data"></slot>
                </Calendar>
              </div>
              <CalendarTime v-if="timePicker && start" @update="onUpdateStartTime"
                :miniute-increment="timePickerIncrement" :hour24="timePicker24Hour" :second-picker="timePickerSeconds"
                :current-time="start" :readonly="readonly" />
            </div>

            <div class="drp-calendar col right" v-if="!datePickerType">
              <div class="daterangepicker_input" v-if="false">
                <input class="input-mini form-control" type="text" name="daterangepicker_end" :value="endText" />
                <i class="fa fa-calendar glyphicon glyphicon-calendar"></i>
              </div>
              <div class="calendar-table">
                <Calendar :monthDate="nextMonthDate" :locale-data="locale" :start="start" :end="end" :minDate="min"
                  :maxDate="max" :show-dropdowns="showDropdowns" @change-month="changeRightMonth"
                  :date-format="dateFormatFn" @dateClick="dateClick" @hoverDate="hoverDate"
                  :showWeekNumbers="showWeekNumbers">
                  <!--
                    Allows you to change date cell slot. By default it renders the day number

                    @param {Date} date - the date being rendered into the table cell
                  -->
                  <slot name="date" slot="date-slot" slot-scope="data" v-bind="$data"></slot>
                </Calendar>
              </div>
              <CalendarTime v-if="timePicker && end" @update="onUpdateEndTime" :miniute-increment="timePickerIncrement"
                :hour24="timePicker24Hour" :second-picker="timePickerSeconds" :current-time="end" :readonly="readonly" />
            </div>
          </div>
        </div>
        <!--
          Allows you to change footer of the component (where the buttons are)

          @param {string} rangeText - the formatted date range by the component
          @param {object} locale - the locale object @see locale prop
          @param {function} clickCancel - function which is called when you want to cancel the range picking and reset old values
          @param {function} clickApply -function which to call when you want to apply the selection
          @param {boolean} in_selection - is the picker in selection mode
          @param {boolean} autoApply - value of the autoApply prop (whether to select immediately)
        -->
        <slot name="footer" :rangeText="rangeText" :locale="locale" :clickCancel="clickCancel" :clickApply="clickApply"
          :in_selection="in_selection" :autoApply="autoApply">
          <div class="drp-buttons" v-if="!autoApply">
            <span class="drp-selected" v-if="showCalendars">{{ rangeText }}</span>
            <button class="cancelBtn btn btn-sm btn-secondary" type="button" @click="clickCancel" v-if="!readonly">{{
              locale.cancelLabel }}
            </button>
            <button class="applyBtn btn btn-sm btn-success" :disabled="in_selection" type="button" @click="clickApply"
              v-if="!readonly">{{ locale.applyLabel }}
            </button>
          </div>
        </slot>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import DateUtilMixin from './components/DateUtilMixin.vue';
import Calendar from './components/Calendar.vue';
import CalendarTime from './components/CalendarTime.vue';
import CalendarRanges from './components/CalendarRanges.vue';
import appendToBody from './directives/AppendToBody.vue';
import type { TimePickerValue } from './components/CalendarTime.vue'
import { type PropType, defineComponent } from 'vue'
import type { LocaleOptions } from './dateUtil.js';

type Pos = {
  top: number,
  width: number,
  left: number,
  right: number,
}

export type DateRange = {
  startDate: Date | undefined,
  endDate: Date | undefined,
}

export type Classes = { [key: string]: any };
export type Ranges = {
  Today: Date[];
  Yesterday: Date[];
  'This month': Date[];
  'This year': Date[];
  'Last month': Date[]
} & { [key: string]: Date[] };
export type DatePickerValue = {
  month: number;
  year: number;
}

export type TogglePickerFn = (value: boolean | null, event?: boolean) => void;
export type DateFormatFn = (classes: Classes, date: Date) => Classes;
export type CalculatePosFn = (dropdownList: HTMLUListElement, component: any, pos: Pos) => void;
/**
 * Single - one calendar
 * Range - one calendar with ranges
 * Double - two calendars with ranges
 */
export enum RangePickerType {
  Single = 0,
  Range = 1,
  Double = 2,
}

const DateRangePicker = defineComponent({
  inheritAttrs: false,
  components: { Calendar, CalendarTime, CalendarRanges },
  mixins: [DateUtilMixin],
  directives: { appendToBody },
  model: {
    prop: 'dateRange',
    event: 'update',
  },
  emits: {
    'update:value': (val: DateRange) => true,
    'change-month': (val: Date, i: number) => true,
    'toggle': (open: boolean, togglePicker: TogglePickerFn) => true,
    'finishSelection': (val: Date) => true,
    'startSelection': (val: Date) => true,
    'select': (val: DateRange) => true,
    'hoverDate': (val: Date) => true,
    'update:modelValue': (val: DateRange) => true,
  },
  props: {
    minDate: {
      type: Date,
      default() {
        return new Date('1900-01-01');
      }
    },
    maxDate: {
      type: Date,
      default() {
        return new Date('2100-01-01');
      }
    },
    /**
     * Show the week numbers on the left side of the calendar
     */
    showWeekNumbers: {
      type: Boolean,
      default: false,
    },
    /**
     * Each calendar has separate navigation when this is false
     */
    linkedCalendars: {
      type: Boolean,
      default: true,
    },
    /**
     * Only show a single calendar, with or without ranges.
     *
     */
    datePickerType: {
      type: Number as PropType<RangePickerType>,
      default: RangePickerType.Double,
    },
    /**
     * Show the dropdowns for month and year selection above the calendars
     */
    showDropdowns: {
      type: Boolean,
      default: false,
    },
    /**
     * Show the dropdowns for time (hour/minute) selection below the calendars
     */
    timePicker: {
      type: Boolean,
      default: false,
    },
    /**
     * Determines the increment of minutes in the minute dropdown
     */
    timePickerIncrement: {
      type: Number,
      default: 5,
    },
    /**
     * Use 24h format for the time
     */
    timePicker24Hour: {
      type: Boolean,
      default: true,
    },
    /**
     * Allows you to select seconds except hour/minute
     */
    timePickerSeconds: {
      type: Boolean,
      default: false,
    },
    /**
     * Auto apply selected range. If false you need to click an apply button
     */
    autoApply: {
      type: Boolean,
      default: false,
    },
    /**
     * Object containing locale data used by the picker. See example below the table
     *
     * @default *see below
     */
    localeData: {
      type: Object as PropType<LocaleOptions>,
      default() {
        return {}
      },
    },
    /**
     * This is the v-model prop which the component uses. This should be an object containing startDate and endDate props.
     * Each of the props should be a string which can be parsed by Date, or preferably a Date Object.
     */
    modelValue: {
      type: Object as PropType<DateRange>,
      default: () => ({}),
    },

    /**
     * You can set this to false in order to hide the ranges selection. Otherwise it is an object with key/value. See below
     * @default *see below
     */
    ranges: {
      type: [Object, Boolean] as PropType<Ranges | false>,
      default(): Ranges {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayEnd = new Date()
        todayEnd.setHours(11, 59, 59, 999);

        const yesterdayStart = new Date()
        yesterdayStart.setDate(today.getDate() - 1)
        yesterdayStart.setHours(0, 0, 0, 0);

        const yesterdayEnd = new Date()
        yesterdayEnd.setDate(today.getDate() - 1)
        yesterdayEnd.setHours(11, 59, 59, 999);

        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 11, 59, 59, 999);

        return {
          'Today': [today, todayEnd],
          'Yesterday': [yesterdayStart, yesterdayEnd],
          'This month': [thisMonthStart, thisMonthEnd],
          'This year': [
            new Date(today.getFullYear(), 0, 1),
            new Date(today.getFullYear(), 11, 31, 11, 59, 59, 999)
          ],
          'Last month': [
            new Date(today.getFullYear(), today.getMonth() - 1, 1),
            new Date(today.getFullYear(), today.getMonth(), 0, 11, 59, 59, 999)
          ],
        }
      }
    },
    /**
     * which way the picker opens - "center", "left", "right" or "inline"
     */
    opens: {
      type: String as PropType<'center' | 'left' | 'right' | 'inline'>,
      default: 'center'
    },

    /**
     function(classes, date) - special prop type function which accepts 2 params:
     "classes" - the classes that the component's logic has defined,
     "date" - tha date currently processed.
     You should return Vue class object which should be applied to the date rendered.
     */
    dateFormat: Function as PropType<DateFormatFn>,

    /**
     * If set to false and one of the predefined ranges is selected then calendars are hidden.
     * If no range is selected or you have clicked the "Custom ranges" then the calendars are shown.
     */
    alwaysShowCalendars: {
      type: Boolean,
      default: true
    },
    /**
     * Disabled state. If true picker do not popup on click.
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Class of html picker control container
     */
    controlContainerClass: {
      type: String,
      default: 'form-control reportrange-text'
    },

    /**
     * Append the dropdown element to the end of the body
     * and size/position it dynamically. Use it if you have
     * overflow or z-index issues.
     * @type {Boolean}
     */
    appendToBody: {
      type: Boolean,
      default: false
    },

    /**
     * When `appendToBody` is true, this function is responsible for
     * positioning the drop down list.
     *
     * If a function is returned from `calculatePosition`, it will
     * be called when the drop down list is removed from the DOM.
     * This allows for any garbage collection you may need to do.
     *
     * @since v0.5.1
     */
    calculatePosition: {
      type: Function as PropType<CalculatePosFn>,
      /**
       * @param dropdownList {HTMLUListElement}
       * @param component {Vue} current instance of vue date range picker
       * @param width {int} calculated width in pixels of the dropdown menu
       * @param top {int} absolute position top value in pixels relative to the document
       * @param left {int} absolute position left value in pixels relative to the document
       * @param right {int} absolute position right value in pixels relative to the document
       * @return {function|void}
       */
      default(dropdownList: HTMLUListElement, component: any, { width, top, left, right }: Pos) {
        // which way the picker opens - "center", "left" or "right"
        if (component.opens === 'center') {
          dropdownList.style.left = (left + width / 2) + 'px'
        } else if (component.opens === 'left') {
          dropdownList.style.right = (window.innerWidth - right) + 'px'
        } else if (component.opens === 'right') {
          dropdownList.style.left = (left) + 'px'
        }
        dropdownList.style.top = top + 'px'
        // dropdownList.style.width = width + 'px'
      }
    },
    /**
     * Whether to close the dropdown on "esc"
     */
    closeOnEsc: {
      type: Boolean,
      default: true
    },
    /**
     * Makes the picker readonly. No button in footer. No ranges. Cannot change.
     */
    readonly: {
      type: Boolean
    }
  },
  data(ctx) {
    //copy locale data object
    const locale = ctx.$dateUtil.localeData({ ...this.localeData });

    const startDate = ctx.modelValue.startDate;
    const endDate = ctx.modelValue.endDate;

    const monthDate = startDate ? new Date(startDate) : new Date()
    //get next month date
    const nextMonthDate = this.$dateUtil.nextMonth(monthDate)

    const start = startDate ? new Date(startDate) : undefined; 
    let end;
    if (this.datePickerType !== RangePickerType.Range) {
      // ignore endDate for singleDatePicker
      end = start
    } else {
      end = endDate ? new Date(endDate) : undefined
    }
    const in_selection = false
    const open = false
    //When alwaysShowCalendars = false and custom range is clicked
    const showCustomRangeCalendars = false

    // update day names order to firstDay
    if (locale.firstDay !== 0) {
      let iterator = locale.firstDay
      let weekDays = [...locale.daysOfWeek]
      while (iterator > 0) {
        const shift = weekDays.shift();
        if (shift) {
          weekDays.push(shift);
        }
        iterator--
      }
      locale.daysOfWeek = weekDays
    }

    return {
      locale,
      monthDate,
      nextMonthDate,
      start: start ?? undefined,
      end: end ?? undefined,
      in_selection,
      open,
      showCustomRangeCalendars,
    }
  },
  methods: {
    //calculate initial month selected in picker
    selectMonthDate() {
      let dt = this.end || new Date()
      if (this.datePickerType !== RangePickerType.Double)
        this.changeLeftMonth({ year: dt.getFullYear(), month: dt.getMonth() + 1 })
      else
        this.changeRightMonth({ year: dt.getFullYear(), month: dt.getMonth() + 1 })
    },
    dateFormatFn(classes: Classes, date: Date) {
      const startDate = this.start ?? new Date();
      const endDate = this.end ?? new Date();
      const dt = new Date(date)
      dt.setHours(0, 0, 0, 0)
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(endDate)
      end.setHours(0, 0, 0, 0)

      classes['in-range'] = dt >= start && dt <= end

      return this.dateFormat ? this.dateFormat(classes, date) : classes
    },
    changeLeftMonth(value: DatePickerValue) {
      let newDate = new Date(value.year, value.month - 1, 1);
      this.monthDate = newDate
      if (this.linkedCalendars || (this.$dateUtil.yearMonth(this.monthDate) >= this.$dateUtil.yearMonth(this.nextMonthDate))) {
        this.nextMonthDate = this.$dateUtil.validateDateRange(this.$dateUtil.nextMonth(newDate), this.minDate, this.maxDate);
        // || this.singleDatePicker === 'range'
        if ((!this.datePickerType) && this.$dateUtil.yearMonth(this.monthDate) === this.$dateUtil.yearMonth(this.nextMonthDate)) {
          this.monthDate = this.$dateUtil.validateDateRange(this.$dateUtil.prevMonth(this.monthDate), this.minDate, this.maxDate)
        }
      }
      /**
       * Emits event when the viewing month is changes. The second param is the index of the calendar.
       *
       * @param {Date} date displayed (first day of the month)
       * @param calendarIndex int 0 - first(left) calendar, 1 - second(right) calendar
       */
      this.$emit('change-month', this.monthDate, 0)
    },
    changeRightMonth(value: DatePickerValue) {
      let newDate = new Date(value.year, value.month - 1, 1);
      this.nextMonthDate = newDate
      if (this.linkedCalendars || (this.$dateUtil.yearMonth(this.nextMonthDate) <= this.$dateUtil.yearMonth(this.monthDate))) {
        this.monthDate = this.$dateUtil.validateDateRange(this.$dateUtil.prevMonth(newDate), this.minDate, this.maxDate);
        if (this.$dateUtil.yearMonth(this.monthDate) === this.$dateUtil.yearMonth(this.nextMonthDate)) {
          this.nextMonthDate = this.$dateUtil.validateDateRange(this.$dateUtil.nextMonth(this.nextMonthDate), this.minDate, this.maxDate)
        }
      }
      //check for same month fix
      if (this.$dateUtil.yearMonth(this.monthDate) === this.$dateUtil.yearMonth(this.nextMonthDate)) {
        this.nextMonthDate = this.$dateUtil.nextMonth(this.nextMonthDate)
      }

      this.$emit('change-month', this.nextMonthDate, 1)
    },
    normalizeDatetime(value: Date, oldValue?: Date) {
      let newDate = new Date(value);
      if (this.timePicker && oldValue) {
        newDate.setHours(oldValue.getHours());
        newDate.setMinutes(oldValue.getMinutes());
        newDate.setSeconds(oldValue.getSeconds());
        newDate.setMilliseconds(oldValue.getMilliseconds());
      }

      return newDate;
    },
    dateClick(value: Date) {
      if (this.readonly) return false

      if (this.in_selection) {
        this.in_selection = false
        // this.end = this.normalizeDatetime(value, this.end);
        /**
         * Emits event when the user clicks the second date and finishes selection
         *
         * @param {Date} date the date clicked
         */
        this.$emit('finishSelection', value)
        if (this.autoApply)
          this.clickApply();
      } else {
        this.start = this.normalizeDatetime(value, this.start);
        this.end = this.normalizeDatetime(value, this.end);
        if (this.datePickerType === RangePickerType.Range) {
          this.in_selection = Boolean(this.end);
          this.$emit('startSelection', this.start)
        } else {
          if (this.autoApply)
            this.clickApply();
        }
      }
      this.onSelect();
    },
    hoverDate(value: Date) {
      if (this.readonly)
        return false
      const dt_end = this.normalizeDatetime(value, this.end);
      const dt_start = this.normalizeDatetime(value, this.start);
      if (this.in_selection) {
        this.start = new Date(Math.min(Number(this.in_selection), dt_end.valueOf(), dt_start.valueOf()))
        this.end = new Date(Math.max(Number(this.in_selection), dt_end.valueOf(), dt_start.valueOf()))
      }
      /**
       * Emits event when the mouse hovers a date
       * @param {Date} value the date that is being hovered
       */
      this.$emit('hoverDate', value)
    },
    onClickPicker() {
      if (!this.disabled) {
        this.togglePicker(null, true)
      }
    },
    togglePicker(value: boolean | null, event?: boolean) {
      if (typeof value === 'boolean') {
        this.open = value
      } else {
        this.open = !this.open
      }

      if (event === true) {
        /**
         * Emits whenever the picker opens/closes
         * @param {boolean} open - the current state of the picker
         * @param {Function} togglePicker - function (show, event) which can be used to control the picker. where "show" is the new state and "event" is boolean indicating whether a new event should be raised
         */
        this.$emit('toggle', this.open, this.togglePicker)
      }
    },
    clickApply() {
      this.value = {
        startDate: this.start,
        endDate: this.datePickerType !== RangePickerType.Range ? this.start : this.end
      }
      this.togglePicker(false, true);
    },
    clickCancel() {
      if (this.open) {
        // reset start and end
        let startDate = this.value.startDate
        let endDate = this.value.endDate
        this.start = startDate ? new Date(startDate) : undefined;
        this.end = endDate ? new Date(endDate) : undefined;
        // this.open = false
        this.in_selection = false;
        this.togglePicker(false, true);
      }
    },
    onSelect() {
      this.$emit('select', { startDate: this.start, endDate: this.end })
    },
    clickAway(event: MouseEvent) {
      const dropdown = this.$refs.dropdown as HTMLDivElement | undefined;
      if (event && event.target &&
        !this.$el.contains(event.target) &&
        dropdown &&
        !dropdown.contains(event.target as Node)) {
        this.clickCancel()
      }
    },
    clickRange(value: Date[]) {
      this.in_selection = false;

      if (this.$dateUtil.isValidDate(value[0]) && this.$dateUtil.isValidDate(value[1])) {
        this.start = this.$dateUtil.validateDateRange(new Date(value[0]), this.minDate, this.maxDate)
        this.end = this.$dateUtil.validateDateRange(new Date(value[1]), this.minDate, this.maxDate)
        this.changeLeftMonth({
          month: this.value.startDate!.getMonth() + 1,
          year: this.value.startDate!.getFullYear()
        })

        if (this.linkedCalendars === false) {
          this.changeRightMonth({
            month: this.value.endDate!.getMonth() + 1,
            year: this.value.endDate!.getFullYear()
          })
        }
      } else {
        this.start = undefined; 
        this.end = undefined; 
      }

      this.onSelect();

      if (this.autoApply)
        this.clickApply()
    },
    onUpdateStartTime(value: TimePickerValue) {
      let start = new Date(this.start ?? 0);
      start.setHours(value.hours);
      start.setMinutes(value.minutes);
      start.setSeconds(value.seconds);

      this.start = this.$dateUtil.validateDateRange(start, this.minDate, this.maxDate);

      // if autoapply is ON we should update the value on time selection change
      if (this.autoApply) {
        this.value = {
          startDate: this.start,
          endDate: this.datePickerType !== RangePickerType.Range ? this.start : this.end
        }
      }
    },
    onUpdateEndTime(value: TimePickerValue) {
      const end = new Date(this.end ?? 0);
      end.setHours(value.hours);
      end.setMinutes(value.minutes);
      end.setSeconds(value.seconds);

      this.end = this.$dateUtil.validateDateRange(end, this.minDate, this.maxDate);

      // if autoapply is ON we should update the value on time selection change
      if (this.autoApply) {
        this.value = { startDate: this.start, endDate: this.end };
      }
    },
    handleEscape(e: KeyboardEvent) {
      if (this.open && e.keyCode === 27 && this.closeOnEsc) {
        this.clickCancel()
      }
    }
  },
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value: DateRange) {
        this.$emit('update:modelValue', value);
      }
    },
    showRanges() {
      return this.ranges !== false && !this.readonly
    },
    showCalendars() {
      return this.alwaysShowCalendars || this.showCustomRangeCalendars
    },
    startText() {
      if (!this.start) return ''
      return this.$dateUtil.format(this.start, this.locale.format)
    },
    endText() {
      if (!this.end) return ''
      return this.$dateUtil.format(this.end, this.locale.format)
    },
    rangeText() {
      let range = this.startText;
      if (this.datePickerType === RangePickerType.Range) {
        range += this.locale.separator + this.endText;
      }
      return range;
    },
    min() {
      return this.minDate; 
    },
    max() {
      return this.maxDate; 
    },
    pickerStyles() {
      return {
        'show-calendar': this.open || this.opens === 'inline',
        'show-ranges': this.showRanges,
        'show-weeknumbers': this.showWeekNumbers,
        single: this.datePickerType,
        ['opens' + this.opens]: true,
        linked: this.linkedCalendars,
        'hide-calendars': !this.showCalendars
      }
    },
    isClear() {
      return !this.value.startDate || !this.value.endDate
    },
    isDirty() {
      const origStart = new Date(this.value.startDate ?? 0);
      const origEnd = new Date(this.value.endDate ?? 0);

      return !this.isClear && (this.start?.getTime() !== origStart.getTime() || this.end?.getTime() !== origEnd.getTime())
    }
  },
  watch: {
    minDate() {
      this.selectMonthDate();
    },
    maxDate() {
      this.selectMonthDate();
    },
    'dateRange.startDate'(value?: Date) {
      if (!this.$dateUtil.isValidDate(value))
        return

      this.start = (!!value && !this.isClear && this.$dateUtil.isValidDate(new Date(value))) ? new Date(value) : undefined
      if (this.isClear) {
        this.start = undefined;
        this.end = undefined;
      } else {
        this.start = new Date(this.value.startDate ?? 0)
        this.end = new Date(this.value.endDate ?? 0)
      }
    },
    'dateRange.endDate'(value?: Date) {
      if (!this.$dateUtil.isValidDate(value))
        return

      this.end = (!!value && !this.isClear) ? new Date(value) : undefined;
      if (this.isClear) {
        this.start = undefined;
        this.end = undefined;
      } else {
        this.start = new Date(this.value.startDate ?? 0);
        this.end = new Date(this.value.endDate ?? 0);
      }
    },
    open: {
      handler(value) {
        if (document) {
          this.selectMonthDate(); //select initial visible months

          this.$nextTick(() => {
            value ? document.body.addEventListener('click', this.clickAway) : document.body.removeEventListener('click', this.clickAway)
            value ? document.addEventListener('keydown', this.handleEscape) : document.removeEventListener('keydown', this.handleEscape)

            if (!this.alwaysShowCalendars && this.ranges) {
              const ranges = this.ranges as Ranges;
              this.showCustomRangeCalendars = !Object.keys(ranges)
                .find(key => {
                  const range = ranges[key];
                  const rangeOne = range[0];
                  const rangeTwo = range[1];
                  this.$dateUtil.isSame(this.start, rangeOne, 'date') && this.$dateUtil.isSame(this.end, rangeTwo, 'date')
                })
            }
          })
        }
      },
      immediate: true
    }
  }
})

export default DateRangePicker;
</script>

<style lang="scss">
@import '@/assets/daterangepicker.scss';
</style>

<style lang="scss" scoped>
.calendars {
  display: flex;
  flex-wrap: wrap;
}

$week-width: 0px;

.reportrange-text {
  background: #fff;
  cursor: pointer;
  padding: 5px 10px;
  border: 1px solid #ccc;
  width: 100%;
  overflow: hidden;
}

.daterangepicker {
  flex-direction: column;
  display: flex;
  width: auto;

  //les than 768
  @media screen and (max-width: 768px) {
    &.show-ranges {
      .drp-calendar.left {
        border-left: 0px;
      }

      .ranges {
        border-bottom: 1px solid #ddd;
        width: 100%;

        ::v-deep ul {
          display: flex;
          flex-wrap: wrap;
          width: auto;
        }
      }
    }
  }

  @media screen and (max-width: 541px) {
    .calendars-container {
      flex-wrap: wrap;
    }
  }

  /*from 540 to 768*/
  @media screen and (min-width: 540px) {
    min-width: 486px;

    &.show-weeknumbers {
      min-width: 486px + $week-width;
    }
  }

  //more than 768
  @media screen and (min-width: 768px) {
    &.show-ranges {
      min-width: 682px;

      &.show-weeknumbers {
        min-width: 682px + $week-width;
      }
    }
  }

  &.single {
    @media screen and (max-width: 340px) {
      min-width: 250px;

      &.show-weeknumbers {
        min-width: 250px + $week-width;
      }
    }

    @media screen and (min-width: 339px) {
      min-width: auto;

      &.show-ranges {
        min-width: 356px;

        &.show-weeknumbers {
          min-width: 356px + $week-width;
        }

        .drp-calendar.left {
          border-left: 1px solid #ddd;
        }

        .ranges {
          //width: auto;
          max-width: none;
          flex-basis: auto;
          border-bottom: 0;

          ::v-deep ul {
            display: block;
            width: 100%;
          }
        }
      }
    }
  }

  &.show-calendar {
    display: block;
    top: auto;
  }
}

.daterangepicker {
  &.opensleft {
    /*top: 35px;*/
    right: 10px;
    left: auto;
  }

  &.openscenter {
    /*top: 35px;*/
    right: auto;
    left: 50%;
    transform: translate(-50%, 0);
  }

  &.opensright {
    /*top: 35px;*/
    left: 10px;
    right: auto;
  }
}

/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active {
  transition: all .2s ease;
}

.slide-fade-leave-active {
  transition: all .1s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter,
.slide-fade-leave-to

/* .slide-fade-leave-active for <2.1.8 */
  {
  transform: translateX(10px);
  opacity: 0;
}

.vue-daterange-picker {
  position: relative;
  display: inline-block;
  min-width: 60px;

  .show-ranges.hide-calendars {
    width: 150px;
    min-width: 150px;
  }
}

.inline {
  .daterangepicker {
    position: static;

    &:before,
    &:after {
      display: none;
    }
  }
}
</style>
