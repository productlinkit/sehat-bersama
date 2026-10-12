// Mock data that stands in for the backend. Swap these for API calls later.
// Copy follows docs/design-guide.md: one voice ("kamu"), plain names, no test values.

import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Apple, Baby, Brain, Droplets, Leaf, Stethoscope } from 'lucide-react'
import {
  IconChild,
  IconFamily,
  IconHomecare,
  IconInfusion,
  IconLab,
  IconMind,
  IconScreening,
  IconSparkHeart,
  IconStethoscope,
  IconSun,
  IconSunPlus,
  IconWeek,
  MoodConfused,
  MoodEnergetic,
  MoodHappy,
  MoodNeutral,
  MoodSad,
  type IconProps,
} from '@/components/icons'

export type AppIcon = ComponentType<IconProps>

/** Illustration colour pairs (icon stroke + soft fill). Amber is reserved for warnings. */
export const iconTones = {
  teal: { ring: 'bg-emerald-100', fg: 'text-teal-800', fill: '[--icon-fill:#6ee7b7]', tint: 'bg-emerald-50 border-emerald-200' },
  rose: { ring: 'bg-rose-100', fg: 'text-rose-800', fill: '[--icon-fill:#fda4af]', tint: 'bg-rose-50 border-rose-200' },
  violet: { ring: 'bg-violet-100', fg: 'text-violet-800', fill: '[--icon-fill:#c4b5fd]', tint: 'bg-violet-50 border-violet-200' },
  sky: { ring: 'bg-sky-100', fg: 'text-sky-800', fill: '[--icon-fill:#7dd3fc]', tint: 'bg-sky-50 border-sky-200' },
  cyan: { ring: 'bg-cyan-100', fg: 'text-cyan-800', fill: '[--icon-fill:#67e8f9]', tint: 'bg-cyan-50 border-cyan-200' },
} as const
export type IconTone = keyof typeof iconTones

export type ServiceKey = 'umum' | 'anak' | 'mental' | 'homecare' | 'homelab'

export interface Service {
  key: ServiceKey
  name: string
  shortName: string
  description: string
  badge?: { label: string; tone: 'teal' | 'info' }
  icon: AppIcon
  tone: IconTone
  /** Where the tile goes for a signed-in user and for a guest. Every tile is a link. */
  to: { user: string; guest: string }
}

export const services: Service[] = [
  {
    key: 'umum',
    name: 'Konsultasi Umum',
    shortName: 'Konsultasi Umum',
    description: 'Chat langsung dengan dokter umum yang siaga',
    badge: { label: 'Termasuk paket', tone: 'teal' },
    icon: IconStethoscope,
    tone: 'teal',
    to: { user: '/consultation/start?type=umum', guest: '/packages?for=umum' },
  },
  {
    key: 'anak',
    name: 'Dokter Anak',
    shortName: 'Dokter Anak',
    description: 'Konsultasi dengan dokter spesialis anak',
    badge: { label: 'Termasuk paket', tone: 'teal' },
    icon: IconChild,
    tone: 'rose',
    to: { user: '/consultation/start?type=anak', guest: '/packages?for=anak' },
  },
  {
    key: 'mental',
    name: 'Kesehatan Mental (Lega)',
    shortName: 'Kesehatan Mental',
    description: 'Teman cerita AI dan konseling psikolog berlisensi',
    icon: IconMind,
    tone: 'violet',
    to: { user: '/lega', guest: '/lega' },
  },
  {
    key: 'homecare',
    name: 'Perawatan di Rumah',
    shortName: 'Perawatan di Rumah',
    description: 'Perawat datang langsung ke rumahmu',
    badge: { label: 'Kota terpilih', tone: 'info' },
    icon: IconHomecare,
    tone: 'sky',
    to: { user: '/home-services', guest: '/home-services' },
  },
  {
    key: 'homelab',
    name: 'Lab di Rumah',
    shortName: 'Lab di Rumah',
    description: 'Ambil sampel darah & urin di rumah',
    badge: { label: 'Jabodetabek', tone: 'info' },
    icon: IconLab,
    tone: 'cyan',
    to: { user: '/home-services', guest: '/home-services' },
  },
]

