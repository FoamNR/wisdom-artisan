<script setup lang="ts">
// ไม่จำเป็นต้อง import อะไรเพิ่ม Nuxt จัดการให้
</script>

<template>
  <footer class="bg-white text-gray-500 py-10 border-t border-gray-50">
    <div class="max-w-[1200px] mx-auto px-6 md:px-8">

      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-8">

        <div class="md:col-span-4 space-y-3">
          <h3 class="text-xl font-semibold text-gray-900 tracking-tight">
            สืบสาน<span class="text-emerald-600">ภูมิปัญญา</span>
          </h3>
          <p class="text-sm leading-relaxed pr-4 text-gray-400">
            แพลตฟอร์มรวบรวมงานฝีมือและภูมิปัญญาท้องถิ่น ส่งต่อคุณค่าสู่สากล
          </p>
        </div>

        <div class="hidden md:block md:col-span-2"></div>

        <div class="md:col-span-3">
          <h4 class="text-gray-900 font-medium mb-3 text-sm">เมนูนำทาง</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <NuxtLink to="/" class="hover:text-emerald-600 transition-colors">หน้าแรก</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/search" class="hover:text-emerald-600 transition-colors">ค้นหาผลงาน</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/collections" class="hover:text-emerald-600 transition-colors">คอลเลกชัน</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/about" class="hover:text-emerald-600 transition-colors">เกี่ยวกับเรา</NuxtLink>
            </li>
          </ul>
        </div>

        <div class="md:col-span-3">
          <h4 class="text-gray-900 font-medium mb-3 text-sm">ติดต่อเรา</h4>
          <ul class="space-y-2 text-sm">
            <li class="leading-relaxed">
              กองบริการเทคโนโลยีสารสนเทศและการสื่อสาร (CITCOMS)<br/>
              มหาวิทยาลัยนเรศวร 99 หมู่ 9 ตำบลท่าโพธิ์<br/>
              อำเภอเมืองพิษณุโลก จังหวัดพิษณุโลก<br/>
              รหัสไปรษณีย์ 65000
            </li>
            <li><a href="mailto:hello@thaicraft.com"
                class="hover:text-emerald-600 transition-colors">hello@thaicraft.com</a></li>
            <li><a href="tel:021234567" class="hover:text-emerald-600 transition-colors">02-123-4567</a></li>
          </ul>
        </div>

      </div>

      <div
        class="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
        <p>&copy; 2025 ThaiCraft Heritage.</p>

        <div class="flex gap-5">
          <a href="#" class="hover:text-emerald-600 transition-colors">Facebook</a>
          <a href="#" class="hover:text-emerald-600 transition-colors">Instagram</a>
          <a href="#" class="hover:text-emerald-600 transition-colors">Twitter</a>
        </div>
      </div>

    </div>
  </footer>
</template>