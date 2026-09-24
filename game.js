import * as THREE from "three";
import { createStation } from "./station.js";

/* =========================================================
   NIGHT SHIFT: 3:17 AM
   GAME CONTROLLER — PART 1/2
========================================================= */

const canvas = document.getElementById("gameCanvas");

if (!canvas) {
    throw new Error("gameCanvas was not found");
}

/* =========================
   SCENE
========================= */

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x05070a);

scene.fog =
    new THREE.FogExp2(
        0x05070a,
        0.012
    );

/* =========================
   CAMERA
========================= */

const camera =
    new THREE.PerspectiveCamera(
        75,
        window.innerWidth /
        window.innerHeight,
        0.05,
        400
    );

camera.position.set(
    0,
    2,
    20
);

camera.rotation.order =
    "YXZ";

scene.add(camera);

/* =========================
   RENDERER
========================= */

const renderer =
    new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        powerPreference:
            "high-performance"
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio || 1,
        2
    )
);

renderer.shadowMap.enabled =
    true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure =
    0.9;

/* =========================
   LIGHTING
========================= */

const ambientLight =
    new THREE.HemisphereLight(
        0x687080,
        0x090a0d,
        1
    );

scene.add(ambientLight);

const stationLight =
    new THREE.DirectionalLight(
        0xbfc7d8,
        1
    );

stationLight.position.set(
    20,
    35,
    15
);

stationLight.castShadow =
    true;

stationLight.shadow.mapSize.width =
    1024;

stationLight.shadow.mapSize.height =
    1024;

scene.add(stationLight);

/* =========================
   STATION
========================= */

let stationData = null;

try {

    stationData =
        createStation(scene);

    console.log(
        "Station loaded"
    );

} catch (error) {

    console.error(
        "STATION ERROR:",
        error
    );

    const floor =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                80,
                1,
                180
            ),
            new THREE.MeshStandardMaterial({
                color: 0x33363b
            })
        );

    floor.position.y =
        -0.5;

    scene.add(floor);
}

/* =========================
   PLAYER
========================= */

const PLAYER_HEIGHT = 2;

let yaw = 0;
let pitch = 0;

let mouseLocked = false;

const keys = {};

const WALK_SPEED = 5.5;
const SPRINT_SPEED = 9;

/* =========================
   GAME STATE
========================= */

let gameStarted = false;
let paused = false;

let gameMinutes =
    23 * 60;

let three17Triggered =
    false;

let lastFrame =
    performance.now();

/* =========================
   FLASHLIGHT
========================= */

const flashlight =
    new THREE.SpotLight(
        0xffffff,
        10,
        42,
        Math.PI / 7,
        0.45,
        1.5
    );

flashlight.position.set(
    0,
    -0.15,
    0
);

flashlight.castShadow =
    true;

flashlight.shadow.mapSize.width =
    512;

flashlight.shadow.mapSize.height =
    512;

camera.add(
    flashlight
);

const flashlightTarget =
    new THREE.Object3D();

flashlightTarget.position.set(
    0,
    -0.1,
    -15
);

camera.add(
    flashlightTarget
);

flashlight.target =
    flashlightTarget;

let flashlightOn = true;
let battery = 100;

/* =========================
   START GAME
========================= */

window.addEventListener(
    "startShift",
    startShift
);

function startShift() {

    if (gameStarted) {
        return;
    }

    gameStarted = true;
    paused = false;

    camera.position.set(
        0,
        PLAYER_HEIGHT,
        20
    );

    yaw = 0;
    pitch = 0;

    camera.rotation.set(
        0,
        0,
        0
    );

    flashlightOn = true;
    battery = 100;

    flashlight.visible =
        true;

    console.log(
        "NIGHT SHIFT STARTED"
    );

    showObjective(
        "Begin your shift. Check the station."
    );

    updateHUD();

    tryPointerLock();
}

/* =========================
   POINTER LOCK
========================= */

function tryPointerLock() {

    if (
        document.pointerLockElement
    ) {
        return;
    }

    try {

        document.body.requestPointerLock();

    } catch (error) {

        console.log(
            "Pointer lock unavailable"
        );

    }
}

document.addEventListener(
    "pointerlockchange",
    () => {

        mouseLocked =
            document.pointerLockElement ===
            document.body;

    }
);

/* =========================
   MOUSE LOOK
========================= */

document.addEventListener(
    "mousemove",
    event => {

        if (
            !gameStarted ||
            paused ||
            !mouseLocked
        ) {
            return;
        }

        yaw -=
            event.movementX *
            0.0022;

        pitch -=
            event.movementY *
            0.0022;

        pitch =
            THREE.MathUtils.clamp(
                pitch,
                -Math.PI / 2.1,
                Math.PI / 2.1
            );

        camera.rotation.y =
            yaw;

        camera.rotation.x =
            pitch;

    }
);

