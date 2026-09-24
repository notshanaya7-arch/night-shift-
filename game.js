import * as THREE from "three";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/PointerLockControls.js";

/* =========================================================
   NIGHT SHIFT: 3:17 AM
   Main Character: YASH
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

    objective: "Find the maintenance key.",

    currentInteractable: null

};


/* =========================================================
   THREE.JS
   ========================================================= */

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x151820);

scene.fog =
    new THREE.FogExp2(
        0x151820,
        0.008
    );


const camera =
    new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.05,
        300
    );

camera.position.set(
    0,
    1.7,
    14
);


const renderer =
    new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
    THREE.SRGBColorSpace;


/* =========================================================
   FIRST PERSON CONTROLS
   ========================================================= */

const controls =
    new PointerLockControls(
        camera,
        document.body
    );

scene.add(camera);


/* =========================================================
   MATERIALS
   ========================================================= */

function makeMaterial(
    color,
    roughness = 0.8,
    metalness = 0
) {

    return new THREE.MeshStandardMaterial({

        color: color,

        roughness: roughness,

        metalness: metalness

    });

}


const floorMaterial =
    makeMaterial(
        0x34373b
    );

const wallMaterial =
    makeMaterial(
        0x4a4d50
    );

const ceilingMaterial =
    makeMaterial(
        0x292b2f
    );

const darkMaterial =
    makeMaterial(
        0x17191c
    );

const metalMaterial =
    makeMaterial(
        0x777b80,
        0.45,
        0.65
    );

const yellowMaterial =
    makeMaterial(
        0xc0a42b
    );

const redMaterial =
    makeMaterial(
        0x791d1d
    );


const glassMaterial =
    new THREE.MeshStandardMaterial({

        color: 0x1c2b35,

        roughness: 0.2,

        metalness: 0.25,

        transparent: true,

        opacity: 0.75

    });


/* =========================================================
   HELPERS
   ========================================================= */

function createBox(
    name,
    width,
    height,
    depth,
    x,
    y,
    z,
    material,
    interactable = null
) {

    const geometry =
        new THREE.BoxGeometry(
            width,
            height,
            depth
        );

    const mesh =
        new THREE.Mesh(
            geometry,
            material
        );

    mesh.name = name;

    mesh.position.set(
        x,
        y,
        z
    );

    mesh.castShadow = true;

    mesh.receiveShadow = true;

    if (interactable) {

        mesh.userData.interactable =
            interactable;

    }

    scene.add(mesh);

    return mesh;

}


function createCylinder(
    radius,
    height,
    x,
    y,
    z,
    material
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
            material
        );

    mesh.position.set(
        x,
        y,
        z
    );

    mesh.castShadow = true;

    mesh.receiveShadow = true;

    scene.add(mesh);

    return mesh;

}


/* =========================================================
   STATION FLOOR
   ========================================================= */

createBox(
    "Station Floor",
    40,
    0.3,
    50,
    0,
    -0.15,
    0,
    floorMaterial
);


/* =========================================================
   CEILING
   ========================================================= */

createBox(
    "Ceiling",
    40,
    0.3,
    50,
    0,
    6,
    0,
    ceilingMaterial
);


/* =========================================================
   WALLS
   ========================================================= */

createBox(
    "Back Wall",
    40,
    6,
    0.4,
    0,
    3,
    -25,
    wallMaterial
);

createBox(
    "Left Wall",
    0.4,
    6,
    50,
    -20,
    3,
    0,
    wallMaterial
);

createBox(
    "Right Wall",
    0.4,
    6,
    50,
    20,
    3,
    0,
    wallMaterial
);


/* =========================================================
   PLATFORM EDGE
   ========================================================= */

createBox(
    "Yellow Safety Line",
    40,
    0.12,
    0.35,
    0,
    0.12,
    -8,
    yellowMaterial
);


/* =========================================================
   TRACKS
   ========================================================= */

function createTrack(x) {

    createBox(
        "Rail",
        0.15,
        0.12,
        48,
        x - 0.7,
        0.04,
        -2,
        metalMaterial
    );

    createBox(
        "Rail",
        0.15,
        0.12,
        48,
        x + 0.7,
        0.04,
        -2,
        metalMaterial
    );


    for (
        let z = -25;
        z <= 22;
        z += 1.8
    ) {

        createBox(
            "Rail Sleeper",
            2.2,
            0.12,
            0.3,
            x,
            0,
            z,
            darkMaterial
        );

    }

}

createTrack(-3.5);
createTrack(3.5);


/* =========================================================
   PILLARS
   ========================================================= */

for (
    let z = -21;
    z <= 21;
    z += 7
) {

    createBox(
        "Pillar",
        0.7,
        5.5,
        0.7,
        -14,
        2.75,
        z,
        metalMaterial
    );

    createBox(
        "Pillar",
        0.7,
        5.5,
        0.7,
        14,
        2.75,
        z,
        metalMaterial
    );

}


