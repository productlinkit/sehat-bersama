// Mock data that stands in for the backend. Swap these for API calls later.
// Every user-facing string is bilingual ({ id, en }); see docs/design-guide.md for voice rules.
// Dates are ISO strings and are formatted per language at render time.

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
import type { L } from './i18n'

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
  name: L
  shortName: L
  description: L
  badge?: { label: L; tone: 'teal' | 'info' }
  icon: AppIcon
  tone: IconTone
  /** Where the tile goes for a signed-in user and for a guest. Every tile is a link. */
  to: { user: string; guest: string }
}

const included: L = { id: 'Termasuk paket', en: 'In your plan' }

export const services: Service[] = [
  {
    key: 'umum',
    name: { id: 'Konsultasi Umum', en: 'General Consultation' },
    shortName: { id: 'Konsultasi Umum', en: 'General Doctor' },
    description: { id: 'Chat langsung dengan dokter umum yang siaga', en: 'Chat now with an on-duty general doctor' },
    badge: { label: included, tone: 'teal' },
    icon: IconStethoscope,
    tone: 'teal',
    to: { user: '/consultation/start?type=umum', guest: '/packages?for=umum' },
  },
  {
    key: 'anak',
    name: { id: 'Dokter Anak', en: 'Paediatrician' },
    shortName: { id: 'Dokter Anak', en: 'Child Doctor' },
    description: { id: 'Konsultasi dengan dokter spesialis anak', en: 'Consult a children’s specialist' },
    badge: { label: included, tone: 'teal' },
    icon: IconChild,
    tone: 'rose',
    to: { user: '/consultation/start?type=anak', guest: '/packages?for=anak' },
  },
  {
    key: 'mental',
    name: { id: 'Kesehatan Mental (Lega)', en: 'Mental Health (Lega)' },
    shortName: { id: 'Kesehatan Mental', en: 'Mental Health' },
    description: { id: 'Teman cerita AI dan konseling psikolog berlisensi', en: 'AI companion and licensed psychologists' },
    icon: IconMind,
    tone: 'violet',
    to: { user: '/lega', guest: '/lega' },
  },
  {
    key: 'homecare',
    name: { id: 'Perawatan di Rumah', en: 'Home Care' },
    shortName: { id: 'Perawatan di Rumah', en: 'Home Care' },
    description: { id: 'Perawat datang langsung ke rumahmu', en: 'A nurse comes to your home' },
    badge: { label: { id: 'Kota terpilih', en: 'Selected cities' }, tone: 'info' },
    icon: IconHomecare,
    tone: 'sky',
    to: { user: '/home-services', guest: '/home-services' },
  },
  {
    key: 'homelab',
    name: { id: 'Lab di Rumah', en: 'Home Lab Test' },
    shortName: { id: 'Lab di Rumah', en: 'Home Lab' },
    description: { id: 'Ambil sampel darah & urin di rumah', en: 'Blood & urine samples taken at home' },
    badge: { label: { id: 'Jabodetabek', en: 'Greater Jakarta' }, tone: 'info' },
    icon: IconLab,
    tone: 'cyan',
    to: { user: '/home-services', guest: '/home-services' },
  },
]

export interface Quota {
  label: L
  remaining: number
  total: number
}

export const quotas: Quota[] = [
  { label: { id: 'Chat Dokter Umum', en: 'General doctor chat' }, remaining: 8, total: 10 },
  { label: { id: 'Konsultasi Dokter Anak', en: 'Paediatrician consult' }, remaining: 1, total: 1 },
  { label: { id: 'Panggilan Video', en: 'Video calls' }, remaining: 2, total: 2 },
  { label: { id: 'Panggilan Suara', en: 'Voice calls' }, remaining: 2, total: 2 },
]

