<template>
  <div class="ranges">
    <ul v-if="ranges">
      <li v-for="range in listedRanges" @click="clickRange(range.value)" :data-range-key="range.label" :key="range.label"
        :class="range_class(range)" tabindex="0">{{ range.label }}
      </li>
      <li v-if="showCustomRangeLabel" :class="{ active: customRangeActive || !selectedRange }" @click="clickCustomRange"
        tabindex="0">
        {{ localeData.customRangeLabel }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { LocaleOptions } from '../dateUtil.js';
import DateUtilMixin from './DateUtilMixin.vue';


type Ranges = {
  label: string,
  value: Date[],
  selected: boolean
}

export default {
  mixins: [DateUtilMixin],
  props: {
    ranges: {
      type: Object as PropType<{ [key: string]: Date[] }>,
      required: true,
    },
    selected: {
      type: Object as PropType<{ startDate: Date, endDate: Date }>,
      required: true,
    },
    localeData: {
      type: Object as PropType<LocaleOptions>,
      required: true,
    },
    alwaysShowCalendars: Boolean,
  },
  data() {
    return {
      customRangeActive: false
    }
  },
  methods: {
    clickRange(range: Date[]) {
      this.customRangeActive = false
      this.$emit('clickRange', range)
    },
    clickCustomRange() {
      this.customRangeActive = true
      this.$emit('showCustomRange')
    },
    range_class(range: Ranges) {
      return { active: range.selected === true };
    }
  },
  computed: {
    listedRanges(): Ranges[] {
      if (!this.ranges)
        return [];
      return Object.keys(this.ranges).map(value => {
        return {
          label: value,
          value: this.ranges[value],
          selected:
            this.$dateUtil.isSame(this.selected.startDate, this.ranges[value][0]) &&
            this.$dateUtil.isSame(this.selected.endDate, this.ranges[value][1])
        };
      })
    },
    selectedRange() {
      return this.listedRanges.find(r => r.selected === true)
    },
    showCustomRangeLabel() {
      return !this.alwaysShowCalendars;
    }
  },
}
</script>
