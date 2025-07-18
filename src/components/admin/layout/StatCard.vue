<template>
  <v-card class="stat-card" outlined>
    <v-card-title>
      <div class="info">
        <div class="label">{{ label }}</div>
        <div class="count">{{ count }}</div>
      </div>
      <img :src="icon" :alt="label" width="24" />
    </v-card-title>
  </v-card>
</template>

<script>
import { colors } from '@/constants/color.js'

export default {
  props: {
    icon: String,
    label: String,
    count: Number,
  },
  data() {
    return { colors }
  },
}
</script>

<style scoped>
.stat-card {
  padding: 20px;
  display: flex;
  align-items: center;
  height: 120px;
  background-color: var(--color-white);
  border-radius: 12px;
}

.v-card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0;
}
.info {
  margin-left: 15px;
}
.label {
  font-size: 14px;
  color: var(--color-text);
}
.count {
  font-size: 28px;
  font-weight: bold;
  color: var(--color-text);
}
</style>