/** One display label + artwork per article category, used on every surface. */
export const categories: Record<string, { label: L; icon: LucideIcon; cover: string; fg: string }> = {
  'kesehatan-mental': { label: { id: 'Kesehatan Mental', en: 'Mental Health' }, icon: Brain, cover: 'from-violet-200 to-fuchsia-100', fg: 'text-violet-700' },
  nutrisi: { label: { id: 'Nutrisi', en: 'Nutrition' }, icon: Apple, cover: 'from-lime-200 to-emerald-100', fg: 'text-emerald-700' },
  umum: { label: { id: 'Kesehatan Umum', en: 'General Health' }, icon: Stethoscope, cover: 'from-teal-200 to-cyan-100', fg: 'text-teal-700' },
  'gaya-hidup': { label: { id: 'Gaya Hidup', en: 'Lifestyle' }, icon: Droplets, cover: 'from-sky-200 to-blue-100', fg: 'text-sky-700' },
  anak: { label: { id: 'Anak', en: 'Children' }, icon: Baby, cover: 'from-rose-200 to-pink-100', fg: 'text-rose-700' },
}
export const fallbackCategory = { label: { id: 'Artikel', en: 'Article' } as L, icon: Leaf, cover: 'from-emerald-100 to-teal-50', fg: 'text-teal-700' }
export const categoryOf = (slug: string) => categories[slug] ?? fallbackCategory

export interface Article {
  slug: string
  title: L
  category: string
  readMinutes: number
  body: L[]
}

