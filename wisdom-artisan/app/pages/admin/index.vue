<script setup lang="ts">
import StatCard from '~/components/Admin/StatCard.vue'
import ActivityTable from '~/components/Admin/ActivityTable.vue'
import axios from 'axios'
import Highcharts from 'highcharts'
import type { Options } from 'highcharts'
import { ref, onMounted, watch } from 'vue'

/* ================== INTERFACES ================== */
interface CountPratcha {
  total_artisans: number
  total_provinces: number
  total_categories: number
  total_drafts: number
  // [NEW] เพิ่มฟิลด์ยอดวิวรวม
  total_artisan_views: number
  total_product_views: number
}

interface ProvinceCount {
  province: string
  count: number
}

interface CategoryStat {
  category_id: number
  category_name: string
  count: number
  color?: string
}

// [NEW] Interface สำหรับ Top 5
interface TopViewItem {
  name: string
  views: number
}

/* ================== META ================== */
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-log'] // เช็ค Middleware ให้ถูกต้อง
})

useSeoMeta({
  title: 'Wisdom Artisan - ภาพรวมสำหรับผู้ดูแลระบบ',
  description: 'Dashboard สำหรับผู้ดูแลระบบฐานข้อมูลปราชญ์ชาวบ้าน'
})

/* ================== STATE ================== */
const pratchaCount = useState<CountPratcha>('pratchaCount', () => ({
  total_artisans: 0,
  total_provinces: 0,
  total_categories: 0,
  total_drafts: 0,
  total_artisan_views: 0,
  total_product_views: 0
}))

const provinceTop5 = useState<ProvinceCount[]>('provinceTop5', () => [])
const categoryStats = useState<CategoryStat[]>('categoryStats', () => [])

// [NEW] State สำหรับ Top Views
const topArtisans = useState<TopViewItem[]>('topArtisans', () => [])
const topProducts = useState<TopViewItem[]>('topProducts', () => [])

const chartColors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']

/* ================== CHART REFS ================== */
const provinceChartEl = ref<HTMLDivElement | null>(null)
const categoryChartEl = ref<HTMLDivElement | null>(null)
// [NEW] Refs สำหรับกราฟใหม่
const artisanViewChartEl = ref<HTMLDivElement | null>(null)
const productViewChartEl = ref<HTMLDivElement | null>(null)

let provinceChart: Highcharts.Chart | undefined
let categoryChart: Highcharts.Chart | undefined
// [NEW] Instances
let artisanViewChart: Highcharts.Chart | undefined
let productViewChart: Highcharts.Chart | undefined

/* ================== API ================== */
const getCountPratcha = async () => {
  try {
    const { data } = await axios.get('http://localhost:4000/artisan/count', { withCredentials: true })
    // Update แค่ส่วน count พื้นฐาน (เดี๋ยว view จะมาจากการ fetch stats ใหม่)
    pratchaCount.value = { ...pratchaCount.value, ...data }
  } catch (error) {
    console.error('Failed to fetch counts:', error)
  }
}

const getProvinceTop5 = async () => {
  try {
    const { data } = await axios.get('http://localhost:4000/artisan/artisan/by-province', { withCredentials: true })
    provinceTop5.value = data.slice(0, 5).map((i: any) => ({ province: i.province, count: Number(i.count) }))
  } catch (error) {
    console.error('Failed to fetch provinces:', error)
  }
}

