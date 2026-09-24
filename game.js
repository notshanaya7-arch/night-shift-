import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/PointerLockControls.js";

/* =========================================
   BASIC SETUP
========================================= */

const canvas = document.getElementById("gameCanvas");

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x020202);

scene.fog = new THREE.Fog(
    0x020202,
    5,
    45
);


/* =========================================
   CAMERA
========================================= */

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(
    0,
    1.7,
    8
);


/* =========================================
   RENDERER
========================================= */

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
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


/* =========================================
   LIGHTING
========================================= */

const ambientLight = new THREE.AmbientLight(
    0x666666,
    0.35
);

scene.add(ambientLight);


/* =========================================
   FLASHLIGHT
========================================= */

const flashlight = new THREE.SpotLight(
    0xffffff,
    8,
    30,
    Math.PI / 7,
    0.5,
    1
);

flashlight.position.set(
    0,
    1.65,
    0
);

flashlight.castShadow = true;

scene.add(flashlight);

scene.add(flashlight.target);


/* =========================================
   FLOOR
========================================= */

const floorGeometry = new THREE.PlaneGeometry(
    40,
    40
);

const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x292929,
    roughness: 0.85
});

const floor = new THREE.Mesh(
    floorGeometry,
    floorMaterial
);

floor.rotation.x = -Math.PI / 2;

floor.receiveShadow = true;

scene.add(floor);


/* =========================================
   WALL CREATOR
========================================= */

function createWall(
    x,
    y,
    z,
    width,
    height,
    depth
) {

    const geometry = new THREE.BoxGeometry(
        width,
        height,
        depth
    );

    const material = new THREE.MeshStandardMaterial({
        color: 0x202020,
        roughness: 0.9
    });

    const wall = new THREE.Mesh(
        geometry,
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

    return wall;
}


/* =========================================
   METRO STATION
========================================= */

/* Left wall */

createWall(
    -8,
    3,
    0,
    0.5,
    6,
    40
);


/* Right wall */

createWall(
    8,
    3,
    0,
    0.5,
    6,
    40
);


/* Back wall */

createWall(
    0,
    3,
    -20,
    16,
    6,
    0.5
);


/* Ceiling */

const ceilingGeometry =
    new THREE.BoxGeometry(
        16,
        0.5,
        40
    );

const ceilingMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111111
    });

const ceiling =
    new THREE.Mesh(
        ceilingGeometry,
        ceilingMaterial
    );

ceiling.position.y = 6;

scene.add(ceiling);


/* =========================================
   RAILWAY TRACKS
========================================= */

function createRail(z) {

    const railGeometry =
        new THREE.BoxGeometry(
            40,
            0.08,
            0.08
        );

    const railMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x777777,
            metalness: 0.8,
            roughness: 0.3
        });

    const rail =
        new THREE.Mesh(
            railGeometry,
            railMaterial
        );

    rail.position.set(
        0,
        0.08,
        z
    );

    scene.add(rail);
}


createRail(-3);
createRail(-5);


/* =========================================
   PLATFORM EDGE
========================================= */

const edgeGeometry =
    new THREE.BoxGeometry(
        40,
        0.15,
        0.4
    );

const edgeMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x555555
    });

const platformEdge =
    new THREE.Mesh(
        edgeGeometry,
        edgeMaterial
    );

platformEdge.position.set(
    0,
    0.12,
    -1
);

scene.add(platformEdge);


/* =========================================
   METRO COLUMNS
========================================= */

for (
    let z = 15;
    z > -18;
    z -= 5
) {

    createWall(
        -4,
        2.5,
        z,
        0.5,
        5,
        0.5
    );

    createWall(
        4,
        2.5,
        z,
        0.5,
        5,
        0.5
    );
}


/* =========================================
   CEILING LIGHTS
========================================= */

function createCeilingLight(z) {

    const light =
        new THREE.PointLight(
            0xbfcfff,
            1.5,
            8
        );

    light.position.set(
        0,
        5.5,
        z
    );

    scene.add(light);


    const bulbGeometry =
        new THREE.BoxGeometry(
            2,
            0.05,
            0.2
        );

    const bulbMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xddeeff
        });

    const bulb =
        new THREE.Mesh(
            bulbGeometry,
            bulbMaterial
        );

    bulb.position.set(
        0,
        5.5,
        z
    );

    scene.add(bulb);
}


