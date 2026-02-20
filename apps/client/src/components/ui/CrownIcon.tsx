interface CrownIconProps {
  size?: number;
  className?: string;
}

export default function CrownIcon({ size = 20, className = "" }: CrownIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M2 18L4 8L8 12L12 4L16 12L20 8L22 18H2Z"
        fill="#FFD700"
        stroke="#FFA500"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="4" cy="8" r="1.5" fill="#FFD700" />
      <circle cx="12" cy="4" r="1.5" fill="#FFD700" />
      <circle cx="20" cy="8" r="1.5" fill="#FFD700" />
    </svg>
  );
}
