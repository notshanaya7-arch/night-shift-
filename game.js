import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/PointerLockControls.js";

const canvas = document.getElementById("gameCanvas");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050608);
scene.fog = new THREE.FogExp2(0x050608, 0.035);


/* =========================
   CAMERA
========================= */

const camera = new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.1,
    1000
);

camera.position.set(0, 1.7, 12);


/* =========================
   RENDERER
========================= */

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
});

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;


/* =========================
   LIGHTING
========================= */

const ambient = new THREE.AmbientLight(
    0x6b7280,
    0.18
);

scene.add(ambient);


/* =========================
   MATERIALS
========================= */

const concrete = new THREE.MeshStandardMaterial({
    color: 0x292b2d,
    roughness: 0.95
});

const darkConcrete = new THREE.MeshStandardMaterial({
    color: 0x17191b,
    roughness: 1
});

const metal = new THREE.MeshStandardMaterial({
    color: 0x55585a,
    metalness: 0.8,
    roughness: 0.35
});

const yellow = new THREE.MeshStandardMaterial({
    color: 0xb08b19,
    roughness: 0.8
});

const glass = new THREE.MeshStandardMaterial({
    color: 0x26343b,
    transparent: true,
    opacity: 0.45
});


/* =========================
   HELPER
========================= */

function box(
    x,
    y,
    z,
    w,
    h,
    d,
    material
) {

    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        material
    );

    mesh.position.set(x, y, z);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);

    return mesh;
}


/* =========================
   FLOOR
========================= */

box(
    0,
    -0.1,
    0,
    18,
    0.2,
    60,
    concrete
);


/* =========================
   PLATFORM
========================= */

box(
    0,
    0.15,
    5,
    16,
    0.3,
    25,
    concrete
);


/* Platform edge */

box(
    0,
    0.28,
    -7.5,
    16,
    0.15,
    0.45,
    yellow
);


/* =========================
   WALLS
========================= */

box(
    -8.5,
    3,
    0,
    0.5,
    6,
    60,
    darkConcrete
);

box(
    8.5,
    3,
    0,
    0.5,
    6,
    60,
    darkConcrete
);


/* Back tunnel */

box(
    0,
    3,
    -30,
    17,
    6,
    0.5,
    darkConcrete
);


/* =========================
   CEILING
========================= */

box(
    0,
    6,
    0,
    17,
    0.4,
    60,
    darkConcrete
);


/* =========================
   RAILWAY TRACKS
========================= */

function createRail(z) {

    box(
        0,
        0.05,
        z,
        60,
        0.08,
        0.08,
        metal
    );

    /* sleepers */

    for (
        let x = -28;
        x < 29;
        x += 1.2
    ) {

        box(
            x,
            0,
            z,
            0.35,
            0.12,
            1.8,
            darkConcrete
        );

    }
}


createRail(-10);
createRail(-12);


/* =========================
   PILLARS
========================= */

for (
    let z = 15;
    z >= -25;
    z -= 5
) {

    box(
        -5,
        2.8,
        z,
        0.55,
        5.6,
        0.55,
        concrete
    );

    box(
        5,
        2.8,
        z,
        0.55,
        5.6,
        0.55,
        concrete
    );
}


/* =========================
   CEILING LIGHT
========================= */

function ceilingLight(z, flicker = false) {

    const light = new THREE.PointLight(
        0xd9e8ff,
        2,
        9
    );

    light.position.set(
        0,
        5.6,
        z
    );

    light.castShadow = true;

    scene.add(light);


    const lamp = new THREE.Mesh(
        new THREE.BoxGeometry(
            2.4,
            0.08,
            0.18
        ),
        new THREE.MeshBasicMaterial({
            color: 0xe9f4ff
        })
    );

    lamp.position.copy(light.position);

    scene.add(lamp);


    if (flicker) {

        setInterval(() => {

            light.visible =
                Math.random() > 0.25;

            lamp.visible =
                light.visible;

        }, 120 + Math.random() * 300);

    }
}


ceilingLight(15);
ceilingLight(10, true);
ceilingLight(5);
ceilingLight(0, true);
ceilingLight(-5);
ceilingLight(-10, true);
ceilingLight(-15);
ceilingLight(-20, true);


/* =========================
   BENCH
========================= */

