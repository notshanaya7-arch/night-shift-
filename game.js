import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/PointerLockControls.js";

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x050608);
scene.fog = new THREE.Fog(0x050608, 8, 55);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(0, 1.7, 8);

const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("gameCanvas"),
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

const controls = new PointerLockControls(camera, document.body);

const clock = new THREE.Clock();


// =====================================================
// PLAYER
// =====================================================

const player = {
    height: 1.7,
    radius: 0.35,
    speed: 3.5,
    sprintSpeed: 7,
    hasKey: false,
    repairedPower: false
};


// =====================================================
// MATERIALS
// =====================================================

const floorMat = new THREE.MeshStandardMaterial({
    color: 0x242424,
    roughness: 0.9
});

const wallMat = new THREE.MeshStandardMaterial({
    color: 0x303236,
    roughness: 0.8
});

const darkMat = new THREE.MeshStandardMaterial({
    color: 0x111214,
    roughness: 0.9
});

const metalMat = new THREE.MeshStandardMaterial({
    color: 0x55585c,
    metalness: 0.7,
    roughness: 0.4
});

const doorMat = new THREE.MeshStandardMaterial({
    color: 0x25272a,
    metalness: 0.4,
    roughness: 0.7
});


// =====================================================
// OBJECT CREATION
// =====================================================

const colliders = [];
const interactables = [];

function box(
    x,
    y,
    z,
    sx,
    sy,
    sz,
    material,
    name = "",
    collision = false
) {

    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(sx, sy, sz),
        material
    );

    mesh.position.set(x, y, z);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    mesh.name = name;

    scene.add(mesh);

    if (collision) {
        colliders.push({
            mesh,
            width: sx,
            depth: sz
        });
    }

    return mesh;
}


// =====================================================
// LIGHTING
// =====================================================

scene.add(
    new THREE.HemisphereLight(
        0x555555,
        0x111111,
        0.35
    )
);


// =====================================================
// MAIN PLATFORM
// =====================================================

box(
    0,
    -0.1,
    0,
    24,
    0.2,
    70,
    floorMat,
    "Platform Floor"
);


// =====================================================
// MAIN WALLS
// =====================================================

box(
    0,
    4,
    -35,
    24,
    8,
    0.5,
    wallMat,
    "Back Wall",
    true
);

box(
    0,
    4,
    35,
    24,
    8,
    0.5,
    wallMat,
    "Front Wall",
    true
);

box(
    -12,
    4,
    0,
    0.5,
    8,
    70,
    wallMat,
    "Left Wall",
    true
);

box(
    12,
    4,
    0,
    0.5,
    8,
    70,
    wallMat,
    "Right Wall",
    true
);


// =====================================================
// CEILING
// =====================================================

box(
    0,
    8,
    0,
    24,
    0.3,
    70,
    darkMat,
    "Ceiling"
);


// =====================================================
// TRACKS
// =====================================================

for (let z = -30; z <= 30; z += 4) {

    box(
        -4,
        -0.03,
        z,
        0.15,
        0.1,
        3.5,
        metalMat,
        "Rail"
    );

    box(
        4,
        -0.03,
        z,
        0.15,
        0.1,
        3.5,
        metalMat,
        "Rail"
    );
}

for (let z = -30; z <= 30; z += 2) {

    box(
        0,
        -0.08,
        z,
        9,
        0.15,
        0.3,
        darkMat,
        "Sleeper"
    );
}


// =====================================================
// PILLARS
// =====================================================

for (let z = -28; z <= 28; z += 8) {

    box(
        -9,
        4,
        z,
        0.7,
        8,
        0.7,
        wallMat,
        "Pillar",
        true
    );

    box(
        9,
        4,
        z,
        0.7,
        8,
        0.7,
        wallMat,
        "Pillar",
        true
    );
}


// =====================================================
// LIGHTS
// =====================================================

const ceilingLights = [];

for (let z = -28; z <= 28; z += 7) {

    const light = new THREE.PointLight(
        0xffffff,
        1.2,
        12
    );

    light.position.set(0, 7, z);

    scene.add(light);

    ceilingLights.push(light);

    box(
        0,
        7.8,
        z,
        2,
        0.1,
        0.5,
        new THREE.MeshBasicMaterial({
            color: 0xffffff
        }),
        "Ceiling Light"
    );
}


// =====================================================
// BENCHES
// =====================================================

for (let z = -20; z <= 20; z += 10) {

    box(
        -8,
        1,
        z,
        4,
        0.3,
        0.7,
        metalMat,
        "Bench",
        true
    );

    box(
        -8,
        2,
        z + 0.3,
        4,
        2,
        0.2,
        metalMat,
        "Bench Back",
        true
    );
}


// =====================================================
// MAINTENANCE ROOM
// =====================================================

const roomX = 7;
const roomZ = -10;


// Back wall
box(
    roomX,
    3,
    roomZ - 5,
    8,
    6,
    0.4,
    wallMat,
    "Maintenance Back Wall",
    true
);


// Left wall
box(
    roomX - 4,
    3,
    roomZ,
    0.4,
    6,
    10,
    wallMat,
    "Maintenance Left Wall",
    true
);


// Right wall
box(
    roomX + 4,
    3,
    roomZ,
    0.4,
    6,
    10,
    wallMat,
    "Maintenance Right Wall",
    true
);


// =====================================================
// MAINTENANCE DOOR
// =====================================================

const maintenanceDoor = box(
    7,
    2.5,
    -5,
    0.35,
    5,
    3.5,
    doorMat,
    "Maintenance Door",
    true
);

maintenanceDoor.userData.type = "door";
maintenanceDoor.userData.locked = true;
maintenanceDoor.userData.open = false;

interactables.push(maintenanceDoor);


// Door frame

box(
    5.2,
    2.5,
    -5,
    0.2,
    5.5,
    0.2,
    metalMat,
    "Door Frame"
);

box(
    8.8,
    2.5,
    -5,
    0.2,
    5.5,
    0.2,
    metalMat,
    "Door Frame"
);


// =====================================================
// ELECTRICAL PANEL
// =====================================================

const panel = box(
    10.6,
    2.5,
    -12,
    0.25,
    2.5,
    2,
   