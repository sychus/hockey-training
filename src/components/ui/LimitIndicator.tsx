interface LimitIndicatorProps {
  current: number
  max: number
  label: string
}

export function LimitIndicator({ current, max, label }: LimitIndicatorProps) {
  const isAtLimit = current >= max
  const isNearLimit = current >= max - 2

  return (
    <span
      className={`text-sm font-mono ${
        isAtLimit
          ? 'text-red-500 font-bold'
          : isNearLimit
            ? 'text-yellow-500'
            : 'text-gray-400'
      }`}
    >
      {label ? `${label}: ` : ''}{current}/{max}
    </span>
  )
}