export const articles: Article[] = [
  {
    slug: 'atasi-stres-kerja-mindfulness-10-menit',
    title: { id: 'Atasi Stres Kerja dalam 10 Menit dengan Teknik Mindfulness', en: 'Ease Work Stress in 10 Minutes with Mindfulness' },
    category: 'kesehatan-mental',
    readMinutes: 6,
    body: [
      {
        id: 'Tekanan pekerjaan yang menumpuk bisa membuat pikiran sulit fokus. Latihan singkat yang dilakukan rutin bisa membantu tubuh dan pikiranmu kembali tenang.',
        en: 'Piled-up work pressure can make it hard to focus. A short routine practised regularly can help your body and mind settle again.',
      },
      {
        id: 'Mulailah dengan duduk nyaman, pejamkan mata, lalu tarik napas perlahan selama empat hitungan. Tahan sebentar, kemudian embuskan selama enam hitungan. Ulangi beberapa kali.',
        en: 'Sit comfortably, close your eyes and breathe in slowly for a count of four. Hold briefly, then breathe out for a count of six. Repeat a few times.',
      },
      {
        id: 'Setelah napas lebih teratur, arahkan perhatian ke sensasi tubuh dari kepala hingga kaki. Tidak perlu mengubah apa pun, cukup sadari apa yang terasa.',
        en: 'Once your breathing is steadier, move your attention through your body from head to toe. You don’t need to change anything, just notice what you feel.',
      },
      {
        id: 'Kalau stres terus mengganggu tidur, nafsu makan, atau aktivitas harian, pertimbangkan untuk bicara dengan psikolog.',
        en: 'If stress keeps affecting your sleep, appetite or daily activities, consider talking to a psychologist.',
      },
    ],
  },
  {
    slug: 'cara-praktis-menjaga-pola-makan-sehat',
    title: { id: 'Cara Praktis Menjaga Pola Makan Sehat di Tengah Kesibukan', en: 'Practical Ways to Eat Well on a Busy Schedule' },
    category: 'nutrisi',
    readMinutes: 5,
    body: [
      {
        id: 'Jadwal padat sering membuat kita memilih makanan cepat saji. Dengan sedikit perencanaan, makan sehat tetap bisa kamu lakukan.',
        en: 'A packed schedule often pushes us towards fast food. With a little planning, eating well is still within reach.',
      },
      {
        id: 'Siapkan bahan makanan untuk beberapa hari di akhir pekan. Potong sayur, rebus telur, dan masak sumber karbohidrat secukupnya.',
        en: 'Prep ingredients for a few days at the weekend: chop vegetables, boil eggs and cook a batch of carbohydrates.',
      },
      {
        id: 'Isi setengah piring dengan sayur dan buah, seperempat dengan protein, dan seperempat dengan karbohidrat kompleks.',
        en: 'Fill half your plate with vegetables and fruit, a quarter with protein and a quarter with complex carbohydrates.',
      },
      {
        id: 'Bawa camilan sehat seperti kacang atau buah supaya tidak tergoda jajanan manis saat lapar.',
        en: 'Carry healthy snacks such as nuts or fruit so sugary treats are less tempting when you’re hungry.',
      },
    ],
  },
  {
    slug: 'kenali-gejala-demam-berdarah',
    title: { id: 'Kenali Gejala Demam Berdarah Sejak Dini', en: 'Spotting the Early Signs of Dengue Fever' },
    category: 'umum',
    readMinutes: 5,
    body: [
      {
        id: 'Demam berdarah dengue disebabkan virus yang ditularkan lewat gigitan nyamuk. Mengenali tanda awal membantu penanganan lebih cepat.',
        en: 'Dengue fever is caused by a virus spread through mosquito bites. Recognising the early signs leads to faster treatment.',
      },
      {
        id: 'Gejala umum meliputi demam tinggi mendadak, nyeri kepala, nyeri di belakang mata, nyeri otot dan sendi, serta ruam kulit.',
        en: 'Common symptoms include a sudden high fever, headache, pain behind the eyes, muscle and joint pain, and a skin rash.',
      },
      {
        id: 'Waspadai tanda bahaya seperti nyeri perut hebat, muntah terus-menerus, gusi berdarah, atau lemas berlebihan. Segera ke fasilitas kesehatan bila muncul.',
        en: 'Watch for warning signs such as severe stomach pain, persistent vomiting, bleeding gums or extreme weakness. Go to a health facility straight away if they appear.',
      },
      {
        id: 'Cegah dengan menguras tempat penampungan air, menutup wadah air, dan memakai losion anti nyamuk.',
        en: 'Prevent it by draining standing water, covering water containers and using mosquito repellent.',
      },
    ],
  },
  {
    slug: 'jaga-kesehatan-mental-harian',
    title: { id: 'Jaga Kesehatan Mental dalam Keseharian', en: 'Looking After Your Mental Health Every Day' },
    category: 'kesehatan-mental',
    readMinutes: 6,
    body: [
      {
        id: 'Kesehatan mental sama pentingnya dengan kesehatan fisik. Kebiasaan kecil sehari-hari bisa memberi dampak besar.',
        en: 'Mental health matters as much as physical health. Small daily habits can make a big difference.',
      },
      {
        id: 'Tidur cukup, bergerak aktif, dan menjaga hubungan baik dengan orang terdekat adalah fondasi yang sederhana tapi efektif.',
        en: 'Enough sleep, staying active and keeping close relationships are simple but effective foundations.',
      },
      {
        id: 'Luangkan waktu untuk mencatat perasaanmu. Menuliskan emosi membantu kamu memahami pola dan pemicunya.',
        en: 'Take time to note how you feel. Writing emotions down helps you understand their patterns and triggers.',
      },
      { id: 'Jangan ragu minta bantuan profesional saat merasa kewalahan.', en: 'Don’t hesitate to ask a professional for help when you feel overwhelmed.' },
    ],
  },
  {
    slug: 'panduan-hidrasi-yang-benar',
    title: { id: 'Panduan Hidrasi yang Benar untuk Tubuh', en: 'A Simple Guide to Staying Hydrated' },
    category: 'gaya-hidup',
    readMinutes: 4,
    body: [
      {
        id: 'Air berperan di hampir semua fungsi tubuh, mulai dari mengatur suhu hingga membantu pencernaan.',
        en: 'Water plays a part in almost every body function, from regulating temperature to aiding digestion.',
      },
      {
        id: 'Kebutuhan cairan tiap orang berbeda, tergantung aktivitas, cuaca, dan kondisi kesehatan. Warna urine jernih kekuningan jadi penanda sederhana tubuhmu cukup cairan.',
        en: 'Everyone needs a different amount depending on activity, weather and health. Pale yellow urine is a simple sign you’re drinking enough.',
      },
      { id: 'Biasakan membawa botol minum dan minum sedikit demi sedikit sepanjang hari.', en: 'Carry a water bottle and sip steadily throughout the day.' },
    ],
  },
  {
    slug: 'kapan-anak-cek-tumbuh-kembang',
    title: { id: 'Kapan Anak Perlu Cek Tumbuh Kembang?', en: 'When Should Children Have Development Check-ups?' },
    category: 'anak',
    readMinutes: 5,
    body: [
      {
        id: 'Pemantauan tumbuh kembang membantu kamu mengetahui apakah anak berkembang sesuai usianya.',
        en: 'Tracking growth and development helps you know whether your child is developing as expected for their age.',
      },
      {
        id: 'Pemeriksaan rutin biasanya lebih sering di tahun pertama, lalu berkala hingga usia sekolah.',
        en: 'Check-ups are usually more frequent in the first year, then regular until school age.',
      },
      {
        id: 'Konsultasikan dengan dokter anak bila anak terlambat bicara, berjalan, atau berat badannya tidak naik sesuai kurva.',
        en: 'See a paediatrician if your child is late to talk or walk, or isn’t gaining weight along their growth curve.',
      },
    ],
  },
]

