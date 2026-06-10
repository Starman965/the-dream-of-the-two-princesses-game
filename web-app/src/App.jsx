import { useEffect, useRef, useState } from 'react'
import './App.css'
import { BASE_SIZE, STORY } from './gameData'
import {
  fadeOutBackgroundSound,
  playAmbientSoundSet,
  playBackgroundSound,
  playStorySound,
  stopActiveSound,
  stopBackgroundSound,
} from './storyAudio'
import { STORY_VIDEOS } from './storyVideo'
import MapPuzzle from './MapPuzzle'

const DREAM_SYMBOLS = ['castle', 'mirror', 'dragon', 'bear', 'witch', 'key', 'moon', 'stars']

function DreamIcon({ name }) {
  if (name === 'castle') {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path d="M14 68V30l8 6V20l8 6v42M50 68V26l8-6 8 6v42" />
        <path d="M28 68V34l12-10 12 10v34M34 68V52a6 6 0 0 1 12 0v16" />
        <path d="M18 24h8M54 24h8M32 38h16" />
      </svg>
    )
  }

  if (name === 'mirror') {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <ellipse cx="40" cy="27" rx="17" ry="21" />
        <path d="M40 48v22M30 70h20M26 16l6-6 8 4 8-4 6 6" />
        <path d="M32 28c4-8 10-11 17-10" />
      </svg>
    )
  }

  if (name === 'dragon') {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path d="M18 47c8-13 18-16 31-12 9 3 15 10 19 21-13-7-23-7-32-2-8 5-15 4-18-7Z" />
        <path d="M42 34 34 12l18 17 16-10-8 20M51 36c5-8 11-12 18-11" />
        <path d="M21 47 10 55M50 54l8 11M30 54l-4 11" />
      </svg>
    )
  }

  if (name === 'bear') {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="42" r="23" />
        <circle cx="23" cy="25" r="9" />
        <circle cx="57" cy="25" r="9" />
        <path d="M32 43h16M34 53c4 4 8 4 12 0" />
        <path d="M31 36h.1M49 36h.1" />
      </svg>
    )
  }

  if (name === 'witch') {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path d="M21 37h38L43 12 36 37M16 43h48" />
        <path d="M30 43c0 15 20 15 20 0M38 55l-9 15M42 55l9 15" />
        <path d="M48 25c8-5 14-4 19 2" />
      </svg>
    )
  }

  if (name === 'key') {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="27" cy="37" r="13" />
        <path d="M40 37h29M58 37v11M66 37v8" />
        <circle cx="27" cy="37" r="5" />
      </svg>
    )
  }

  if (name === 'moon') {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path d="M54 63C31 59 18 38 29 17c-18 7-25 31-12 47 12 15 35 16 48 2-4 0-8-1-11-3Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 80 80" aria-hidden="true">
      <path d="M40 9l6 22 22 6-22 6-6 22-6-22-22-6 22-6 6-22Z" />
      <path d="M18 13l3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9ZM62 44l2 8 8 2-8 2-2 8-2-8-8-2 8-2 2-8Z" />
    </svg>
  )
}

