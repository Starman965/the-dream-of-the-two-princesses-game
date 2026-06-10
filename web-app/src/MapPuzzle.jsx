import { useEffect, useRef, useState } from 'react'
import { DestinationMarker, TravelPartyMarker } from './MapMarkers'

function pointInZone(x, y, zone) {
  return (
    x >= zone.x &&
    x <= zone.x + zone.width &&
    y >= zone.y &&
    y <= zone.y + zone.height
  )
}

function getRenderedImageBounds(container, imageAspect) {
  const rect = container.getBoundingClientRect()
  const containerAspect = rect.width / rect.height

  let renderedWidth
  let renderedHeight
  let offsetX
  let offsetY

  if (imageAspect > containerAspect) {
    renderedWidth = rect.width
    renderedHeight = rect.width / imageAspect
    offsetX = 0
    offsetY = (rect.height - renderedHeight) / 2
  } else {
    renderedHeight = rect.height
    renderedWidth = rect.height * imageAspect
    offsetY = 0
    offsetX = (rect.width - renderedWidth) / 2
  }

  return { rect, renderedWidth, renderedHeight, offsetX, offsetY }
}

function getImageClickPosition(container, imageAspect, clientX, clientY) {
  const { rect, renderedWidth, renderedHeight, offsetX, offsetY } =
    getRenderedImageBounds(container, imageAspect)

  const x = ((clientX - rect.left - offsetX) / renderedWidth) * 100
  const y = ((clientY - rect.top - offsetY) / renderedHeight) * 100

  const displayX = ((clientX - rect.left) / rect.width) * 100
  const displayY = ((clientY - rect.top) / rect.height) * 100

  return {
    x,
    y,
    displayX,
    displayY,
    valid: x >= 0 && x <= 100 && y >= 0 && y <= 100,
  }
}

function getMarkerImagePosition(container, imageAspect, point) {
  const { rect, renderedWidth, renderedHeight, offsetX, offsetY } =
    getRenderedImageBounds(container, imageAspect)
  const centerX = (point.x / 100) * rect.width + (point.offsetX ?? 0)
  const centerY = (point.y / 100) * rect.height + (point.offsetY ?? 0)

  return {
    x: ((centerX - offsetX) / renderedWidth) * 100,
    y: ((centerY - offsetY) / renderedHeight) * 100,
  }
}

function pointNearMarker(position, markerCenter, hitRadius) {
  const deltaX = position.x - markerCenter.x
  const deltaY = position.y - markerCenter.y

  return Math.hypot(deltaX, deltaY) <= hitRadius
}

function MapPuzzle({
  mapImage,
  zones,
  markers,
  targetOnly = false,
  solveMessage = 'You found it!',
  onSolve,
  onHint,
  onClose,
  disabled,
}) {
  const containerRef = useRef(null)
  const imageRef = useRef(null)
  const alphaCanvasRef = useRef(null)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [showTrailClue, setShowTrailClue] = useState(false)
  const [foundTrail, setFoundTrail] = useState(false)
  const [tapMarker, setTapMarker] = useState(null)
  const imageAspect = 1

  useEffect(() => {
    const image = imageRef.current
    if (!image) {
      return undefined
    }

    function captureAlphaMask() {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const context = canvas.getContext('2d', { willReadFrequently: true })
      context.drawImage(image, 0, 0)
      alphaCanvasRef.current = canvas
    }

    if (image.complete && image.naturalWidth > 0) {
      captureAlphaMask()
    } else {
      image.addEventListener('load', captureAlphaMask)
    }

    return () => {
      image.removeEventListener('load', captureAlphaMask)
      alphaCanvasRef.current = null
    }
  }, [mapImage])

  function isOpaqueAt(position) {
    const canvas = alphaCanvasRef.current
    if (!canvas) {
      return true
    }

    const pixelX = Math.min(
      canvas.width - 1,
      Math.max(0, Math.floor((position.x / 100) * canvas.width)),
    )
    const pixelY = Math.min(
      canvas.height - 1,
      Math.max(0, Math.floor((position.y / 100) * canvas.height)),
    )
    const alpha = canvas
      .getContext('2d', { willReadFrequently: true })
      .getImageData(pixelX, pixelY, 1, 1).data[3]

    return alpha > 48
  }

  function handleMapClick(event) {
    if (disabled) {
      return
    }

    const position = getImageClickPosition(
      containerRef.current,
      imageAspect,
      event.clientX,
      event.clientY,
    )

    if (!position.valid || !isOpaqueAt(position)) {
      return
    }

    setTapMarker({ x: position.displayX, y: position.displayY })

    if (targetOnly && markers?.destination) {
      const targetCenter = getMarkerImagePosition(
        containerRef.current,
        imageAspect,
        markers.destination,
      )
      const hitRadius = markers.destination.hitRadius ?? 9

      if (pointNearMarker(position, targetCenter, hitRadius)) {
        onHint(solveMessage)
        onSolve()
        return
      }
    } else {
      const correctZone = zones.find((zone) => zone.correct)
      if (correctZone && pointInZone(position.x, position.y, correctZone)) {
        onHint(solveMessage)
        onSolve()
        return
      }
    }

    const matchedZone = [...zones]
      .filter((zone) => !zone.correct)
      .sort((left, right) => left.width * left.height - right.width * right.height)
      .find((zone) => pointInZone(position.x, position.y, zone))

    if (matchedZone) {
      if (matchedZone.trail) {
        setFoundTrail(true)
      }

      onHint(matchedZone.hint)
      setWrongAttempts((attempts) => attempts + 1)
      return
    }

    const nextAttempts = wrongAttempts + 1
    setWrongAttempts(nextAttempts)

    if (nextAttempts >= 2 && !targetOnly) {
      setShowTrailClue(true)
    }

    onHint(
      targetOnly
        ? 'Tap the glowing forest path target to enter the woods.'
        : 'Nothing important there. Study the paths and red markings on the map.',
    )
  }

  return (
    <div className="map-puzzle">
      <button
        type="button"
        className="map-puzzle-close"
        onClick={onClose}
        disabled={disabled}
        aria-label="Close map"
      >
        ×
      </button>
      <button
        ref={containerRef}
        type="button"
        className="map-puzzle-surface"
        onClick={handleMapClick}
        disabled={disabled}
        aria-label="Search the forest map for the witch's cabin"
      >
        <img
          ref={imageRef}
          className="map-puzzle-image"
          src={mapImage}
          alt="A hand-drawn forest map"
        />
        {markers?.youAreHere && (
          <TravelPartyMarker
            point={markers.youAreHere}
            label={markers.youAreHereLabel ?? 'You are here'}
          />
        )}
        {markers?.destination && (
          <DestinationMarker
            point={markers.destination}
            label={markers.destinationLabel ?? 'Go here'}
          />
        )}
        {showTrailClue && !foundTrail && (
          <div className="map-puzzle-clue" aria-hidden="true">
            <span className="map-puzzle-clue-line map-puzzle-clue-line-start" />
            <span className="map-puzzle-clue-line map-puzzle-clue-line-end" />
          </div>
        )}
        {tapMarker && (
          <span
            className="map-puzzle-tap-marker"
            style={{ left: `${tapMarker.x}%`, top: `${tapMarker.y}%` }}
            aria-hidden="true"
          />
        )}
      </button>
    </div>
  )
}

export default MapPuzzle
