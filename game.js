import * as THREE from "three";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/PointerLockControls.js";

/* =========================================================
   NIGHT SHIFT: 3:17 AM
   Main character: Yash
   ========================================================= */

const canvas = document.getElementById("gameCanvas");

const timeUI = document.getElementById("time");
const batteryUI = document.getElementById("batteryValue");
const objectiveUI = document.getElementById("objectiveText");
const interactionUI = document.getElementById("interaction");

const startScreen = document.getElementById("startScreen");
const pauseScreen = document.getElementById("pauseScreen");

const startButton = document.getElementById("startButton");
const resumeButton = document.getElementById("resumeButton");
const restartButton = document.getElementById("restartButton");

const eventMessage = document.getElementById("eventMessage");
const eventText = document.getElementById("eventText");

const errorScreen = document.getElementById("errorScreen");
const errorText = document.getElementById("errorText");

/* =========================================================
   BASIC THREE.JS SETUP
   ========================================================= */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x050608);

scene.fog = new THREE.FogExp2(
  0x050608,
  0.035
);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.05,
  250
);

camera.position.set(
  0,
  1.7,
  14
);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;

/* =========================================================
   CONTROLS
   ========================================================= */

const controls = new PointerLockControls(
  camera,
  document.body
);

scene.add(camera);

/* =========================================================
   GAME STATE
   ========================================================= */

const state = {

  started: false,

  paused: false,

  gameOver: false,

  minutes: 23 * 60,

  battery: 100,

  flashlightOn: true,

  stamina: 100,

  hasKey: false,

  powerRestored: false,

  readReport: false,

  readFamilyFile: false,

  event317: false,

  trainArrived: false,

  passengerActive: false,

  currentInteractable: null,

  objective:
    "Find the maintenance key."

};

/* =========================================================
   INPUT
   ========================================================= */

const keys = {};

window.addEventListener("keydown", event => {

  keys[event.code] = true;

  if (
    event.code === "KeyF" &&
    state.started &&
    !state.gameOver
  ) {

    toggleFlashlight();

  }

  if (
    event.code === "KeyE" &&
    state.started &&
    !state.gameOver
  ) {

    interact();

  }

});

window.addEventListener("keyup", event => {

  keys[event.code] = false;

});

/* =========================================================
   START / PAUSE
   ========================================================= */

startButton.addEventListener("click", () => {

  state.started = true;

  startScreen.classList.add("hidden");

  controls.lock();

  showEvent(
    "EMPLOYEE: YASH\nSHIFT STARTED — 11:00 PM",
    3000
  );

});

resumeButton.addEventListener("click", () => {

  pauseScreen.classList.add("hidden");

  controls.lock();

});

restartButton.addEventListener("click", () => {

  location.reload();

});

controls.addEventListener("lock", () => {

  if (state.started && !state.gameOver) {

    state.paused = false;

    pauseScreen.classList.add("hidden");

  }

});

controls.addEventListener("unlock", () => {

  if (
    state.started &&
    !state.gameOver
  ) {

    state.paused = true;

    pauseScreen.classList.remove("hidden");

  }

});

/* =========================================================
   MATERIALS
   ========================================================= */

function material(
  color,
  roughness = 0.8,
  metalness = 0
) {

  return new THREE.MeshStandardMaterial({

    color,

    roughness,

    metalness

  });

}

const floorMat = material(0x25272a);

const wallMat = material(0x343638);

const ceilingMat = material(0x1b1c1e);

const darkMat = material(0x111214);

const metalMat = material(
  0x4a4d50,
  0.45,
  0.65
);

const yellowMat = material(
  0x8c721c
);

const redMat = material(
  0x641717
);

const glassMat =
  new THREE.MeshStandardMaterial({

    color: 0x111820,

    transparent: true,

    opacity: 0.55,

    roughness: 0.15,

    metalness: 0.2

  });

/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

function box(
  name,
  size,
  position,
  mat,
  cast = true,
  receive = true
) {

  const geometry =
    new THREE.BoxGeometry(
      size.x,
      size.y,
      size.z
    );

  const mesh =
    new THREE.Mesh(
      geometry,
      mat
    );

  mesh.name = name;

  mesh.position.copy(position);

  mesh.castShadow = cast;

  mesh.receiveShadow = receive;

  scene.add(mesh);

  return mesh;
}

function cylinder(
  name,
  radius,
  height,
  position,
  mat
) {

  const geometry =
    new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      16
    );

  const mesh =
    new THREE.Mesh(
      geometry,
      mat
    );

  mesh.name = name;

  mesh.position.copy(position);

  mesh.castShadow = true;

  mesh.receiveShadow = true;

  scene.add(mesh);

  return mesh;
}

/* =========================================================
   STATION
   ========================================================= */

