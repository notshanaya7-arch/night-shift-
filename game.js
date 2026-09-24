// ============================================================
// NIGHT SHIFT: 3:17 AM
// MASTER GAME.JS
// Main character: YASH
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/PointerLockControls.js";


// ============================================================
// BASIC SETUP
// ============================================================

const canvas = document.getElementById("gameCanvas");

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x030405);

scene.fog = new THREE.Fog(
    0x030405,
    8,
    65
);


const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    150
);

camera.position.set(
    0,
    1.7,
    25
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

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


const controls =
    new PointerLockControls(
        camera,
        document.body
    );


const clock = new THREE.Clock();


// ============================================================
// GAME STATE
// ============================================================

const game = {

    started: false,

    paused: false,

    timeMinutes: 23 * 60,

    // 1 game hour = 4.5 real minutes
    minutesPerSecond:
        60 / 270,

    flashlight: true,

    battery: 100,

    hasKey: false,

    powerRestored: false,

    foundReport: false,

    foundFamilyDocument: false,

    watchedCCTV: false,

    sawPassenger: false,

    trainArrived: false,

    passengerActive: false,

    passengerEscaped: false,

    endingTriggered: false,

    currentObjective:
        "Check the electrical panel.",

    currentCamera: 1,

    cctvOpen: false,

    inventory: [],

    lastMessage: "",

    footsteps: false
};


// ============================================================
// PLAYER
// ============================================================

const player = {

    height: 1.7,

    radius: 0.35,

    speed: 3.5,

    sprintSpeed: 6.5,

    stamina: 100
};


// ============================================================
// MATERIALS
// ============================================================

const floorMat =
    new THREE.MeshStandardMaterial({
        color: 0x242424,
        roughness: 0.95
    });


const wallMat =
    new THREE.MeshStandardMaterial({
        color: 0x303236,
        roughness: 0.85
    });


const darkMat =
    new THREE.MeshStandardMaterial({
        color: 0x101114,
        roughness: 0.9
    });


const metalMat =
    new THREE.MeshStandardMaterial({
        color: 0x55585c,
        metalness: 0.75,
        roughness: 0.4
    });


const doorMat =
    new THREE.MeshStandardMaterial({
        color: 0x25272a,
        metalness: 0.45,
        roughness: 0.7
    });


const redMat =
    new THREE.MeshStandardMaterial({
        color: 0x440b0b,
        roughness: 0.8
    });


const yellowMat =
    new THREE.MeshStandardMaterial({
        color: 0xb58a00,
        metalness: 0.8,
        roughness: 0.25
    });


// ============================================================
// COLLISION SYSTEM
// ============================================================

const colliders = [];

const interactables = [];


function addCollider(
    mesh,
    width,
    depth
) {

    const collider = {
        mesh,
        width,
        depth,
        enabled: true
    };

    colliders.push(collider);

    return collider;
}


function removeCollider(mesh) {

    const found =
        colliders.find(
            c => c.mesh === mesh
        );

    if (found) {
        found.enabled = false;
    }
}


function restoreCollider(mesh) {

    const found =
        colliders.find(
            c => c.mesh === mesh
        );

    if (found) {
        found.enabled = true;
    }
}


// ============================================================
// BOX HELPER
// ============================================================

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

    const mesh =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                sx,
                sy,
                sz
            ),
            material
        );

    mesh.position.set(
        x,
        y,
        z
    );

    mesh.castShadow = true;

    mesh.receiveShadow = true;

    mesh.name = name;

    scene.add(mesh);

    if (collision) {

        addCollider(
            mesh,
            sx,
            sz
        );
    }

    return mesh;
}


// ============================================================
// LIGHTING
// ============================================================

const ambientLight =
    new THREE.HemisphereLight(
        0x555555,
        0x090909,
        0.35
    );

scene.add(ambientLight);


const mainLight =
    new THREE.DirectionalLight(
        0x8890a0,
        0.15
    );

mainLight.position.set(
    0,
    10,
    0
);

mainLight.castShadow = true;