export const AI_COPILOT_EXPLAINER: L = {
  id: 'AI Co-Pilot adalah asisten AI yang menanyakan gejalamu terlebih dulu, lalu meneruskan ringkasannya ke dokter supaya konsultasi lebih cepat. AI Co-Pilot tidak memberi diagnosis.',
  en: 'AI Co-Pilot is an AI assistant that asks about your symptoms first, then passes a summary to the doctor so your consultation is faster. AI Co-Pilot does not diagnose.',
}

export type CompareRow = 'chat' | 'anak' | 'call' | 'ai' | 'resep' | 'diskon'
export const compareRows: { key: CompareRow; label: L }[] = [
  { key: 'chat', label: { id: 'Chat Dokter Umum', en: 'General doctor chat' } },
  { key: 'anak', label: { id: 'Konsultasi Dokter Anak', en: 'Paediatrician consult' } },
  { key: 'call', label: { id: 'Panggilan video / suara', en: 'Video / voice calls' } },
  { key: 'ai', label: { id: 'AI Co-Pilot 24/7', en: 'AI Co-Pilot 24/7' } },
  { key: 'resep', label: { id: 'Resep digital', en: 'Digital prescription' } },
  { key: 'diskon', label: { id: 'Diskon perawatan & lab di rumah', en: 'Home care & lab discount' } },
]

export interface Package {
  id: string
  name: string // brand name, same in both languages
  days: number
  price: number
  icon: AppIcon
  tone: IconTone
  features: L[]
  popular?: boolean
  /** Feature matrix for the comparison sheet. */
  compare: Record<CompareRow, string>
}

const f = {
  chat1: { id: '1x Chat Dokter Umum', en: '1x general doctor chat' },
  anak1: { id: '1x Konsultasi Dokter Anak', en: '1x paediatrician consult' },
  ai: { id: 'AI Co-Pilot 24/7', en: 'AI Co-Pilot 24/7' },
  resep: { id: 'Resep digital', en: 'Digital prescription' },
} satisfies Record<string, L>

export const packages: Package[] = [
  {
    id: 'harian',
    name: 'Sehat Harian',
    days: 1,
    price: 2000,
    icon: IconSun,
    tone: 'teal',
    features: [f.chat1, f.ai, f.resep],
    compare: { chat: '1x', anak: '—', call: '—', ai: '✓', resep: '✓', diskon: '—' },
  },
  {
    id: 'harian-plus',
    name: 'Sehat Harian Plus',
    days: 1,
    price: 3000,
    icon: IconSunPlus,
    tone: 'cyan',
    features: [f.chat1, f.anak1, f.ai, f.resep],
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
    features: [
      { id: '10x Chat Dokter Umum (maks. 30 menit/sesi)', en: '10x general doctor chat (max. 30 min/session)' },
      f.anak1,
      { id: '2x Panggilan video/suara', en: '2x video/voice calls' },
      f.ai,
    ],
    compare: { chat: '10x', anak: '1x', call: '2x', ai: '✓', resep: '✓', diskon: '—' },
  },
  {
    id: 'keluarga',
    name: 'Sehat Keluarga',
    days: 30,
    price: 79000,
    icon: IconFamily,
    tone: 'sky',
    features: [
      { id: '30x Chat Dokter Umum', en: '30x general doctor chat' },
      { id: '4x Konsultasi Dokter Anak', en: '4x paediatrician consults' },
      { id: '4x Panggilan video/suara', en: '4x video/voice calls' },
      { id: 'Diskon perawatan & lab di rumah 20%', en: '20% off home care & lab tests' },
    ],
    compare: { chat: '30x', anak: '4x', call: '4x', ai: '✓', resep: '✓', diskon: '20%' },
  },
]

