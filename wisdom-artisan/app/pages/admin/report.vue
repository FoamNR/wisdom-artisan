<script setup>
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
  , middleware: ['auth', 'admin-log']
})

// 1. Mock Data: ข้อมูลสรุปตัวเลข
const stats = ref([
  { 
    title: 'ปราชญ์ชาวบ้านทั้งหมด', 
    value: '124', 
    unit: 'คน',
    change: '+12%', 
    trend: 'up',
    iconColor: 'bg-blue-50 text-blue-600',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
  },
  { 
    title: 'หมวดหมู่งานฝีมือ', 
    value: '15', 
    unit: 'หมวด',
    change: '+2', 
    trend: 'up',
    iconColor: 'bg-orange-50 text-orange-600',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>'
  },
  { 
    title: 'รอการตรวจสอบ', 
    value: '5', 
    unit: 'รายการ',
    change: '-2', 
    trend: 'down',
    iconColor: 'bg-yellow-50 text-yellow-600',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
  },
  { 
    title: 'ยอดเข้าชมเดือนนี้', 
    value: '8.5k', 
    unit: 'ครั้ง',
    change: '+24%', 
    trend: 'up',
    iconColor: 'bg-green-50 text-green-600',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>'
  }
])

// 2. Mock Data: จังหวัดยอดนิยม (ใช้แสดง Progress Bar)
const topProvinces = ref([
  { name: 'เชียงใหม่', count: 45, percent: 85, color: 'bg-green-500' },
  { name: 'ขอนแก่น', count: 32, percent: 60, color: 'bg-blue-500' },
  { name: 'พระนครศรีอยุธยา', count: 28, percent: 50, color: 'bg-indigo-500' },
  { name: 'นครศรีธรรมราช', count: 15, percent: 30, color: 'bg-orange-500' },
  { name: 'สุรินทร์', count: 12, percent: 25, color: 'bg-slate-500' },
])

// 3. Mock Data: กิจกรรมล่าสุด
const recentActivities = ref([
  { id: 1, user: 'Admin', action: 'เพิ่มปราชญ์คนใหม่', target: 'คุณยายสมศรี', time: '10 นาทีที่แล้ว', type: 'add' },
  { id: 2, user: 'Admin', action: 'แก้ไขข้อมูล', target: 'กลุ่มทอผ้าไหม', time: '1 ชั่วโมงที่แล้ว', type: 'edit' },
  { id: 3, user: 'Staff A', action: 'อนุมัติสถานะ', target: 'เครื่องเงินล้านนา', time: '3 ชั่วโมงที่แล้ว', type: 'approve' },
  { id: 4, user: 'System', action: 'สำรองข้อมูลอัตโนมัติ', target: 'Database', time: '5 ชั่วโมงที่แล้ว', type: 'system' },
])

const getActionColor = (type) => {
  if (type === 'add') return 'bg-green-100 text-green-600'
  if (type === 'edit') return 'bg-blue-100 text-blue-600'
  if (type === 'approve') return 'bg-purple-100 text-purple-600'
  return 'bg-gray-100 text-gray-600'
}

const getActionIcon = (type) => {
  if (type === 'add') return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>'
  if (type === 'edit') return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>'
  if (type === 'approve') return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>'
  return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>'
}

</script>

<template>
  <div class="font-sans text-slate-800 p-6 min-h-screen">
    
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">ภาพรวมระบบ (Dashboard)</h1>
        <p class="text-slate-500 text-sm mt-1">สรุปข้อมูลสถิติและการดำเนินงานของฐานข้อมูลปราชญ์ชาวบ้าน</p>
      </div>
      
      <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
        <button class="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-md">วันนี้</button>
        <button class="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-gray-50 rounded-md transition">7 วัน</button>
        <button class="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-gray-50 rounded-md transition">30 วัน</button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="(stat, index) in stats" :key="index" class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 mb-1">{{ stat.title }}</p>
            <div class="flex items-baseline gap-1">
              <h3 class="text-2xl font-bold text-slate-800">{{ stat.value }}</h3>
              <span class="text-sm text-slate-400 font-normal">{{ stat.unit }}</span>
            </div>
          </div>
          <div class="p-3 rounded-lg" :class="stat.iconColor" v-html="stat.icon"></div>
        </div>
        <div class="mt-4 flex items-center text-xs">
          <span :class="stat.trend === 'up' ? 'text-green-600' : 'text-red-600'" class="flex items-center font-medium">
             <span class="mr-1">{{ stat.change }}</span>
             <svg v-if="stat.trend === 'up'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
             <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
          </span>
          <span class="text-slate-400 ml-2">จากเดือนที่แล้ว</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      
      <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-bold text-slate-800">สถิติการเพิ่มข้อมูลปราชญ์ (รายเดือน)</h3>
          <button class="text-slate-400 hover:text-green-600 transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
          </button>
        </div>
        
        <div class="flex items-end justify-between h-48 pt-4 gap-2 md:gap-4">
          <div v-for="h in [40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95]" :key="h" class="w-full flex flex-col items-center group cursor-pointer">
             <div class="relative w-full bg-green-50 rounded-t-sm h-full overflow-hidden">
                <div class="absolute bottom-0 w-full bg-green-500 rounded-t-sm transition-all duration-500 group-hover:bg-green-600" :style="`height: ${h}%`"></div>
             </div>
             <span class="text-[10px] text-slate-400 mt-2">M{{ h > 90 ? 12 : (h/10 + 2).toFixed(0) }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 class="font-bold text-slate-800 mb-6">จังหวัดที่มีปราชญ์มากที่สุด</h3>
        <div class="space-y-5">
          <div v-for="(prov, idx) in topProvinces" :key="idx">
            <div class="flex justify-between items-end mb-1">
              <span class="text-sm font-medium text-slate-700">{{ prov.name }}</span>
              <span class="text-xs text-slate-500">{{ prov.count }} คน</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div class="h-2 rounded-full transition-all duration-500" :class="prov.color" :style="`width: ${prov.percent}%`"></div>
            </div>
          </div>
        </div>
        <button class="w-full mt-6 py-2 text-sm text-green-600 font-medium hover:bg-green-50 rounded-lg transition">ดูทั้งหมด</button>
      </div>

    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 class="font-bold text-slate-800">การดำเนินการล่าสุด</h3>
        <button class="text-sm text-green-600 hover:underline">ดูประวัติทั้งหมด</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
            <tr>
              <th class="px-6 py-3">ผู้ใช้งาน</th>
              <th class="px-6 py-3">การกระทำ</th>
              <th class="px-6 py-3">เป้าหมาย</th>
              <th class="px-6 py-3 text-right">เวลา</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 text-sm">
            <tr v-for="activity in recentActivities" :key="activity.id" class="hover:bg-gray-50/50">
              <td class="px-6 py-4 font-medium text-slate-700">{{ activity.user }}</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium" :class="getActionColor(activity.type)">
                  <span v-html="getActionIcon(activity.type)"></span>
                  {{ activity.action }}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-600">{{ activity.target }}</td>
              <td class="px-6 py-4 text-right text-slate-400">{{ activity.time }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>