/* =========================================================
   BENCH
   ========================================================= */

function createBench(x, z) {

    createBox(
        "Bench Seat",
        4,
        0.3,
        0.8,
        x,
        1,
        z,
        metalMaterial
    );

    createBox(
        "Bench Back",
        4,
        1.5,
        0.25,
        x,
        1.7,
        z + 0.3,
        metalMaterial
    );

    createBox(
        "Bench Leg",
        0.25,
        1,
        0.25,
        x - 1.5,
        0.5,
        z,
        darkMaterial
    );

    createBox(
        "Bench Leg",
        0.25,
        1,
        0.25,
        x + 1.5,
        0.5,
        z,
        darkMaterial
    );

}

createBench(-9, 8);
createBench(9, 1);
createBench(-9, -7);


/* =========================================================
   TICKET MACHINES
   ========================================================= */

function createTicketMachine(x, z) {

    createBox(
        "Ticket Machine",
        1,
        2.2,
        0.6,
        x,
        1.1,
        z,
        darkMaterial
    );

    createBox(
        "Ticket Screen",
        0.55,
        0.45,
        0.05,
        x,
        1.55,
        z - 0.33,
        glassMaterial
    );

}

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


/* =========================================================
   MAINTENANCE ROOM
   ========================================================= */

let maintenanceDoor;

createBox(
    "Maintenance Back Wall",
    8,
    4,
    0.3,
    10,
    2,
    -23,
    wallMaterial
);

createBox(
    "Maintenance Left Wall",
    0.3,
    4,
    10,
    6,
    2,
    -18,
    wallMaterial
);

createBox(
    "Maintenance Right Wall",
    0.3,
    4,
    10,
    14,
    2,
    -18,
    wallMaterial
);


maintenanceDoor =
    createBox(
        "Maintenance Door",
        2.5,
        3,
        0.3,
        10,
        1.5,
        -18,
        metalMaterial,
        "door"
    );


/* =========================================================
   ELECTRICAL PANEL
   ========================================================= */

const powerPanel =
    createBox(
        "Electrical Panel",
        1.2,
        1.6,
        0.25,
        11.5,
        1.8,
        -22.7,
        darkMaterial,
        "power"
    );


/* =========================================================
   SECURITY ROOM
   ========================================================= */

createBox(
    "Security Back Wall",
    10,
    4,
    0.3,
    -11,
    2,
    -23,
    wallMaterial
);


/* Desk */

createBox(
    "Security Desk",
    6,
    1,
    2,
    -11,
    0.5,
    -20,
    darkMaterial
);


/* CCTV */

const cctv =
    createBox(
        "CCTV Monitor",
        3,
        1.8,
        0.2,
        -11,
        2,
        -20.8,
        glassMaterial,
        "cctv"
    );


/* Report */

const report =
    createBox(
        "Security Report",
        0.8,
        0.04,
        0.6,
        -8.5,
        1.03,
        -20,
        makeMaterial(0xe5dfca),
        "report"
    );


/* Family document */

const familyFile =
    createBox(
        "Old Family File",
        0.8,
        0.05,
        0.5,
        -13.5,
        1.03,
        -20,
        redMaterial,
        "family"
    );


/* =========================================================
   EMERGENCY EXIT
   ========================================================= */

const exitDoor =
    createBox(
        "Emergency Exit",
        3,
        3,
        0.3,
        0,
        1.5,
        24,
        redMaterial,
        "exit"
    );


/* =========================================================
   MAINTENANCE KEY
   ========================================================= */

const keyGroup =
    new THREE.Group();

const keyMaterial =
    new THREE.MeshStandardMaterial({

        color: 0xffd447,

        metalness: 0.85,

        roughness: 0.2

    });


const keyRing =
    new THREE.Mesh(
        new THREE.TorusGeometry(
            0.14,
            0.035,
            8,
            20
        ),
        keyMaterial
    );


const keyShaft =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.4,
            0.06,
            0.06
        ),
        keyMaterial
    );

keyShaft.position.x =
    0.22;


keyGroup.add(
    keyRing,
    keyShaft
);


keyGroup.position.set(
    -7,
    1.35,
    5
);

keyGroup.rotation.z =
    Math.PI / 2;

keyGroup.userData.interactable =
    "key";

scene.add(keyGroup);


/* =========================================================
   LIGHTING
   ========================================================= */

/* Strong ambient light */

const ambientLight =
    new THREE.HemisphereLight(
        0xffffff,
        0x555555,
        1.8
    );

scene.add(
    ambientLight
);


/* Main station light */

const mainLight =
    new THREE.DirectionalLight(
        0xffffff,
        1.5
    );

mainLight.position.set(
    5,
    10,
    10
);

mainLight.castShadow =
    true;

scene.add(
    mainLight
);


/* =========================================================
   CEILING LIGHTS
   ========================================================= */

const stationLights = [];