export interface Quota {
  label: string
  remaining: number
  total: number
}

export const quotas: Quota[] = [
  { label: 'Chat Dokter Umum', remaining: 8, total: 10 },
  { label: 'Konsultasi Dokter Anak', remaining: 1, total: 1 },
  { label: 'Panggilan Video', remaining: 2, total: 2 },
  { label: 'Panggilan Suara', remaining: 2, total: 2 },
]

/** One display label + artwork per article category, used on every surface. */
export const categories: Record<string, { label: string; icon: LucideIcon; cover: string; fg: string }> = {
  'kesehatan-mental': { label: 'Kesehatan Mental', icon: Brain, cover: 'from-violet-200 to-fuchsia-100', fg: 'text-violet-700' },
  nutrisi: { label: 'Nutrisi', icon: Apple, cover: 'from-lime-200 to-emerald-100', fg: 'text-emerald-700' },
  umum: { label: 'Kesehatan Umum', icon: Stethoscope, cover: 'from-teal-200 to-cyan-100', fg: 'text-teal-700' },
  'gaya-hidup': { label: 'Gaya Hidup', icon: Droplets, cover: 'from-sky-200 to-blue-100', fg: 'text-sky-700' },
  anak: { label: 'Anak', icon: Baby, cover: 'from-rose-200 to-pink-100', fg: 'text-rose-700' },
}
export const fallbackCategory = { label: 'Artikel', icon: Leaf, cover: 'from-emerald-100 to-teal-50', fg: 'text-teal-700' }
export const categoryOf = (slug: string) => categories[slug] ?? fallbackCategory

export interface Article {
  slug: string
  title: string
  category: string
  readMinutes: number
  body: string[]
}

export const articles: Article[] = [
  {
    slug: 'atasi-stres-kerja-mindfulness-10-menit',
    title: 'Atasi Stres Kerja dalam 10 Menit dengan Teknik Mindfulness',
    category: 'kesehatan-mental',
    readMinutes: 6,
    body: [
      'Tekanan pekerjaan yang menumpuk bisa membuat pikiran sulit fokus. Latihan singkat yang dilakukan rutin bisa membantu tubuh dan pikiranmu kembali tenang.',
      'Mulailah dengan duduk nyaman, pejamkan mata, lalu tarik napas perlahan selama empat hitungan. Tahan sebentar, kemudian embuskan selama enam hitungan. Ulangi beberapa kali.',
      'Setelah napas lebih teratur, arahkan perhatian ke sensasi tubuh dari kepala hingga kaki. Tidak perlu mengubah apa pun, cukup sadari apa yang terasa.',
      'Kalau stres terus mengganggu tidur, nafsu makan, atau aktivitas harian, pertimbangkan untuk bicara dengan psikolog.',
    ],
  },
  {
    slug: 'cara-praktis-menjaga-pola-makan-sehat',
    title: 'Cara Praktis Menjaga Pola Makan Sehat di Tengah Kesibukan',
    category: 'nutrisi',
    readMinutes: 5,
    body: [
      'Jadwal padat sering membuat kita memilih makanan cepat saji. Dengan sedikit perencanaan, makan sehat tetap bisa kamu lakukan.',
      'Siapkan bahan makanan untuk beberapa hari di akhir pekan. Potong sayur, rebus telur, dan masak sumber karbohidrat secukupnya.',
      'Isi setengah piring dengan sayur dan buah, seperempat dengan protein, dan seperempat dengan karbohidrat kompleks.',
      'Bawa camilan sehat seperti kacang atau buah supaya tidak tergoda jajanan manis saat lapar.',
    ],
  },
  {
    slug: 'kenali-gejala-demam-berdarah',
    title: 'Kenali Gejala Demam Berdarah Sejak Dini',
    category: 'umum',
    readMinutes: 5,
    body: [
      'Demam berdarah dengue disebabkan virus yang ditularkan lewat gigitan nyamuk. Mengenali tanda awal membantu penanganan lebih cepat.',
      'Gejala umum meliputi demam tinggi mendadak, nyeri kepala, nyeri di belakang mata, nyeri otot dan sendi, serta ruam kulit.',
      'Waspadai tanda bahaya seperti nyeri perut hebat, muntah terus-menerus, gusi berdarah, atau lemas berlebihan. Segera ke fasilitas kesehatan bila muncul.',
      'Cegah dengan menguras tempat penampungan air, menutup wadah air, dan memakai losion anti nyamuk.',
    ],
  },
  {
    slug: 'jaga-kesehatan-mental-harian',
    title: 'Jaga Kesehatan Mental dalam Keseharian',
    category: 'kesehatan-mental',
    readMinutes: 6,
    body: [
      'Kesehatan mental sama pentingnya dengan kesehatan fisik. Kebiasaan kecil sehari-hari bisa memberi dampak besar.',
      'Tidur cukup, bergerak aktif, dan menjaga hubungan baik dengan orang terdekat adalah fondasi yang sederhana tapi efektif.',
      'Luangkan waktu untuk mencatat perasaanmu. Menuliskan emosi membantu kamu memahami pola dan pemicunya.',
      'Jangan ragu minta bantuan profesional saat merasa kewalahan.',
    ],
  },
  {
    slug: 'panduan-hidrasi-yang-benar',
    title: 'Panduan Hidrasi yang Benar untuk Tubuh',
    category: 'gaya-hidup',
    readMinutes: 4,
    body: [
      'Air berperan di hampir semua fungsi tubuh, mulai dari mengatur suhu hingga membantu pencernaan.',
      'Kebutuhan cairan tiap orang berbeda, tergantung aktivitas, cuaca, dan kondisi kesehatan. Warna urine jernih kekuningan jadi penanda sederhana tubuhmu cukup cairan.',
      'Biasakan membawa botol minum dan minum sedikit demi sedikit sepanjang hari.',
    ],
  },
  {
    slug: 'kapan-anak-cek-tumbuh-kembang',
    title: 'Kapan Anak Perlu Cek Tumbuh Kembang?',
    category: 'anak',
    readMinutes: 5,
    body: [
      'Pemantauan tumbuh kembang membantu kamu mengetahui apakah anak berkembang sesuai usianya.',
      'Pemeriksaan rutin biasanya lebih sering di tahun pertama, lalu berkala hingga usia sekolah.',
      'Konsultasikan dengan dokter anak bila anak terlambat bicara, berjalan, atau berat badannya tidak naik sesuai kurva.',
    ],
  },
]