export const legaPass = {
  options: [
    { id: 'lega-1', name: { id: 'Lega Pass 1 hari', en: 'Lega Pass · 1 day' }, label: { id: '1 hari', en: '1 day' }, days: 1, price: 1000 },
    { id: 'lega-7', name: { id: 'Lega Pass 7 hari', en: 'Lega Pass · 7 days' }, label: { id: '7 hari', en: '7 days' }, days: 7, price: 5000 },
    { id: 'lega-30', name: { id: 'Lega Pass 30 hari', en: 'Lega Pass · 30 days' }, label: { id: '30 hari', en: '30 days' }, days: 30, price: 25000 },
  ],
  features: [
    { id: 'Teman cerita AI 24/7', en: '24/7 AI companion' },
    { id: 'Cek perasaan harian', en: 'Daily mood check' },
    { id: 'Jurnal emosi', en: 'Feelings journal' },
    { id: 'Ringkasan perasaan mingguan', en: 'Weekly mood summary' },
  ] as L[],
  icon: IconSparkHeart as AppIcon,
}

export interface Product {
  id: string
  name: L | string
  price: number
  days: number
}

/** Anything purchasable, by id. */
export function findProduct(id: string | null): Product | undefined {
  if (!id) return undefined
  const p = packages.find((x) => x.id === id)
  if (p) return { id: p.id, name: p.name, price: p.price, days: p.days }
  const l = legaPass.options.find((x) => x.id === id)
  if (l) return { id: l.id, name: l.name, price: l.price, days: l.days }
  return undefined
}

/** Triage-based recommendation for the package page (?for=). */
export const recommendationFor: Record<string, { id: string; reason: L }> = {
  umum: {
    id: 'mingguan',
    reason: { id: 'Cocok kalau kamu butuh beberapa kali konsultasi minggu ini.', en: 'A good fit if you need several consultations this week.' },
  },
  anak: {
    id: 'harian-plus',
    reason: { id: 'Sudah termasuk 1x konsultasi dokter anak, harga paling hemat.', en: 'Includes one paediatrician consult at the lowest price.' },
  },
  keluarga: {
    id: 'keluarga',
    reason: { id: 'Kuota besar untuk seluruh keluarga, plus diskon perawatan & lab di rumah.', en: 'A large quota for the whole family, plus home care & lab discounts.' },
  },
  mental: {
    id: 'lega-7',
    reason: { id: 'Akses Lega seminggu penuh untuk cek perasaan dan cerita kapan saja.', en: 'A full week of Lega to check in and talk any time.' },
  },
}

export const activePlans = [
  {
    name: 'Sehat Mingguan',
    until: '2026-10-18',
    daysLeft: 6,
    features: packages.find((p) => p.id === 'mingguan')!.features,
  },
]

export interface Doctor {
  name: string
  specialty: L
  years: number
  rating: number
  online: boolean
  initials: string
}

const gp: L = { id: 'Dokter Umum', en: 'General Practitioner' }
const paed: L = { id: 'Dokter Anak', en: 'Paediatrician' }

// Fictional doctors for the demo.
export const doctors: Doctor[] = [
  { name: 'dr. Ayu Lestari', specialty: gp, years: 6, rating: 4.9, online: true, initials: 'AL' },
  { name: 'dr. Bima Saputra', specialty: gp, years: 4, rating: 4.8, online: true, initials: 'BS' },
  { name: 'dr. Citra Wulandari, Sp.A', specialty: paed, years: 9, rating: 4.9, online: true, initials: 'CW' },
  { name: 'dr. Dimas Prakoso', specialty: gp, years: 3, rating: 4.7, online: false, initials: 'DP' },
  { name: 'dr. Eka Rahmawati, Sp.A', specialty: paed, years: 12, rating: 4.9, online: false, initials: 'ER' },
]

