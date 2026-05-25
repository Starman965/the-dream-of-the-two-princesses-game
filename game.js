const BASE_WIDTH = 1280;
const BASE_HEIGHT = 720;

const story = [
  {
    image: "assets/art/bedroom.png",
    title: "The Magic Mirror",
    body: "Emily wakes up and Audrey is gone. Something golden sparkles on the floor.",
    task: "Tap the magic mirror.",
    target: [1044, 390, 176, 184],
    done: "The mirror shimmers. WHOOSH! Emily is swept into a magical land.",
  },
  {
    image: "assets/art/meadow_castle.png",
    title: "Friends on the Path",
    body: "The bear, donkey, and rabbit tell Emily that Audrey is locked in the tower.",
    task: "Tap the castle gate to begin the rescue.",
    target: [846, 198, 242, 218],
    done: "Emily holds the mirror close and turns bravely toward the Great Forest.",
  },
  {
    image: "assets/art/forest_witch.png",
    title: "The Golden Key",
    body: "The witch is sleeping. The key to the dragons' cave is nearby.",
    task: "Tap the golden key before the floorboard creaks.",
    target: [642, 392, 146, 142],
    done: "Emily grabs the key and runs back to her friends.",
  },
  {
    image: "assets/art/dragon_cave.png",
    title: "Wake the Dragons",
    body: "Jax and Lily sleep inside a cave filled with glowing crystals.",
    task: "Tap the dragons to wake them.",
    target: [252, 118, 860, 390],
    done: "The dragons open their kind eyes. They are ready to fly to Audrey.",
  },
  {
    image: "assets/art/sisters_reunited.png",
    title: "Audrey Is Safe",
    body: "After the dragon lands at the castle, Emily and Audrey are together again.",
    task: "Press Play Again when you are ready.",
    target: [350, 112, 542, 520],
    done: "Maybe it was not a dream after all.",
  },
];

const els = {
  background: document.querySelector("#background"),
  panel: document.querySelector("#panel"),
  title: document.querySelector("#title"),
  body: document.querySelector("#body"),
  task: document.querySelector("#task"),
  target: document.querySelector("#target"),
  progress: document.querySelector("#progress"),
  continue: document.querySelector("#continue"),
  cutscene: document.querySelector("#cutscene"),
  cutsceneFrame: document.querySelector("#cutscene-frame"),
  skip: document.querySelector("#skip"),
};

let index = 0;
let solved = false;
let cutsceneTimer = null;

function contentRect() {
  const scale = Math.max(window.innerWidth / BASE_WIDTH, window.innerHeight / BASE_HEIGHT);
  const width = BASE_WIDTH * scale;
  const height = BASE_HEIGHT * scale;
  return {
    scale,
    left: (window.innerWidth - width) / 2,
    top: (window.innerHeight - height) / 2,
  };
}

function placeTarget() {
  const [x, y, width, height] = story[index].target;
  const rect = contentRect();
  els.target.style.left = `${rect.left + x * rect.scale}px`;
  els.target.style.top = `${rect.top + y * rect.scale}px`;
  els.target.style.width = `${width * rect.scale}px`;
  els.target.style.height = `${height * rect.scale}px`;
}

function loadScene(nextIndex) {
  index = nextIndex;
  solved = false;
  const scene = story[index];
  document.querySelector("#game").classList.toggle("ending", index === story.length - 1);
  els.background.src = scene.image;
  els.title.textContent = scene.title;
  els.body.textContent = scene.body;
  els.task.textContent = scene.task;
  els.progress.textContent = `Chapter ${index + 1} of ${story.length}`;
  els.continue.disabled = true;
  els.continue.textContent = index === story.length - 1 ? "Play Again" : "Keep Going";
  els.target.hidden = false;
  if (index === story.length - 1) {
    els.continue.disabled = false;
    els.target.hidden = true;
  }
  placeTarget();
}

function solveScene() {
  if (solved) return;
  solved = true;
  els.body.textContent = story[index].done;
  els.task.textContent = "Nice. Tap the button to continue.";
  els.target.hidden = true;
  els.continue.disabled = false;
}

function startCutscene() {
  let frame = 1;
  els.cutscene.hidden = false;
  const tick = () => {
    els.cutsceneFrame.src = `assets/video/dragon_flight_frames/frame_${String(frame).padStart(3, "0")}.jpg`;
    frame += 1;
    if (frame > 100) finishCutscene();
  };
  tick();
  cutsceneTimer = window.setInterval(tick, 100);
}

function finishCutscene() {
  if (cutsceneTimer) window.clearInterval(cutsceneTimer);
  cutsceneTimer = null;
  els.cutscene.hidden = true;
  loadScene(4);
}

els.target.addEventListener("click", solveScene);
els.continue.addEventListener("click", () => {
  if (index === story.length - 1) loadScene(0);
  else if (index === 3) startCutscene();
  else loadScene(index + 1);
});
els.skip.addEventListener("click", finishCutscene);
window.addEventListener("resize", placeTarget);

loadScene(0);
