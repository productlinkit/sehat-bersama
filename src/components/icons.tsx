// Sehat Bersama icon set: duotone 48×48 SVGs, 2.5px rounded strokes in currentColor,
// soft fill from --icon-fill. Same rendering on every OS (replaces emoji icons).
import type { SVGProps } from 'react'

export type IconProps = SVGProps<SVGSVGElement>

function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

const fill = 'var(--icon-fill, #99f6e4)'

export const IconStethoscope = (p: IconProps) => (
  <Base {...p}>
    <circle cx="36" cy="27" r="5" fill={fill} />
    <path d="M12 8h-2v10a9 9 0 0 0 18 0V8h-2" />
    <path d="M19 27v4a10 10 0 0 0 20 0v-1" />
    <circle cx="36" cy="27" r="2" />
  </Base>
)

export const IconChild = (p: IconProps) => (
  <Base {...p}>
    <circle cx="24" cy="21" r="12" fill={fill} />
    <path d="M22 9c0-3 5-4 6-1" />
    <path d="M19.5 20h.01M28.5 20h.01" strokeWidth={3.5} />
    <path d="M20 25.5a5 5 0 0 0 8 0" />
    <path d="M12 43a12 12 0 0 1 24 0" />
  </Base>
)

export const IconMind = (p: IconProps) => (
  <Base {...p}>
    <path d="M10 10h28a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4H23l-9 7v-7h-4a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" fill={fill} />
    <path d="M24 27s-7-4-7-8.5a3.5 3.5 0 0 1 7-1 3.5 3.5 0 0 1 7 1C31 23 24 27 24 27z" />
  </Base>
)

export const IconHomecare = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 21 24 8l16 13v17a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3z" fill={fill} />
    <path d="M24 24v11M18.5 29.5h11" />
  </Base>
)

export const IconLab = (p: IconProps) => (
  <Base {...p}>
    <path d="M19 22h10v11a5 5 0 0 1-10 0z" fill={fill} stroke="none" />
    <path d="M17 6h14M19 6v27a5 5 0 0 0 10 0V6" />
    <path d="M19 22h10" />
    <circle cx="36" cy="14" r="2" />
    <circle cx="38" cy="22" r="1.5" />
  </Base>
)

export const IconScreening = (p: IconProps) => (
  <Base {...p}>
    <rect x="11" y="9" width="26" height="33" rx="3" fill={fill} />
    <rect x="18" y="5" width="12" height="7" rx="2" />
    <path d="M15 28h5l3-7 4 13 3-6h4" />
  </Base>
)

export const IconInfusion = (p: IconProps) => (
  <Base {...p}>
    <rect x="15" y="5" width="18" height="20" rx="5" fill={fill} />
    <path d="M20 13h8M24 25v5" />
    <rect x="21" y="30" width="6" height="6" rx="1.5" />
    <path d="M24 36v6" />
  </Base>
)

export const IconSun = (p: IconProps) => (
  <Base {...p}>
    <circle cx="24" cy="24" r="8" fill={fill} />
    <path d="M24 6v4M24 38v4M6 24h4M38 24h4M11.3 11.3l2.8 2.8M33.9 33.9l2.8 2.8M11.3 36.7l2.8-2.8M33.9 14.1l2.8-2.8" />
  </Base>
)

export const IconSunPlus = (p: IconProps) => (
  <Base {...p}>
    <circle cx="20" cy="20" r="7" fill={fill} />
    <path d="M20 5v3M20 32v3M5 20h3M32 20h3M9.4 9.4l2.1 2.1M28.5 11.5l2.1-2.1M9.4 30.6l2.1-2.1" />
    <circle cx="35" cy="35" r="8" />
    <path d="M35 31v8M31 35h8" />
  </Base>
)

export const IconWeek = (p: IconProps) => (
  <Base {...p}>
    <rect x="8" y="11" width="32" height="30" rx="4" fill={fill} />
    <path d="M16 7v8M32 7v8M8 19h32" />
    <path d="M20 25h8l-5 10" />
  </Base>
)

export const IconFamily = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 22 24 8l18 14" />
    <path d="M10 19v19a3 3 0 0 0 3 3h22a3 3 0 0 0 3-3V19" fill={fill} />
    <circle cx="19" cy="25" r="3.5" />
    <circle cx="30" cy="27" r="2.5" />
    <path d="M13 39a6 6 0 0 1 12 0M26 39a4 4 0 0 1 8 0" />
  </Base>
)

export const IconSparkHeart = (p: IconProps) => (
  <Base {...p}>
    <path d="M24 40S8 31 8 19.5A8 8 0 0 1 24 15a8 8 0 0 1 16 4.5C40 31 24 40 24 40z" fill={fill} />
    <path d="M36 6v6M33 9h6" />
  </Base>
)

export const IconPaid = (p: IconProps) => (
  <Base {...p}>
    <circle cx="24" cy="24" r="17" fill={fill} />
    <path d="m16 24.5 5.5 5.5L33 18.5" strokeWidth={3.5} />
  </Base>
)

/* Mood faces for Lega */
function Face({ mouth, brows, eyes = 'dots', ...p }: IconProps & { mouth: string; brows?: string; eyes?: 'dots' | 'happy' }) {
  return (
    <Base {...p}>
      <circle cx="24" cy="24" r="17" fill={fill} />
      {eyes === 'dots' ? (
        <path d="M18 21h.01M30 21h.01" strokeWidth={4} />
      ) : (
        <path d="M15.5 22a3 3 0 0 1 5 0M27.5 22a3 3 0 0 1 5 0" />
      )}
      {brows && <path d={brows} />}
      <path d={mouth} />
    </Base>
  )
}

export const MoodEnergetic = (p: IconProps) => <Face {...p} eyes="happy" brows="M15 15.5l4-1.5M33 15.5l-4-1.5" mouth="M16 28a8 8 0 0 0 16 0z" />
export const MoodHappy = (p: IconProps) => <Face {...p} eyes="happy" mouth="M17.5 28.5a8 8 0 0 0 13 0" />
export const MoodNeutral = (p: IconProps) => <Face {...p} mouth="M18 30h12" />
export const MoodConfused = (p: IconProps) => <Face {...p} brows="M15 16l5 1M28 17l5-2" mouth="M17 31c2-2 4 2 7 0s5 2 7 0" />
export const MoodSad = (p: IconProps) => <Face {...p} brows="M15 17l5-2M33 17l-5-2" mouth="M17.5 32a8 8 0 0 1 13 0" />
