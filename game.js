// ============================================
// ECHO: THE LAST SIGNAL
// MOBILE 3D PROTOTYPE
// Joystick + Touch Camera
// ============================================

let THREE;
let scene, camera, renderer, clock;
let player;
let gameStarted = false;

const joystick = {
  active: false,
  id: null,
  x: 0,
  y: 0
};

const touchCamera = {
  active: false,
  id: null,
  lastX: 0,
  lastY: 0,
  yaw: 0,
  pitch: 0.25
};

let selectedCharacter = null;

// ============================================
// CHARACTER MENU
// ============================================

function selectCharacter(name) {
  selectedCharacter = name;

  const selected = document.getElementById("selected");

  if (selected) {
    selected.textContent = "SELECTED: " + name;
  }
}

function showCharacter() {
  document.getElementById("home").classList.add("hidden");
  document.getElementById("character-screen").classList.remove("hidden");
}

function backHome() {
  document.getElementById("character-screen").classList.add("hidden");
  document.getElementById("home").classList.remove("hidden");
}

// ============================================
// START
// ============================================

async function startGame() {

  if (!selectedCharacter) {
    alert("Pilih karakter terlebih dahulu.");
    return;
  }

  document.getElementById("home").classList.add("hidden");
  document.getElementById("character-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");

  const oldUI = document.querySelector(".game-ui");

  if (oldUI) {
    oldUI.style.display = "none";
  }

  await loadThree();

  if (!gameStarted) {
    createGame();
    gameStarted = true;
  }
}

// ============================================
// THREE.JS
// ============================================

async function loadThree() {

  if (THREE) return;

  THREE = await import(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js"
  );
}

// ============================================
// GAME
// ============================================

function createGame() {

  clock = new THREE.Clock();

  scene = new THREE.Scene();

  scene.background = new THREE.Color(0x070a10);

  scene.fog = new THREE.Fog(
    0x070a10,
    8,
    35
  );

  // CAMERA

  camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  // RENDERER

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 1.7)
  );

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.shadowMap.enabled = true;

  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.touchAction = "none";

  document
    .getElementById("game-screen")
    .appendChild(renderer.domElement);

  // LIGHTING

  const ambient =
    new THREE.HemisphereLight(
      0x9baac4,
      0x111111,
      1.5
    );

  scene.add(ambient);

  const light =
    new THREE.DirectionalLight(
      0xffffff,
      2
    );

  light.position.set(
    5,
    10,
    5
  );

  light.castShadow = true;

  scene.add(light);

  // ROOM

  createRoom();

  // PLAYER

  player = createPlayer();

  player.position.set(
    0,
    0,
    7
  );

  scene.add(player);

  // MOBILE UI

  createMobileControls();

  setupTouchControls();

  window.addEventListener(
    "resize",
    resize
  );

  animate();
}

// ============================================
// ROOM
// ============================================

function createRoom() {

  const floorMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x202631,
      roughness: 0.9
    });

  const wallMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x111722,
      roughness: 0.85
    });

  // FLOOR

  const floor =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        18,
        0.4,
        24
      ),
      floorMaterial
    );

  floor.position.y = -0.2;

  floor.receiveShadow = true;

  scene.add(floor);

  // WALLS

  addWall(
    18,
    6,
    0.4,
    0,
    3,
    -12,
    wallMaterial
  );

  addWall(
    0.4,
    6,
    24,
    -9,
    3,
    0,
    wallMaterial
  );

  addWall(
    0.4,
    6,
    24,
    9,
    3,
    0,
    wallMaterial
  );

  addWall(
    18,
    6,
    0.4,
    0,
    3,
    12,
    wallMaterial
  );

  // CHESTS

  createChest(
    -5,
    0,
    -5
  );

  createChest(
    0,
    0,
    -5
  );

  createChest(
    5,
    0,
    -5
  );

  // DOOR

  const door =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        3,
        5,
        0.5
      ),
      new THREE.MeshStandardMaterial({
        color: 0x090d15,
        roughness: 0.6
      })
    );

  door.position.set(
    0,
    2.5,
    -11.7
  );

  door.castShadow = true;

  scene.add(door);
}

function addWall(
  width,
  height,
  depth,
  x,
  y,
  z,
  material
) {

  const wall =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        depth
      ),
      material
    );

  wall.position.set(
    x,
    y,
    z
  );

  wall.castShadow = true;
  wall.receiveShadow = true;

  scene.add(wall);
}

// ============================================
// CHEST
// ============================================