export const homeServiceCities = ['Jakarta', 'Bali', 'Lombok', 'Surabaya', 'Bandung']

export const homeServices: { name: L; desc: L; icon: AppIcon; tone: IconTone }[] = [
  {
    name: { id: 'Perawatan di Rumah', en: 'Home Care' },
    desc: { id: 'Perawat datang ke rumahmu untuk perawatan berkala', en: 'A nurse visits your home for regular care' },
    icon: IconHomecare,
    tone: 'sky',
  },
  {
    name: { id: 'Lab di Rumah', en: 'Home Lab Test' },
    desc: { id: 'Ambil sampel darah & lab medis di rumahmu', en: 'Blood and lab samples collected at home' },
    icon: IconLab,
    tone: 'cyan',
  },
  {
    name: { id: 'Skrining Kesehatan Lanjutan', en: 'Advanced Health Screening' },
    desc: { id: 'Paket cek kesehatan menyeluruh langsung di lokasimu', en: 'A full health check-up at your location' },
    icon: IconScreening,
    tone: 'teal',
  },
  {
    name: { id: 'Infus Vitamin & Kebugaran', en: 'Vitamin & Wellbeing Drip' },
    desc: { id: 'Penambah energi dan imun dengan pengawasan medis', en: 'Energy and immunity boost under medical supervision' },
    icon: IconInfusion,
    tone: 'rose',
  },
]

export interface Consultation {
  id: string
  date: string
  title: L
  summary: L
  status: 'ongoing' | 'done'
}

const gpConsult: L = { id: 'Konsultasi Dokter Umum', en: 'General doctor consultation' }

export const consultations: Consultation[] = [
  { id: 'c1', date: '2026-10-12', title: gpConsult, summary: { id: 'Keluhan pusing dan demam ringan sejak kemarin.', en: 'Dizziness and a mild fever since yesterday.' }, status: 'ongoing' },
  { id: 'c2', date: '2026-10-09', title: gpConsult, summary: { id: 'Batuk berdahak 3 hari, tanpa sesak napas.', en: 'Chesty cough for 3 days, no shortness of breath.' }, status: 'done' },
  {
    id: 'c3',
    date: '2026-10-02',
    title: { id: 'Konsultasi Dokter Anak', en: 'Paediatrician consultation' },
    summary: { id: 'Anak demam 38°C, nafsu makan menurun.', en: 'Child has a 38°C fever and reduced appetite.' },
    status: 'done',
  },
]

const done: L = { id: 'Konsultasi selesai', en: 'Consultation completed' }
const doneBody: L = { id: 'Ringkasan konsultasimu sudah tersedia.', en: 'Your consultation summary is ready.' }

export const notifications: { title: L; body: L; time: string; to: string; unread: boolean }[] = [
  {
    title: { id: 'Resep digital terbit', en: 'Digital prescription issued' },
    body: { id: 'Doktermu menerbitkan resep. Buka untuk melihat detail.', en: 'Your doctor issued a prescription. Open it to see the details.' },
    time: '2026-10-12T10:59',
    to: '/prescriptions',
    unread: true,
  },
  {
    title: { id: 'Dokter membalas', en: 'Your doctor replied' },
    body: { id: 'dr. Ayu Lestari mengirim pesan baru di konsultasimu.', en: 'dr. Ayu Lestari sent a new message in your consultation.' },
    time: '2026-10-12T10:54',
    to: '/consultation',
    unread: true,
  },
  { title: done, body: doneBody, time: '2026-10-09T16:20', to: '/history', unread: false },
  {
    title: { id: 'Paket aktif', en: 'Plan active' },
    body: { id: 'Sehat Mingguan aktif sampai 18 Okt 2026.', en: 'Sehat Mingguan is active until 18 Oct 2026.' },
    time: '2026-10-11T09:02',
    to: '/account',
    unread: false,
  },
  { title: done, body: doneBody, time: '2026-10-02T19:45', to: '/history', unread: false },
]