for (
    let z = 15;
    z > -18;
    z -= 5
) {

    createCeilingLight(z);
}


/* =========================================
   SIMPLE BENCHES
========================================= */

function createBench(x, z) {

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x343434
        });


    const seat =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.5,
                0.15,
                0.5
            ),
            material
        );

    seat.position.set(
        x,
        1,
        z
    );

    scene.add(seat);


    const legs = [
        [-0.9, z],
        [0.9, z]
    ];

    for (const [lx, lz] of legs) {

        const leg =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.15,
                    1,
                    0.15
                ),
                material
            );

        leg.position.set(
            x + lx,
            0.5,
            lz
        );

        scene.add(leg);
    }
}


createBench(-6, 10);
createBench(6, 2);
createBench(-6, -8);


/* =========================================
   FIRST PERSON CONTROLS
========================================= */

const controls =
    new PointerLockControls(
        camera,
        document.body
    );


/* =========================================
   START BUTTON
========================================= */

const startButton =
    document.getElementById(
        "startButton"
    );

const startScreen =
    document.getElementById(
        "startScreen"
    );


startButton.addEventListener(
    "click",
    () => {

        controls.lock();

    }
);


controls.addEventListener(
    "lock",
    () => {

        startScreen.style.display =
            "none";

    }
);


/* =========================================
   PAUSE
========================================= */

const pauseScreen =
    document.getElementById(
        "pauseScreen"
    );

controls.addEventListener(
    "unlock",
    () => {

        if (
            gameStarted &&
            !gameFinished
        ) {

            pauseScreen.style.display =
                "flex";

        }

    }
);


const resumeButton =
    document.getElementById(
        "resumeButton"
    );

resumeButton.addEventListener(
    "click",
    () => {

        controls.lock();

    }
);


/* =========================================
   MOVEMENT
========================================= */

const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false
};


document.addEventListener(
    "keydown",
    (event) => {

        switch (event.code) {

            case "KeyW":
                keys.forward = true;
                break;

            case "KeyS":
                keys.backward = true;
                break;

            case "KeyA":
                keys.left = true;
                break;

            case "KeyD":
                keys.right = true;
                break;

            case "ShiftLeft":
                keys.sprint = true;
                break;

        }

    }
);


document.addEventListener(
    "keyup",
    (event) => {

        switch (event.code) {

            case "KeyW":
                keys.forward = false;
                break;

            case "KeyS":
                keys.backward = false;
                break;

            case "KeyA":
                keys.left = false;
                break;

            case "KeyD":
                keys.right = false;
                break;

            case "ShiftLeft":
                keys.sprint = false;
                break;

        }

    }
);


/* =========================================
   FLASHLIGHT TOGGLE
========================================= */

let flashlightOn = true;

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.code === "KeyF"
        ) {

            flashlightOn =
                !flashlightOn;

            flashlight.visible =
                flashlightOn;

        }

    }
);


/* =========================================
   GAME STATE
========================================= */

let gameStarted = false;
let gameFinished = false;

controls.addEventListener(
    "lock",
    () => {

        gameStarted = true;

    }
);


/* =========================================
   GAME CLOCK
========================================= */

const clockElement =
    document.getElementById(
        "time"
    );

let gameMinutes = 23 * 60;


/* One real second = one game minute */

let lastTime =
    performance.now();


function updateGameTime() {

    const now =
        performance.now();

    if (
        gameStarted &&
        controls.isLocked
    ) {

        if (
            now - lastTime >= 1000
        ) {

            gameMinutes++;

            lastTime = now;

        }

    }


    if (
        gameMinutes >= 24 * 60
    ) {

        gameMinutes -= 24 * 60;

    }


    let hours =
        Math.floor(
            gameMinutes / 60
        );

    const minutes =
        gameMinutes % 60;

    const suffix =
        hours >= 12
            ? "PM"
            : "AM";

    if (hours === 0) {
        hours = 12;
    }

    if (hours > 12) {
        hours -= 