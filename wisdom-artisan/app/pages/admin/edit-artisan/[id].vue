<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import auth from '~/middleware/auth'

definePageMeta({
  layout: 'admin',
  middleware: [auth, 'admin-log']
})
useSeoMeta({
  title: 'Wisdom Artisan - แก้ไขข้อมูลปราชญ์ชาวบ้าน',
  ogTitle: 'Wisdom Artisan - แก้ไขข้อมูลปราชญ์ชาวบ้าน',
  description: 'Dashboard สำหรับผู้ดูแลระบบฐานข้อมูลปราชญ์ชาวบ้าน',
})

const route = useRoute()
const router = useRouter()
const artisanId = ref(null)

const api = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Helper Function: แปลง Path รูปภาพให้เป็น Full URL (แก้ปัญหารูปไม่ขึ้น) ---
const getFullImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('blob:')) {
    return path
  }
  return `http://localhost:4000${path}`
}

const logAdminAction = async (actionName, actionPath, httpMethod = 'GET', errorMsg = null) => {
  try {
    await api.post('/log/log-admin-action', {
      action: actionName,
      method: httpMethod,
      path: actionPath,
      errorMessage: errorMsg
    });
  } catch (err) {
    console.error('Failed to send admin log:', err);
  }
};

const modal = ref({
  isOpen: false,
  type: 'info',
  title: '',
  message: '',
  confirmLabel: 'ตกลง',
  cancelLabel: 'ยกเลิก',
  onConfirm: null,
  onClose: null
})

const closeModal = () => {
  modal.value.isOpen = false
  if (modal.value.onClose) {
    modal.value.onClose()
    modal.value.onClose = null
  }
}

const handleConfirm = () => {
  if (modal.value.onConfirm) {
    modal.value.onConfirm()
  }
  closeModal()
}

const showAlert = (type, title, message, onClose = null) => {
  modal.value = {
    isOpen: true,
    type,
    title,
    message,
    confirmLabel: 'ตกลง',
    showCancel: false,
    onConfirm: null,
    onClose
  }
}

const showConfirm = (title, message, onConfirmAction) => {
  modal.value = {
    isOpen: true,
    type: 'confirm',
    title,
    message,
    confirmLabel: 'ยืนยัน',
    cancelLabel: 'ยกเลิก',
    showCancel: true,
    onConfirm: onConfirmAction,
    onClose: null
  }
}

// --- Edit Gallery State ---
const editGalleryModal = ref({
  isOpen: false,
  galleryId: null,
  index: null,
  name_gallery: '',
  caption: ''
})

const openEditGalleryModal = (item, index) => {
  editGalleryModal.value = {
    isOpen: true,
    galleryId: item.gallery_id,
    index: index,
    name_gallery: item.name_gallery,
    caption: item.caption || ''
  }
}

const closeEditGalleryModal = () => {
  editGalleryModal.value.isOpen = false
  editGalleryModal.value.galleryId = null
}

// --- Edit Award State ---
const editAwardModal = ref({
  isOpen: false,
  awardId: null,
  award_title: '',
  award_description: '',
  received_date: '',
  current_file: null,
  newFile: null,
  newFilePreview: null,
  newFileType: 'image'
})

const openEditAwardModal = (item) => {
  editAwardModal.value = {
    isOpen: true,
    awardId: item.award_id,
    award_title: item.award_title,
    received_date: item.received_date ? new Date(item.received_date).toISOString().split('T')[0] : '',
    award_description:item.award_description,
    current_file: item.file_url,
    newFile: null,
    newFilePreview: null,
    newFileType: 'image'
  }
}

const closeEditAwardModal = () => {
  editAwardModal.value.isOpen = false
  editAwardModal.value.newFile = null
  editAwardModal.value.newFilePreview = null
}

const handleEditAwardUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      showAlert('warning', 'ไฟล์ใหญ่เกินไป', 'ขนาดไฟล์ต้องน้อยกว่า 5MB')
      return
    }

    const isImage = file.type.startsWith('image/')
    const isPdf = file.type === 'application/pdf'

    if (!isImage && !isPdf) {
      showAlert('warning', 'ไฟล์ไม่ถูกต้อง', 'กรุณาอัปโหลดเฉพาะไฟล์รูปภาพหรือ PDF')
      return
    }

    editAwardModal.value.newFile = file
    editAwardModal.value.newFileType = isPdf ? 'pdf' : 'image'
    editAwardModal.value.newFilePreview = URL.createObjectURL(file)
  }
}

