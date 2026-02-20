<script setup>
definePageMeta({ layout: false })

useSeoMeta({
    title: 'About - Wisdom Artisan',
    description: 'แพลตฟอร์มรวบรวมภูมิปัญญาและงานฝีมือไทยจากช่างฝีมือทั่วประเทศ'
})

</script>

<template>
    <div class="bg-white">
        <Navbar />

        <!-- Hero Section - Minimal -->
        <div class="py-24"
            style="background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('img/pexels-84330351-11410248.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat;">
            <div class="container mx-auto px-4">
                <div class="max-w-3xl mx-auto text-center">
                    <h1 class="text-5xl font-light text-white mb-6">เกี่ยวกับเรา</h1>
                    <p class="text-xl text-white font-light">
                        ศูนย์รวมภูมิปัญญาท้องถิ่น เชื่อมโยงความรู้ดั้งเดิมสู่คนรุ่นใหม่
                    </p>
                </div>
            </div>
        </div>

        <!-- Story Section -->
        <div class="container mx-auto px-4 py-20">
            <div class="max-w-4xl mx-auto">
                <div class="grid md:grid-cols-2 gap-16 items-center mb-24">
                    <div>
                        <h2 class="text-3xl font-light text-gray-800 mb-6">พันธกิจของเรา</h2>
                        <p class="text-gray-600 leading-relaxed mb-4">
                            เราเป็นแพลตฟอร์มที่อนุรักษ์และเผยแพร่ภูมิปัญญาชาวบ้านจากทุกภูมิภาคของประเทศไทย
                            โดยมุ่งเน้นการบันทึกความรู้ท้องถิ่นที่มีคุณค่า
                        </p>
                        <p class="text-gray-600 leading-relaxed">
                            ด้วยความเชื่อว่าภูมิปัญญาของบรรพบุรุษเป็นมรดกอันล้ำค่าที่ควรสืบทอด
                            เราจึงรวบรวมและจัดเก็บข้อมูลเหล่านี้ให้เป็นระบบ
                        </p>
                    </div>
                    <div class="bg-emerald-100 rounded-lg h-80">
                        <img src="https://image.makewebcdn.com/makeweb/0/ik7KhtWb0/Blog/Artisan__19_.png?v=202405291424"
                            alt="พันธกิจ" class="w-full h-full object-cover rounded-lg">
                    </div>
                </div>

                <!-- Values Section -->
                <div class="mb-24">
                    <h2 class="text-3xl font-light text-gray-800 text-center mb-16">หลักการของเรา</h2>
                    <div class="grid md:grid-cols-3 gap-12">
                        <div class="text-center">
                            <div
                                class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 class="text-xl font-light text-gray-800 mb-3">อนุรักษ์ความรู้</h3>
                            <p class="text-gray-600 text-sm leading-relaxed">
                                บันทึกและเก็บรักษาภูมิปัญญาท้องถิ่นอย่างเป็นระบบ
                                เพื่อไม่ให้ความรู้อันล้ำค่าสูญหายไป
                            </p>
                        </div>

                        <div class="text-center">
                            <div
                                class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 class="text-xl font-light text-gray-800 mb-3">เชื่อมโยงชุมชน</h3>
                            <p class="text-gray-600 text-sm leading-relaxed">
                                สร้างเครือข่ายผู้รู้และผู้สนใจภูมิปัญญาท้องถิ่น
                                เพื่อแลกเปลี่ยนเรียนรู้
                            </p>
                        </div>

                        <div class="text-center">
                            <div
                                class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 class="text-xl font-light text-gray-800 mb-3">เผยแพร่สู่สาธารณะ</h3>
                            <p class="text-gray-600 text-sm leading-relaxed">
                                ทำให้ภูมิปัญญาชาวบ้านเข้าถึงได้ง่าย
                                ผ่านแพลตฟอร์มดิจิทัล
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Categories Section -->
                <div class="mb-24">
                    <h2 class="text-3xl font-light text-gray-800 text-center mb-16">หมวดหมู่ภูมิปัญญา</h2>
                    <div class="grid md:grid-cols-4 gap-8">
                        <div
                            class="border border-emerald-100 rounded-lg p-6 hover:border-emerald-300 transition-colors">
                            <div
                                class="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <h3 class="text-center text-gray-800 font-light mb-2">เกษตรกรรม</h3>
                            <p class="text-center text-gray-500 text-sm">การทำนา ปลูกพืช</p>
                        </div>

                        <div
                            class="border border-emerald-100 rounded-lg p-6 hover:border-emerald-300 transition-colors">
                            <div
                                class="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 class="text-center text-gray-800 font-light mb-2">การแพทย์</h3>
                            <p class="text-center text-gray-500 text-sm">สมุนไพร การรักษา</p>
                        </div>

                        <div
                            class="border border-emerald-100 rounded-lg p-6 hover:border-emerald-300 transition-colors">
                            <div
                                class="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                            </div>
                            <h3 class="text-center text-gray-800 font-light mb-2">หัตถกรรม</h3>
                            <p class="text-center text-gray-500 text-sm">งานฝีมือ ผ้าทอ</p>
                        </div>

                        <div
                            class="border border-emerald-100 rounded-lg p-6 hover:border-emerald-300 transition-colors">
                            <div
                                class="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 class="text-center text-gray-800 font-light mb-2">วัฒนธรรม</h3>
                            <p class="text-center text-gray-500 text-sm">ประเพณี พิธีกรรม</p>
                        </div>
                    </div>
                </div>
                <!-- CTA Section 
                <div class="text-center py-12">
                    <h2 class="text-3xl font-light text-gray-800 mb-4">มีภูมิปัญญาที่อยากแบ่งปัน?</h2>
                    <p class="text-gray-600 mb-8 max-w-2xl mx-auto">
                        เราเปิดรับการมีส่วนร่วมจากทุกคน หากคุณมีความรู้หรือต้องการบันทึกภูมิปัญญาจากชุมชนของคุณ
                    </p>
                    <div class="flex gap-4 justify-center">
                        <button class="bg-emerald-600 hover:bg-emerald-700 text-white font-light px-8 py-3 rounded-lg transition-colors">
                            ส่งข้อมูลภูมิปัญญา
                        </button>
                        <button class="border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-light px-8 py-3 rounded-lg transition-colors">
                            เรียนรู้เพิ่มเติม
                        </button>
                    </div>
                </div>
                -->
            </div>
        </div>

        <Footer />
    </div>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>