function createChest(x, y, z) {

  const group =
    new THREE.Group();

  const body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        2.3,
        1.2,
        1.6
      ),
      new THREE.MeshStandardMaterial({
        color: 0x4a3525,
        roughness: 0.75
      })
    );

  body.position.y = 0.6;

  body.castShadow = true;

  group.add(body);

  const lid =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        2.4,
        0.35,
        1.7
      ),
      new THREE.MeshStandardMaterial({
        color: 0x6a492d,
        roughness: 0.7
      })
    );

  lid.position.y = 1.35;

  lid.castShadow = true;

  group.add(lid);

  const lock =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.3,
        0.4,
        0.15
      ),
      new THREE.MeshStandardMaterial({
        color: 0xd0a84c,
        metalness: 0.8,
        roughness: 0.3
      })
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

// ============================================
// BLOCKY CHARACTER
// ============================================

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

  // LEGS

  for (const x of [-0.28, 0.28]) {

    const leg =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.45,
          1.2,
          0.55
        ),
        pants
      );

    leg.position.set(
      x,
      0.6,
      0
    );

    leg.castShadow = true;

    character.add(leg);
  }

  // ARMS

  for (const x of [-0.78, 0.78]) {

    const arm =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.4,
          1.25,
          0.45
        ),
        shirt
      );

    arm.position.set(
      x,
      1.7,
      0
    );

    arm.castShadow = true;

    character.add(arm);
  }

  return character;
}

// ============================================
// MOBILE CONTROLS
// ============================================

function createMobileControls() {

  const old =
    document.getElementById(
      "mobile-controls"
    );

  if (old) old.remove();

  const ui =
    document.createElement("div");

  ui.id =
    "mobile-controls";

  ui.innerHTML = `
    <div id="joystick">
      <div id="joystick-knob"></div>
    </div>

    <div id="camera-hint">
      SWIPE TO LOOK
    </div>

    <div id="interact-button">
      OPEN
    </div>
  `;

  document
    .getElementById("game-screen")
    .appendChild(ui);

  const style =
    document.createElement("style");

  style.textContent = `

    #mobile-controls {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 50;
      user-select: none;
      -webkit-user-select: none;
    }

    #joystick {
      position: absolute;
      left: 25px;
      bottom: 25px;

      width: 125px;
      height: 125px;

      border-radius: 50%;

      background: rgba(255,255,255,.10);

      border:
        2px solid
        rgba(255,255,255,.25);

      backdrop-filter: blur(8px);

      pointer-events: auto;
      touch-action: none;
    }

    #joystick-knob {
      position: absolute;

      width: 55px;
      height: 55px;

      left: 33px;
      top: 33px;

      border-radius: 50%;

      background:
        rgba(255,255,255,.55);

      box-shadow:
        0 4px 20px
        rgba(0,0,0,.4);

      pointer-events: none;
    }

    #interact-button {
      position: absolute;

      right: 25px;
      bottom: 35px;

      width: 78px;
      height: 78px;

      border-radius: 50%;

      display: flex;
      align-items: center;
      justify-content: center;

      font-size: 12px;
      font-weight: bold;
      letter-spacing: 1px;

      background:
        rgba(255,255,255,.12);

      border:
        2px solid
        rgba(255,255,255,.35);

      backdrop-filter: blur(8px);

      pointer-events: auto;
      touch-action: manipulation;
    }

    #camera-hint {
      position: absolute;

      right: 120px;
      bottom: 25px;

      font-size: 9px;
      letter-spacing: 2px;

      opacity: .45;
    }

    @media (min-width: 800px) {
      #mobile-controls {
        display: none;
      }
    }

  `;

  document.head.appendChild(style);
}

// ============================================
// TOUCH
// ============================================

