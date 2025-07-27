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
        :active="$route.name === item.value"
        :to="{ name: item.value }"
        @click="$emit('update:modelValue', false)"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const menuItems = [
  { icon: 'mdi-view-grid', title: 'Collection', value: 'collection' },
  { icon: 'mdi-store', title: 'Market', value: 'market' },
  { icon: 'mdi-magnify', title: 'Lookup', value: 'lookup' },
  { icon: 'mdi-cards', title: 'Sets', value: 'sets' },
  { icon: 'mdi-information', title: 'About', value: 'about' },
  { icon: 'mdi-cog', title: 'Settings', value: 'settings' },
];
</script>