export const AI_COPILOT_EXPLAINER =
  'AI Co-Pilot adalah asisten AI yang menanyakan gejalamu terlebih dulu, lalu meneruskan ringkasannya ke dokter supaya konsultasi lebih cepat. AI Co-Pilot tidak memberi diagnosis.'

export interface Package {
  id: string
  name: string
  days: number
  price: number
  icon: AppIcon
  tone: IconTone
  features: string[]
  popular?: boolean
  /** Feature matrix for the comparison sheet. */
  compare: Record<CompareRow, string>
}

export type CompareRow = 'chat' | 'anak' | 'call' | 'ai' | 'resep' | 'diskon'
export const compareRows: { key: CompareRow; label: string }[] = [
  { key: 'chat', label: 'Chat Dokter Umum' },
  { key: 'anak', label: 'Konsultasi Dokter Anak' },
  { key: 'call', label: 'Panggilan video / suara' },
  { key: 'ai', label: 'AI Co-Pilot 24/7' },
  { key: 'resep', label: 'Resep digital' },
  { key: 'diskon', label: 'Diskon perawatan & lab di rumah' },
]

export const packages: Package[] = [
  {
    id: 'harian',
    name: 'Sehat Harian',
    days: 1,
    price: 2000,
    icon: IconSun,
    tone: 'teal',
    features: ['1x Chat Dokter Umum', 'AI Co-Pilot 24/7', 'Resep digital'],
    compare: { chat: '1x', anak: '—', call: '—', ai: '✓', resep: '✓', diskon: '—' },
  },
  {
    id: 'harian-plus',
    name: 'Sehat Harian Plus',
    days: 1,
    price: 3000,
    icon: IconSunPlus,
    tone: 'cyan',
    features: ['1x Chat Dokter Umum', '1x Konsultasi Dokter Anak', 'AI Co-Pilot 24/7', 'Resep digital'],
    compare: { chat: '1x', anak: '1x', call: '—', ai: '✓', resep: '✓', diskon: '—' },
  },
  {
    id: 'mingguan',
    name: 'Sehat Mingguan',
    days: 7,
    price: 15000,
    icon: IconWeek,
    tone: 'rose',
    popular: true,
    features: ['10x Chat Dokter Umum (maks. 30 menit/sesi)', '1x Konsultasi Dokter Anak', '2x Panggilan video/suara', 'AI Co-Pilot 24/7'],
    compare: { chat: '10x', anak: '1x', call: '2x', ai: '✓', resep: '✓', diskon: '—' },
  },
  {
    id: 'keluarga',
    name: 'Sehat Keluarga',
    days: 30,
    price: 79000,
    icon: IconFamily,
    tone: 'sky',
    features: ['30x Chat Dokter Umum', '4x Konsultasi Dokter Anak', '4x Panggilan video/suara', 'Diskon perawatan & lab di rumah 20%'],
    compare: { chat: '30x', anak: '4x', call: '4x', ai: '✓', resep: '✓', diskon: '20%' },
  },
]

