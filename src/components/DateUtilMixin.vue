<script lang="ts">
import { PropType } from 'vue';
import nativeUtil, { DateUtil } from '../dateUtil.js';

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
