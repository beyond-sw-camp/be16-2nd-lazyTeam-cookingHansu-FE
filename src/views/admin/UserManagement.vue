<template>
    <v-container fluid>
        <h2 class="mt-4" :style="{ color: colors.text }">요리사 승인 관리</h2>
        <p class="mb-6" :style="{ color: colors.text }">요리사 승인 요청 현황</p>
    
        <v-data-table
        :headers="headers"
        :items="chefs"
        class="elevation-1"
        :loading="loading"
        item-value="id"
        >
        <template v-slot:item.status="{ item }">
            <v-chip
            :color="item.status === '승인 대기' ? 'orange' : 'green'"
            text-color="white"
            >
            {{ item.status }}
            </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
            <v-btn
            color="primary"
            @click="approveChef(item.id)"
            v-if="item.status === '승인 대기'"
            >
            승인
            </v-btn>
            <v-btn
            color="error"
            @click="rejectChef(item.id)"
            v-if="item.status === '승인 대기'"
            >
            거절
            </v-btn>
        </template>
        </v-data-table>
    </v-container>
</template>