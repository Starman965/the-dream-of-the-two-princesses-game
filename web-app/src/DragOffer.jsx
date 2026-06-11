import { useEffect, useRef, useState } from 'react'
import { BASE_SIZE } from './gameData'

function toPercent(rect) {
  return {
    left: `${(rect.x / BASE_SIZE.width) * 100}%`,
    top: `${(rect.y / BASE_SIZE.height) * 100}%`,
    width: `${(rect.width / BASE_SIZE.width) * 100}%`,
    height: `${(rect.height / BASE_SIZE.height) * 100}%`,
  }
}

function rectsOverlap(a, b) {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  )
}

function clampRockPosition(rect) {
  return {
    ...rect,
    x: Math.max(0, Math.min(BASE_SIZE.width - rect.width, rect.x)),
    y: Math.max(0, Math.min(BASE_SIZE.height - rect.height, rect.y)),
  }
}

export default function DragOffer({
  rockImage,
  rockStart,
  dropTarget,
  onComplete,
  disabled,
  placed = false,
}) {
  const [rockRect, setRockRect] = useState(rockStart)
  const [holding, setHolding] = useState(false)
  const [tumbling, setTumbling] = useState(false)
  const rockRectRef = useRef(rockStart)
  const artboardRef = useRef(null)
  const tumbleTimer = useRef(null)

  useEffect(() => {
    rockRectRef.current = rockStart
    setRockRect(rockStart)
    setHolding(false)
    setTumbling(false)
  }, [rockStart])

  useEffect(() => {
    return () => {
      if (tumbleTimer.current) {
        clearTimeout(tumbleTimer.current)
      }
    }
  }, [])

  function clientToScenePoint(clientX, clientY) {
    const bounds = artboardRef.current?.getBoundingClientRect()
    if (!bounds) {
      return { x: 0, y: 0 }
    }

    return {
      x: ((clientX - bounds.left) / bounds.width) * BASE_SIZE.width,
      y: ((clientY - bounds.top) / bounds.height) * BASE_SIZE.height,
    }
  }

  function centerRockOnPoint(point) {
    const next = clampRockPosition({
      ...rockRectRef.current,
      x: point.x - rockRectRef.current.width / 2,
      y: point.y - rockRectRef.current.height / 2,
    })
    rockRectRef.current = next
    setRockRect(next)
  }

  function pickUpRock() {
    if (disabled || tumbling || holding) {
      return
    }

    setHolding(true)
  }

  function tumbleBack() {
    setHolding(false)
    setTumbling(true)

    const next = { ...rockStart }
    rockRectRef.current = next
    setRockRect(next)

    if (tumbleTimer.current) {
      clearTimeout(tumbleTimer.current)
    }

    tumbleTimer.current = setTimeout(() => {
      setTumbling(false)
      tumbleTimer.current = null
    }, 650)
  }

  function attemptPlace(clientX, clientY) {
    if (disabled || tumbling || !holding) {
      return
    }

    if (clientX != null && clientY != null) {
      centerRockOnPoint(clientToScenePoint(clientX, clientY))
    }

    if (rectsOverlap(rockRectRef.current, dropTarget)) {
      setHolding(false)
      onComplete()
      return
    }

    tumbleBack()
  }

  function handleLayerPointerDown(event) {
    if (!holding || disabled || tumbling) {
      return
    }

    event.preventDefault()
    attemptPlace(event.clientX, event.clientY)
  }

  function handleLayerPointerMove(event) {
    if (!holding || disabled || tumbling) {
      return
    }

    centerRockOnPoint(clientToScenePoint(event.clientX, event.clientY))
  }

  function handleRockPointerDown(event) {
    event.stopPropagation()

    if (disabled || tumbling) {
      return
    }

    if (holding) {
      event.preventDefault()
      attemptPlace(event.clientX, event.clientY)
      return
    }

    event.preventDefault()
    pickUpRock()
    centerRockOnPoint(clientToScenePoint(event.clientX, event.clientY))
  }

  return (
    <div
      className={`drag-offer-layer${holding ? ' is-holding' : ''}${placed ? ' is-wish-magic' : ''}`}
      ref={artboardRef}
      onPointerDown={handleLayerPointerDown}
      onPointerMove={handleLayerPointerMove}
    >
      <div
        className={`drag-offer-drop-zone${holding ? ' is-active' : ''}${placed ? ' is-wish-magic' : ''}`}
        style={toPercent(dropTarget)}
        aria-hidden="true"
      />

      <button
        type="button"
        className={`drag-offer-rock${holding ? ' is-held' : ''}${tumbling ? ' is-tumbling' : ''}${placed ? ' is-placed' : ''}`}
        style={toPercent(rockRect)}
        aria-label={
          holding
            ? 'Tap the Buddha to place the rock'
            : 'Tap the rock to pick it up'
        }
        onPointerDown={handleRockPointerDown}
        disabled={placed}
      >
        <img src={rockImage} alt="" draggable={false} />
      </button>
    </div>
  )
}