export const pointHistory: { label: L; at: string; points: number }[] = [
  { label: { id: 'Pembelian Sehat Mingguan', en: 'Bought Sehat Mingguan' }, at: '2026-10-11T09:02', points: 150 },
  { label: done, at: '2026-10-09T16:20', points: 100 },
  { label: { id: 'Klaim poin harian', en: 'Daily points claimed' }, at: '2026-10-09T08:10', points: 15 },
  { label: done, at: '2026-10-02T19:45', points: 100 },
  { label: { id: 'Klaim poin harian', en: 'Daily points claimed' }, at: '2026-10-02T07:30', points: 15 },
  { label: { id: 'Bonus pengguna baru', en: 'New member bonus' }, at: '2026-10-01T10:00', points: 750 },
]

/** Point tiers. */
export const tiers: { name: L; min: number }[] = [
  { name: { id: 'Perak', en: 'Silver' }, min: 0 },
  { name: { id: 'Emas', en: 'Gold' }, min: 500 },
  { name: { id: 'Platinum', en: 'Platinum' }, min: 2000 },
]

export interface Voucher {
  id: string
  title: L
  description: L
  cost: number
  /** Product ids the voucher applies to at checkout; empty = coming soon. */
  appliesTo: string[]
  discount: number
}

/** Redeemable catalogue, tied to packages. */
export const voucherCatalogue: Voucher[] = [
  {
    id: 'v-harian',
    title: { id: 'Potongan Rp 1.000', en: 'Rp 1,000 off' },
    description: { id: 'Untuk Sehat Harian atau Sehat Harian Plus', en: 'For Sehat Harian or Sehat Harian Plus' },
    cost: 300,
    appliesTo: ['harian', 'harian-plus'],
    discount: 1000,
  },
  {
    id: 'v-mingguan',
    title: { id: 'Potongan Rp 3.000', en: 'Rp 3,000 off' },
    description: { id: 'Untuk Sehat Mingguan', en: 'For Sehat Mingguan' },
    cost: 600,
    appliesTo: ['mingguan'],
    discount: 3000,
  },
  {
    id: 'v-keluarga',
    title: { id: 'Potongan Rp 10.000', en: 'Rp 10,000 off' },
    description: { id: 'Untuk Sehat Keluarga', en: 'For Sehat Keluarga' },
    cost: 1500,
    appliesTo: ['keluarga'],
    discount: 10000,
  },
  {
    id: 'v-homecare',
    title: { id: 'Diskon 15% Perawatan di Rumah', en: '15% off Home Care' },
    description: { id: 'Segera hadir untuk layanan ke rumah', en: 'Coming soon for home services' },
    cost: 2000,
    appliesTo: [],
    discount: 0,
  },
]

export const transactions = [
  { name: 'Sehat Mingguan', date: '2026-10-11', amount: 15000 },
  { name: 'Sehat Harian', date: '2026-10-09', amount: 2000 },
  { name: 'Sehat Harian Plus', date: '2026-10-02', amount: 3000 },
]

export const accessHistory = [
  { name: 'Sehat Mingguan', from: '2026-10-11', to: '2026-10-18', active: true, used: 2, total: 10 },
  { name: 'Sehat Harian', from: '2026-10-09', to: '2026-10-10', active: false, used: 1, total: 1 },
  { name: 'Sehat Harian Plus', from: '2026-10-02', to: '2026-10-03', active: false, used: 1, total: 1 },
]

export const prescriptions = [
  {
    no: 'RX-261012-1ED757',
    patient: 'Akun Demo',
    doctor: 'dr. Ayu Lestari',
    issued: '2026-10-12T10:59',
    items: [
      {
        name: 'Paracetamol 500 mg',
        dose: { id: '3 x 1 tablet sesudah makan, bila demam', en: '1 tablet 3 times a day after meals, when feverish' } as L,
      },
    ],
    hash: '2381B00E9381402A',
  },
]