const saveEditAward = async () => {
  if (!editAwardModal.value.award_title) {
    showAlert('warning', 'ข้อมูลไม่ครบ', 'กรุณากรอกชื่อรางวัล')
    return
  }

  try {
    const fd = new FormData()
    fd.append('award_title', editAwardModal.value.award_title)
    fd.append('received_date', editAwardModal.value.received_date)
    fd.append('award_description', editAwardModal.value.award_description || '')

    if (editAwardModal.value.newFile) {
      // กรณีมีไฟล์ใหม่
      fd.append('file_url', editAwardModal.value.newFile)
    } else {
      // กรณีใช้ไฟล์เดิม (ส่ง Path เดิมกลับไปเพื่อให้ Backend รู้ว่าไม่ต้องลบรูป)
      fd.append('file_url', editAwardModal.value.current_file)
    }

    await api.put(`/award/edit-award/${editAwardModal.value.awardId}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    await logAdminAction('UPDATE_AWARD', `/award/edit-award/${editAwardModal.value.awardId}`, 'PUT')
    showAlert('success', 'สำเร็จ', 'แก้ไขข้อมูลรางวัลเรียบร้อยแล้ว')

    closeEditAwardModal()
    await fetchAwards()

  } catch (error) {
    console.error('Edit Award Error:', error)
    await logAdminAction('UPDATE_AWARD_ERROR', `/award/edit-award/${editAwardModal.value.awardId}`, 'PUT', error.message)
    showAlert('error', 'ผิดพลาด', error.message || 'ไม่สามารถแก้ไขได้')
  }
}

// --- Main Data State ---
const isLoading = ref(true)
const isSubmitting = ref(false)

const formData = ref({
  fname: '',
  lname: '',
  birth_date: '',
  address: '',
  province: '',
  district: '',
  phone: '', // เพิ่ม
  category_id: null,
  biography: '',
  status: 'ฉบับร่าง',
  profile_img: null
})

const categories = ref([])
const oldProfileImg = ref(null)

const profileFile = ref(null)
const profilePreview = ref(null)

const galleryItems = ref([])
const galleryFile = ref(null)
const galleryPreview = ref(null)
const galleryForm = ref({
  name_gallery: '',
  caption: ''
})

const awardsItems = ref([])
const awardFile = ref(null)
const awardPreview = ref(null)
const awardFileType = ref('image')
const awardForm = ref({
  award_title: '',
  received_date: ''
})



const fetchCategories = async () => {
  try {
    const { data } = await api.get('/artisan/category/list')
    categories.value = data
  } catch (error) {
    console.error('Fetch Categories Error:', error)
    showAlert('error', 'ผิดพลาด', 'ไม่สามารถโหลดหมวดหมู่ได้')
  }
}

const fetchData = async () => {
  try {
    isLoading.value = true
    const { data: artisan } = await api.get(`/admin/artisan/${artisanId.value}`)

    if (!artisan) {
      showAlert('error', 'ไม่พบข้อมูล', 'ไม่พบข้อมูลปราชญ์ในระบบ', () => router.push('/admin/artisan'))
      return
    }

    formData.value = {
      fname: artisan.fname,
      lname: artisan.lname,
      birth_date: artisan.birth_date ? new Date(artisan.birth_date).toISOString().split('T')[0] : '',
      address: artisan.address || '',
      province: artisan.province || '',
      district: artisan.district || '',
      phone: artisan.phone || '', // เพิ่ม
      category_id: artisan.category_id,
      biography: artisan.biography || '',
      status: artisan.status || 'ฉบับร่าง',
      profile_img: artisan.profile_img
    }

    oldProfileImg.value = artisan.profile_img

    if (artisan.profile_img) {
      profilePreview.value = getFullImageUrl(artisan.profile_img)
    }

    await fetchGallery()
    await fetchAwards()

  } catch (error) {
    console.error('Fetch Error:', error)
    if (error.response?.status === 401) {
      showAlert('error', 'Session หมดอายุ', 'กรุณาเข้าสู่ระบบใหม่', () => router.push('/login'))
    } else {
      showAlert('error', 'ผิดพลาด', 'โหลดข้อมูลล้มเหลว')
    }
  } finally {
    isLoading.value = false
  }
}

const fetchGallery = async () => {
  try {
    const { data } = await api.get(`/gallery/artisan/${artisanId.value}`)
    galleryItems.value = data || []
  } catch (error) {
    console.error('Fetch Gallery Error:', error)
  }
}

const fetchAwards = async () => {
  try {
    const { data } = await api.get(`/award/get-all-award/${artisanId.value}`)
    awardsItems.value = data || []
  } catch (error) {
    console.error('Fetch Awards Error:', error)
  }
}

onMounted(async () => {
  artisanId.value = route.params.id
  if (!artisanId.value) {
    showAlert('error', 'ไม่พบ ID', 'ไม่พบ ID ปราชญ์', () => router.push('/admin/artisan'))
    return
  }

  await fetchCategories()
  fetchData()
})

const handleProfileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      showAlert('warning', 'ไฟล์ใหญ่เกินไป', 'ขนาดไฟล์ต้องน้อยกว่า 5MB')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      showAlert('warning', 'ไฟล์ไม่ถูกต้อง', 'กรุณาอัปโหลดเฉพาะไฟล์รูปภาพ (jpg, png, gif)')
      return
    }

    profileFile.value = file
    profilePreview.value = URL.createObjectURL(file)
  }
}

const removeProfileImage = () => {
  profileFile.value = null
  profilePreview.value = null
  formData.value.profile_img = null
  const input = document.getElementById('profileInput')
  if (input) input.value = ''
}

const handleGalleryUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      showAlert('warning', 'ไฟล์ใหญ่เกินไป', 'ขนาดไฟล์ต้องน้อยกว่า 5MB')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      showAlert('warning', 'ไฟล์ไม่ถูกต้อง', 'กรุณาอัปโหลดเฉพาะไฟล์รูปภาพ (jpg, png, gif)')
      return
    }

    galleryFile.value = file
    galleryPreview.value = URL.createObjectURL(file)
    galleryForm.value.name_gallery = file.name.split('.')[0]
  }
}

const removeGalleryPreview = () => {
  galleryFile.value = null
  galleryPreview.value = null
  galleryForm.value.name_gallery = ''
  galleryForm.value.caption = ''
  const input = document.getElementById('galleryInput')
  if (input) input.value = ''
}

const handleAwardUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      showAlert('warning', 'ไฟล์ใหญ่เกินไป', 'ขนาดไฟล์ต้องน้อยกว่า 5MB')
      return
    }

    const isImage = file.type.startsWith('image/')
    const isPdf = file.type === 'application/pdf'

    if (!isImage && !isPdf) {
      showAlert('warning', 'ไฟล์ไม่ถูกต้อง', 'กรุณาอัปโหลดเฉพาะไฟล์รูปภาพหรือ PDF')
      return
    }

    awardFile.value = file
    awardFileType.value = isPdf ? 'pdf' : 'image'
    awardPreview.value = URL.createObjectURL(file)
    awardForm.value.award_title = file.name.split('.')[0]
    awardForm.value.received_date = new Date().toISOString().split('T')[0]
  }
}

const removeAwardPreview = () => {
  awardFile.value = null
  awardPreview.value = null
  awardFileType.value = 'image'
  awardForm.value.award_title = ''
  awardForm.value.received_date = ''
  const input = document.getElementById('awardInput')
  if (input) input.value = ''
}

const uploadFileService = async (file, isGallery = false) => {
  if (!file) return null
  try {
    const fd = new FormData()
    fd.append('file', file)
    if (isGallery) fd.append('isGallery', 'true')

    const res = await api.post('/admin/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      method: 'POST'
    })

    if (!res.data.path) throw new Error('ไม่ได้รับ path กลับมาจาก server')
    return res.data.path

  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message || 'ไม่สามารถอัปโหลดไฟล์รูปภาพได้'
    throw new Error(errorMsg)
  }
}

const addGalleryItem = async () => {
  if (!galleryFile.value || !galleryForm.value.name_gallery) {
    showAlert('warning', 'ข้อมูลไม่ครบ', 'กรุณาเลือกรูปภาพและกรอกชื่อ')
    return
  }

  try {
    const fd = new FormData()
    fd.append('image', galleryFile.value)
    fd.append('name_gallery', galleryForm.value.name_gallery)
    fd.append('caption', galleryForm.value.caption || '')

    const res = await api.post(`/gallery/${artisanId.value}/add`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      method: 'POST'
    })

    if (res?.data?.data) {
      await logAdminAction('ADD_GALLERY', `/gallery/${artisanId.value}/add`, 'POST');
      showAlert('success', 'สำเร็จ', 'เพิ่มรูปภาพลงแกลเลอรี่เรียบร้อยแล้ว')
      removeGalleryPreview()
      await fetchGallery()
    } else {
      throw new Error('ไม่สามารถเพิ่มรูปภาพได้')
    }

  } catch (error) {
    console.error('Add Gallery Error:', error)
    await logAdminAction('ADD_GALLERY_ERROR', `/gallery/${artisanId.value}/add`, 'POST', error.message);
    showAlert('error', 'ผิดพลาด', error.message || 'ไม่ทราบสาเหตุ')
  }
}

const addAwardItem = async () => {
  if (!awardFile.value || !awardForm.value.award_title) {
    showAlert('warning', 'ข้อมูลไม่ครบ', 'กรุณาเลือกไฟล์และกรอกชื่อรางวัล')
    return
  }

  try {
    const fd = new FormData()
    fd.append('file_url', awardFile.value)
    fd.append('award_title', awardForm.value.award_title)
    fd.append('received_date', awardForm.value.received_date)
    fd.append('award_description', awardForm.value.award_description || '')

    await api.post(`/award/add-award/${artisanId.value}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      method: 'POST'
    })

    await logAdminAction('ADD_AWARD', `/award/add-award/${artisanId.value}`, 'POST');
    showAlert('success', 'สำเร็จ', 'เพิ่มข้อมูลรางวัลเรียบร้อยแล้ว')
    removeAwardPreview()
    await fetchAwards()

  } catch (error) {
    console.error('Add Award Error:', error)
    await logAdminAction('ADD_AWARD_ERROR', `/award/add-award/${artisanId.value}`, 'POST', error.message);
    showAlert('error', 'ผิดพลาด', error.message || 'ไม่ทราบสาเหตุ')
  }
}