function setupTouchControls() {

  const joy =
    document.getElementById(
      "joystick"
    );

  const knob =
    document.getElementById(
      "joystick-knob"
    );

  // JOYSTICK START

  joy.addEventListener(
    "touchstart",
    e => {

      e.preventDefault();

      const t =
        e.changedTouches[0];

      joystick.active = true;
      joystick.id = t.identifier;

      updateJoystick(
        t,
        joy,
        knob
      );

    },
    { passive: false }
  );

  // JOYSTICK MOVE

  joy.addEventListener(
    "touchmove",
    e => {

      e.preventDefault();

      for (const t of e.changedTouches) {

        if (
          joystick.active &&
          t.identifier === joystick.id
        ) {

          updateJoystick(
            t,
            joy,
            knob
          );
        }
      }

    },
    { passive: false }
  );

  // JOYSTICK END

  joy.addEventListener(
    "touchend",
    e => {

      for (const t of e.changedTouches) {

        if (
          t.identifier === joystick.id
        ) {

          joystick.active = false;
          joystick.x = 0;
          joystick.y = 0;

          knob.style.transform =
            "translate(0px, 0px)";
        }
      }

    }
  );

  // CAMERA TOUCH

  renderer.domElement.addEventListener(
    "touchstart",
    e => {

      for (const t of e.changedTouches) {

        // ignore touches near joystick

        if (t.clientX < 180)
          continue;

        touchCamera.active = true;
        touchCamera.id = t.identifier;

        touchCamera.lastX = t.clientX;
        touchCamera.lastY = t.clientY;
      }

    },
    { passive: true }
  );

  renderer.domElement.addEventListener(
    "touchmove",
    e => {

      for (const t of e.changedTouches) {

        if (
          touchCamera.active &&
          t.identifier === touchCamera.id
        ) {

          const dx =
            t.clientX -
            touchCamera.lastX;

          const dy =
            t.clientY -
            touchCamera.lastY;

          touchCamera.lastX =
            t.clientX;

          touchCamera.lastY =
            t.clientY;

          touchCamera.yaw -=
            dx * 0.008;

          touchCamera.pitch -=
            dy * 0.005;

          touchCamera.pitch =
            Math.max(
              -0.25,
              Math.min(
                0.8,
                touchCamera.pitch
              )
            );
        }
      }

    },
    { passive: true }
  );

  renderer.domElement.addEventListener(
    "touchend",
    e => {

      for (const t of e.changedTouches) {

        if (
          t.identifier ===
          touchCamera.id
        ) {

          touchCamera.active = false;
        }
      }

    }
  );
}

// ============================================
// JOYSTICK CALCULATION
// ============================================

function updateJoystick(
  touch,
  joystickElement,
  knob
) {

  const rect =
    joystickElement.getBoundingClientRect();

  const centerX =
    rect.left +
    rect.width / 2;

  const centerY =
    rect.top +
    rect.height / 2;

  let dx =
    touch.clientX -
    centerX;

  let dy =
    touch.clientY -
    centerY;

  const max =
    45;

  const distance =
    Math.sqrt(
      dx * dx +
      dy * dy
    );

  if (distance > max) {

    dx =
      dx / distance * max;

    dy =
      dy / distance * max;
  }

  joystick.x =
    dx / max;

  joystick.y =
    dy / max;

  knob.style.transform =
    `translate(${dx}px, ${dy}px)`;
}

// ============================================
// PLAYER MOVEMENT
// ============================================

function updatePlayer(delta) {

  if (!player)
    return;

  const speed = 4.2;

  const moveX =
    joystick.x;

  const moveZ =
    joystick.y;

  if (
    Math.abs(moveX) > 0.05 ||
    Math.abs(moveZ) > 0.05
  ) {

    const forward =
      new THREE.Vector3(
        Math.sin(
          touchCamera.yaw
        ),
        0,
        Math.cos(
          touchCamera.yaw
        )
      );

    const right =
      new THREE.Vector3(
        Math.cos(
          touchCamera.yaw
        ),
        0,
        -Math.sin(
          touchCamera.yaw
        )
      );

    const movement =
      new THREE.Vector3();

    movement.addScaledVector(
      right,
      moveX
    );

    movement.addScaledVector(
      forward,
      moveZ
    );

    movement.normalize();

    player.position.addScaledVector(
      movement,
      speed * delta
    );

    player.rotation.y =
      Math.atan2(
        movement.x,
        movement.z
      );
  }

  // ROOM LIMITS

  player.position.x =
    Math.max(
      -7.3,
      Math.min(
        7.3,
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

// ============================================
// CAMERA
// ============================================

function updateCamera() {

  if (!player)
    return;

  const distance = 7;

  const horizontal =
    Math.cos(
      touchCamera.pitch
    ) * distance;

  const vertical =
    Math.sin(
      touchCamera.pitch
    ) * distance;

  const x =
    player.position.x -
    Math.sin(
      touchCamera.yaw
    ) * horizontal;

  const z =
    player.position.z -
    Math.cos(
      touchCamera.yaw
    ) * horizontal;

  const y =
    player.position.y +
    2.5 +
    vertical;

  camera.position.lerp(
    new THREE.Vector3(
      x,
      y,
      z
    ),
    0.12
  );

  camera.lookAt(
    player.position.x,
    player.position.y + 1.6,
    player.position.z
  );
}

// ============================================
// LOOP
// ============================================

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

// ============================================
// RESIZE
// ============================================

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