function createStation() {

  /* Main floor */

  box(
    "PlatformFloor",
    new THREE.Vector3(
      40,
      0.3,
      50
    ),
    new THREE.Vector3(
      0,
      -0.15,
      0
    ),
    floorMat
  );

  /* Ceiling */

  box(
    "Ceiling",
    new THREE.Vector3(
      40,
      0.3,
      50
    ),
    new THREE.Vector3(
      0,
      6,
      0
    ),
    ceilingMat
  );

  /* Back wall */

  box(
    "BackWall",
    new THREE.Vector3(
      40,
      6,
      0.4
    ),
    new THREE.Vector3(
      0,
      3,
      -25
    ),
    wallMat
  );

  /* Left wall */

  box(
    "LeftWall",
    new THREE.Vector3(
      0.4,
      6,
      50
    ),
    new THREE.Vector3(
      -20,
      3,
      0
    ),
    wallMat
  );

  /* Right wall */

  box(
    "RightWall",
    new THREE.Vector3(
      0.4,
      6,
      50
    ),
    new THREE.Vector3(
      20,
      3,
      0
    ),
    wallMat
  );

  /* Platform edge */

  box(
    "PlatformEdge",
    new THREE.Vector3(
      40,
      0.25,
      0.35
    ),
    new THREE.Vector3(
      0,
      0.12,
      -8
    ),
    yellowMat
  );

  /* =====================================================
     TRACKS
     ===================================================== */

  createTrack(-3.5);

  createTrack(3.5);

  /* =====================================================
     PILLARS
     ===================================================== */

  for (
    let z = -22;
    z <= 20;
    z += 7
  ) {

    createPillar(-14, z);

    createPillar(14, z);

  }

  /* =====================================================
     BENCHES
     ===================================================== */

  createBench(-9, 8);

  createBench(9, 1);

  createBench(-9, -7);

  /* =====================================================
     TICKET MACHINES
     ===================================================== */

  createTicketMachine(
    -7,
    5
  );

  createTicketMachine(
    -7,
    1
  );

  createTicketMachine(
    -7,
    -3
  );

  /* =====================================================
     MAINTENANCE AREA
     ===================================================== */

  createMaintenanceRoom();

  /* =====================================================
     SECURITY ROOM
     ===================================================== */

  createSecurityRoom();

  /* =====================================================
     EXIT
     ===================================================== */

  createExit();

}

function createTrack(x) {

  /* Rails */

  box(
    "Rail",
    new THREE.Vector3(
      0.15,
      0.1,
      48
    ),
    new THREE.Vector3(
      x - 0.7,
      0.05,
      -2
    ),
    metalMat
  );

  box(
    "Rail",
    new THREE.Vector3(
      0.15,
      0.1,
      48
    ),
    new THREE.Vector3(
      x + 0.7,
      0.05,
      -2
    ),
    metalMat
  );

  /* Sleepers */

  for (
    let z = -25;
    z < 22;
    z += 1.8
  ) {

    box(
      "Sleeper",
      new THREE.Vector3(
        2.2,
        0.12,
        0.3
      ),
      new THREE.Vector3(
        x,
        0,
        z
      ),
      darkMat
    );

  }

}

function createPillar(x, z) {

  box(
    "Pillar",
    new THREE.Vector3(
      0.7,
      5.5,
      0.7
    ),
    new THREE.Vector3(
      x,
      2.75,
      z
    ),
    metalMat
  );

}

function createBench(x, z) {

  box(
    "BenchSeat",
    new THREE.Vector3(
      4,
      0.3,
      0.8
    ),
    new THREE.Vector3(
      x,
      1,
      z
    ),
    metalMat
  );

  box(
    "BenchBack",
    new THREE.Vector3(
      4,
      1.5,
      0.25
    ),
    new THREE.Vector3(
      x,
      1.7,
      z + 0.3
    ),
    metalMat
  );

  for (
    let dx of [-1.5, 1.5]
  ) {

    box(
      "BenchLeg",
      new THREE.Vector3(
        0.25,
        1,
        0.25
      ),
      new THREE.Vector3(
        x + dx,
        0.5,
        z
      ),
      darkMat
    );

  }

}

function createTicketMachine(x, z) {

  const machine = box(
    "TicketMachine",
    new THREE.Vector3(
      1,
      2.2,
      0.6
    ),
    new THREE.Vector3(
      x,
      1.1,
      z
    ),
    darkMat
  );

  box(
    "TicketScreen",
    new THREE.Vector3(
      0.55,
      0.45,
      0.05
    ),
    new THREE.Vector3(
      x,
      1.55,
      z - 0.32
    ),
    glassMat,
    false
  );

}

/* =========================================================
   MAINTENANCE ROOM
   ========================================================= */

