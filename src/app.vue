<script lang="ts" setup>
import { ref } from 'vue';
import VueContext from '@/vue-context.vue';

const menu = ref<typeof VueContext | null>(null);
const closeCount = ref(0);
const items = ref([
  'Cras justo odio',
  'Dapibus ac facilisis in',
  'Morbi leo risus',
  'Porta ac consectetur ac',
  'Vestibulum at eros',
]);

function openContextMenu(e: MouseEvent) {
  menu.value?.open(e, { x: 10, y: 20 });
}

function onClick(text: string, payload: any) {
  console.log(text, payload);
}

function onClose() {
  console.log('close fired');
  console.log(++closeCount.value);
}
</script>

<template>
  <div class="container py-3 mt-5">
    <ul class="list-group">
      <li v-for="(item, index) in items" :key="index" class="list-group-item" @contextmenu.prevent="openContextMenu">
        {{ item }}
      </li>
    </ul>

    <vue-context ref="menu" @close="onClose">
      <template #default="{ data }: { data: any }">
        <li tabindex="0">
          <a href="#" class="v-context-item" @click.prevent="onClick('item 1', data)"> Do something </a>
        </li>
        <li class="v-context__sub">
          <a href="#" class="v-context-item" @click.prevent="onClick('item 2', data)"> Do something else </a>
          <ul class="v-context">
            <li tabindex="0">
              <a href="#" class="v-context-item" @click.prevent="onClick('sub item 1', data)"> Submenu </a>
            </li>
            <li class="v-context__sub">
              <a href="#" class="v-context-item" @click.prevent="onClick('sub item 2', data)"> Submenu next </a>

              <ul class="v-context">
                <li tabindex="0">
                  <a href="#" class="v-context-item" @click.prevent="onClick('sub sub item 1', data)">
                    We need to go deeper
                  </a>
                </li>
                <li tabindex="0">
                  <a href="#" class="v-context-item" @click.prevent="onClick('sub sub item 2', data)">
                    double nested Submenu
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <a href="#" class="v-context-item" @click.prevent="onClick('sub item 3', data)"> Submenu next </a>
            </li>
            <li class="v-context__sub">
              <a href="#" class="v-context-item" @click.prevent="onClick('sub item 4', data)">
                second nested Submenu
              </a>

              <ul class="v-context">
                <li tabindex="0">
                  <a href="#" class="v-context-item" @click.prevent="onClick('sub sub item 3', data)"> sub sub </a>
                </li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          <a href="#" class="v-context-item" @click.prevent="onClick('item 3', data)"> Another option </a>
        </li>
      </template>
    </vue-context>
  </div>
</template>
