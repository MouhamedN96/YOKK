import React from 'react'

interface IconProps {
  className?: string
  size?: number
}

// Sankofa - "Learn from the past"
export const SankofahIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 4C12 4 8 6 8 10C8 12 9 13 10 14C11 15 12 16 12 18M12 4C12 4 16 6 16 10C16 12 15 13 14 14C13 15 12 16 12 18M12 4V18M12 18C12 19 13 20 14 20M12 18C12 19 11 20 10 20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="18" r="2" fill="currentColor" />
  </svg>
)

// Gye Nyame - "Supremacy of God / Community"
export const GyeNyameIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 3L14.5 8.5L20 9.5L16 14L17 20L12 17L7 20L8 14L4 9.5L9.5 8.5L12 3Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
)

// Dwennimmen - "Strength & Humility" (Ram's horns)
export const DwennimmenIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M6 8C6 8 4 10 4 14C4 16 5 18 7 19M18 8C18 8 20 10 20 14C20 16 19 18 17 19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M7 19C7 19 8 16 9 14C10 12 11 11 12 11C13 11 14 12 15 14C16 16 17 19 17 19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="6" cy="8" r="2" fill="currentColor" />
    <circle cx="18" cy="8" r="2" fill="currentColor" />
  </svg>
)

// Fihankra - "Security & Safety"
export const FihankraIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 3L4 7V11C4 15.5 7 19.5 12 21C17 19.5 20 15.5 20 11V7L12 3Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 12L11 14L15 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// Mpatapo - "Knot of Reconciliation"
export const MpatapoIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 4L8 8L12 12L8 16L12 20M12 4L16 8L12 12L16 16L12 20M12 4V20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
)

// Flame icon for streaks
export const FlameIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 2C12 2 8 6 8 10C8 13 10 15 12 15C14 15 16 13 16 10C16 6 12 2 12 2Z"
      fill="currentColor"
      opacity="0.5"
    />
    <path
      d="M12 15C12 15 10 17 10 19C10 21 11 22 12 22C13 22 14 21 14 19C14 17 12 15 12 15Z"
      fill="currentColor"
    />
  </svg>
)
