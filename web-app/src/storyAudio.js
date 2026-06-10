import lampOffDream from './assets/audio/lamp_off_dream.mp3?url'
import bear from './assets/audio/bear.mp3?url'
import donkey from './assets/audio/donkey.mp3?url'
import donkeyDeepForest from './assets/audio/donkey_deep_forest.mp3?url'
import rabbit from './assets/audio/rabbit.mp3?url'
import rabbitDeepForest from './assets/audio/rabbit_deep_forest.mp3?url'
import whoosh from './assets/audio/whoosh.mp3?url'
import audreyRescueMe from './assets/audio/audrey_rescue_me.mp3?url'
import scene7 from './assets/audio/scene7.mp3?url'
import witchVoice from './assets/audio/witch_voice.mp3?url'
import greatEscape from './assets/audio/great_escape.mp3?url'
import whisperingCastle from './assets/audio/whispering_castle.mp3?url'
import woodCreak from './assets/audio/wood_creak.mp3?url'
import keyInsert from './assets/audio/key_insert.mp3?url'
import magicMirror from './assets/audio/magic_mirror.mp3?url'
import eerieWhisper from './assets/audio/eerie_whisper.mp3?url'
import dragonSleep1 from './assets/audio/dragon_sleep_1.mp3?url'
import dragonSleep2 from './assets/audio/dragon_sleep_2.mp3?url'
import dragonSleep3 from './assets/audio/dragon_sleep_3.mp3?url'
import menuMusic from './assets/audio/menu_music.mp3?url'
import audreyReunionMusic from './assets/audio/audrey_reunion_music.mp3?url'

export const STORY_AUDIO = {
  lampOff: lampOffDream,
  bear,
  donkey,
  donkeyDeepForest,
  rabbit,
  rabbitDeepForest,
  whoosh,
  audreyRescue: audreyRescueMe,
  scene7,
  witchVoice,
  greatEscape,
  whisperingCastle,
  woodCreak,
  keyInsert,
  magicMirror,
  eerieWhisper,
  dragonSleep1,
  dragonSleep2,
  dragonSleep3,
  menuMusic,
  audreyReunionMusic,
}

let activeSound = null
let backgroundSound = null
let backgroundFadeInterval = null
let activeSoundFadeInterval = null
let ambientTimeout = null
let ambientEndedHandler = null

export function playStorySound(audioId, options = {}) {
  const src = STORY_AUDIO[audioId]
  if (!src) {
    return null
  }

  if (options.persistent) {
    if (activeSound) {
      activeSound.pause()
    }

    activeSound = new Audio(src)
    activeSound.volume = options.volume ?? 1
    activeSound.play().catch(() => {})
    return activeSound
  }

  const sound = new Audio(src)
  sound.volume = options.volume ?? 1
  sound.play().catch(() => {})
  return sound
}

export function stopActiveSound() {
  if (activeSoundFadeInterval) {
    clearInterval(activeSoundFadeInterval)
    activeSoundFadeInterval = null
  }

  if (activeSound) {
    activeSound.pause()
    activeSound = null
  }
}

export function fadeOutActiveSound(durationMs = 2000) {
  if (!activeSound) {
    return
  }

  const sound = activeSound
  const startVolume = sound.volume
  const startTime = performance.now()

  if (activeSoundFadeInterval) {
    clearInterval(activeSoundFadeInterval)
  }

  activeSoundFadeInterval = setInterval(() => {
    const elapsed = performance.now() - startTime
    const progress = Math.min(elapsed / durationMs, 1)
    sound.volume = startVolume * (1 - progress)

    if (progress >= 1) {
      clearInterval(activeSoundFadeInterval)
      activeSoundFadeInterval = null
      sound.pause()
      if (activeSound === sound) {
        activeSound = null
      }
    }
  }, 50)
}

function clearAmbientPlayback() {
  if (ambientTimeout) {
    clearTimeout(ambientTimeout)
    ambientTimeout = null
  }

  if (backgroundSound && ambientEndedHandler) {
    backgroundSound.removeEventListener('ended', ambientEndedHandler)
    ambientEndedHandler = null
  }
}

export function playBackgroundSound(audioId, volume = 0.25) {
  const src = STORY_AUDIO[audioId]
  if (!src) {
    return null
  }

  stopBackgroundSound()

  backgroundSound = new Audio(src)
  backgroundSound.loop = true
  backgroundSound.volume = volume
  backgroundSound.play().catch(() => {})
  return backgroundSound
}

export function playAmbientSoundSet(audioIds, volume = 0.25, options = {}) {
  const minGapMs = options.minGapMs ?? 2500
  const maxGapMs = options.maxGapMs ?? 6500
  const initialDelayMs = options.initialDelayMs ?? 800
  const sequential = Boolean(options.sequential)
  let nextIndex = 0

  stopBackgroundSound()

  function pickAudioId() {
    if (sequential) {
      const audioId = audioIds[nextIndex % audioIds.length]
      nextIndex += 1
      return audioId
    }

    return audioIds[Math.floor(Math.random() * audioIds.length)]
  }

  function scheduleNext(delayMs) {
    ambientTimeout = setTimeout(() => {
      const audioId = pickAudioId()
      const src = STORY_AUDIO[audioId]

      if (!src) {
        scheduleNext(minGapMs)
        return
      }

      backgroundSound = new Audio(src)
      backgroundSound.volume = volume

      ambientEndedHandler = () => {
        if (backgroundSound) {
          backgroundSound.removeEventListener('ended', ambientEndedHandler)
        }

        ambientEndedHandler = null
        backgroundSound = null

        const gapMs = minGapMs + Math.random() * (maxGapMs - minGapMs)
        scheduleNext(gapMs)
      }

      backgroundSound.addEventListener('ended', ambientEndedHandler)
      backgroundSound.play().catch(() => {
        scheduleNext(minGapMs)
      })
    }, delayMs)
  }

  scheduleNext(initialDelayMs)
}

export function fadeOutBackgroundSound(durationMs = 2000) {
  clearAmbientPlayback()

  if (!backgroundSound) {
    return
  }

  const sound = backgroundSound
  const startVolume = sound.volume
  const startTime = performance.now()

  if (backgroundFadeInterval) {
    clearInterval(backgroundFadeInterval)
  }

  backgroundFadeInterval = setInterval(() => {
    const elapsed = performance.now() - startTime
    const progress = Math.min(elapsed / durationMs, 1)
    sound.volume = startVolume * (1 - progress)

    if (progress >= 1) {
      clearInterval(backgroundFadeInterval)
      backgroundFadeInterval = null
      sound.pause()
      if (backgroundSound === sound) {
        backgroundSound = null
      }
    }
  }, 50)
}

export function stopBackgroundSound() {
  if (backgroundFadeInterval) {
    clearInterval(backgroundFadeInterval)
    backgroundFadeInterval = null
  }

  clearAmbientPlayback()

  if (backgroundSound) {
    backgroundSound.pause()
    backgroundSound = null
  }
}
