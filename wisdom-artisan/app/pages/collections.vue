<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({
    title: 'collections - Wisdom Artisan',
    description: 'แพลตฟอร์มรวบรวมภูมิปัญญาและงานฝีมือไทยจากช่างฝีมือทั่วประเทศ'
})
</script>
<template>
    <Navbar/>
    <section>
        <Gallery />
        <Footer />
    </section>
</template>