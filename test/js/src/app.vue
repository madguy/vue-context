<template>
    <div class="container py-3 mt-5">
        <ul class="list-group">
            <li v-for="(item, index) in items" :key="index"
                class="list-group-item"
                @contextmenu.prevent="$refs.menu.open"
            >
                {{ item }}
            </li>
        </ul>

        <vue-context ref="menu" @close="onClose">
            <template #default="child">
                <li tabindex="0">
                    <a href="#" class="v-context-item"
                       @click.prevent="onClick('item 1')"
                    >
                        Do something
                    </a>
                </li>
                <li class="v-context__sub">
                    <a href="#" class="v-context-item"
                       @click.prevent="onClick('item 2')"
                    >
                        Do something else
                    </a>
                    <ul class="v-context">
                        <li tabindex="0">
                            <a href="#" class="v-context-item"
                               @click.prevent="onClick('sub item 1')"
                            >
                                Submenu
                            </a>
                        </li>
                        <li class="v-context__sub">
                            <a href="#" class="v-context-item"
                               @click.prevent="onClick('sub item 2')"
                            >
                                Submenu next
                            </a>

                            <ul class="v-context">
                                <li tabindex="0">
                                    <a href="#" class="v-context-item"
                                       @click.prevent="onClick('sub sub item 1')"
                                    >
                                        We need to go deeper
                                    </a>
                                </li>
                                <li tabindex="0">
                                    <a href="#" class="v-context-item"
                                       @click.prevent="onClick('sub sub item 2')"
                                    >
                                        double nested Submenu
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <a href="#" class="v-context-item"
                               @click.prevent="onClick('sub item 3')"
                            >
                                Submenu next
                            </a>
                        </li>
                        <li class="v-context__sub">
                            <a href="#" class="v-context-item"
                               @click.prevent="onClick('sub item 4')"
                            >
                                second nested Submenu
                            </a>

                            <ul class="v-context">
                                <li tabindex="0">
                                    <a href="#" class="v-context-item"
                                       @click.prevent="onClick('sub sub item 3')"
                                    >
                                        sub sub
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#" class="v-context-item"
                       @click.prevent="onClick('item 3')"
                    >
                        Another option
                    </a>
                </li>
            </template>
        </vue-context>
    </div>
</template>

<script>
import VueContext from "../../../src/js/vue-context";

export default {
    components: {
        VueContext
    },

    data() {
        return {
            close: true,
            closeCount: 0,
            menuRefs: [],
            items: [
                'Cras justo odio',
                'Dapibus ac facilisis in',
                'Morbi leo risus',
                'Porta ac consectetur ac',
                'Vestibulum at eros'
            ]
        }
    },

    methods: {
        onClick (text) {
            console.log(text)
        },

        onClose() {
            console.log('close fired');
            console.log(++this.closeCount);
        },
        addMenuRef(el) {
            if (!el) {
                return;
            }
            this.menuRefs.push(el)
        },
    },
}
</script>

<style lang="scss" scoped>
    @use '../../../src/sass/vue-context' as *;
</style>