const saveEditGallery = async () => {
  if (!editGalleryModal.value.name_gallery) {
    alert('กรุณากรอกชื่อรูปภาพ')
    return
  }

  try {
    await api.put(`/gallery/${editGalleryModal.value.galleryId}`, {
      name_gallery: editGalleryModal.value.name_gallery,
      caption: editGalleryModal.value.caption,
      method: 'PUT'
    })

    await logAdminAction('UPDATE_GALLERY', `/gallery/${editGalleryModal.value.galleryId}`, 'PUT');
    showAlert('success', 'สำเร็จ', 'แก้ไขข้อมูลแกลเลอรี่เรียบร้อยแล้ว')
    closeEditGalleryModal()
    await fetchGallery()

  } catch (error) {
    console.error('Edit Gallery Error:', error)
    await logAdminAction('UPDATE_GALLERY_ERROR', `/gallery/${editGalleryModal.value.galleryId}`, 'PUT', error.message);
    showAlert('error', 'ผิดพลาด', error.message)
  }
}

const deleteGalleryItem = (galleryId) => {
  showConfirm('ยืนยันการลบ', 'คุณต้องการลบรูปภาพนี้ใช่หรือไม่?', async () => {
    try {
      await api.delete(`/gallery/${galleryId}`, { method: 'DELETE' })
      await logAdminAction('DELETE_GALLERY', `/gallery/${galleryId}`, 'DELETE');
      showAlert('success', 'สำเร็จ', 'ลบรูปภาพเรียบร้อยแล้ว')
      await fetchGallery()
    } catch (error) {
      console.error('Delete Gallery Error:', error)
      await logAdminAction('DELETE_GALLERY_ERROR', `/gallery/${galleryId}`, 'DELETE', error.message);
      showAlert('error', 'ผิดพลาด', error.message)
    }
  })
}