canvas.addEventListener(
    "click",
    () => {

        if (gameStarted) {
            tryPointerLock();
        }

    }
);

/* =========================
   KEYBOARD
========================= */

window.addEventListener(
    "keydown",
    event => {

        keys[event.code] =
            true;

        if (
            event.code === "Space" ||
            event.code.startsWith("Arrow")
        ) {
            event.preventDefault();
        }

        if (
            event.code === "KeyF" &&
            !event.repeat
        ) {
            toggleFlashlight();
        }

        if (
            event.code === "KeyE" &&
            !event.repeat
        ) {
            interact();
        }

        if (
            event.code === "KeyR" &&
            !event.repeat
        ) {
            rechargeFlashlight();
        }

        if (
            event.code === "Escape" &&
            !event.repeat
        ) {
            togglePause();
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

/* =========================
   FLASHLIGHT
========================= */

function toggleFlashlight() {

    if (!gameStarted) {
        return;
    }

    flashlightOn =
        !flashlightOn;

    flashlight.visible =
        flashlightOn &&
        battery > 0;

    showInteraction(
        flashlightOn
            ? "FLASHLIGHT ON"
            : "FLASHLIGHT OFF"
    );
}

function rechargeFlashlight() {

    if (!gameStarted) {
        return;
    }

    battery =
        Math.min(
            100,
            battery + 25
        );

    showInteraction(
        "Battery restored"
    );

    updateHUD();
}

/* =========================
   MOVEMENT
========================= */

const forward =
    new THREE.Vector3();

const right =
    new THREE.Vector3();

function updateMovement(delta) {

    if (
        !gameStarted ||
        paused
    ) {
        return;
    }

    let forwardInput = 0;
    let sideInput = 0;

    if (keys["KeyW"])
        forwardInput++;

    if (keys["KeyS"])
        forwardInput--;

    if (keys["KeyD"])
        sideInput++;

    if (keys["KeyA"])
        sideInput--;

    if (
        forwardInput === 0 &&
        sideInput === 0
    ) {
        return;
    }

    const length =
        Math.sqrt(
            forwardInput *
            forwardInput +
            sideInput *
            sideInput
        );

    forwardInput /=
        length;

    sideInput /=
        length;

    forward.set(
        -Math.sin(yaw),
        0,
        -Math.cos(yaw)
    );

    right.set(
        Math.cos(yaw),
        0,
        -Math.sin(yaw)
    );

    const sprinting =
        keys["ShiftLeft"] ||
        keys["ShiftRight"];

    const speed =
        sprinting
            ? SPRINT_SPEED
            : WALK_SPEED;

    camera.position.addScaledVector(
        forward,
        forwardInput *
        speed *
        delta
    );

    camera.position.addScaledVector(
        right,
        sideInput *
        speed *
        delta
    );

    camera.position.x =
        THREE.MathUtils.clamp(
            camera.position.x,
            -7.5,
            41.5
        );

    camera.position.z =
        THREE.MathUtils.clamp(
            camera.position.z,
            -128,
            82
        );

    camera.position.y =
        PLAYER_HEIGHT;
}

/* =========================
   FLASHLIGHT BATTERY
========================= */

function updateFlashlight(delta) {

    if (
        !gameStarted ||
        !flashlightOn ||
        battery <= 0
    ) {
        return;
    }

    battery -=
        delta * 0.45;

    battery =
        Math.max(
            0,
            battery
        );

    if (battery <= 0) {

        flashlightOn =
            false;

        flashlight.visible =
            false;

        showInteraction(
            "FLASHLIGHT BATTERY DEAD"
        );
    }

    updateHUD();
}
/* =========================
   GAME CLOCK
========================= */

function updateGameClock(delta) {

    if (
        !gameStarted ||
        paused
    ) {
        return;
    }

    gameMinutes +=
        delta * 60;

    if (gameMinutes >= 1440) {
        gameMinutes -= 1440;
    }

    const hour =
        Math.floor(
            gameMinutes / 60
        );

    const minute =
        Math.floor(
            gameMinutes % 60
        );

    if (
        hour === 3 &&
        minute === 17 &&
        !three17Triggered
    ) {
        trigger317();
    }

    updateTimeDisplay(
        hour,
        minute
    );
}

/* =========================
   TIME DISPLAY
========================= */

function updateTimeDisplay(
    hour,
    minute
) {

    const element =
        document.getElementById(
            "gameTime"
        );

    if (!element) {
        return;
    }

    let displayHour =
        hour % 12;

    if (displayHour === 0) {
        displayHour = 12;
    }

    const period =
        hour >= 12
            ? "PM"
            : "AM";

    element.textContent =
        `${displayHour}:${String(
            minute
        ).padStart(2, "0")} ${period}`;
}

/* =========================
   3:17 EVENT
========================= */

function trigger317() {

    three17Triggered =
        true;

    console.log(
        "THE CLOCK HAS REACHED 3:17 AM"
    );

    ambientLight.intensity =
        0.25;

    stationLight.intensity =
        0.25;

    scene.background.set(
        0x010103
    );

    scene.fog.color.set(
        0x010103
    );

    scene.fog.density =
        0.026;

    showEventMessage(
        "3:17 AM"
    );

    setTimeout(
        () => {

            showEventMessage(
                "Please remain on the platform."
            );

        },
        2500
    );

    setTimeout(
        () => {

            showObjective(
                "Something is wrong. Check the platform."
            );

        },
        6000
    );

    flickerStation();
}

/* =========================
   LIGHT FLICKER
========================= */

function flickerStation() {

    let flashes = 0;

    const interval =
        setInterval(
            () => {

                flashes++;

                ambientLight.intensity =
                    flashes % 2 === 0
                        ? 0.25
                        : 0.06;

                stationLight.intensity =
                    flashes % 2 === 0
                        ? 0.25
                        : 0.05;

                if (flashes >= 14) {

                    clearInterval(
                        interval
                    );

                    ambientLight.intensity =
                        0.2;

                    stationLight.intensity =
                        0.2;
                }

            },
            180
        );
}

/* =========================
   INTERACTION
========================= */

const raycaster =
    new THREE.Raycaster();

const interactionVector =
    new THREE.Vector2(
        0,
        0
    );

function interact() {

    if (
        !gameStarted ||
        paused
    ) {
        return;
    }

    raycaster.setFromCamera(
        interactionVector,
        camera
    );

    const hits =
        raycaster.intersectObjects(
            scene.children,
            true
        );

    if (!hits.length) {

        showInteraction(
            "Nothing to interact with."
        );

        return;
    }

    const object =
        hits[0].object;

    if (
        object.userData &&
        object.userData.isCCTV
    ) {

        const number =
            object.userData.cameraNumber;

        showEventMessage(
            `CAMERA ${number}`
        );

        showObjective(
            `CCTV ${number}: something moved.`
        );

        return;
    }

    if (
        object.name ===
        "ElectricalPanel"
    ) {

        showInteraction(
            "Electrical panel"
        );

        return;
    }

    showInteraction(
        "Nothing happens."
    );
}

/* =========================
   PAUSE
========================= */

function togglePause() {

    if (!gameStarted) {
        return;
    }

    paused =
        !paused;

    const pauseScreen =
        document.getElementById(
            "pauseScreen"
        );

    if (!pauseScreen) {
        return;
    }

    pauseScreen.classList.toggle(
        "hidden",
        !paused
    );

    if (paused) {

        if (
            document.exitPointerLock
        ) {
            document.exitPointerLock();
        }

    } else {

        tryPointerLock();
    }
}

/* =========================
   HUD
========================= */

function updateHUD() {

    const batteryElement =
        document.getElementById(
            "battery"
        );

    if (batteryElement) {

        batteryElement.textContent =
            `BATTERY ${Math.round(
                battery
            )}%`;
    }

    const mission =
        document.getElementById(
            "mission"
        );

    if (
        mission &&
        !three17Triggered
    ) {

        mission.textContent =
            "NIGHT SHIFT — 11:00 PM";
    }
}

function showObjective(text) {

    const element =
        document.getElementById(
            "objective"
        );

    if (!element) {
        return;
    }

    element.textContent =
        text;
}

function showInteraction(text) {

    const element =
        document.getElementById(
            "interaction"
        );

    if (!element) {
        return;
    }

    element.textContent =
        text;

    element.style.opacity =
        "1";

    clearTimeout(
        showInteraction.timeout
    );

    showInteraction.timeout =
        setTimeout(
            () => {

                element.style.opacity =
                    "0";

            },
            1800
        );
}

function showEventMessage(text) {

    const element =
        document.getElementById(
            "eventMessage"
        );

    if (!element) {
        return;
    }

    element.textContent =
        text;

    element.style.display =
        "block";

    clearTimeout(
        showEventMessage.timeout
    );

    showEventMessage.timeout =
        setTimeout(
            () => {

                element.style.display =
                    "none";

            },
            3500
        );
}

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

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                2
            )
        );
    }
);

/* =========================
   INITIAL HUD
========================= */

updateHUD();

/* =========================
   GAME LOOP
========================= */

function animate() {

    requestAnimationFrame(
        animate
    );

    const now =
        performance.now();

    const delta =
        Math.min(
            (now - lastFrame) / 1000,
            0.05
        );

    lastFrame =
        now;

    updateMovement(
        delta
    );

    updateFlashlight(
        delta
    );

    updateGameClock(
        delta
    );

    renderer.render(
        scene,
        camera
    );
}

animate();

console.log(
    "NIGHT SHIFT: 3:17 AM loaded successfully."
);