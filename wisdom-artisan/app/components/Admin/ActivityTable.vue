<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

// กำหนด interface เพื่อความชัดเจนของข้อมูล (Optional)
interface Activity {
  type: string
  action: string
  item: string
  by: string
  time: string
}

// เปลี่ยนเป็น ref และใส่ข้อมูลจำลองอื่นๆ ไว้ก่อน
const activities = ref<Activity[]>([
])

const getIconColor = (type: string) => {
  switch(type) {
    case 'add': return 'bg-blue-100 text-blue-600'
    case 'edit': return 'bg-purple-100 text-purple-600'
    case 'approve': return 'bg-emerald-100 text-emerald-600'
    case 'delete': return 'bg-red-100 text-red-600'
    default: return 'bg-gray-100'
  }
}

// ฟังก์ชันดึงข้อมูล
// ฟังก์ชันดึงข้อมูล (แก้ไข)
const fetchLatestActivity = async () => {
  try {
    // --- ส่วนเดิม: ดึงข้อมูล Artisan ---
    const responseArtisan = await axios.get('http://localhost:4000/activity/artisan', { withCredentials: true })
    const dataArtisan = responseArtisan.data
    
    const artisanActivity: Activity = {
      type: 'add',
      action: 'เพิ่มปราชญ์',
      item: `${dataArtisan.artisan_fname} ${dataArtisan.artisan_lname}`,
      by: `${dataArtisan.user_fname} ${dataArtisan.user_lname}`,
      time: dataArtisan.updated_at
    }
    activities.value.unshift(artisanActivity)

    // --- ส่วนใหม่: ดึงข้อมูล Category (อัปเดตงานฝีมือ) ---
    const responseCategory = await axios.get('http://localhost:4000/activity/category', { withCredentials: true })
    const dataCategory = responseCategory.data

    const categoryActivity: Activity = {
      type: 'edit',            // ใช้ type edit จะได้ icon สีม่วง
      action: 'อัปเดตงานฝีมือ', // ข้อความตามที่คุณระบุ
      item: dataCategory.category_name, // ชื่อหมวดหมู่/งานฝีมือ
      by: `${dataCategory.user_fname} ${dataCategory.user_lname}`,
      time: dataCategory.updated_at
    }

    // แทรกข้อมูล Category ไว้บนสุด (จะเป็นรายการล่าสุดกว่า Artisan ในการแสดงผลรอบนี้)
    activities.value.unshift(categoryActivity)

  } catch (error) {
    console.error('Error fetching activity:', error)
  }
}

onMounted(() => {
  fetchLatestActivity()
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
    <div class="p-6 border-b border-slate-50">
      <h3 class="font-bold text-lg text-slate-800">รายการล่าสุด (Recent Activities)</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="text-slate-400 text-xs uppercase bg-slate-50/50">
            <th class="px-6 py-4 font-semibold">กิจกรรม</th>
            <th class="px-6 py-4 font-semibold">รายการ</th>
            <th class="px-6 py-4 font-semibold">ผู้ดำเนินการ</th>
            <th class="px-6 py-4 font-semibold">เวลา</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="(act, index) in activities" :key="index" class="hover:bg-slate-50/50 transition">
            <td class="px-6 py-4 flex items-center gap-3">
              <div :class="`w-8 h-8 rounded-full flex items-center justify-center ${getIconColor(act.type)}`">
                <span v-if="act.type === 'add'" class="text-lg font-bold">+</span>
                <span v-else-if="act.type === 'edit'" class="text-sm">✎</span>
                <span v-else-if="act.type === 'approve'" class="text-sm">✓</span>
                <span v-else-if="act.type === 'delete'" class="text-sm">🗑</span>
              </div>
              <span class="text-slate-700 font-medium">{{ act.action }}</span>
            </td>
            <td class="px-6 py-4 text-slate-600">{{ act.item }}</td>
            <td class="px-6 py-4 text-slate-500 text-sm">{{ act.by }}</td>
            <td class="px-6 py-4 text-slate-400 text-sm">{{ act.time }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>