const deleteAwardItem = (awardId) => {
  showConfirm('ยืนยันการลบ', 'คุณต้องการลบรางวัลนี้ใช่หรือไม่?', async () => {
    try {
      await api.delete(`/award/delete-award/${awardId}`, { method: 'DELETE' })
      await logAdminAction('DELETE_AWARD', `/award/delete-award/${awardId}`, 'DELETE');
      showAlert('success', 'สำเร็จ', 'ลบรางวัลเรียบร้อยแล้ว')
      await fetchAwards()
    } catch (error) {
      console.error('Delete Award Error:', error)
      await logAdminAction('DELETE_AWARD_ERROR', `/award/delete-award/${awardId}`, 'DELETE', error.message);
      showAlert('error', 'ผิดพลาด', error.message)
    }
  })
}

const submitForm = async () => {
  if (!formData.value.fname || !formData.value.lname || !formData.value.category_id) {
    showAlert('warning', 'ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลสำคัญ (ชื่อ, นามสกุล, หมวดหมู่) ให้ครบ')
    return
  }

  showConfirm('ยืนยันการบันทึก', 'คุณต้องการบันทึกการแก้ไขข้อมูลใช่หรือไม่?', async () => {
    isSubmitting.value = true
    try {
      let finalProfilePath = formData.value.profile_img

      if (profileFile.value) {
        finalProfilePath = await uploadFileService(profileFile.value)
      } else if (formData.value.profile_img === null && oldProfileImg.value) {
        finalProfilePath = null
      }

      // Payload จะรวม latitude, longitude ไปด้วยอัตโนมัติ เพราะเราเพิ่มใน formData แล้ว
      const artisanPayload = {
        ...formData.value,
        profile_img: finalProfilePath
      }

      await api.put(`/admin/artisan/${artisanId.value}`, artisanPayload, { method: 'PUT' })
      await logAdminAction('UPDATE_ARTISAN', `/admin/artisan/${artisanId.value}`, 'PUT');

      showAlert('success', 'บันทึกสำเร็จ', 'แก้ไขข้อมูลเรียบร้อยแล้ว!', () => {
        router.push('/admin/artisan')
      })

    } catch (error) {
      console.error('Update Error:', error)
      const msg = error.response?.data?.message || error.message
      await logAdminAction('UPDATE_ARTISAN_ERROR', `/admin/artisan/${artisanId.value}`, 'PUT', msg);
      showAlert('error', 'บันทึกล้มเหลว', msg)
    } finally {
      isSubmitting.value = false
    }
  })
}
</script>