function App() {
  const [currentScene, setCurrentScene] = useState(0)
  const [solved, setSolved] = useState(false)
  const [targetStep, setTargetStep] = useState(0)
  const [dreamTransitionActive, setDreamTransitionActive] = useState(false)
  const [warpTransitionActive, setWarpTransitionActive] = useState(false)
  const [dissolveTransitionActive, setDissolveTransitionActive] = useState(false)
  const [dissolveDurationMs, setDissolveDurationMs] = useState(1800)
  const [fadeTransitionActive, setFadeTransitionActive] = useState(false)
  const [fadeBlackHandoffActive, setFadeBlackHandoffActive] = useState(false)
  const [fadeBlackSlowActive, setFadeBlackSlowActive] = useState(false)
  const [fadeBlackSlowDurationMs, setFadeBlackSlowDurationMs] = useState(6000)
  const [videoTransitionActive, setVideoTransitionActive] = useState(false)
  const [activeVideoId, setActiveVideoId] = useState(null)
  const [sequenceLocked, setSequenceLocked] = useState(false)
  const [debugMenuVisible, setDebugMenuVisible] = useState(false)
  const [narrativeVisible, setNarrativeVisible] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mapPuzzleHint, setMapPuzzleHint] = useState('')
  const [mapOpen, setMapOpen] = useState(false)
  const [kenBurns, setKenBurns] = useState(null)
  const transitionTimers = useRef([])
  const cutsceneVideoRef = useRef(null)
  const sceneVideoRef = useRef(null)
  const advancingFromVideo = useRef(false)
  const videoPurpose = useRef(null)

  const scene = STORY[currentScene]
  const sequenceTarget = scene.targetSequence?.[targetStep]
  const activeTarget = sequenceTarget?.target ?? scene.target
  const isMenuScene = Boolean(scene.isMenu)
  const isFinalScene = currentScene === STORY.length - 1
  const hasMapAccess = Boolean(scene.mapAccess)
  const requiresTap = Boolean(activeTarget) || (hasMapAccess && !solved)
  const advancesOnTap = Boolean(scene.advanceOnTap)
  const transitionActive =
    dreamTransitionActive ||
    warpTransitionActive ||
    dissolveTransitionActive ||
    fadeTransitionActive ||
    fadeBlackHandoffActive ||
    fadeBlackSlowActive ||
    videoTransitionActive
  const actionDisabled =
    transitionActive || sequenceLocked || (!isFinalScene && requiresTap && !solved)

  const targetStyle = activeTarget
    ? {
        left: `${(activeTarget.x / BASE_SIZE.width) * 100}%`,
        top: `${(activeTarget.y / BASE_SIZE.height) * 100}%`,
        width: `${(activeTarget.width / BASE_SIZE.width) * 100}%`,
        height: `${(activeTarget.height / BASE_SIZE.height) * 100}%`,
      }
    : undefined

  useEffect(() => {
    return () => {
      transitionTimers.current.forEach((timerId) => clearTimeout(timerId))
    }
  }, [])

  useEffect(() => {
    const storyScene = STORY[currentScene]
    if (storyScene.backgroundAudioSet) {
      playAmbientSoundSet(
        storyScene.backgroundAudioSet,
        storyScene.backgroundVolume ?? 0.25,
        storyScene.backgroundAudioOptions,
      )
    } else if (storyScene.backgroundAudio) {
      playBackgroundSound(storyScene.backgroundAudio, storyScene.backgroundVolume ?? 0.25)
    }

    return () => {
      stopBackgroundSound()
    }
  }, [currentScene])

  useEffect(() => {
    const storyScene = STORY[currentScene]
    if (!storyScene.sceneAudio) {
      return undefined
    }

    playStorySound(storyScene.sceneAudio, { persistent: true })

    return () => {
      stopActiveSound()
    }
  }, [currentScene])

  function loadScene(index, { playIntro = true } = {}) {
    const nextScene = STORY[index]

    setCurrentScene(index)
    setSolved(false)
    setTargetStep(0)
    setSequenceLocked(false)
    setMapPuzzleHint('')
    setMapOpen(false)
    setKenBurns(null)

    if (playIntro && nextScene.introVideo && STORY_VIDEOS[nextScene.introVideo]) {
      videoPurpose.current = 'intro'
      advancingFromVideo.current = false
      setActiveVideoId(nextScene.introVideo)
      setVideoTransitionActive(true)
    }
  }

  function playStoryAudio(audioId, options = {}) {
    if (!audioId) {
      return
    }

    playStorySound(audioId, options)
  }

  function handleTargetPress() {
    if (solved || isFinalScene || !requiresTap || transitionActive || sequenceLocked) {
      return
    }

    if (sequenceTarget) {
      playStoryAudio(sequenceTarget.audio, {
        persistent: sequenceTarget.persistentAudio,
      })

      if (targetStep < scene.targetSequence.length - 1) {
        const stepDelay = scene.sequenceStepDelay ?? 0

        if (stepDelay > 0) {
          setSequenceLocked(true)

          const stepTimer = setTimeout(() => {
            setTargetStep((step) => step + 1)
            setSequenceLocked(false)
            transitionTimers.current = []
          }, stepDelay)

          transitionTimers.current = [stepTimer]
          return
        }

        setTargetStep((step) => step + 1)
        return
      }

      setSequenceLocked(true)

      const delay = scene.sequenceCompleteDelay ?? 0
      const advanceTimer = setTimeout(() => {
        if (scene.sequenceCompleteTransition === 'fadeToBlack') {
          startFadeToBlackHandoff(() => {
            loadScene(currentScene + 1)
          })
          return
        }

        if (scene.sequenceCompleteTransition === 'dissolve') {
          startDissolveTransition()
          return
        }

        loadScene(currentScene + 1)
      }, delay)

      transitionTimers.current = [advanceTimer]
      return
    }

    if (advancesOnTap) {
      if (scene.transition === 'dream') {
        startDreamTransition()
        return
      }

      if (scene.transition === 'warp') {
        startWarpTransition()
        return
      }

      if (scene.transition === 'fade') {
        startFadeTransition()
        return
      }

      if (scene.transition === 'fadeToBlack') {
        if (scene.tapAudio) {
          playStoryAudio(scene.tapAudio)
        }

        const beginFadeToBlack = () => {
          startFadeToBlackHandoff(() => {
            loadScene(currentScene + 1)
          })
        }

        if (scene.transitionDelay) {
          setSequenceLocked(true)

          const delayTimer = setTimeout(beginFadeToBlack, scene.transitionDelay)
          transitionTimers.current = [delayTimer]
          return
        }

        beginFadeToBlack()
        return
      }

      if (scene.transition === 'dissolve') {
        if (scene.tapAudio) {
          playStoryAudio(scene.tapAudio)
        }

        const beginDissolve = () => {
          startDissolveTransition({ duration: scene.transitionDuration })
        }

        if (scene.transitionDelay) {
          setSequenceLocked(true)

          const delayTimer = setTimeout(beginDissolve, scene.transitionDelay)
          transitionTimers.current = [delayTimer]
          return
        }

        beginDissolve()
        return
      }

      if (scene.transition === 'video') {
        startVideoTransition()
        return
      }

      if (scene.tapAudio) {
        playStoryAudio(scene.tapAudio)
      }

      if (scene.kenBurns) {
        setSolved(true)

        const kenBurnsConfig =
          typeof scene.kenBurns === 'object' ? scene.kenBurns : { variant: scene.kenBurns }
        const durationMs = kenBurnsConfig.duration ?? scene.advanceDelay ?? 4000

        setKenBurns({
          variant: kenBurnsConfig.variant ?? 'in',
          durationMs,
          originX: kenBurnsConfig.originX,
          originY: kenBurnsConfig.originY,
        })
      }

      if (scene.advanceDelay) {
        setSequenceLocked(true)

        const advanceTimer = setTimeout(() => {
          if (scene.advanceVideo && STORY_VIDEOS[scene.advanceVideo]) {
            videoPurpose.current = 'advance'
            advancingFromVideo.current = false
            setActiveVideoId(scene.advanceVideo)
            setVideoTransitionActive(true)
            return
          }

          if (scene.advanceTransition === 'dissolve') {
            startDissolveTransition()
            return
          }

          if (scene.advanceTransition === 'fadeToBlack') {
            startFadeToBlackHandoff(() => {
              loadScene(currentScene + 1)
            })
            return
          }

          loadScene(currentScene + 1)
        }, scene.advanceDelay)

        transitionTimers.current = [advanceTimer]
        return
      }

      loadScene(currentScene + 1)
      return
    }

    if (scene.tapAudio) {
      playStoryAudio(scene.tapAudio)
    }

    setSolved(true)
  }

  function closeMapOverlay() {
    setMapOpen(false)
    setMapPuzzleHint('')
  }

  function openMapOverlay() {
    if (solved || transitionActive || sequenceLocked || !scene.mapAccess) {
      return
    }

    setMapOpen(true)
    setMapPuzzleHint('')
  }

  function handleMapAccessSolve() {
    if (solved || transitionActive || sequenceLocked || !scene.mapAccess) {
      return
    }

    setSolved(true)
    setSequenceLocked(true)
    setMapOpen(false)

    const mapAccess = scene.mapAccess

    const delay = mapAccess.transitionDelay ?? mapAccess.solveDelay ?? 5000

    if (mapAccess.mapAudio) {
      playStorySound(mapAccess.mapAudio)
      setKenBurns({ variant: 'in', durationMs: delay })
    }
    const fadeToBlack =
      mapAccess.transition === 'fadeToBlack' ||
      mapAccess.solveTransition === 'fadeToBlack'

    const advanceTimer = setTimeout(() => {
      if (fadeToBlack) {
        startFadeToBlackHandoff(() => {
          loadScene(currentScene + 1)
        })
        return
      }

      loadScene(currentScene + 1)
    }, delay)

    transitionTimers.current = [advanceTimer]
  }

  function startDreamTransition() {
    playStorySound('lampOff')
    setDreamTransitionActive(true)

    const revealTimer = setTimeout(() => {
      loadScene(currentScene + 1)
    }, 2950)

    const finishTimer = setTimeout(() => {
      setDreamTransitionActive(false)
      transitionTimers.current = []
    }, 3900)

    transitionTimers.current = [revealTimer, finishTimer]
  }

  function startWarpTransition() {
    if (scene.backgroundAudio) {
      fadeOutBackgroundSound(scene.backgroundFadeOutMs ?? 2000)
    }

    playStorySound('whoosh')
    setWarpTransitionActive(true)

    const revealTimer = setTimeout(() => {
      loadScene(currentScene + 1)
    }, 2800)

    const finishTimer = setTimeout(() => {
      setWarpTransitionActive(false)
      transitionTimers.current = []
    }, 4000)

    transitionTimers.current = [revealTimer, finishTimer]
  }

  function startDissolveTransition({ duration = 1800 } = {}) {
    const revealAt = duration * 0.5

    setDissolveDurationMs(duration)
    setDissolveTransitionActive(true)

    const revealTimer = setTimeout(() => {
      loadScene(currentScene + 1)
    }, revealAt)

    const finishTimer = setTimeout(() => {
      setDissolveTransitionActive(false)
      setSequenceLocked(false)
      transitionTimers.current = []
    }, duration)

    transitionTimers.current = [revealTimer, finishTimer]
  }

  useEffect(() => {
    const storyScene = STORY[currentScene]
    const advanceDelay = storyScene.autoAdvanceDelay
    if (advanceDelay == null) {
      return undefined
    }

    const advanceTimer = setTimeout(() => {
      if (storyScene.autoAdvanceTransition === 'fadeToBlack') {
        startFadeToBlackHandoff(() => {
          loadScene(currentScene + 1)
        })
        return
      }

      if (storyScene.autoAdvanceTransition === 'dissolve') {
        startDissolveTransition()
        return
      }

      loadScene(currentScene + 1)
    }, advanceDelay)

    transitionTimers.current.push(advanceTimer)

    return () => {
      clearTimeout(advanceTimer)
    }
  }, [currentScene])

  useEffect(() => {
    if (!scene.sceneVideo || !sceneVideoRef.current) {
      return undefined
    }

    const video = sceneVideoRef.current
    video.currentTime = 0
    video.play().catch(() => {})

    return () => {
      video.pause()
      video.currentTime = 0
    }
  }, [currentScene, scene.sceneVideo])

  function advanceAfterSceneVideo() {
    if (scene.autoAdvanceTransition === 'fadeToBlack') {
      startFadeToBlackHandoff(() => {
        loadScene(currentScene + 1)
      })
      return
    }

    if (scene.autoAdvanceTransition === 'dissolve') {
      startDissolveTransition()
      return
    }

    loadScene(currentScene + 1)
  }

  function handleSceneVideoEnded() {
    if (!scene.autoAdvanceOnVideoEnd) {
      return
    }

    advanceAfterSceneVideo()
  }

  function startFadeTransition() {
    playStorySound('scene7')
    setFadeTransitionActive(true)

    const revealTimer = setTimeout(() => {
      loadScene(currentScene + 1)
    }, 5000)

    const finishTimer = setTimeout(() => {
      setFadeTransitionActive(false)
      transitionTimers.current = []
    }, 10000)

    transitionTimers.current = [revealTimer, finishTimer]
  }

  function startVideoTransition(videoId = scene.tapVideo ?? scene.actionVideo) {
    if (!videoId || !STORY_VIDEOS[videoId]) {
      loadScene(currentScene + 1)
      return
    }

    if (scene.backgroundAudio || scene.backgroundAudioSet) {
      stopBackgroundSound()
    }

    videoPurpose.current = 'tap'
    advancingFromVideo.current = false
    setActiveVideoId(videoId)
    setVideoTransitionActive(true)
  }

  function clearVideoPlayback() {
    if (cutsceneVideoRef.current) {
      cutsceneVideoRef.current.pause()
      cutsceneVideoRef.current.currentTime = 0
    }

    setVideoTransitionActive(false)
    setActiveVideoId(null)
  }

  function startDissolveHandoff(onReveal) {
    setDissolveTransitionActive(true)

    const revealTimer = setTimeout(() => {
      onReveal()
    }, 900)

    const finishTimer = setTimeout(() => {
      setDissolveTransitionActive(false)
      transitionTimers.current = []
    }, 1800)

    transitionTimers.current = [revealTimer, finishTimer]
  }

  function startFadeToBlackHandoff(onReveal) {
    setFadeBlackHandoffActive(true)

    const revealTimer = setTimeout(() => {
      onReveal()
    }, 810)

    const finishTimer = setTimeout(() => {
      setFadeBlackHandoffActive(false)
      transitionTimers.current = []
    }, 1800)

    transitionTimers.current = [revealTimer, finishTimer]
  }

  function startSlowFadeToBlack(onComplete, duration = 6000) {
    setFadeBlackSlowDurationMs(duration)
    setFadeBlackSlowActive(true)

    const finishTimer = setTimeout(() => {
      onComplete()
      setFadeBlackSlowActive(false)
      transitionTimers.current = []
    }, duration)

    transitionTimers.current = [finishTimer]
  }

  function finishVideoTransition() {
    if (advancingFromVideo.current) {
      return
    }

    advancingFromVideo.current = true

    if (videoPurpose.current === 'intro') {
      const startHandoff =
        scene.introVideoAdvance === 'dissolve'
          ? startDissolveHandoff
          : startFadeToBlackHandoff

      startHandoff(() => {
        clearVideoPlayback()
        advancingFromVideo.current = false
        videoPurpose.current = null
      })
      return
    }

    if (videoPurpose.current === 'advance') {
      const nextSceneIndex = currentScene + 1
      const startHandoff =
        scene.advanceTransition === 'fadeToBlack'
          ? startFadeToBlackHandoff
          : scene.advanceTransition === 'dissolve'
            ? startDissolveHandoff
            : null

      if (startHandoff) {
        startHandoff(() => {
          clearVideoPlayback()
          loadScene(nextSceneIndex)
          advancingFromVideo.current = false
          videoPurpose.current = null
        })
        return
      }

      clearVideoPlayback()
      loadScene(nextSceneIndex)
      advancingFromVideo.current = false
      videoPurpose.current = null
      return
    }

    const chainVideo = scene.tapVideo ?? scene.actionVideo

    if (
      scene.followUpVideo &&
      activeVideoId === chainVideo &&
      STORY_VIDEOS[scene.followUpVideo]
    ) {
      const startHandoff =
        scene.followUpVideoTransition === 'fadeToBlack'
          ? startFadeToBlackHandoff
          : startDissolveHandoff

      startHandoff(() => {
        if (cutsceneVideoRef.current) {
          cutsceneVideoRef.current.pause()
          cutsceneVideoRef.current.currentTime = 0
        }

        advancingFromVideo.current = false
        videoPurpose.current = 'tap'
        setActiveVideoId(scene.followUpVideo)
        setVideoTransitionActive(true)
      })
      return
    }

    if (scene.videoAdvance === 'fadeToBlack' || scene.videoAdvance === 'dissolve') {
      const nextSceneIndex = currentScene + 1
      const startHandoff =
        scene.videoAdvance === 'fadeToBlack' ? startFadeToBlackHandoff : startDissolveHandoff

      startHandoff(() => {
        clearVideoPlayback()
        loadScene(nextSceneIndex)
        advancingFromVideo.current = false
      })
      return
    }

    clearVideoPlayback()
    loadScene(currentScene + 1)
    advancingFromVideo.current = false
  }

  useEffect(() => {
    if (!videoTransitionActive || !cutsceneVideoRef.current) {
      return undefined
    }

    cutsceneVideoRef.current.play().catch(() => {})

    return undefined
  }, [videoTransitionActive, activeVideoId])

  function handleActionPress() {
    if (isMenuScene) {
      if (transitionActive) {
        return
      }

      if (scene.backgroundAudio || scene.backgroundAudioSet) {
        fadeOutBackgroundSound(scene.backgroundFadeOutMs ?? 2500)
      }

      startFadeToBlackHandoff(() => {
        loadScene(1)
      })
      return
    }

    if (isFinalScene) {
      startSlowFadeToBlack(() => {
        loadScene(0)
      }, scene.finishFadeDuration ?? 6000)
      return
    }

    if (scene.actionVideo && STORY_VIDEOS[scene.actionVideo]) {
      startVideoTransition(scene.actionVideo)
      return
    }

    loadScene(currentScene + 1)
  }

  function handleDebugSceneChange(event) {
    setDreamTransitionActive(false)
    setWarpTransitionActive(false)
    setDissolveTransitionActive(false)
    setFadeTransitionActive(false)
    setFadeBlackHandoffActive(false)
    setFadeBlackSlowActive(false)
    clearVideoPlayback()
    advancingFromVideo.current = false
    videoPurpose.current = null
    setSequenceLocked(false)
    setMapOpen(false)
    setMapPuzzleHint('')
    setKenBurns(null)
    stopActiveSound()
    stopBackgroundSound()
    transitionTimers.current.forEach((timerId) => clearTimeout(timerId))
    transitionTimers.current = []
    loadScene(Number(event.target.value))
  }

  return (
    <main className="game-shell">
      <section className="stage" aria-label="The Dream of the Two Princesses">
        <div className="artboard">
          {scene.sceneVideo && STORY_VIDEOS[scene.sceneVideo] ? (
            <video
              ref={sceneVideoRef}
              className="scene-image"
              src={STORY_VIDEOS[scene.sceneVideo]}
              poster={scene.image}
              playsInline
              muted={Boolean(scene.sceneVideoMuted)}
              onEnded={handleSceneVideoEnded}
            />
          ) : (
            <div className="scene-image-frame">
              <img
                key={currentScene}
                className={`scene-image${
                  kenBurns?.variant === 'door'
                    ? ' scene-image-ken-burns-door'
                    : kenBurns?.variant === 'in'
                      ? ' scene-image-ken-burns'
                      : ''
                }`}
                src={scene.image}
                alt=""
                style={{
                  objectPosition: scene.imagePosition ?? 'center center',
                  ...(kenBurns
                    ? {
                        animationDuration: `${kenBurns.durationMs}ms`,
                        ...(kenBurns.variant !== 'door' && kenBurns.originX != null
                          ? { transformOrigin: `${kenBurns.originX}% ${kenBurns.originY ?? 50}%` }
                          : {}),
                      }
                    : {}),
                }}
              />
            </div>
          )}

          {!isFinalScene &&
            activeTarget &&
            !hasMapAccess &&
            requiresTap &&
            !solved &&
            !sequenceLocked &&
            !transitionActive && (
            <button
              type="button"
              className="target-button"
              style={targetStyle}
              onClick={handleTargetPress}
              aria-label={sequenceTarget?.label ?? scene.task}
            />
          )}
        </div>

        {hasMapAccess && !solved && !mapOpen && !transitionActive && (
          <button
            type="button"
            className="map-icon-button"
            onClick={openMapOverlay}
            aria-label="Open the forest map"
          >
            <img src={scene.mapAccess.mapImage} alt="" />
          </button>
        )}

        {hasMapAccess && mapOpen && !solved && (
          <MapPuzzle
            mapImage={scene.mapAccess.mapImage}
            zones={scene.mapAccess.zones}
            markers={scene.mapAccess.markers}
            targetOnly={Boolean(scene.mapAccess.targetOnly)}
            solveMessage={scene.mapAccess.solveMessage}
            onSolve={handleMapAccessSolve}
            onHint={setMapPuzzleHint}
            onClose={closeMapOverlay}
            disabled={sequenceLocked || transitionActive}
          />
        )}

        <div className="scene-shade" aria-hidden="true" />

        {dreamTransitionActive && (
          <div className="dream-transition" aria-hidden="true">
            <div className="dream-swirl" />
            <div className="dream-sparkles" />
            <div className="dream-symbols">
              {DREAM_SYMBOLS.map((symbol) => (
                <span className={`dream-symbol dream-symbol-${symbol}`} key={symbol}>
                  <DreamIcon name={symbol} />
                </span>
              ))}
            </div>
          </div>
        )}

        {warpTransitionActive && (
          <div className="warp-transition" aria-hidden="true">
            <div className="warp-tunnel" />
            <div className="warp-stars" />
            <div className="warp-core" />
          </div>
        )}

        {dissolveTransitionActive && (
          <div
            className="dissolve-transition"
            style={{ animationDuration: `${dissolveDurationMs}ms` }}
            aria-hidden="true"
          >
            <div
              className="dissolve-glow"
              style={{ animationDuration: `${dissolveDurationMs}ms` }}
            />
          </div>
        )}

        {fadeTransitionActive && <div className="fade-transition" aria-hidden="true" />}

        {fadeBlackHandoffActive && (
          <div className="fade-black-handoff" aria-hidden="true" />
        )}

        {fadeBlackSlowActive && (
          <div
            className="fade-black-slow"
            style={{ animationDuration: `${fadeBlackSlowDurationMs}ms` }}
            aria-hidden="true"
          />
        )}

        {videoTransitionActive && activeVideoId && (
          <div className="cutscene-layer">
            <video
              ref={cutsceneVideoRef}
              className="cutscene-video"
              src={STORY_VIDEOS[activeVideoId]}
              playsInline
              onEnded={finishVideoTransition}
            />
            <div className="cutscene-shade" aria-hidden="true" />
          </div>
        )}

        {narrativeVisible &&
          !scene.hideNarrative &&
          !videoTransitionActive &&
          !dissolveTransitionActive &&
          !fadeBlackHandoffActive &&
          !fadeBlackSlowActive && (
          <article
            className={`story-panel${
              isMenuScene ? ' story-panel-menu' : ''
            }${scene.panelPosition ? ` story-panel-${scene.panelPosition}` : ''}`}
          >
            <h1>{scene.title}</h1>
            {((solved || (scene.targetSequence && targetStep > 0)) && scene.done) || scene.body ? (
              <p>
                {(solved || (scene.targetSequence && targetStep > 0)) && scene.done
                  ? scene.done
                  : scene.body}
              </p>
            ) : null}
            <p className="task-text">
              {sequenceLocked && hasMapAccess && solved
                ? scene.mapAccess.mode === 'advance'
                  ? 'Into the forest we go...'
                  : 'On our way to the witch\'s cabin...'
                : sequenceLocked
                ? scene.waitingTask ?? scene.sequenceStepWaitingTask ?? 'Listen to your new friend...'
                : mapOpen
                  ? mapPuzzleHint || scene.task
                  : sequenceTarget?.label ||
                    (solved && !isFinalScene ? 'Nice. Tap the button to continue.' : scene.task)}
            </p>
          </article>
        )}

        {!videoTransitionActive &&
          !dissolveTransitionActive &&
          !fadeBlackHandoffActive &&
          !fadeBlackSlowActive && (
        <div className="parent-controls">
          {settingsOpen && (
            <div className="settings-panel" role="dialog" aria-label="Parent settings">
              <label className="settings-option">
                <input
                  type="checkbox"
                  checked={narrativeVisible}
                  onChange={(event) => setNarrativeVisible(event.target.checked)}
                />
                <span>Story text</span>
              </label>
              <label className="settings-option">
                <input
                  type="checkbox"
                  checked={debugMenuVisible}
                  onChange={(event) => setDebugMenuVisible(event.target.checked)}
                />
                <span>Debug menu</span>
              </label>
              {debugMenuVisible && (
                <label className="settings-scene-picker">
                  <span>Scene</span>
                  <select value={currentScene} onChange={handleDebugSceneChange}>
                    {STORY.map((storyScene, index) => (
                      <option key={storyScene.title} value={index}>
                        {index + 1}. {storyScene.title}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          )}

          <button
            type="button"
            className="settings-gear-button"
            onClick={() => setSettingsOpen((open) => !open)}
            aria-expanded={settingsOpen}
            aria-label={settingsOpen ? 'Close settings' : 'Open settings'}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
              <path d="M19.4 13.1a7.4 7.4 0 0 0 .1-2.2l2-1.5-2-3.4-2.3 1a7.5 7.5 0 0 0-1.9-1.1l-.3-2.4H9l-.3 2.4a7.5 7.5 0 0 0-1.9 1.1l-2.3-1-2 3.4 2 1.5a7.4 7.4 0 0 0 .1 2.2l-2 1.5 2 3.4 2.3-1a7.5 7.5 0 0 0 1.9 1.1l.3 2.4h6l.3-2.4a7.5 7.5 0 0 0 1.9-1.1l2.3 1 2-3.4-2-1.5Z" />
            </svg>
          </button>
        </div>
        )}

        {!advancesOnTap && (
          <button
            type="button"
            className={`action-button${isMenuScene ? ' action-button-menu' : ''}`}
            disabled={actionDisabled}
            onClick={handleActionPress}
          >
            {isMenuScene
              ? 'Start Story'
              : isFinalScene
                ? 'Finish'
                : (scene.actionLabel ?? 'Keep Going')}
          </button>
        )}

      </section>
    </main>
  )
}

export default App
