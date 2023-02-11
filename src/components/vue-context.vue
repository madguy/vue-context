<script lang="ts">
import { defineComponent, h, resolveDirective, withDirectives, vShow } from 'vue';
import { directive as onClickAway } from 'vue3-click-away';
import { KEYS, isVisibleFilter, parentElementByClassName } from '@/modules/utils';
import { normalizeSlot } from '@/modules/normalize-slot';
import type { PropType } from 'vue';

export default defineComponent({
  directives: {
    onClickAway,
  },

  props: {
    closeOnClick: {
      type: Boolean,
      default: true,
    },
    closeOnScroll: {
      type: Boolean,
      default: true,
    },
    lazy: {
      type: Boolean,
      default: false,
    },
    itemSelector: {
      type: [String, Array] as PropType<string | string[]>,
      default: () => ['.v-context-item', '.v-context > li > a'],
    },
    role: {
      type: String,
      default: 'menu',
    },
    subMenuOffset: {
      type: Number,
      default: 10,
    },
    useScrollHeight: {
      type: Boolean,
      default: false,
    },
    useScrollWidth: {
      type: Boolean,
      default: false,
    },
    heightOffset: {
      type: Number,
      default: 25,
    },
    widthOffset: {
      type: Number,
      default: 25,
    },
    tag: {
      type: String,
      default: 'ul',
    },
  },

  data(): {
    top: number;
    left: number;
    show: boolean;
    data: any;
    localItemSelector: string;
    activeSubMenu: HTMLUListElement | null;
  } {
    return {
      top: 0,
      left: 0,
      show: false,
      data: null,
      localItemSelector: '',
      activeSubMenu: null,
    };
  },

  computed: {
    style() {
      return this.show ? { top: `${this.top}px`, left: `${this.left}px` } : null;
    },
  },

  created() {
    this.localItemSelector = this.mapItemSelector(this.itemSelector);
  },

  beforeUnmount() {
    if (this.closeOnScroll) {
      this.removeScrollEventListener();
    }
  },

  methods: {
    addScrollEventListener() {
      window.addEventListener('scroll', this.close);
    },

    addHoverEventListener(element: HTMLElement) {
      element.querySelectorAll('.v-context__sub').forEach((subMenuNode) => {
        subMenuNode.addEventListener('mouseenter', this.openSubMenu);
        subMenuNode.addEventListener('mouseleave', this.closeSubMenu);
      });
    },

    close() {
      if (!this.show) {
        return;
      }

      // make sure all sub menus are closed
      while (this.activeSubMenu != null) {
        let parentElement = parentElementByClassName(this.activeSubMenu, 'v-context__sub');
        parentElement?.dispatchEvent(new Event('mouseleave'));
      }

      this.resetData();
      this.removeHoverEventListener(this.$el);

      if (this.closeOnScroll) {
        this.removeScrollEventListener();
      }

      this.$emit('close');
    },

    focusItem(index: number, items: HTMLElement[]) {
      const el = items[index];
      el?.focus();
    },

    async focusNext(event: KeyboardEvent, up: boolean) {
      if (!this.show) {
        return;
      }

      if (!(event.target instanceof HTMLElement)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      await new Promise((resolve) => this.$nextTick(() => resolve(true)));

      const items = this.getItems();
      if (items.length < 1) {
        return;
      }

      let index = items.indexOf(event.target);
      if (up && index > 0) {
        index--;
      } else if (!up && index < items.length - 1) {
        index++;
      }

      if (index < 0) {
        index = 0;
      }

      this.focusItem(index, items);
    },

    getItems() {
      // if a sub menu is active only return the elements of the sub menu to keep the scope
      return (this.activeSubMenu ?? this.$el ?? document)
        .querySelectorAll(this.localItemSelector)
        .filter(isVisibleFilter);
    },

    mapItemSelector(itemSelector: string | string[]) {
      if (Array.isArray(itemSelector)) {
        itemSelector = itemSelector.map((selector) => `${selector}:not(.disabled):not([disabled])`).join(', ');
      }

      return itemSelector;
    },

    onClick() {
      this.close();
    },

    onKeydown(event: KeyboardEvent) {
      const key = event.key;

      if (key === KEYS.ESC) {
        // Close on esc
        this.close();
      } else if (key === KEYS.DOWN) {
        // Down arrow
        this.focusNext(event, false);
      } else if (key === KEYS.UP) {
        // Up arrow
        this.focusNext(event, true);
      } else if (key === KEYS.RIGHT) {
        // check if a parent element which is associated with a sub menu can be found.
        if (!(event.target instanceof HTMLElement)) {
          return;
        }

        const menuContainer = parentElementByClassName(event.target, 'v-context__sub');

        // try to open a sub menu if the sub menu isn't the current sub menu
        if (menuContainer && menuContainer.getElementsByClassName('v-context')[0] !== this.activeSubMenu) {
          menuContainer.dispatchEvent(new Event('mouseenter'));
          this.focusNext(event, false);
        }
      } else if (key === KEYS.LEFT) {
        if (!this.activeSubMenu) {
          return;
        }

        const parentMenu = parentElementByClassName(this.activeSubMenu, 'v-context__sub');
        if (!(parentMenu instanceof HTMLElement)) {
          return;
        }

        parentMenu.dispatchEvent(new Event('mouseleave'));

        const items = this.getItems(),
          index = items.indexOf(parentMenu.getElementsByTagName('a')[0]);

        this.focusItem(index, items);
      }
    },

    open(event: MouseEvent, data: any) {
      this.data = data;
      this.show = true;

      this.$nextTick(() => {
        [this.top, this.left] = this.positionMenu(event.clientY, event.clientX, this.$el);

        this.$el.focus();
        this.setItemRoles();
        this.addHoverEventListener(this.$el);

        if (this.closeOnScroll) {
          this.addScrollEventListener();
        }

        this.$emit('open', event, this.data, this.top, this.left);
      });
    },

    openSubMenu(event: Event) {
      if (!(event.target instanceof HTMLElement)) {
        return;
      }

      const subMenuElement = this.getSubMenuElementByEvent(event);
      if (subMenuElement === undefined) {
        return;
      }

      const parentMenu = parentElementByClassName(subMenuElement.parentElement, 'v-context');
      if (!(parentMenu instanceof HTMLElement)) {
        return;
      }

      const bcr = event.target.getBoundingClientRect();

      // check if another sub menu is open. In this case make sure no other as well as no nested sub menu is open
      if (this.activeSubMenu !== parentMenu) {
        while (
          this.activeSubMenu != null &&
          this.activeSubMenu !== parentMenu &&
          this.activeSubMenu !== subMenuElement
        ) {
          const parentElement = parentElementByClassName(this.activeSubMenu, 'v-context__sub');
          parentElement?.dispatchEvent(new Event('mouseleave'));
        }
      }

      // first set the display and afterwards execute position calculation for correct element offsets
      subMenuElement.style.display = 'block';

      let [elementTop, elementLeft] = this.positionMenu(bcr.top, bcr.right - this.subMenuOffset, subMenuElement);

      subMenuElement.style.left = `${elementLeft}px`;
      subMenuElement.style.top = `${elementTop}px`;

      this.activeSubMenu = subMenuElement;
    },

    closeSubMenu(event: Event) {
      const subMenuElement = this.getSubMenuElementByEvent(event);
      if (subMenuElement === undefined) {
        return;
      }

      const parentMenu = parentElementByClassName(subMenuElement, 'v-context');

      // if a sub menu is closed and it's not the currently active sub menu (eg. a lowe layered sub menu closed
      // by a mouseleave event) close all nested sub menus
      if (this.activeSubMenu !== subMenuElement) {
        while (this.activeSubMenu != null && this.activeSubMenu !== subMenuElement) {
          const parentElement = parentElementByClassName(this.activeSubMenu, 'v-context__sub');
          parentElement?.dispatchEvent(new Event('mouseleave'));
        }
      }

      subMenuElement.style.display = 'none';

      // check if a parent menu exists and the parent menu is a sub menu to keep track of the correct sub menu
      this.activeSubMenu =
        parentMenu && parentElementByClassName(parentMenu, 'v-context__sub') ? (parentMenu as HTMLUListElement) : null;
    },

    getSubMenuElementByEvent(event: Event) {
      if (!(event.target instanceof HTMLElement)) {
        return;
      }
      return event.target.getElementsByTagName('ul')[0];
    },

    positionMenu(top: number, left: number, element: HTMLElement) {
      const elementHeight = this.useScrollHeight ? element.scrollHeight : element.offsetHeight;
      const largestHeight = window.innerHeight - elementHeight - this.heightOffset;

      const elementWidth = this.useScrollWidth ? element.scrollWidth : element.offsetWidth;
      const largestWidth = window.innerWidth - elementWidth - this.widthOffset;

      if (top > largestHeight) {
        top = largestHeight;
      }

      if (left > largestWidth) {
        left = largestWidth;
      }

      return [top, left];
    },

    removeScrollEventListener() {
      window.removeEventListener('scroll', this.close);
    },

    removeHoverEventListener(element: HTMLElement) {
      element.querySelectorAll('.v-context__sub').forEach((subMenuNode) => {
        subMenuNode.removeEventListener('mouseenter', this.openSubMenu);
        subMenuNode.removeEventListener('mouseleave', this.closeSubMenu);
      });
    },

    resetData() {
      this.top = 0;
      this.left = 0;
      this.data = null;
      this.show = false;
    },

    setItemRoles() {
      // Add role="menuitem" and tabindex="-1" to all items
      for (const el of this.$el.querySelectorAll(this.localItemSelector)) {
        el.setAttribute('role', 'menuitem');
        el.setAttribute('tabindex', '-1');
      }
    },
  },

  watch: {
    closeOnScroll(newValue, oldValue) {
      if (newValue === oldValue) {
        return;
      }

      if (newValue && this.show) {
        this.addScrollEventListener();
      } else {
        this.removeScrollEventListener();
      }
    },

    itemSelector(selector, oldValue) {
      if (selector !== oldValue) {
        this.localItemSelector = this.mapItemSelector(selector);
      }
    },
  },

  render() {
    if (this.lazy && !this.show) {
      return;
    }

    // Only register the events we need
    const events = {
      onKeydown: this.onKeydown, // up, down, esc
      onClick: () => {},
    };

    if (this.closeOnClick) {
      events.onClick = this.onClick;
    }

    // Only register the directives we need
    const directives: any[] = [[resolveDirective('on-click-away'), this.close]];

    if (!this.lazy) {
      directives.push([vShow, this.show]);
    }

    return withDirectives(
      h(
        this.tag,
        {
          class: 'v-context',
          style: this.style,
          tabindex: '-1',
          role: this.role,
          'aria-hidden': this.lazy ? null : String(!this.show),
          ...events,
        },
        [normalizeSlot('default', { data: this.data }, this.$slots)]
      ),
      directives
    );
  },
});
</script>

<style lang="scss">
@use '@/sass/vue-context.scss' as *;
</style>