for (
    let z = -21;
    z <= 21;
    z += 7
) {

    const light =
        new THREE.PointLight(
            0xc8d8ff,
            3.5,
            14
        );

    light.position.set(
        0,
        5.2,
        z
    );

    light.castShadow =
        true;

    scene.add(light);

    stationLights.push(light);


    /* Light fixture */

    createBox(
        "Ceiling Light",
        2,
        0.08,
        0.5,
        0,
        5.7,
        z,
        makeMaterial(0xdde8ff)
    );

}


/* =========================================================
   FLASHLIGHT
   ========================================================= */

const flashlight =
    new THREE.SpotLight(
        0xffffff,
        8,
        35,
        Math.PI / 7,
        0.5,
        1
    );

flashlight.position.set(
    0,
    -0.1,
    0
);

flashlight.castShadow =
    true;

camera.add(
    flashlight
);


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


/* =========================================================
   PASSENGER
   ========================================================= */

let passenger;


function createPassenger() {

    passenger =
        new THREE.Group();


    const body =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.32,
                0.42,
                1.8,
                12
            ),

            new THREE.MeshStandardMaterial({

                color: 0x030303,

                roughness: 1

            })

        );

    body.position.y =
        0.9;


    passenger.add(
        body
    );


    const head =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.28,
                16,
                16
            ),

            new THREE.MeshStandardMaterial({

                color: 0x010101,

                roughness: 1

            })

        );

    head.position.y =
        2;


    passenger.add(
        head
    );


    passenger.position.set(
        3.5,
        0,
        -15
    );

    passenger.visible =
        false;


    scene.add(
        passenger
    );

}

createPassenger();


/* =========================================================
   GHOST TRAIN
   ========================================================= */

let ghostTrain;


function createGhostTrain() {

    ghostTrain =
        new THREE.Group();


    const trainBody =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                7,
                3.2,
                14
            ),

            new THREE.MeshStandardMaterial({

                color: 0x25282c,

                roughness: 0.65,

                metalness: 0.35

            })

        );


    trainBody.position.y =
        1.8;


    ghostTrain.add(
        trainBody
    );


    /* Windows */

    for (
        let z = -5;
        z <= 5;
        z += 2.5
    ) {

        const window =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    2.5,
                    1,
                    0.05
                ),

                new THREE.MeshStandardMaterial({

                    color: 0x071018,

                    emissive: 0x020406

                })

            );


        window.position.set(
            0,
            2,
            z
        );

        window.rotation.y =
            Math.PI / 2;


        ghostTrain.add(
            window
        );

    }


    ghostTrain.position.set(
        3.5,
        0,
        -30
    );


    ghostTrain.visible =
        false;


    scene.add(
        ghostTrain
    );

}


createGhostTrain();


/* =========================================================
   INPUT
   ========================================================= */

const keys = {};


window.addEventListener(
    "keydown",
    event => {

        keys[event.code] =
            true;


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

    }
);


window.addEventListener(
    "keyup",
    event => {

        keys[event.code] =
            false;

    }
);


/* =========================================================
   START
   ========================================================= */

startButton.addEventListener(
    "click",
    () => {

        state.started =
            true;

        startScreen.classList.add(
            "hidden"
        );

        controls.lock();


        showMessage(
            "EMPLOYEE: YASH\n\nSHIFT STARTED — 11:00 PM",
            3000
        );

    }
);


/* =========================================================
   PAUSE
   ========================================================= */

resumeButton.addEventListener(
    "click",
    () => {

        pauseScreen.classList.add(
            "hidden"
        );

        controls.lock();

    }
);


restartButton.addEventListener(
    "click",
    () => {

        location.reload();

    }
);


controls.addEventListener(
    "unlock",
    () => {

        if (
            state.started &&
            !state.gameOver
        ) {

            state.paused =
                true;

            pauseScreen.classList.remove(
                "hidden"
            );

        }

    }
);


controls.addEventListener(
    "lock",
    () => {

        state.paused =
            false;

        pauseScreen.classList.add(
            "hidden"
        );

    }
);


/* =========================================================
   FLASHLIGHT
   ========================================================= */

function toggleFlashlight() {

    if (
        state.battery <= 0
    ) {

        state.flashlightOn =
            false;

        flashlight.visible =
            false;

        return;

    }


    state.flashlightOn =
        !state.flashlightOn;


    flashlight.visible =
        state.flashlightOn;

}


/* =========================================================
   INTERACTION DETECTION
   ========================================================= */

function findInteractable() {

    const player =
        camera.position;


    const objects = [

        keyGroup,
        maintenanceDoor,
        powerPanel,
        cctv,
        report,
        familyFile,
        exitDoor

    ];


    let closest =
        null;

    let closestDistance =
        Infinity;


    for (
        const object of objects
    ) {

        if (
            !object.visible
        ) {

            continue;

        }


        if (
            object === keyGroup &&
            state.hasKey
        ) {

            continue;

        }


        const distance =
            player.distanceTo(
                object.position
            );


        if (
            distance < 3 &&
 