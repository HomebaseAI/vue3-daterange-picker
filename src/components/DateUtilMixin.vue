<script lang="ts">
import type { PropType } from 'vue';
import nativeUtil, { type DateUtil } from '../dateUtil.js';

export default {
  inject: {
    $dateUtil: {
      type: Object as PropType<DateUtil>,
      default: nativeUtil,
    },
  },
  setup(_, ctx) {
    return {
      $dateUtil: nativeUtil,
    }
  }
};
</script>