scene.add(mainLight);


// ============================================================
// MAIN STATION
// ============================================================

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


// Outer walls

box(
    0,
    4,
    -35,
    24,
    8,
    0.5,
    wallMat,
    "North Wall",
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
    "South Wall",
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
    "West Wall",
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
    "East Wall",
    true
);


// Ceiling

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


// ============================================================
// PLATFORM EDGE
// ============================================================

box(
    0,
    0.05,
    -8,
    11,
    0.15,
    0.25,
    yellowMat,
    "Safety Line"
);


// ============================================================
// TRACKS
// ============================================================

for (
    let z = -32;
    z <= 32;
    z += 4
) {

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


for (
    let z = -32;
    z <= 32;
    z += 2
) {

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


// ============================================================
// PILLARS
// ============================================================

for (
    let z = -28;
    z <= 28;
    z += 8
) {

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


// ============================================================
// LIGHTS
// ============================================================

const ceilingLights = [];


for (
    let z = -28;
    z <= 28;
    z += 7
) {

    const light =
        new THREE.PointLight(
            0xffffff,
            1.2,
            13
        );

    light.position.set(
        0,
        7,
        z
    );

    light.castShadow = true;

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


// ============================================================
// BENCHES
// ============================================================

for (
    let z = -20;
    z <= 20;
    z += 10
) {

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


// ============================================================
// SIGNS
// ============================================================

function createTextTexture(text) {

    const c =
        document.createElement("canvas");

    c.width = 512;
    c.height = 128;

    const ctx =
        c.getContext("2d");

    ctx.fillStyle = "#07100a";
    ctx.fillRect(
        0,
        0,
        c.width,
        c.height
    );

    ctx.fillStyle = "#d6e8d6";

    ctx.font =
        "bold 42px Arial";

    ctx.textAlign = "center";

    ctx.textBaseline = "middle";

    ctx.fillText(
        text,
        c.width / 2,
        c.height / 2
    );

    return new THREE.CanvasTexture(c);
}


function sign(
    text,
    x,
    y,
    z,
    rotationY = 0
) {

    const material =
        new THREE.MeshBasicMaterial({
            map: createTextTexture(text)
        });

    const mesh =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                4,
                1
            ),
            material
        );

    mesh.position.set(
        x,
        y,
        z
    );

    mesh.rotation.y =
        rotationY;

    scene.add(mesh);
}


sign(
    "PLATFORM 2",
    0,
    5.5,
    -10
);


// ============================================================
// MAINTENANCE ROOM
// ============================================================

const roomX = 7;
const roomZ = -15;


// Back

box(
    roomX,
    3,
    roomZ - 5,
    8,
    6,
    0.4,
    wallMat,
    "Maintenance Back",
    true
);


// Left

box(
    roomX - 4,
    3,
    roomZ,
    0.4,
    6,
    10,
    wallMat,
    "Maintenance Left",
    true
);


// Right

box(
    roomX + 4,
    3,
    roomZ,
    0.4,
    6,
    10,
    wallMat,
    "Maintenance Right",
    true
);


// ============================================================
// MAINTENANCE DOOR
// ============================================================

const maintenanceDoor =
    box(
        7,
        2.5,
        -10,
        0.35,
        5,
        3.5,
        doorMat,
        "Maintenance Door",
        true
    );


maintenanceDoor.userData.type =
    "door";

maintenanceDoor.userData.locked =
    true;

maintenanceDoor.userData.open =
    false;


interactables.push(
    maintenanceDoor
);


const doorCollider =
    colliders.find(
        c => c.mesh === maintenanceDoor
    );


// ============================================================
// ELECTRICAL PANEL
// ============================================================

const panel =
    box(
        10.6,
        2.5,
        -17,
        0.25,
        2.5,
        2,
        metalMat,
        "Electrical Panel"
    );


panel.userData.type =
    "panel";


interactables.push(
    panel
);


const panelLight =
    new THREE.PointLight(
        0xff2200,
        1.2,
        4
    );

panelLight.position.set(
    10.2,
    2.7,
    -17
);

scene.add(panelLight);


// ============================================================
// GENERATOR
// ============================================================

box(
    8,
    1.2,
    -18.5,
    3,
    2.4,
    2,
    metalMat,
    "Generator",
    true
);


// ============================================================
// KEY
// ============================================================

const key =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.12,
            0.05,
            0.35
        ),
        new THREE.MeshStandardMaterial({
            color: 0xffc400,
            metalness: 0.9,
            roughness: 0.2
        })
    );


key.position.set(
    -7,
    1.35,
    5
);

key.rotation.y =
    Math.PI / 4;

scene.add(key);


key.userData.type =
    "key";


interactables.push(
    key
);


// ============================================================
// SECURITY ROOM
// ============================================================

const securityX = -7;
const securityZ = -25;


// Back wall

box(
    securityX,
    3,
    securityZ - 4,
    8,
    6,
    0.4,
    wallMat,
    "Security Back",
    true
);


// Left wall

box(
    securityX - 4,
    3,
    securityZ,
    0.4,
    6,
    8,
    wallMat,
    "Security Left",
    true
);


// Right wall

box(
    securityX + 4,
    3,
    securityZ,
    0.4,
    6,
    8,
    wallMat,
    "Security Right",
    true
);


// ============================================================
// SECURITY MONITOR
// ============================================================

const securityMonitor =
    box(
        -7,
        2.2,
        -21,
        3,
        2,
        0.7,
        darkMat,
        "Security Monitor"
    );


securityMonitor.userData.type =
    "cctv";


interactables.push(
    securityMonitor
);


// Monitor glow

const monitorLight =
    new THREE.PointLight(
        0x224422,
        1,
        5
    );

monitorLight.position.set(
    -7,
    2.5,
    -20.5
);

scene.add(monitorLight);


// ============================================================
// DOCUMENTS
// ============================================================

const report =
    box(
        -9,
        1.25,
        -23,
        0.7,
        0.08,
        1,
        new THREE.MeshStandardMaterial({
            color: 0xd8d2bd
        }),
        "Security Report"
    );


report.userData.type =
    "report";


interactables.push(
    report
);


const familyDocument =
    box(
        -5,
        1.25,
        -23,
        0.7,
        0.08,
        1,
        new THREE.MeshStandardMaterial({
            color: 0xd8d2bd
        }),
        "Old Document"
    );


familyDocument.userData.type =
    "familyDocument";


interactables.push(
    familyDocument
);


// ============================================================
// TICKET MACHINE
// ============================================================

const ticketMachine =
    box(
        -8,
        1.5,
        5,
        1.2,
        3,
        0.8,
        metalMat,
        "Ticket Machine"
    );


ticketMachine.userData.type =
    "machine";


interactables.push(
    ticketMachine
);


// ============================================================
// FLASHLIGHT
// ============================================================

const flashlight =
    new THREE.SpotLight(
        0xffffff,
        5,
        27,
        Math.PI / 7,
        0.5,
        1
    );


flashlight.castShadow =
    true;

camera.add(
    flashlight
);

camera.add(
    flashlight.target
);

scene.add(
    camera
);


// ============================================================
// CCTV UI
// ============================================================

const cctvScreen =
    document.createElement("div");

cctvScreen.id =
    "cctvRuntime";

cctvScreen.style.cssText = `
position:fixed;
inset:0;
z-index:100;
display:none;
background:#020403;
color:#b9e9b9;
font-family:monospace;
padding:20px;
box-sizing:border-box;
`;

document.body.appendChild(
    cctvScreen
);


cctvScreen.innerHTML = `

<div style="
display:flex;
justify-content:space-between;
font-size:20px;
margin-bottom:15px;
">
<span>SECURITY MONITOR</span>
<span id="runtimeCam">CAM 01</span>
</div>

<div id="runtimeView" style="
height:70vh;
border:2px solid #365236;
display:flex;
align-items:center;
justify-content:center;
font-size:28px;
position:relative;
overflow:hidden;
background:#071007;
">

<div id="runtimeStatic" style="
position:absolute;
inset:0;
opacity:.15;
background:repeating-linear-gradient(
0deg,
transparent 0px,
transparent 3px,
white 4px
);
pointer-events:none;
"></div>

<div id="runtimeScene">
MAIN PLATFORM — NORTH
</div>

<div id="runtimeWarning" style="
position:absolute;
display:none;
color:#ff3333;
font-size:25px;
">
MOTION DETECTED
</div>

</div>

<div id="runtimeButtons" style="
display:flex;
flex-wrap:wrap;
gap:6px;
margin-top:15px;
justify-content:center;
"></div>

<div style="
text-align:center;
margin-top:15px;
color:#777;
">
E — EXIT SECURITY MONITOR
</div>
`;


const runtimeCam =
    document.getElementById(
        "runtimeCam"
    );

const runtimeScene =
    document.getElementById(
        "runtimeScene"
    );

const runtimeWarning =
    document.getElementById(
        "runtimeWarning"
    );

const runtimeButtons =
    document.getElementById(
        "runtimeButtons"
    );


const cameraNames = {

    1:
        "MAIN PLATFORM — NORTH",

    2:
        "MAIN PLATFORM — SOUTH",

    3:
        "TICKET HALL",

    4:
        "TICKET GATES",

    5:
        "STAIRWAY",

    6:
        "MAINTENANCE CORRIDOR",

    7:
        "MAINTENANCE DOOR",

    8:
        "GENERATOR ROOM",

    9:
        "PLATFORM 2",

    10:
        "EMERGENCY EXIT",

    11:
        "SERVICE TUNNEL",

    12:
        "UNKNOWN LOCATION"
};


for (
    let i = 1;
    i <= 12;
    i++
) {

    const button =
        document.createElement(
            "button"
        );

    button.textContent =
        `CAM ${String(i).padStart(2, "0")}`;

    button.style.cssText = `
    background:#091309;
    color:#a5d5a5;
    border:1px solid #365536;
    padding:8px 12px;
    cursor:pointer;
    `;

    button.onclick =
        () => switchCamera(i);

    runtimeButtons.appendChild(
        button
    );
}


// ============================================================
// CCTV CAMERA SWITCHING
// ============================================================

function switchCamera(number) {

    game.currentCamera =
        number;

    runtimeCam.textContent =
        `CAM ${String(number).padStart(2, "0")}`;

    runtimeWarning.style.display =
        "none";


    if (
        number === 7 &&
        game.powerRestored
    ) {

        game.watchedCCTV =
            true;

        if (
            !game.sawPassenger
        ) {

            runtimeScene.innerHTML = `
            <div style="
            width:100%;
            height:100%;
            position:relative;
            background:
            linear-gradient(#111,#050505);
            ">
            
            <div style="
            position:absolute;
            width:25px;
            height:170px;
            background:#030303;
            left:61%;
            top:31%;
            border-radius:50% 50% 10% 10%;
            ">
            </div>

            <div style="
            position:absolute;
            bottom:20px;
            left:20px;
            font-size:14px;
            ">
            MAINTENANCE CORRIDOR
            </div>

            </div>
            `;

            runtimeWarning.style.display =
                "block";

            game.sawPassenger =
                true;

            showMessage(
                "CAM 07 — MOTION DETECTED"
            );

        } else {

            runtimeScene.textContent =
                "CAMERA FEED — EMPTY";
        }

    } else {

        runtimeScene.textContent =
            cameraNames[number];
    }


    if (
        number === 12 &&
        game.timeMinutes >=
        3 * 60 + 17
    ) {

        runtimeScene.innerHTML = `
        <div style="
        text-align:center;
        color:#888;
        ">
        SIGNAL SOURCE UNKNOWN
        <br><br>
        03:17:17
        </div>
        `;
    }
}


// ============================================================
// SHOW / HIDE CCTV
// ============================================================

function openCCTV() {

    game.cctvOpen =
        true;

    cctvScreen.style.di