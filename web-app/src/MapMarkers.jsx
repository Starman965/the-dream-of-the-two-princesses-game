function markerStyle(point) {
  const offsetX = point.offsetX ?? 0
  const offsetY = point.offsetY ?? 0

  return {
    left: `${point.x}%`,
    top: `${point.y}%`,
    transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
  }
}

export function TravelPartyMarker({ point, label = 'You are here' }) {
  return (
    <div className="map-marker map-marker-party" style={markerStyle(point)} aria-hidden="true">
      <svg className="map-marker-party-icon" viewBox="0 0 120 72" aria-hidden="true">
        <ellipse cx="28" cy="58" rx="22" ry="5" fill="rgba(0,0,0,0.18)" />
        <circle cx="24" cy="34" r="11" fill="#f7b4d7" stroke="#5f3d52" strokeWidth="2" />
        <path
          d="M16 44c2 10 16 10 16 0v-6H16v6Z"
          fill="#f48ec4"
          stroke="#5f3d52"
          strokeWidth="2"
        />
        <circle cx="52" cy="42" r="9" fill="#f2d15b" stroke="#6d5520" strokeWidth="2" />
        <circle cx="48" cy="40" r="1.5" fill="#4e3b16" />
        <circle cx="56" cy="40" r="1.5" fill="#4e3b16" />
        <path d="M49 44h6" stroke="#6d5520" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="76" cy="44" rx="11" ry="13" fill="#b7bec8" stroke="#4d5663" strokeWidth="2" />
        <path d="M68 34h4M80 34h4" stroke="#4d5663" strokeWidth="2" strokeLinecap="round" />
        <circle cx="98" cy="40" r="8" fill="#f4f4f4" stroke="#6a6f78" strokeWidth="2" />
        <ellipse cx="92" cy="32" rx="4" ry="9" fill="#f4f4f4" stroke="#6a6f78" strokeWidth="2" />
        <ellipse cx="104" cy="34" rx="4" ry="7" fill="#f4f4f4" stroke="#6a6f78" strokeWidth="2" />
        <circle cx="96" cy="40" r="1.2" fill="#4e4e4e" />
        <circle cx="100" cy="40" r="1.2" fill="#4e4e4e" />
      </svg>
      <span className="map-marker-label map-marker-label-party">{label}</span>
    </div>
  )
}

export function DestinationMarker({ point, label = 'Go here' }) {
  return (
    <div className="map-marker map-marker-destination" style={markerStyle(point)} aria-hidden="true">
      <span className="map-marker-destination-ring" />
      <span className="map-marker-destination-dot" />
      <span className="map-marker-label map-marker-label-destination">{label}</span>
    </div>
  )
}
