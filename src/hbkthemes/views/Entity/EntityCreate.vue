<template>
    <div>
        <HeaderPage />
        <Card class="mb-8">
            <template #title>Remplissez les champs ci-dessous</template>
            <template #content>
                <div class="p-5 bg-gray-50 my-2">
                    <CustomForm />
                </div>
            </template>
        </Card>
    </div>
</template>
<script setup lang="ts">
import HeaderPage from '@/hbkthemes/components/HeaderPage.vue';
import CustomForm from '@/hbkthemes/views/Entity/EntityForm.vue';
import Card from 'primevue/card';
</script>