const maintenanceDoor = {

  mesh: null,

  open: false,

  position:
    new THREE.Vector3(
      9,
      1.5,
      -18
    )

};

function createMaintenanceRoom() {

  /* Walls */

  box(
    "MaintenanceBack",
    new THREE.Vector3(
      8,
      4,
      0.3
    ),
    new THREE.Vector3(
      10,
      2,
      -23
    ),
    wallMat
  );

  box(
    "MaintenanceLeft",
    new THREE.Vector3(
      0.3,
      4,
      10
    ),
    new THREE.Vector3(
      6,
      2,
      -18
    ),
    wallMat
  );

  box(
    "MaintenanceRight",
    new THREE.Vector3(
      0.3,
      4,
      10
    ),
    new THREE.Vector3(
      14,
      2,
      -18
    ),
    wallMat
  );

  maintenanceDoor.mesh = box(
    "MaintenanceDoor",
    new THREE.Vector3(
      2.5,
      3,
      0.3
    ),
    maintenanceDoor.position,
    metalMat
  );

  maintenanceDoor.mesh.userData.interactable =
    "door";

  /* Electrical panel */

  const panel = box(
    "ElectricalPanel",
    new THREE.Vector3(
      1.2,
      1.6,
      0.25
    ),
    new THREE.Vector3(
      11.5,
      1.8,
      -22.7
    ),
    darkMat
  );

  panel.userData.interactable =
    "power";

  /* Warning light */

  const warningLight = new THREE.PointLight(
    0xaa0000,
    1.5,
    7
  );

  warningLight.position.set(
    10,
    3.2,
    -22.5
  );

  scene.add(warningLight);

}

/* =========================================================
   SECURITY ROOM
   ========================================================= */

function createSecurityRoom() {

  box(
    "SecurityBack",
    new THREE.Vector3(
      10,
      4,
      0.3
    ),
    new THREE.Vector3(
      -11,
      2,
      -23
    ),
    wallMat
  );

  /* Desk */

  box(
    "SecurityDesk",
    new THREE.Vector3(
      6,
      1,
      2
    ),
    new THREE.Vector3(
      -11,
      0.5,
      -20
    ),
    darkMat
  );

  /* Monitor */

  const monitor = box(
    "CCTVMonitor",
    new THREE.Vector3(
      3,
      1.8,
      0.2
    ),
    new THREE.Vector3(
      -11,
      2,
      -20.8
    ),
    glassMat
  );

  monitor.userData.interactable =
    "cctv";

  /* Report */

  const report = box(
    "SecurityReport",
    new THREE.Vector3(
      0.8,
      0.04,
      0.6
    ),
    new THREE.Vector3(
      -8.5,
      1.03,
      -20
    ),
    material(0xddd8c7)
  );

  report.userData.interactable =
    "report";

  /* Family file */

  const file = box(
    "FamilyFile",
    new THREE.Vector3(
      0.8,
      0.05,
      0.5
    ),
    new THREE.Vector3(
      -13.5,
      1.03,
      -20
    ),
    redMat
  );

  file.userData.interactable =
    "family";

}

/* =========================================================
   EXIT
   ========================================================= */

function createExit() {

  const exit = box(
    "EmergencyExit",
    new THREE.Vector3(
      3,
      3,
      0.3
    ),
    new THREE.Vector3(
      0,
      1.5,
      24
    ),
    redMat
  );

  exit.userData.interactable =
    "exit";

}

/* =========================================================
   KEY
   ========================================================= */

const key = new THREE.Group();

function createKey() {

  const ring =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.13,
        0.035,
        8,
        16
      ),
      new THREE.MeshStandardMaterial({
        color: 0xd7b94c,
        metalness: 0.8,
        roughness: 0.25
      })
    );

  const shaft =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.35,
        0.06,
        0.06
      ),
      ring.material
    );

  shaft.position.x =
    0.2;

  key.add(
    ring,
    shaft
  );

  key.position.set(
    -7,
    1.35,
    5
  );

  key.rotation.z =
    Math.PI / 2;

  key.userData.interactable =
    "key";

  scene.add(key);

}

createKey();

/* =========================================================
   LIGHTING
   ========================================================= */

const ambientLight =
  new THREE.HemisphereLight(
    0x20242c,
    0x050505,
    0.28
  );

scene.add(ambientLight);

function createCeilingLights() {

  for (
    let z = -20;
    z <= 20;
    z += 7
  ) {

    const light =
      new THREE.PointLight(
        0xb8c7d6,
        1.5,
        9
      );

    light.position.set(
      0,
      5.2,
      z
    );

    light.castShadow = true;

    scene.add(light);

  }

}

createCeilingLights();

