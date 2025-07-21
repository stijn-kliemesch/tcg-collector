<template>
  <v-navigation-drawer
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    temporary
    close-on-back
  >
    <v-list>
      <v-list-item
        v-for="item in menuItems"
        :key="item.value"
        :prepend-icon="item.icon"
        :title="item.title"
        :value="item.value"
        :active="currentPage === item.value"
        @click="handleItemClick(item.value)"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AppNavigation',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    currentPage: {
      type: String,
      required: true
    }
  },
  emits: ['update:modelValue', 'update:currentPage'],
  setup(props, { emit }) {
    const handleItemClick = (value: string) => {
      emit('update:currentPage', value)
      emit('update:modelValue', false)
    }

    const menuItems = [
      { icon: 'mdi-view-grid', title: 'Collection', value: 'collection' },
      { icon: 'mdi-store', title: 'Market', value: 'market' },
      { icon: 'mdi-magnify', title: 'Lookup', value: 'lookup' },
      { icon: 'mdi-cards', title: 'Sets', value: 'sets' },
      { icon: 'mdi-information', title: 'About', value: 'about' },
      { icon: 'mdi-cog', title: 'Settings', value: 'settings' }
    ]

    return {
      menuItems,
      handleItemClick
    }
  }
})
</script>