const getCategoryStats = async () => {
  try {
    const { data } = await axios.get('http://localhost:4000/category/', { withCredentials: true }) // เช็ค path backend ให้ตรง
    categoryStats.value = data.map((i: any, index: number) => ({
      category_id: i.category_id,
      category_name: i.category_name,
      count: Number(i.artisan_count || 0), // ต้องแน่ใจว่า backend ส่ง artisan_count มา
      color: chartColors[index % chartColors.length]
    }))
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

// [NEW] ดึงข้อมูล Top Views
const getTopViews = async () => {
  try {
    const { data } = await axios.get('http://localhost:4000/admin/stats/top-views', { withCredentials: true }) // path ตามที่แก้ใน backend
    
    topArtisans.value = data.top_artisans.map((i: any) => ({ name: i.name, views: Number(i.views) }))
    topProducts.value = data.top_products.map((i: any) => ({ name: i.name, views: Number(i.views) }))
    
    // อัปเดตยอดวิวรวม
    pratchaCount.value.total_artisan_views = data.total_views.artisan
    pratchaCount.value.total_product_views = data.total_views.product
  } catch (error) {
    console.error('Failed to fetch top views:', error)
  }
}

/* ================== CHART RENDER ================== */
const renderProvinceChart = () => {
  if (!provinceChartEl.value) return
  if (provinceChart) provinceChart.destroy()

  provinceChart = Highcharts.chart(provinceChartEl.value, {
    chart: { type: 'column' },
    title: { text: undefined },
    xAxis: { categories: provinceTop5.value.map(i => i.province) },
    yAxis: { min: 0, title: { text: 'จำนวนปราชญ์' } },
    tooltip: { valueSuffix: ' คน' },
    series: [{ type: 'column', name: 'จำนวนปราชญ์', data: provinceTop5.value.map(i => i.count), color: '#10b981' }],
    credits: { enabled: false }
  } as Options)
}

const renderCategoryChart = () => {
  if (!categoryChartEl.value) return
  if (categoryChart) categoryChart.destroy()

  categoryChart = Highcharts.chart(categoryChartEl.value, {
    chart: { type: 'pie' },
    title: { text: undefined },
    tooltip: { pointFormat: '<b>{point.percentage:.1f}%</b> ({point.y})' },
    plotOptions: { pie: { innerSize: '60%', dataLabels: { enabled: true, format: '{point.name}' } } },
    series: [{ type: 'pie', name: 'จำนวน', data: categoryStats.value.map(i => ({ name: i.category_name, y: i.count, color: i.color })) }],
    credits: { enabled: false }
  } as Options)
}

// [NEW] Render กราฟยอดวิวปราชญ์ (Bar Chart แนวนอน)
const renderArtisanViewChart = () => {
  if (!artisanViewChartEl.value) return
  if (artisanViewChart) artisanViewChart.destroy()

  artisanViewChart = Highcharts.chart(artisanViewChartEl.value, {
    chart: { type: 'bar' }, // bar คือแนวนอน
    title: { text: undefined },
    xAxis: { 
      categories: topArtisans.value.map(i => i.name),
      title: { text: null }
    },
    yAxis: { min: 0, title: { text: 'จำนวนการเข้าชม (ครั้ง)' } },
    tooltip: { valueSuffix: ' วิว' },
    plotOptions: { bar: { dataLabels: { enabled: true } } },
    series: [{ 
      type: 'bar', 
      name: 'ยอดวิว', 
      data: topArtisans.value.map(i => i.views), 
      color: '#3b82f6' 
    }],
    credits: { enabled: false },
    legend: { enabled: false }
  } as Options)
}

// [NEW] Render กราฟยอดวิวสินค้า (Bar Chart แนวนอน)
const renderProductViewChart = () => {
  if (!productViewChartEl.value) return
  if (productViewChart) productViewChart.destroy()

  productViewChart = Highcharts.chart(productViewChartEl.value, {
    chart: { type: 'bar' },
    title: { text: undefined },
    xAxis: { 
      categories: topProducts.value.map(i => i.name),
      title: { text: null }
    },
    yAxis: { min: 0, title: { text: 'จำนวนการเข้าชม (ครั้ง)' } },
    tooltip: { valueSuffix: ' วิว' },
    plotOptions: { bar: { dataLabels: { enabled: true } } },
    series: [{ 
      type: 'bar', 
      name: 'ยอดวิว', 
      data: topProducts.value.map(i => i.views), 
      color: '#f59e0b' 
    }],
    credits: { enabled: false },
    legend: { enabled: false }
  } as Options)
}

/* ================== WATCH ================== */
watch(provinceTop5, (val) => { if (val.length > 0) renderProvinceChart() }, { deep: true })
watch(categoryStats, (val) => { if (val.length > 0) renderCategoryChart() }, { deep: true })
// [NEW] Watchers for new charts
watch(topArtisans, (val) => { if (val.length > 0) renderArtisanViewChart() }, { deep: true })
watch(topProducts, (val) => { if (val.length > 0) renderProductViewChart() }, { deep: true })

/* ================== LIFECYCLE ================== */
onMounted(() => {
  getCountPratcha()
  getProvinceTop5()
  getCategoryStats()
  getTopViews() // เรียก API ใหม่
})
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800">ภาพรวมสำหรับผู้ดูแลระบบ</h1>
      <p class="text-slate-500 text-sm">สถิติสรุปแบบ Real-time ของระบบ</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard title="ปราชญ์ทั้งหมด" :value="pratchaCount.total_artisans" icon="users" />
      <StatCard title="ประเภทงานฝีมือ" :value="pratchaCount.total_categories" icon="layers" />
      <StatCard title="ยอดเข้าชมปราชญ์รวม" :value="pratchaCount.total_artisan_views" icon="eye" color="blue" />
      <StatCard title="ยอดเข้าชมสินค้าสรวม" :value="pratchaCount.total_product_views" icon="shopping-bag" color="orange" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 class="font-bold text-lg mb-4 text-slate-700">จำนวนปราชญ์แยกตามจังหวัด</h3>
        <ClientOnly>
          <div ref="provinceChartEl" class="w-full h-[320px]" />
        </ClientOnly>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 class="font-bold text-lg mb-4 text-slate-700">สัดส่วนประเภทงาน</h3>
        <ClientOnly>
          <div ref="categoryChartEl" class="w-full h-[320px]" />
        </ClientOnly>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div class="flex items-center justify-between mb-4">
             <h3 class="font-bold text-lg text-slate-700">5 อันดับ ปราชญ์ยอดนิยม</h3>
             <span class="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-lg">Top Views</span>
        </div>
        <ClientOnly>
          <div ref="artisanViewChartEl" class="w-full h-[300px]" />
        </ClientOnly>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div class="flex items-center justify-between mb-4">
             <h3 class="font-bold text-lg text-slate-700">5 อันดับ สินค้ายอดนิยม</h3>
             <span class="text-xs font-medium px-2 py-1 bg-orange-50 text-orange-600 rounded-lg">Top Views</span>
        </div>
        <ClientOnly>
          <div ref="productViewChartEl" class="w-full h-[300px]" />
        </ClientOnly>
      </div>
    </div>

    <ActivityTable />
  </div>
</template>