export const legaPass = {
  options: [
    { id: 'lega-1', name: 'Lega Pass 1 hari', label: '1 hari', days: 1, price: 1000 },
    { id: 'lega-7', name: 'Lega Pass 7 hari', label: '7 hari', days: 7, price: 5000 },
    { id: 'lega-30', name: 'Lega Pass 30 hari', label: '30 hari', days: 30, price: 25000 },
  ],
  features: ['Teman cerita AI 24/7', 'Cek perasaan harian', 'Jurnal emosi', 'Ringkasan perasaan mingguan'],
  icon: IconSparkHeart as AppIcon,
}

/** Anything purchasable, by id. */
export function findProduct(id: string | null) {
  if (!id) return undefined
  const p = packages.find((x) => x.id === id)
  if (p) return { id: p.id, name: p.name, price: p.price, days: p.days }
  const l = legaPass.options.find((x) => x.id === id)
  if (l) return { id: l.id, name: l.name, price: l.price, days: l.days }
  return undefined
}

/** Triage-based recommendation for the package page (?for=). */
export const recommendationFor: Record<string, { id: string; reason: string }> = {
  umum: { id: 'mingguan', reason: 'Cocok kalau kamu butuh beberapa kali konsultasi minggu ini.' },
  anak: { id: 'harian-plus', reason: 'Sudah termasuk 1x konsultasi dokter anak, harga paling hemat.' },
  keluarga: { id: 'keluarga', reason: 'Kuota besar untuk seluruh keluarga, plus diskon perawatan & lab di rumah.' },
  mental: { id: 'lega-7', reason: 'Akses Lega seminggu penuh untuk cek perasaan dan cerita kapan saja.' },
}

export const activePlans = [
  {
    name: 'Sehat Mingguan',
    until: '18 Okt 2026',
    daysLeft: 6,
    features: ['10x Chat Dokter Umum (maks. 30 menit/sesi)', '1x Konsultasi Dokter Anak', '2x Panggilan video/suara', 'AI Co-Pilot 24/7'],
  },
]

export interface Doctor {
  name: string
  specialty: string
  years: number
  rating: number
  online: boolean
  initials: string
}

// Fictional doctors for the demo.
export const doctors: Doctor[] = [
  { name: 'dr. Ayu Lestari', specialty: 'Dokter Umum', years: 6, rating: 4.9, online: true, initials: 'AL' },
  { name: 'dr. Bima Saputra', specialty: 'Dokter Umum', years: 4, rating: 4.8, online: true, initials: 'BS' },
  { name: 'dr. Citra Wulandari, Sp.A', specialty: 'Dokter Anak', years: 9, rating: 4.9, online: true, initials: 'CW' },
  { name: 'dr. Dimas Prakoso', specialty: 'Dokter Umum', years: 3, rating: 4.7, online: false, initials: 'DP' },
  { name: 'dr. Eka Rahmawati, Sp.A', specialty: 'Dokter Anak', years: 12, rating: 4.9, online: false, initials: 'ER' },
]

