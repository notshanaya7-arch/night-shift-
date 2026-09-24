import * as THREE from "three";

/* =========================
   GAME STATE
========================= */

let gameStarted = false;
let flashlightOn = true;
let battery = 100;

const keys = {};

const canvas = document.getElementById("gameCanvas");
const batteryUI = document.getElementById("battery");

if (!canvas) {
    throw new Error("gameCanvas not found.");
}


/* =========================
   SCENE
========================= */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x050609);

scene.fog = new THREE.Fog(
    0x050609,
    5,
    45
);


/* =========================
   CAMERA
========================= */

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.05,
    1000
);

camera.position.set(
    0,
    1.7,
    8
);


/* =========================
   RENDERER
========================= */

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


/* =========================
   LIGHTING
========================= */

const ambientLight =
    new THREE.AmbientLight(
        0x8899aa,
        1.5
    );

scene.add(ambientLight);


/* =========================
   FLOOR
========================= */

const floorGeometry =
    new THREE.PlaneGeometry(
        50,
        50
    );

const floorMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x24272c,
        roughness: 0.95
    });

const floor =
    new THREE.Mesh(
        floorGeometry,
        floorMaterial
    );

floor.rotation.x =
    -Math.PI / 2;

scene.add(floor);


/* =========================
   WALLS
========================= */

const wallMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x14161a,
        roughness: 1
    });

function createWall(
    x,
    y,
    z,
    width,
    height,
    depth
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
            wallMaterial
        );

    wall.position.set(
        x,
        y,
        z
    );

    scene.add(wall);

    return wall;
}

createWall(
    0,
    3,
    -15,
    30,
    6,
    1
);

createWall(
    0,
    3,
    15,
    30,
    6,
    1
);

createWall(
    -15,
    3,
    0,
    1,
    6,
    30
);

createWall(
    15,
    3,
    0,
    1,
    6,
    30
);


/* =========================
   PLATFORM
========================= */

const platformGeometry =
    new THREE.BoxGeometry(
        8,
        0.4,
        30
    );

const platformMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x303238,
        roughness: 0.9
    });

const platform =
    new THREE.Mesh(
        platformGeometry,
        platformMaterial
    );

platform.position.set(
    7,
    0.2,
    0
);

scene.add(platform);


/* =========================
   TRAIN TRACKS
========================= */

const trackMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.8,
        roughness: 0.4
    });

function createTrack(x) {

    const geometry =
        new THREE.BoxGeometry(
            0.15,
            0.1,
            30
        );

    const track =
        new THREE.Mesh(
            geometry,
            trackMaterial
        );

    track.position.set(
        x,
        0.08,
        0
    );

    scene.add(track);
}

createTrack(-2);
createTrack(2);


/* =========================
   CEILING LIGHTS
========================= */

for (
    let z = -12;
    z <= 12;
    z += 6
) {

    const light =
        new THREE.PointLight(
            0x9dbdff,
            35,
            13
        );

    light.position.set(
        5,
        4.5,
        z
    );

    scene.add(light);

    const bulb =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.12,
                8,
                8
            ),
            new THREE.MeshBasicMaterial({
                color: 0xbdd5ff
            })
        );

    bulb.position.copy(
        light.position
    );

    scene.add(bulb);
}


/* =========================
   FLASHLIGHT
========================= */

const flashlight =
    new THREE.SpotLight(
        0xffffff,
        8,
        30,
        Math.PI / 7,
        0.45,
        1.5
    );

flashlight.position.set(
    0,
    1.6,
    0
);

camera.add(flashlight);

scene.add(camera);


/* =========================
   START SHIFT
========================= */

window.addEventListener(
    "startShift",
    () => {

        gameStarted = true;

        console.log(
            "NIGHT SHIFT STARTED"
        );

        /*
         * Pointer lock works on desktop.
         * On mobile, the game still uses
         * keyboard/game controls where available.
         */

        if (
            document.body.requestPointerLock
        ) {

            document.body.requestPointerLock();
        }

    }
);


/* =========================
   KEYBOARD
========================= */

window.addEventListener(
    "keydown",
    (event) => {

        keys[
            event.key.toLowerCase()
        ] = true;

        /* Flashlight */

        if (
            event.key.toLowerCase() === "f"
            && gameStarted
        ) {

            toggleFlashlight();
        }

        /* Recharge */

        if (
            event.key.toLowerCase() === "r"
            && gameStarted
        ) {

            battery = Math.min(
                100,
                battery + 20
            );

            updateBatteryUI();
        }

    }
);