export const faqs: { q: L; a: L }[] = [
  {
    q: { id: 'Bagaimana alur konsultasi di Sehat Bersama?', en: 'How does a consultation work on Sehat Bersama?' },
    a: {
      id: 'Pilih layanan, ceritakan keluhanmu ke AI Co-Pilot, lalu dokter akan bergabung di chat yang sama. Seluruh riwayat chat diteruskan ke dokter.',
      en: 'Choose a service, describe your symptoms to AI Co-Pilot, then a doctor joins the same chat. The whole chat history is passed to the doctor.',
    },
  },
  { q: { id: 'Apa itu AI Co-Pilot?', en: 'What is AI Co-Pilot?' }, a: AI_COPILOT_EXPLAINER },
  {
    q: { id: 'Apa itu paket akses dan bagaimana cara kerjanya?', en: 'What are plans and how do they work?' },
    a: {
      id: 'Paket akses memberi kuota layanan dalam periode tertentu. Kalau kamu punya beberapa paket aktif, kuotanya digabungkan.',
      en: 'A plan gives you a service quota for a set period. If you have several active plans, their quotas are combined.',
    },
  },
  {
    q: { id: 'Bagaimana cara menukar poin?', en: 'How do I redeem points?' },
    a: {
      id: 'Buka menu Hadiah, pilih voucher yang poinnya cukup, lalu tukarkan. Voucher otomatis bisa dipilih saat pembayaran paket yang sesuai.',
      en: 'Open Rewards, pick a voucher you have enough points for and redeem it. You can then choose it when paying for a matching plan.',
    },
  },
  {
    q: { id: 'Bagaimana cara melihat resep digital?', en: 'Where do I find my digital prescription?' },
    a: {
      id: 'Resep dari dokter bisa kamu buka lewat tombol Resep & Dokumen di halaman konsultasi atau dari notifikasi.',
      en: 'Open it from the Prescriptions & Documents button on the consultation page or from your notifications.',
    },
  },
  {
    q: { id: 'Saya lupa kata sandi. Apa yang harus dilakukan?', en: 'I forgot my password. What should I do?' },
    a: {
      id: 'Ketuk "Lupa kata sandi?" di halaman masuk. Kami kirim kode OTP ke nomor HP-mu untuk membuat kata sandi baru.',
      en: 'Tap "Forgot password?" on the sign-in page. We’ll send a one-time code to your phone so you can set a new password.',
    },
  },
  {
    q: { id: 'Apakah data kesehatanku aman?', en: 'Is my health data safe?' },
    a: {
      id: 'Datamu terenkripsi dan hanya bisa diakses olehmu serta tenaga medis yang menangani konsultasimu, sesuai UU PDP No. 27/2022.',
      en: 'Your data is encrypted and only you and the medical staff handling your consultation can access it, in line with Indonesia’s Personal Data Protection Law (No. 27/2022).',
    },
  },
  {
    q: { id: 'Apa yang harus dilakukan dalam kondisi darurat?', en: 'What should I do in an emergency?' },
    a: {
      id: 'Segera hubungi 112 atau 119, atau datang ke IGD terdekat. Sehat Bersama bukan pengganti layanan gawat darurat.',
      en: 'Call 112 or 119 straight away, or go to the nearest emergency department. Sehat Bersama is not an emergency service.',
    },
  },
]

export const moods = [
  { key: 'energik', label: { id: 'Bersemangat', en: 'Energetic' } as L, icon: MoodEnergetic },
  { key: 'senang', label: { id: 'Senang', en: 'Happy' } as L, icon: MoodHappy },
  { key: 'biasa', label: { id: 'Biasa', en: 'Okay' } as L, icon: MoodNeutral },
  { key: 'bingung', label: { id: 'Bingung', en: 'Confused' } as L, icon: MoodConfused },
  { key: 'sedih', label: { id: 'Sedih', en: 'Sad' } as L, icon: MoodSad },
] as const

export type MoodKey = (typeof moods)[number]['key']

/** Rupiah in the current language's number format: "Rp 15.000" (ID) / "Rp 15,000" (EN). */
export const rupiah = (n: number, lang: 'id' | 'en' = 'id') => 'Rp ' + Math.round(n).toLocaleString(lang === 'id' ? 'id-ID' : 'en-GB')

/** WhatsApp customer service. Set VITE_CS_WHATSAPP (e.g. 62811xxxxxxx) to enable the link. */
export const CS_WHATSAPP: string | undefined = import.meta.env.VITE_CS_WHATSAPP
