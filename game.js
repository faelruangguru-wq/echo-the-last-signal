// ==========================================
// ECHO: THE LAST SIGNAL
// 3D PROTOTYPE — ROOM 01
// ==========================================

let selectedCharacter = null;
let attempts = 0;

let THREE;
let scene;
let camera;
let renderer;
let player;
let clock;
let gameStarted = false;

const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false
};

// ---------- CHARACTER ----------

function selectCharacter(name) {
  selectedCharacter = name;

  const selected = document.getElementById("selected");
  if (selected) {
    selected.textContent = "SELECTED: " + name;
  }
}

// ---------- SCREEN ----------

function showCharacter() {
  document.getElementById("home").classList.add("hidden");
  document.getElementById("character-screen").classList.remove("hidden");
}

function backHome() {
  document.getElementById("character-screen").classList.add("hidden");
  document.getElementById("home").classList.remove("hidden");
}

// ---------- START GAME ----------

async function startGame() {

  if (!selectedCharacter) {
    alert("Pilih karakter terlebih dahulu.");
    return;
  }

  document.getElementById("home").classList.add("hidden");
  document.getElementById("character-screen").classList.add("hidden");

  document.getElementById("game-screen").classList.remove("hidden");

  const ui = document.querySelector(".game-ui");
  if (ui) ui.style.display = "none";

  await loadThree();

  if (!gameStarted) {
    createGame();
    gameStarted = true;
  }
}

// ---------- LOAD THREE.JS ----------

async function loadThree() {

  if (THREE) return;

  THREE = await import(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js"
  );
}

// ---------- CREATE GAME ----------

function createGame() {

  clock = new THREE.Clock();

  scene = new THREE.Scene();

  scene.background = new THREE.Color(0x080b12);

  scene.fog = new THREE.Fog(
    0x080b12,
    10,
    32
  );

  // CAMERA

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  // RENDERER

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.shadowMap.enabled = true;

  renderer.domElement.id = "game-canvas";

  document
    .getElementById("game-screen")
    .appendChild(renderer.domElement);

  // LIGHTS

  const ambient = new THREE.HemisphereLight(
    0x8ea0c0,
    0x101010,
    1.5
  );

  scene.add(ambient);

  const mainLight = new THREE.DirectionalLight(
    0xffffff,
    2
  );

  mainLight.position.set(4, 8, 5);
  mainLight.castShadow = true;

  scene.add(mainLight);

  // ROOM

  createRoom();

  // PLAYER

  player = createPlayer();

  scene.add(player);

  player.position.set(
    0,
    0,
    7
  );

  // CAMERA

  camera.position.set(
    0,
    4,
    11
  );

  // INPUT

  setupControls();

  // RESIZE

  window.addEventListener(
    "resize",
    resize
  );

  animate();
}

// ---------- ROOM ----------

function createRoom() {

  // FLOOR

  const floorGeometry =
    new THREE.BoxGeometry(
      18,
      0.4,
      24
    );

  const floorMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x202631,
      roughness: 0.9
    });

  const floor =
    new THREE.Mesh(
      floorGeometry,
      floorMaterial
    );

  floor.position.y = -0.2;
  floor.receiveShadow = true;

  scene.add(floor);

  // WALL MATERIAL

  const wallMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x121722,
      roughness: 0.85
    });

  // BACK WALL

  createWall(
    18,
    6,
    0.4,
    0,
    3,
    -12,
    wallMaterial
  );

  // LEFT WALL

  createWall(
    0.4,
    6,
    24,
    -9,
    3,
    0,
    wallMaterial
  );

  // RIGHT WALL

  createWall(
    0.4,
    6,
    24,
    9,
    3,
    0,
    wallMaterial
  );

  // FRONT WALL

  createWall(
    18,
    6,
    0.4,
    0,
    3,
    12,
    wallMaterial
  );

  // CHESTS

  createChest(-5, 0, -5);
  createChest(0, 0, -5);
  createChest(5, 0, -5);

  // DOOR

  const doorGeometry =
    new THREE.BoxGeometry(
      3,
      5,
      0.5
    );

  const doorMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.6
    });

  const door =
    new THREE.Mesh(
      doorGeometry,
      doorMaterial
    );

  door.position.set(
    0,
    2.5,
    -11.7
  );

  door.castShadow = true;

  scene.add(door);
}

function createWall(
  width,
  height,
  depth,
  x,
  y,
  z,
  material
) {

  const geometry =
    new THREE.BoxGeometry(
      width,
      height,
      depth
    );

  const wall =
    new THREE.Mesh(
      geometry,
      material
    );

  wall.position.set(
    x,
    y,
    z
  );

  wall.receiveShadow = true;
  wall.castShadow = true;

  scene.add(wall);
}

// ---------- CHESTS ----------