/* =========================================================
   FLASHLIGHT
   ========================================================= */

const flashlight =
  new THREE.SpotLight(
    0xffffff,
    5,
    30,
    Math.PI / 7,
    0.5,
    1
  );

flashlight.position.set(
  0,
  -0.1,
  0
);

flashlight.castShadow = true;

camera.add(flashlight);

const flashlightTarget =
  new THREE.Object3D();

flashlightTarget.position.set(
  0,
  0,
  -10
);

camera.add(
  flashlightTarget
);

flashlight.target =
  flashlightTarget;

function toggleFlashlight() {

  if (
    state.battery <= 0
  ) {

    state.flashlightOn = false;

    flashlight.visible = false;

    return;

  }

  state.flashlightOn =
    !state.flashlightOn;

  flashlight.visible =
    state.flashlightOn;

}

/* =========================================================
   THE PASSENGER
   ========================================================= */

let passenger = null;

function createPassenger() {

  passenger =
    new THREE.Group();

  /* Body */

  const body =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.32,
        0.42,
        1.8,
        12
      ),
      new THREE.MeshStandardMaterial({
        color: 0x050505,
        roughness: 1
      })
    );

  body.position.y =
    0.9;

  passenger.add(body);

  /* Head */

  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.28,
        16,
        16
      ),
      new THREE.MeshStandardMaterial({
        color: 0x020202,
        roughness: 1
      })
    );

  head.position.y =
    2;

  passenger.add(head);

  passenger.position.set(
    0,
    0,
    -22
  );

  passenger.visible =
    false;

  scene.add(passenger);

}

createPassenger();

/* =========================================================
   GHOST TRAIN
   ========================================================= */

let ghostTrain = null;

function createGhostTrain() {

  ghostTrain =
    new THREE.Group();

  const body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        8,
        3.2,
        15
      ),
      new THREE.MeshStandardMaterial({
        color: 0x16191c,
        roughness: 0.7,
        metalness: 0.4
      })
    );

  body.position.y =
    1.8;

  ghostTrain.add(body);

  /* Windows */

  for (
    let z = -5;
    z <= 5;
    z += 2.5
  ) {

    const window =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          3,
          1.1,
          0.05
        ),
        new THREE.MeshStandardMaterial({
          color: 0x020508,
          emissive: 0x050505
        })
      );

    window.position.set(
      0,
      2,
      z
    );

    window.rotation.y =
      Math.PI / 2;

    ghostTrain.add(window);

  }

  ghostTrain.position.set(
    3.5,
    0,
    -35
  );

  ghostTrain.visible =
    false;

  scene.add(
    ghostTrain
  );

}

/* =========================================================
   INTERACTION
   ========================================================= */

function getInteractable() {

  let closest = null;

  let closestDistance =
    Infinity;

  const playerPos =
    camera.position;

  const objects = [
    key,
    maintenanceDoor.mesh,
    ...scene.children
  ];

  for (
    const object of objects
  ) {

    if (
      !object ||
      !object.userData ||
      !object.userData.interactable
    ) {

      continue;

    }

    if (
      object === key &&
      state.hasKey
    ) {

      continue;

    }

    const distance =
      playerPos.distanceTo(
        object.position
      );

    if (
      distance < 3 &&
      distance < closestDistance
    ) {

      closest =
        object;

      closestDistance =
        distance;

    }

  }

  return closest;

}

function interact() {

  const object =
    state.currentInteractable;

  if (!object) {

    return;

  }

  const type =
    object.userData.interactable;

  /* KEY */

  if (
    type === "key"
  ) {

    state.hasKey =
      true;

    key.visible =
      false;

    state.objective =
      "Unlock the maintenance door.";

    showEvent(
      "MAINTENANCE KEY ACQUIRED",
      2000
    );

    return;

  }

  /* DOOR */

  if (
    type === "door"
  ) {

    if (!state.hasKey) {

      showEvent(
        "LOCKED.\nI need a maintenance key.",
        2000
      );

      return;

    }

    if (
      !maintenanceDoor.open
    ) {

      maintenanceDoor.open =
        true;

      maintenanceDoor.mesh.rotation.y =
        -Math.PI / 2;

      state.objective =
        "Enter the maintenance room and restore power.";

      showEvent(
        "The door opens.",
        1500
      );

    }

    return;

  }

  /* POWER */

  if (
    type === "power"
  ) {

    if (
      state.powerRestored
    ) {

      showEvent(
        "Power is already restored.",
        1500
      );

      return;

    }

    state.powerRestored =
      true;

    state.objective =
      "Go to the security room.";

    showEvent(
      "POWER RESTORED.\nSomething moved in the tunnel.",
      3000
    );

    return;

  }

  /* CCTV */

  if (
    type === "cctv"
  ) {
