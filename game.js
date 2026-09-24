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


// =========================
// LIGHTING
// =========================

const ambient = new THREE.HemisphereLight(
    0x555555,
    0x111111,
    0.35
);

scene.add(ambient);


// =========================
// MATERIALS
// =========================

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


// =========================
// HELPER
// =========================

function box(
    x,
    y,
    z,
    sx,
    sy,
    sz,
    material,
    name = ""
) {
    const geometry = new THREE.BoxGeometry(sx, sy, sz);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = name;

    scene.add(mesh);

    return mesh;
}


// =========================
// FLOOR
// =========================

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


// =========================
// WALLS
// =========================

box(0, 4, -35, 24, 8, 0.5, wallMat, "Back Wall");
box(0, 4, 35, 24, 8, 0.5, wallMat, "Front Wall");

box(-12, 4, 0, 0.5, 8, 70, wallMat, "Left Wall");
box(12, 4, 0, 0.5, 8, 70, wallMat, "Right Wall");


// =========================
// CEILING
// =========================

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


// =========================
// RAILS
// =========================

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


// =========================
// SLEEPERS
// =========================

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


// =========================
// PILLARS
// =========================

for (let z = -28; z <= 28; z += 8) {

    box(
        -9,
        4,
        z,
        0.7,
        8,
        0.7,
        wallMat,
        "Pillar"
    );

    box(
        9,
        4,
        z,
        0.7,
        8,
        0.7,
        wallMat,
        "Pillar"
    );
}


// =========================
// CEILING LIGHTS
// =========================

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


// =========================
// BENCHES
// =========================

for (let z = -20; z <= 20; z += 10) {

    box(
        -8,
        1,
        z,
        4,
        0.3,
        0.7,
        metalMat,
        "Bench Seat"
    );

    box(
        -8,
        2,
        z + 0.3,
        4,
        2,
        0.2,
        metalMat,
        "Bench Back"
    );
}


// =========================
// TICKET MACHINE
// =========================

const ticketMachine = box(
    -8,
    1.5,
    5,
    1.2,
    3,
    0.8,
    metalMat,
    "Ticket Machine"
);


// =========================
// INTERACTIVE DOOR
// =========================

const door = box(
    7,
    2.5,
    -5,
    0.3,
    5,
    3.5,
    doorMat,
    "Maintenance Door"
);

door.userData.interactable = true;
door.userData.type = "door";
door.userData.open = false;


// Door frame
box(6.7, 2.5, -5, 0.2, 5.5, 0.2, metalMat);
box(7.3, 2.5, -5, 0.2, 5.5, 0.2, metalMat);


// =========================
// FLASHLIGHT
// =========================

const flashlight = new THREE.SpotLight