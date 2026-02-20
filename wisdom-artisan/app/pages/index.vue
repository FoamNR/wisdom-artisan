<script setup lang="ts">
import HeroSearch from '~/components/HeroSearch.vue';
import WorkGallery from '~/components/WorkGallery.vue';
import ThailandMap from '~/components/ThailandMap.vue';
definePageMeta({ layout: false, })

useSeoMeta({
    title: 'Wisdom Artisan',
    description: 'แพลตฟอร์มรวบรวมภูมิปัญญาและงานฝีมือไทยจากช่างฝีมือทั่วประเทศ'
})


</script>
<template>
    <div class="bg-[#F8F9FA]">
        <Navbar />
        <div>
            <HeroSearch />
            <RecommendedCollections />
            <WorkGallery />
                <ClientOnly><ThailandMap /></ClientOnly>
            <Footer />
        </div>
    </div>
</template>