export const homeServiceCities = ['Jakarta', 'Bali', 'Lombok', 'Surabaya', 'Bandung']

export const homeServices: { name: string; desc: string; icon: AppIcon; tone: IconTone }[] = [
  { name: 'Perawatan di Rumah', desc: 'Perawat datang ke rumahmu untuk perawatan berkala', icon: IconHomecare, tone: 'sky' },
  { name: 'Lab di Rumah', desc: 'Ambil sampel darah & lab medis di rumahmu', icon: IconLab, tone: 'cyan' },
  { name: 'Skrining Kesehatan Lanjutan', desc: 'Paket cek kesehatan menyeluruh langsung di lokasimu', icon: IconScreening, tone: 'teal' },
  { name: 'Infus Vitamin & Kebugaran', desc: 'Penambah energi dan imun dengan pengawasan medis', icon: IconInfusion, tone: 'rose' },
]

export interface Consultation {
  id: string
  date: string
  title: string
  summary: string
  status: 'ongoing' | 'done'
}

export const consultations: Consultation[] = [
  {
    id: 'c1',
    date: '12 Okt 2026',
    title: 'Konsultasi Dokter Umum',
    summary: 'Keluhan pusing dan demam ringan sejak kemarin.',
    status: 'ongoing',
  },
  { id: 'c2', date: '9 Okt 2026', title: 'Konsultasi Dokter Umum', summary: 'Batuk berdahak 3 hari, tanpa sesak napas.', status: 'done' },
  { id: 'c3', date: '2 Okt 2026', title: 'Konsultasi Dokter Anak', summary: 'Anak demam 38°C, nafsu makan menurun.', status: 'done' },
]

export const notifications = [
  { title: 'Resep digital terbit', body: 'Doktermu menerbitkan resep. Buka untuk melihat detail.', time: '12 Okt, 10.59', to: '/prescriptions', unread: true },
  { title: 'Dokter membalas', body: 'dr. Ayu Lestari mengirim pesan baru di konsultasimu.', time: '12 Okt, 10.54', to: '/consultation', unread: true },
  { title: 'Konsultasi selesai', body: 'Ringkasan konsultasimu sudah tersedia.', time: '9 Okt, 16.20', to: '/history', unread: false },
  { title: 'Paket aktif', body: 'Sehat Mingguan aktif sampai 18 Okt 2026.', time: '11 Okt, 09.02', to: '/account', unread: false },
  { title: 'Konsultasi selesai', body: 'Ringkasan konsultasimu sudah tersedia.', time: '2 Okt, 19.45', to: '/history', unread: false },
]

export const pointHistory = [
  { label: 'Pembelian Sehat Mingguan', time: '11 Okt, 09.02', points: 150 },
  { label: 'Konsultasi selesai', time: '9 Okt, 16.20', points: 100 },
  { label: 'Klaim poin harian', time: '9 Okt, 08.10', points: 15 },
  { label: 'Konsultasi selesai', time: '2 Okt, 19.45', points: 100 },
  { label: 'Klaim poin harian', time: '2 Okt, 07.30', points: 15 },
  { label: 'Bonus pengguna baru', time: '1 Okt, 10.00', points: 750 },
]

/** Point tiers. */
export const tiers = [
  { name: 'Perak', min: 0 },
  { name: 'Emas', min: 500 },
  { name: 'Platinum', min: 2000 },
]

export interface Voucher {
  id: string
  title: string
  description: string
  cost: number
  /** Product ids the voucher applies to at checkout; empty = coming soon. */
  appliesTo: string[]
  discount: number
}

/** Redeemable catalogue, tied to packages. */
export const voucherCatalogue: Voucher[] = [
  { id: 'v-harian', title: 'Potongan Rp 1.000', description: 'Untuk Sehat Harian atau Sehat Harian Plus', cost: 300, appliesTo: ['harian', 'harian-plus'], discount: 1000 },
  { id: 'v-mingguan', title: 'Potongan Rp 3.000', description: 'Untuk Sehat Mingguan', cost: 600, appliesTo: ['mingguan'], discount: 3000 },
  { id: 'v-keluarga', title: 'Potongan Rp 10.000', description: 'Untuk Sehat Keluarga', cost: 1500, appliesTo: ['keluarga'], discount: 10000 },
  { id: 'v-homecare', title: 'Diskon 15% Perawatan di Rumah', description: 'Segera hadir untuk layanan ke rumah', cost: 2000, appliesTo: [], discount: 0 },
]