window.addEventListener(
    "keyup",
    (event) => {

        keys[
            event.key.toLowerCase()
        ] = false;

    }
);


/* =========================
   FLASHLIGHT
========================= */

function toggleFlashlight() {

    if (battery <= 0) {
        flashlightOn = false;
        flashlight.visible = false;
        return;
    }

    flashlightOn =
        !flashlightOn;

    flashlight.visible =
        flashlightOn;

    updateBatteryUI();
}


function updateBatteryUI() {

    if (!batteryUI) return;

    batteryUI.textContent =
        `FLASHLIGHT: ${Math.ceil(battery)}%`;

}


/* =========================
   MOUSE LOOK
========================= */

let yaw = 0;
let pitch = 0;

document.addEventListener(
    "mousemove",
    (event) => {

        if (!gameStarted) return;

        /*
         * On desktop use pointer lock.
         * Otherwise only respond while
         * the mouse button is held.
         */

        const locked =
            document.pointerLockElement ===
            document.body;

        if (
            !locked &&
            !keys.mouse
        ) {
            return;
        }

        const sensitivity =
            0.0022;

        yaw -=
            event.movementX *
            sensitivity;

        pitch -=
            event.movementY *
            sensitivity;

        const limit =
            Math.PI / 2 - 0.05;

        pitch =
            Math.max(
                -limit,
                Math.min(
                    limit,
                    pitch
                )
            );

        camera.rotation.order =
            "YXZ";

        camera.rotation.y =
            yaw;

        camera.rotation.x =
            pitch;

    }
);


/* =========================
   MOUSE BUTTON
========================= */

document.addEventListener(
    "mousedown",
    () => {

        keys.mouse = true;

    }
);

document.addEventListener(
    "mouseup",
    () => {

        keys.mouse = false;

    }
);


/* =========================
   PLAYER MOVEMENT
========================= */

const velocity =
    new THREE.Vector3();

const direction =
    new THREE.Vector3();

function updatePlayer() {

    if (!gameStarted) return;

    direction.set(
        0,
        0,
        0
    );

    if (keys.w) {
        direction.z -= 1;
    }

    if (keys.s) {
        direction.z += 1;
    }

    if (keys.a) {
        direction.x -= 1;
    }

    if (keys.d) {
        direction.x += 1;
    }

    if (
        direction.lengthSq() > 0
    ) {

        direction.normalize();

    }

    /*
     * Shift = sprint
     */

    const sprinting =
        keys.shift;

    const speed =
        sprinting
            ? 0.14
            : 0.075;

    velocity
        .copy(direction)
        .multiplyScalar(speed);

    /*
     * Move relative to camera direction
     */

    camera.translateX(
        velocity.x
    );

    camera.translateZ(
        velocity.z
    );

    /*
     * Keep player inside station
     */

    camera.position.x =
        THREE.MathUtils.clamp(
            camera.position.x,
            -13.5,
            13.5
        );

    camera.position.z =
        THREE.MathUtils.clamp(
            camera.position.z,
            -13.5,
            13.5
        );

    camera.position.y =
        1.7;

}


/* =========================
   FLASHLIGHT BATTERY
========================= */

let lastBatteryTime =
    performance.now();

function updateBattery() {

    if (
        !gameStarted ||
        !flashlightOn
    ) {
        lastBatteryTime =
            performance.now();

        return;
    }

    const now =
        performance.now();

    const delta =
        (now - lastBatteryTime)
        / 1000;

    lastBatteryTime = now;

    /*
     * Battery drains slowly
     */

    battery -=
        delta * 0.8;

    if (battery <= 0) {

        battery = 0;

        flashlightOn = false;

        flashlight.visible =
            false;

    }

    updateBatteryUI();

}


/* =========================
   GAME LOOP
========================= */

function animate() {

    requestAnimationFrame(
        animate
    );

    updatePlayer();

    updateBattery();

    renderer.render(
        scene,
        camera
    );

}

animate();


/* =========================
   RESIZE
========================= */

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


/* =========================
   INITIAL UI
========================= */

updateBatteryUI();

console.log(
    "NIGHT SHIFT loaded successfully."
);