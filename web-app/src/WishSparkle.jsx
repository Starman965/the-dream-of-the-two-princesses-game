import { BASE_SIZE } from './gameData'

const WISH_SPARKLES = [
  { x: 50, y: 8, size: 22, delay: 0 },
  { x: 18, y: 28, size: 18, delay: 0.08 },
  { x: 82, y: 22, size: 20, delay: 0.12 },
  { x: 32, y: 62, size: 19, delay: 0.18 },
  { x: 72, y: 58, size: 21, delay: 0.22 },
  { x: 50, y: 78, size: 18, delay: 0.28 },
  { x: 8, y: 52, size: 16, delay: 0.35 },
  { x: 92, y: 48, size: 17, delay: 0.4 },
  { x: 24, y: 12, size: 15, delay: 0.45 },
  { x: 76, y: 10, size: 16, delay: 0.5 },
  { x: 42, y: 38, size: 26, delay: 0.15 },
  { x: 58, y: 44, size: 28, delay: 0.2 },
  { x: 50, y: 50, size: 32, delay: 0.05 },
]

function toPercent(rect) {
  return {
    left: `${(rect.x / BASE_SIZE.width) * 100}%`,
    top: `${(rect.y / BASE_SIZE.height) * 100}%`,
    width: `${(rect.width / BASE_SIZE.width) * 100}%`,
    height: `${(rect.height / BASE_SIZE.height) * 100}%`,
  }
}

export default function WishSparkle({ dropTarget }) {
  if (!dropTarget) {
    return null
  }

  return (
    <div className="wish-sparkle-stage-overlay" aria-hidden="true">
      <div className="wish-sparkle-burst" style={toPercent(dropTarget)}>
        <div className="wish-sparkle-glow" />
        <div className="wish-sparkle-ring" />
        <div className="wish-sparkle-ring wish-sparkle-ring-delayed" />
        {WISH_SPARKLES.map((sparkle, index) => (
          <span
            key={index}
            className="wish-sparkle"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              animationDelay: `${sparkle.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