export const transactions = [
  { name: 'Sehat Mingguan', date: '11 Okt 2026', amount: 15000 },
  { name: 'Sehat Harian', date: '9 Okt 2026', amount: 2000 },
  { name: 'Sehat Harian Plus', date: '2 Okt 2026', amount: 3000 },
]

export const accessHistory = [
  { name: 'Sehat Mingguan', period: '11 Okt 2026 – 18 Okt 2026', active: true, quota: 'Kuota chat: 8 tersisa dari 10' },
  { name: 'Sehat Harian', period: '9 Okt 2026 – 10 Okt 2026', active: false, quota: 'Kuota chat: 0 tersisa dari 1' },
  { name: 'Sehat Harian Plus', period: '2 Okt 2026 – 3 Okt 2026', active: false, quota: 'Kuota chat: 0 tersisa dari 1' },
]

export const prescriptions = [
  {
    no: 'RX-261012-1ED757',
    patient: 'Akun Demo',
    doctor: 'dr. Ayu Lestari',
    issued: '12 Oktober 2026 pukul 10.59 WIB',
    items: [{ name: 'Paracetamol 500 mg', dose: '3 x 1 tablet sesudah makan, bila demam' }],
    hash: '2381B00E9381402A',
  },
]

export const faqs = [
  {
    q: 'Bagaimana alur konsultasi di Sehat Bersama?',
    a: 'Pilih layanan, ceritakan keluhanmu ke AI Co-Pilot, lalu dokter akan bergabung di chat yang sama. Seluruh riwayat chat diteruskan ke dokter.',
  },
  {
    q: 'Apa itu AI Co-Pilot?',
    a: AI_COPILOT_EXPLAINER,
  },
  {
    q: 'Apa itu paket akses dan bagaimana cara kerjanya?',
    a: 'Paket akses memberi kuota layanan dalam periode tertentu. Kalau kamu punya beberapa paket aktif, kuotanya digabungkan.',
  },
  {
    q: 'Bagaimana cara menukar poin?',
    a: 'Buka menu Hadiah, pilih voucher yang poinnya cukup, lalu tukarkan. Voucher otomatis bisa dipilih saat pembayaran paket yang sesuai.',
  },
  {
    q: 'Bagaimana cara melihat resep digital?',
    a: 'Resep dari dokter bisa kamu buka lewat tombol Resep & Dokumen di halaman konsultasi atau dari notifikasi.',
  },
  {
    q: 'Saya lupa kata sandi. Apa yang harus dilakukan?',
    a: 'Ketuk "Lupa kata sandi?" di halaman masuk. Kami kirim kode OTP ke nomor HP-mu untuk membuat kata sandi baru.',
  },
  {
    q: 'Apakah data kesehatanku aman?',
    a: 'Datamu terenkripsi dan hanya bisa diakses olehmu serta tenaga medis yang menangani konsultasimu, sesuai UU PDP No. 27/2022.',
  },
  {
    q: 'Apa yang harus dilakukan dalam kondisi darurat?',
    a: 'Segera hubungi 112 atau 119, atau datang ke IGD terdekat. Sehat Bersama bukan pengganti layanan gawat darurat.',
  },
]

export const moods = [
  { key: 'energik', label: 'Bersemangat', icon: MoodEnergetic },
  { key: 'senang', label: 'Senang', icon: MoodHappy },
  { key: 'biasa', label: 'Biasa', icon: MoodNeutral },
  { key: 'bingung', label: 'Bingung', icon: MoodConfused },
  { key: 'sedih', label: 'Sedih', icon: MoodSad },
] as const

export type MoodKey = (typeof moods)[number]['key']

export const rupiah = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID')

/** WhatsApp customer service. Set VITE_CS_WHATSAPP (e.g. 62811xxxxxxx) to enable the link. */
export const CS_WHATSAPP: string | undefined = import.meta.env.VITE_CS_WHATSAPP
