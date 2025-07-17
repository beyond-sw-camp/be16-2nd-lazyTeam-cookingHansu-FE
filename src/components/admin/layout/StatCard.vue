<template>
  <v-card class="stat-card" outlined>
    <v-card-title>
      <v-icon large :color="iconColor">{{ icon }}</v-icon>
      <div class="info">
        <div class="label">{{ label }}</div>
        <div class="count">{{ count }}</div>
      </div>
    </v-card-title>
  </v-card>
</template>

<script setup>
defineProps({
  icon: String,
  iconColor: String,
  label: String,
  count: Number,
})
</script>

<style scoped>
.stat-card {
  padding: 20px;
  display: flex;
  align-items: center;
  height: 120px;
}
.info {
  margin-left: 15px;
}
.label {
  font-size: 14px;
  color: #888;
}
.count {
  font-size: 28px;
  font-weight: bold;
}
</style>