<template>
  <div class="font-sans text-slate-800 p-6 min-h-screen bg-gray-50/50">

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="text-slate-500 animate-pulse flex flex-col items-center">
        <svg class="animate-spin h-8 w-8 text-slate-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        กำลังโหลดข้อมูล...
      </div>
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <div class="text-sm text-slate-500">
          <a href="/admin">Admin Dashboard</a> / ปราชญ์ชาวบ้าน / <span
            class="font-medium text-slate-700">แก้ไขข้อมูล</span>
        </div>
      </div>

      <form @submit.prevent="submitForm">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">แก้ไขข้อมูลปราชญ์ชาวบ้าน</h1>
            <p class="text-slate-500 text-sm mt-1">แก้ไขรายละเอียดข้อมูลส่วนตัวและผลงาน</p>
          </div>

          <div class="flex items-center gap-3">
            <NuxtLink to="/admin/artisan"
              class="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-slate-600 text-sm font-medium hover:bg-gray-50 transition">
              ยกเลิก
            </NuxtLink>

            <button type="submit" :disabled="isSubmitting"
              class="flex items-center gap-2 bg-[#d97706] hover:bg-[#b45309] text-white px-4 py-2 rounded-lg shadow-sm font-medium transition disabled:opacity-70 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข' }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="space-y-6">
            <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 class="font-bold text-slate-800 mb-4">รูปโปรไฟล์</h3>
              <div class="flex flex-col items-center">
                <div class="relative group">
                  <div
                    class="w-40 h-40 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md flex items-center justify-center mb-4">
                    <img v-if="profilePreview" :src="profilePreview" class="w-full h-full object-cover">
                    <svg v-else class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <button v-if="profilePreview" @click="removeProfileImage" type="button"
                    class="absolute top-0 right-0 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition shadow-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div class="relative overflow-hidden inline-block">
                  <button type="button"
                    class="border border-gray-300 bg-white hover:bg-gray-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition">
                    {{ profilePreview ? 'เปลี่ยนรูปโปรไฟล์' : 'เลือกรูปโปรไฟล์' }}
                  </button>
                  <input id="profileInput" type="file" accept="image/*" @change="handleProfileUpload"
                    class="absolute left-0 top-0 opacity-0 cursor-pointer w-full h-full" />
                </div>
              </div>
            </div>
            <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 class="font-bold text-slate-800 mb-4">สถานะ</h3>
              <div class="space-y-3">
                <label
                  class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  :class="{ 'ring-2 ring-green-500 border-transparent': formData.status === 'เผยแพร่' }">
                  <input type="radio" v-model="formData.status" value="เผยแพร่" class="w-4 h-4 text-green-600">
                  <span class="ml-3 text-sm font-medium text-slate-900">เผยแพร่</span>
                </label>
                <label
                  class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  :class="{ 'ring-2 ring-gray-400 border-transparent': formData.status === 'ฉบับร่าง' }">
                  <input type="radio" v-model="formData.status" value="ฉบับร่าง" class="w-4 h-4 text-gray-500">
                  <span class="ml-3 text-sm font-medium text-slate-900">ฉบับร่าง</span>
                </label>
              </div>
            </div>
          </div>

          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 class="font-bold text-slate-800 mb-6 border-b border-gray-100 pb-3">ข้อมูลทั่วไป</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อจริง <span
                      class="text-red-500">*</span></label>
                  <input type="text" v-model="formData.fname"
                    class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">นามสกุล <span
                      class="text-red-500">*</span></label>
                  <input type="text" v-model="formData.lname"
                    class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">วันเกิด <span
                      class="text-red-500">*</span></label>
                  <input type="date" v-model="formData.birth_date"
                    class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition text-slate-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">หมวดหมู่ <span
                      class="text-red-500">*</span></label>
                  <select v-model="formData.category_id"
                    class="w-full border-gray-300 rounded-lg px-3 py-2 border text-slate-700 focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition">
                    <option :value="null" disabled>เลือกหมวดหมู่</option>
                    <option v-for="c in categories" :key="c.category_id" :value="c.category_id">{{ c.category_name
                    }}</option>
                  </select>
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-slate-700 mb-1">ที่อยู่</label>
                  <textarea v-model="formData.address" rows="2"
                    class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition"></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">อำเภอ/เขต</label>
                  <input type="text" v-model="formData.district"
                    class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">จังหวัด</label>
                  <input type="text" v-model="formData.province"
                    class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                  <input type="text" v-model="formData.phone" placeholder="08x-xxx-xxxx"
                    class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition">
                </div>




                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-slate-700 mb-1">ประวัติโดยย่อ</label>
                  <textarea v-model="formData.biography" rows="6"
                    class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition"></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div class="mt-8 space-y-6">
        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 class="font-bold text-slate-800 mb-6 border-b border-gray-100 pb-3">เพิ่มรูปภาพแกลเลอรี่</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex flex-col items-center">
              <div
                class="w-full h-48 rounded-lg overflow-hidden bg-gray-100 border border-gray-300 flex items-center justify-center mb-4">
                <img v-if="galleryPreview" :src="galleryPreview" class="w-full h-full object-cover">
                <svg v-else class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
                  </path>
                </svg>
              </div>
              <div class="relative overflow-hidden w-full">
                <button type="button"
                  class="w-full border border-gray-300 bg-white hover:bg-gray-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition">
                  เลือกรูปภาพ
                </button>
                <input id="galleryInput" type="file" accept="image/*" @change="handleGalleryUpload"
                  class="absolute left-0 top-0 opacity-0 cursor-pointer w-full h-full" />
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อรูปภาพ <span
                    class="text-red-500">*</span></label>
                <input type="text" v-model="galleryForm.name_gallery" placeholder="ชื่อรูปภาพ"
                  class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">คำอธิบาย</label>
                <textarea v-model="galleryForm.caption" rows="3" placeholder="คำอธิบายเพิ่มเติม"
                  class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"></textarea>
              </div>
              <div class="flex gap-2">
                <button type="button" @click="addGalleryItem" v-if="galleryFile"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                  บันทึกรูปภาพ
                </button>
                <button type="button" @click="removeGalleryPreview" v-if="galleryFile"
                  class="flex-1 bg-gray-300 hover:bg-gray-400 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition">
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 class="font-bold text-slate-800 mb-6 border-b border-gray-100 pb-3">แกลเลอรีผลงาน</h3>

          <div v-if="galleryItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="(item, index) in galleryItems" :key="item.gallery_id"
              class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
              <div class="w-full h-40 bg-gray-200 overflow-hidden">
                <img :src="getFullImageUrl(item.image_url)" class="w-full h-full object-cover">
              </div>
              <div class="p-4 space-y-2">
                <p class="font-medium text-slate-800 text-sm truncate">{{ item.name_gallery }}</p>
                <p class="text-slate-600 text-xs line-clamp-2">{{ item.caption || '-' }}</p>
                <div class="flex gap-2 pt-2">
                  <button @click="openEditGalleryModal(item, index)" type="button"
                    class="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2 py-1.5 rounded text-xs font-medium transition">
                    แก้ไข
                  </button>
                  <button @click="deleteGalleryItem(item.gallery_id)" type="button"
                    class="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1.5 rounded text-xs font-medium transition">
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else
            class="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 text-slate-400">
            <p class="text-sm">ยังไม่มีรูปภาพในแกลเลอรี</p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 class="font-bold text-slate-800 mb-6 border-b border-gray-100 pb-3">รางวัลและผลงานที่ได้รับ</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="flex flex-col items-center">
              <div
                class="w-full h-48 rounded-lg overflow-hidden bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
                <img v-if="awardPreview && awardFileType === 'image'" :src="awardPreview"
                  class="w-full h-full object-cover">
                <div v-else-if="awardPreview && awardFileType === 'pdf'"
                  class="text-red-500 flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span class="text-xs font-bold mt-2">PDF FILE</span>
                </div>
                <svg v-else class="w-16 h-16 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z">
                  </path>
                </svg>
              </div>
              <div class="relative overflow-hidden w-full">
                <button type="button"
                  class="w-full border border-amber-300 bg-white hover:bg-amber-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition">
                  เลือกไฟล์ (รูปภาพ/PDF)
                </button>
                <input id="awardInput" type="file" accept="image/*,application/pdf" @change="handleAwardUpload"
                  class="absolute left-0 top-0 opacity-0 cursor-pointer w-full h-full" />
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อรางวัล/เกียรติบัตร <span
                    class="text-red-500">*</span></label>
                <input type="text" v-model="awardForm.award_title" placeholder="ชื่อรางวัล"
                  class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">วันที่ได้รับ</label>
                <input type="date" v-model="awardForm.received_date"
                  class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition text-slate-600">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">คำอธิบายรางวัล</label>
                <textarea v-model="awardForm.award_description" rows="3"
                  class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"></textarea>
              </div>
              <div class="flex gap-2">
                <button type="button" @click="addAwardItem" v-if="awardFile"
                  class="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                  บันทึกรางวัล
                </button>
                <button type="button" @click="removeAwardPreview" v-if="awardFile"
                  class="flex-1 bg-gray-300 hover:bg-gray-400 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition">
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>

          <div v-if="awardsItems.length > 0" class="space-y-3">
            <div v-for="item in awardsItems" :key="item.award_id"
              class="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm bg-gray-50/50">
              <div
                class="w-16 h-16 flex-shrink-0 rounded bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
                <a v-if="item.file_url" :href="getFullImageUrl(item.file_url)" target="_blank"
                  class="block w-full h-full flex items-center justify-center">
                  <img v-if="item.file_url.toLowerCase().match(/\.(jpeg|jpg|png|gif)$/)"
                    :src="getFullImageUrl(item.file_url)" class="w-full h-full object-cover">
                  <div v-else class="text-red-500 flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                </a>
                <svg v-else class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
                  </path>
                </svg>
              </div>

              <div class="flex-grow min-w-0">
                <p class="font-medium text-slate-800 text-sm truncate">{{ item.award_title }}</p>
                <p class="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  {{ item.received_date ? new Date(item.received_date).toLocaleDateString('th-TH') : '-' }}
                </p>
                <p class="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  รายละเอียด : {{item.award_description || "ไม่มีข้อมูล"}}
                </p>
              </div>

              <div class="flex gap-2">
                <button @click="openEditAwardModal(item)" type="button"
                  class="text-slate-400 hover:text-yellow-600 p-2 hover:bg-yellow-50 rounded-full transition"
                  title="แก้ไข">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button @click="deleteAwardItem(item.award_id)" type="button"
                  class="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition" title="ลบ">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div v-else
            class="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 text-slate-400 mt-6">
            <p class="text-sm">ยังไม่มีข้อมูลรางวัล</p>
          </div>

        </div>

      </div>
    </div>

    <div v-if="modal.isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        @click="modal.showCancel ? closeModal() : null"></div>

      <div
        class="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center transform transition-all scale-100">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4" :class="{
          'bg-green-100 text-green-600': modal.type === 'success',
          'bg-red-100 text-red-600': modal.type === 'error',
          'bg-yellow-100 text-yellow-600': modal.type === 'warning' || modal.type === 'confirm',
          'bg-blue-100 text-blue-600': modal.type === 'info'
        }">
          <svg v-if="modal.type === 'success'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <svg v-if="modal.type === 'error'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <svg v-if="modal.type === 'warning' || modal.type === 'confirm'" xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <svg v-if="modal.type === 'info'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </div>

        <h3 class="text-lg font-bold text-gray-900 mb-2">{{ modal.title }}</h3>
        <p class="text-sm text-gray-500 mb-6">{{ modal.message }}</p>

        <div class="flex gap-3 justify-center">
          <button v-if="modal.showCancel" @click="closeModal"
            class="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition">
            {{ modal.cancelLabel }}
          </button>
          <button @click="handleConfirm"
            class="px-4 py-2 text-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition shadow-sm"
            :class="{
              'bg-green-600 hover:bg-green-700 focus:ring-green-500': modal.type === 'success',
              'bg-red-600 hover:bg-red-700 focus:ring-red-500': modal.type === 'error',
              'bg-[#d97706] hover:bg-[#b45309] focus:ring-[#d97706]': modal.type === 'confirm' || modal.type === 'warning',
              'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500': modal.type === 'info'
            }">
            {{ modal.confirmLabel }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="editGalleryModal.isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeEditGalleryModal"></div>
      <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-bold text-slate-800 mb-4">แก้ไขข้อมูลรูปภาพ</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อรูปภาพ</label>
            <input type="text" v-model="editGalleryModal.name_gallery"
              class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">คำอธิบาย</label>
            <textarea v-model="editGalleryModal.caption" rows="3"
              class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"></textarea>
          </div>
        </div>

        <div class="flex gap-3 mt-6 justify-end">
          <button @click="closeEditGalleryModal"
            class="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition">
            ยกเลิก
          </button>
          <button @click="saveEditGallery"
            class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition shadow-sm">
            บันทึก
          </button>
        </div>
      </div>
    </div>

    <div v-if="editAwardModal.isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeEditAwardModal"></div>
      <div class="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-slate-800 mb-4">แก้ไขข้อมูลรางวัล</h3>

        <div class="grid grid-cols-1 gap-6">
          <div class="flex flex-col items-center">
            <div
              class="w-full h-40 rounded-lg overflow-hidden bg-gray-100 border border-gray-300 flex items-center justify-center mb-4 relative">
              <template v-if="editAwardModal.newFilePreview">
                <img v-if="editAwardModal.newFileType === 'image'" :src="editAwardModal.newFilePreview"
                  class="w-full h-full object-cover">
                <div v-else class="text-red-500 flex flex-col items-center">
                  <span class="font-bold">PDF FILE (NEW)</span>
                </div>
              </template>
              <template v-else-if="editAwardModal.current_file">
                <img v-if="editAwardModal.current_file.toLowerCase().match(/\.(jpeg|jpg|png|gif)$/)"
                  :src="getFullImageUrl(editAwardModal.current_file)" class="w-full h-full object-cover">
                <div v-else class="text-red-500 flex flex-col items-center">
                  <span class="font-bold">CURRENT FILE (PDF)</span>
                </div>
              </template>
              <div v-else class="text-gray-400">ไม่มีไฟล์แนบ</div>
            </div>

            <div class="relative overflow-hidden w-full">
              <button type="button"
                class="w-full border border-amber-300 bg-white hover:bg-amber-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition">
                เปลี่ยนไฟล์แนบ (รูปภาพ/PDF)
              </button>
              <input type="file" accept="image/*,application/pdf" @change="handleEditAwardUpload"
                class="absolute left-0 top-0 opacity-0 cursor-pointer w-full h-full" />
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อรางวัล/เกียรติบัตร <span
                  class="text-red-500">*</span></label>
              <input type="text" v-model="editAwardModal.award_title"
                class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">วันที่ได้รับ</label>
              <input type="date" v-model="editAwardModal.received_date"
                class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition">
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">คำอธิบายรางวัล</label>
                <textarea v-model="editAwardModal.award_description" rows="3"
                  class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"></textarea>
              </div>
          </div>
        </div>

        <div class="flex gap-3 mt-8 justify-end">
          <button @click="closeEditAwardModal"
            class="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition">
            ยกเลิก
          </button>
          <button @click="saveEditAward"
            class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition shadow-sm">
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </div>
    </div>

  </div>
</template>