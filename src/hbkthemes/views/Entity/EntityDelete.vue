<template>
    <div>
        <HeaderPage />
        <Card class="mb-8">
            <template #title>Remplissez les champs ci-dessous</template>
            <template #content>
                <CustomForm />
            </template>
        </Card>
    </div>
</template>
<script setup lang="ts">
import HeaderPage from '@/hbkthemes/components/HeaderPage.vue';
import CustomForm from '@/hbkthemes/views/Entity/EntityForm.vue';
import Card from 'primevue/card';
</script>
