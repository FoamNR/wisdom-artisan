<script setup lang="ts">
import { ref, shallowRef, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- State Variables ---
const mapContainer = ref<HTMLElement | null>(null);
const mapInstance = shallowRef<L.Map | null>(null);
const provinceLayer = shallowRef<L.GeoJSON | null>(null);
const districtLayer = shallowRef<L.GeoJSON | null>(null);

const isLoading = ref(true);
const artisans = ref<any[]>([]);
const allDistrictsData = ref<any>(null);

const selectedProvince = ref<string | null>(null);
const selectedDistrict = ref<string | null>(null);

// --- Helper: นับจำนวนปราชญ์ ---
const getArtisanCount = (provinceName: string, districtName?: string) => {
  return artisans.value.filter(item => {
    if (item.status !== 'เผยแพร่') return false;
    if (item.province !== provinceName) return false;
    if (districtName) {
      const dbDist = (item.district || '').replace('อำเภอ', '').trim();
      const mapDist = districtName.replace('อำเภอ', '').trim();
      return dbDist === mapDist || (dbDist.startsWith('เมือง') && mapDist.startsWith('เมือง'));
    }
    return true;
  }).length;
};

// --- Computed: กรองรายชื่อ ---
const filteredArtisans = computed(() => {
  return artisans.value.filter(item => {
    const isPublished = item.status === 'เผยแพร่';
    const matchProvince = item.province === selectedProvince.value;
    let matchDistrict = true;
    if (selectedDistrict.value) {
      const dbDist = (item.district || '').replace('อำเภอ', '').trim();
      const mapDist = (selectedDistrict.value || '').replace('อำเภอ', '').trim();
      matchDistrict = (dbDist === mapDist) || (dbDist.startsWith('เมือง') && mapDist.startsWith('เมือง'));
    }
    return isPublished && matchProvince && matchDistrict;
  });
});

const resetMap = () => {
  if (!mapInstance.value) return;
  if (districtLayer.value) mapInstance.value.removeLayer(districtLayer.value);
  districtLayer.value = null;
  selectedProvince.value = null;
  selectedDistrict.value = null;
  mapInstance.value.setView([13.7367, 100.5231], 6);
  provinceLayer.value?.eachLayer((l: any) => provinceLayer.value?.resetStyle(l));
};

onMounted(async () => {
  if (!mapContainer.value) return;

  const map = L.map(mapContainer.value, {
    zoomControl: false,
    attributionControl: false,
  }).setView([13.7367, 100.5231], 6);

  mapInstance.value = map;
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  try {
    isLoading.value = true;
    const [resP, resD, resArtisans] = await Promise.all([
      axios.get("https://raw.githubusercontent.com/piyayut-ch/mapthai/refs/heads/master/data-raw/geojson/th_adm1.geojson"),
      axios.get("https://raw.githubusercontent.com/piyayut-ch/mapthai/refs/heads/master/data-raw/geojson/th_adm2.geojson"),
      axios.get("http://localhost:4000/artisan/map") 
    ]);
    
    allDistrictsData.value = resD.data;
    artisans.value = resArtisans.data;

    provinceLayer.value = L.geoJSON(resP.data, {
      style: (feature: any) => ({
        fillColor: getArtisanCount(feature.properties.ADM1_TH) > 0 ? '#10b981' : '#ffffff',
        weight: 1,
        color: '#cbd5e1',
        fillOpacity: 0.8
      }),
      onEachFeature: (feature: any, layer: any) => {
        layer.on('click', (e: any) => {
          selectedProvince.value = feature.properties.ADM1_TH;
          selectedDistrict.value = null;
          provinceLayer.value?.eachLayer((l: any) => provinceLayer.value?.resetStyle(l));
          (e.target as L.Path).setStyle({ fillColor: '#d1fae5', color: '#059669', weight: 2 });

          if (districtLayer.value) map.removeLayer(districtLayer.value);
          const filteredFeatures = allDistrictsData.value.features.filter((f: any) => f.properties.ADM1_PCODE === feature.properties.ADM1_PCODE);

          districtLayer.value = L.geoJSON({ ...allDistrictsData.value, features: filteredFeatures }, {
            style: (distF: any) => {
              const count = getArtisanCount(feature.properties.ADM1_TH, distF.properties.ADM2_TH);
              return {
                fillColor: count > 0 ? '#34d399' : '#ffffff',
                weight: 1, color: '#10b981', fillOpacity: count > 0 ? 0.9 : 0.4
              };
            },
            onEachFeature: (f: any, dLayer: any) => {
              const count = getArtisanCount(feature.properties.ADM1_TH, f.properties.ADM2_TH);
              // ลบกล่องดำด้วยการใช้ Class ที่ล้างค่า Background และ Border
              dLayer.bindTooltip(`${f.properties.ADM2_TH} (${count})`, {
                permanent: true,
                direction: 'center',
                className: 'district-label', // ใช้ class ใหม่ที่เราคุมเอง
              }).openTooltip();

              dLayer.on('click', (ev: any) => {
                L.DomEvent.stopPropagation(ev);
                selectedDistrict.value = f.properties.ADM2_TH;
                districtLayer.value?.resetStyle();
                (ev.target as L.Path).setStyle({ fillColor: '#047857', fillOpacity: 1 });
              });
            }
          }).addTo(map);
          map.fitBounds((e.target as L.Polyline).getBounds(), { padding: [20, 20] });
        });
      }
    }).addTo(map);
  } finally { isLoading.value = false; }
});

onUnmounted(() => mapInstance.value?.remove());
</script>

<template>
  <section class="w-full py-6 md:py-10 bg-slate-50 min-h-screen font-sans">
    <div class="px-4 md:px-10 mx-auto max-w-[1400px]">
      
      <header class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-800 tracking-tight">เครือข่ายปราชญ์ชาวบ้าน</h1>
          <p class="text-sm text-slate-500">เลือกพื้นที่บนแผนที่เพื่อดูรายชื่อปราชญ์ในท้องถิ่น</p>
        </div>
        <div class="bg-white shadow-sm border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-3">
          <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span class="text-sm font-bold text-slate-700">พบทั้งหมด {{ artisans.filter(a => a.status === 'เผยแพร่').length }} ท่าน</span>
        </div>
      </header>

      <div class="flex flex-col h-[700px] md:h-[650px] w-full overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-xl relative">
        <div class="flex flex-col md:flex-row flex-1 overflow-hidden">

          <aside class="w-full md:w-[380px] flex flex-col bg-white border-r border-slate-100 z-[10] order-2 md:order-1">
            <div class="p-5 border-b border-slate-50 bg-slate-50/50">
              <h2 class="font-bold text-slate-700 flex items-center gap-2">
                <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>
                รายชื่อในพื้นที่
              </h2>
              <p class="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-bold">
                {{ selectedProvince || 'ประเทศไทย' }} {{ selectedDistrict ? `> ${selectedDistrict}` : '' }}
              </p>
            </div>

            <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              <NuxtLink v-if="filteredArtisans.length > 0" v-for="item in filteredArtisans" :key="item.artisan_id" :to="`/artisan/${item.artisan_id}`"
                class="block p-4 rounded-2xl border border-slate-100 bg-white hover:border-emerald-400 hover:shadow-lg transition-all group">
                <h3 class="font-bold text-slate-800 group-hover:text-emerald-700">{{ item.fname }} {{ item.lname }}</h3>
                <p class="text-[10px] text-emerald-600 font-bold mt-1 bg-emerald-50 inline-block px-2 py-0.5 rounded">{{ item.category_name }}</p>
                <div class="flex gap-3 mt-3 text-[10px] text-slate-400">
                  <span class="flex items-center gap-1"><i class="fas fa-map-marker-alt"></i> {{ item.district }}</span>
                  <span class="flex items-center gap-1"><i class="fas fa-city"></i> {{ item.province }}</span>
                </div>
              </NuxtLink>

              <div v-else class="h-full flex flex-col items-center justify-center text-center p-6 opacity-40">
                <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                <p class="text-sm font-medium">ไม่พบข้อมูลปราชญ์</p>
              </div>
            </div>

            <div class="p-4 bg-white border-t border-slate-50">
              <button @click="resetMap" class="w-full py-3 text-xs font-bold text-slate-500 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 rounded-xl transition-all flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                RESET MAP
              </button>
            </div>
          </aside>

          <main class="flex-1 relative bg-slate-50 order-1 md:order-2 h-[350px] md:h-full">
            <div ref="mapContainer" class="w-full h-full"></div>
            <div v-if="isLoading" class="absolute inset-0 z-[1001] bg-white/60 backdrop-blur-sm flex items-center justify-center">
              <div class="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </main>

        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* จุดสำคัญ: ล้างสไตล์กล่องสีดำของ Leaflet Tooltip */
:deep(.leaflet-tooltip) {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

/* ปรับแต่งตัวหนังสือชื่ออำเภอให้ไม่มีกรอบ แต่ยังอ่านง่าย */
:deep(.district-label) {
  font-size: 11px !important;
  font-weight: 800 !important;
  color: #064e3b !important; /* เขียวเข้มมาก */
  text-shadow: 
    -1px -1px 0 #fff,  
     1px -1px 0 #fff,
    -1px  1px 0 #fff,
     1px  1px 0 #fff,
     0px  0px 4px rgba(255,255,255,0.8); /* ขอบฟุ้งสีขาวช่วยให้อ่านง่ายขึ้น */
  pointer-events: none;
}

/* ลบลูกศรชี้ของ tooltip */
:deep(.leaflet-tooltip-top:before), 
:deep(.leaflet-tooltip-bottom:before), 
:deep(.leaflet-tooltip-left:before), 
:deep(.leaflet-tooltip-right:before) {
  display: none !important;
}

:deep(.leaflet-container) {
  background: #f8fafc;
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>