function bench(x, z) {

    box(
        x,
        1,
        z,
        2.5,
        0.18,
        0.55,
        metal
    );

    box(
        x - 0.9,
        0.5,
        z,
        0.15,
        1,
        0.15,
        metal
    );

    box(
        x + 0.9,
        0.5,
        z,
        0.15,
        1,
        0.15,
        metal
    );
}


bench(-6, 12);
bench(6, 7);
bench(-6, 0);


/* =========================
   METRO SIGN
========================= */

function sign(text, x, y, z) {

    const canvas = document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 128;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, 512, 128);

    ctx.fillStyle = "#eeeeee";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(text, 256, 64);

    const texture =
        new THREE.CanvasTexture(canvas);

    const material =
        new THREE.MeshBasicMaterial({
            map: texture
        });

    const signMesh =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                4,
                1
            ),
            material
        );

    signMesh.position.set(
        x,
        y,
        z
    );

    scene.add(signMesh);
}


sign(
    "PLATFORM 2",
    0,
    3.5,
    -6
);


/* =========================
   TICKET MACHINE
========================= */

function ticketMachine(x, z) {

    box(
        x,
        1.2,
        z,
        0.8,
        2.2,
        0.45,
        metal
    );

    box(
        x,
        1.55,
        z - 0.24,
        0.55,
        0.35,
        0.03,
        glass
    );
}


ticketMachine(-6, 18);
ticketMachine(-6, 14);


/* =========================
   MAINTENANCE DOOR
========================= */

box(
    6,
    2,
    -5,
    2.5,
    4,
    0.2,
    metal
);

sign(
    "MAINTENANCE",
    6,
    4.5,
    -4.8
);


/* =========================
   FLASHLIGHT
========================= */

const flashlight =
    new THREE.SpotLight(
        0xffffff,
        12,
        35,
        Math.PI / 7,
        0.5,
        1
    );

flashlight.castShadow = true;

scene.add(flashlight);
scene.add(flashlight.target);

let flashlightOn = true;


/* =========================
   FIRST PERSON
========================= */

const controls =
    new PointerLockControls(
        camera,
        document.body
    );

document
    .getElementById("startButton")
    .addEventListener("click", () => {

        controls.lock();

    });

controls.addEventListener(
    "lock",
    () => {

        document.getElementById(
            "startScreen"
        ).style.display = "none";

    }
);

controls.addEventListener(
    "unlock",
    () => {

        document.getElementById(
            "pauseScreen"
        ).style.display = "flex";

    }
);


/* =========================
   MOVEMENT
========================= */

const keys = {};

document.addEventListener(
    "keydown",
    e => {

        keys[e.code] = true;

        if (e.code === "KeyF") {

            flashlightOn =
                !flashlightOn;

            flashlight.visible =
                flashlightOn;

        }

    }
);

document.addEventListener(
    "keyup",
    e => {

        keys[e.code] = false;

    }
);


document
    .getElementById("resumeButton")
    .addEventListener("click", () => {

        controls.lock();

    });


/* =========================
   GAME LOOP
========================= */

const clock =
    new THREE.Clock();


function update() {

    requestAnimationFrame(update);

    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    if (controls.isLocked) {

        const speed =
            keys["ShiftLeft"]
                ? 7
                : 3.5;


        if (keys["KeyW"])
            controls.moveForward(
                speed * delta
            );

        if (keys["KeyS"])
            controls.moveForward(
                -speed * delta
            );

        if (keys["KeyA"])
            controls.moveRight(
                -speed * delta
            );

        if (keys["KeyD"])
            controls.moveRight(
                speed * delta
            );


        /* Station boundaries */

        camera.position.x =
            THREE.MathUtils.clamp(
                camera.position.x,
                -7.5,
                7.5
            );

        camera.position.z =
            THREE.MathUtils.clamp(
                camera.position.z,
                -28,
                22
            );

    }


    /* Flashlight follows camera */

    flashlight.position.copy(
        camera.position
    );

    const direction =
        new THREE.Vector3();

    camera.getWorldDirection(
        direction
    );

    flashlight.target.position.copy(
        camera.position
    );

    flashlight.target.position.add(
        direction.multiplyScalar(10)
    );


    renderer.render(
        scene,
        camera
    );
}


update();


/* =========================
   RESIZE
========================= */

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            innerWidth / innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            innerWidth,
            innerHeight
        );

    }
);