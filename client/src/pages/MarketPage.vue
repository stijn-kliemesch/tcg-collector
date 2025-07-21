<script setup lang="ts">
// Future imports will go here
</script>

<template>
  <v-container class="mt-4">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Market</v-card-title>
          <v-card-subtitle>Coming Soon</v-card-subtitle>
          <v-card-text>
            <v-list lines="two">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-tag-multiple" color="primary"></v-icon>
                </template>
                <v-list-item-title>Price Tracking</v-list-item-title>
                <v-list-item-subtitle>Monitor market prices for your cards</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-chart-line" color="primary"></v-icon>
                </template>
                <v-list-item-title>Market Trends</v-list-item-title>
                <v-list-item-subtitle>View price history and market trends</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-store-search" color="primary"></v-icon>
                </template>
                <v-list-item-title>Seller Search</v-list-item-title>
                <v-list-item-subtitle>Find the best deals from trusted sellers</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-swap-horizontal" color="primary"></v-icon>
                </template>
                <v-list-item-title>Trading Platform</v-list-item-title>
                <v-list-item-subtitle>Safely trade cards with other collectors</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
