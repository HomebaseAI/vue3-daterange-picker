<script lang="ts">
import type Vue from 'vue';
import type { DateRangePickerType } from '../DateRangePicker.vue';

type Bindings = Vue.DirectiveBinding<DateRangePickerType>;

const appendToBody: Vue.Directive = {
  beforeMount(el, bindings: Bindings) {
    const context = bindings.instance as DateRangePickerType;
    if (context?.appendToBody) {
      // @ts-ignore
      const {height, top, left, width, right} = context.$refs.toggle?.getBoundingClientRect();

      el.unbindPosition = context.calculatePosition(el, context, {
        width: width,
        top: (window.scrollY + top + height),
        left: (window.scrollX + left),
        right: right
      });

      document.body.appendChild(el);
    } else {
      context.$el.appendChild(el)
    }
  },

  unmounted(el, binding: Bindings) {
    const context = binding.instance as DateRangePickerType;
    if (context.appendToBody) {
      if (el.unbindPosition && typeof el.unbindPosition === 'function') {
        el.unbindPosition();
      }
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }
  },
}

export default appendToBody;
</script>