function createChest(x, y, z) {

  const group =
    new THREE.Group();

  // BODY

  const bodyGeometry =
    new THREE.BoxGeometry(
      2.3,
      1.2,
      1.6
    );

  const bodyMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x4a3525,
      roughness: 0.75
    });

  const body =
    new THREE.Mesh(
      bodyGeometry,
      bodyMaterial
    );

  body.position.y = 0.6;

  body.castShadow = true;

  group.add(body);

  // LID

  const lidGeometry =
    new THREE.BoxGeometry(
      2.4,
      0.35,
      1.7
    );

  const lidMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x6b4b2e,
      roughness: 0.7
    });

  const lid =
    new THREE.Mesh(
      lidGeometry,
      lidMaterial
    );

  lid.position.y = 1.35;

  lid.castShadow = true;

  group.add(lid);

  // LOCK

  const lockGeometry =
    new THREE.BoxGeometry(
      0.3,
      0.4,
      0.15
    );

  const lockMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xd0a84c,
      metalness: 0.8,
      roughness: 0.3
    });

  const lock =
    new THREE.Mesh(
      lockGeometry,
      lockMaterial
    );

  lock.position.set(
    0,
    0.85,
    -0.85
  );

  group.add(lock);

  group.position.set(
    x,
    y,
    z
  );

  scene.add(group);
}

// ---------- BLOCKY PLAYER ----------

function createPlayer() {

  const character =
    new THREE.Group();

  const skin =
    new THREE.MeshStandardMaterial({
      color: 0xc98f6b
    });

  const shirt =
    new THREE.MeshStandardMaterial({
      color: 0x26364f
    });

  const pants =
    new THREE.MeshStandardMaterial({
      color: 0x151a22
    });

  // HEAD

  const head =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.9,
        0.9,
        0.9
      ),
      skin
    );

  head.position.y = 2.7;

  head.castShadow = true;

  character.add(head);

  // BODY

  const body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.15,
        1.35,
        0.65
      ),
      shirt
    );

  body.position.y = 1.65;

  body.castShadow = true;

  character.add(body);

  // LEFT LEG

  const leg1 =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.45,
        1.2,
        0.55
      ),
      pants
    );

  leg1.position.set(
    -0.28,
    0.6,
    0
  );

  leg1.castShadow = true;

  character.add(leg1);

  // RIGHT LEG

  const leg2 =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.45,
        1.2,
        0.55
      ),
      pants
    );

  leg2.position.set(
    0.28,
    0.6,
    0
  );

  leg2.castShadow = true;

  character.add(leg2);

  // LEFT ARM

  const arm1 =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.4,
        1.25,
        0.45
      ),
      shirt
    );

  arm1.position.set(
    -0.78,
    1.7,
    0
  );

  arm1.castShadow = true;

  character.add(arm1);

  // RIGHT ARM

  const arm2 =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.4,
        1.25,
        0.45
      ),
      shirt
    );

  arm2.position.set(
    0.78,
    1.7,
    0
  );

  arm2.castShadow = true;

  character.add(arm2);

  return character;
}

// ---------- CONTROLS ----------

function setupControls() {

  window.addEventListener(
    "keydown",
    e => {

      if (e.key === "w" || e.key === "ArrowUp")
        keys.forward = true;

      if (e.key === "s" || e.key === "ArrowDown")
        keys.backward = true;

      if (e.key === "a" || e.key === "ArrowLeft")
        keys.left = true;

      if (e.key === "d" || e.key === "ArrowRight")
        keys.right = true;
    }
  );

  window.addEventListener(
    "keyup",
    e => {

      if (e.key === "w" || e.key === "ArrowUp")
        keys.forward = false;

      if (e.key === "s" || e.key === "ArrowDown")
        keys.backward = false;

      if (e.key === "a" || e.key === "ArrowLeft")
        keys.left = false;

      if (e.key === "d" || e.key === "ArrowRight")
        keys.right = false;
    }
  );
}

// ---------- MOVEMENT ----------

function updatePlayer(delta) {

  if (!player) return;

  const speed = 4;

  let x = 0;
  let z = 0;

  if (keys.forward) z -= 1;
  if (keys.backward) z += 1;
  if (keys.left) x -= 1;
  if (keys.right) x += 1;

  const length =
    Math.sqrt(x * x + z * z);

  if (length > 0) {

    x /= length;
    z /= length;

    player.position.x +=
      x * speed * delta;

    player.position.z +=
      z * speed * delta;

    player.rotation.y =
      Math.atan2(x, z);
  }

  // ROOM LIMITS

  player.position.x =
    Math.max(
      -7.5,
      Math.min(
        7.5,
        player.position.x
      )
    );

  player.position.z =
    Math.max(
      -10,
      Math.min(
        10,
        player.position.z
      )
    );
}

// ---------- CAMERA ----------

function updateCamera() {

  if (!player) return;

  const target =
    new THREE.Vector3(
      player.position.x,
      player.position.y + 2,
      player.position.z
    );

  const desired =
    new THREE.Vector3(
      player.position.x,
      player.position.y + 4.5,
      player.position.z + 8
    );

  camera.position.lerp(
    desired,
    0.08
  );

  camera.lookAt(target);
}

// ---------- LOOP ----------

function animate() {

  requestAnimationFrame(
    animate
  );

  const delta =
    Math.min(
      clock.getDelta(),
      0.05
    );

  updatePlayer(delta);
  updateCamera();

  renderer.render(
    scene,
    camera
  );
}

// ---------- RESIZE ----------

function resize() {

  if (!camera || !renderer)
    return;

  camera.aspect =
    window.innerWidth /
    window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
}
