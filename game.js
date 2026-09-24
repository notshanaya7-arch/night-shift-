import * as THREE from "three";

let gameStarted = false;

const canvas = document.getElementById("gameCanvas");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050609);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 2, 6);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


// =========================
// LIGHTING
// =========================

const ambientLight = new THREE.AmbientLight(
    0x8899aa,
    2
);

scene.add(ambientLight);

const mainLight = new THREE.PointLight(
    0xffffff,
    80,
    30
);

mainLight.position.set(0, 5, 3);
scene.add(mainLight);


// =========================
// FLOOR
// =========================

const floorGeometry = new THREE.PlaneGeometry(50, 50);

const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x202329,
    roughness: 0.9
});

const floor = new THREE.Mesh(
    floorGeometry,
    floorMaterial
);

floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;

scene.add(floor);


// =========================
// WALLS
// =========================

const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x15171c,
    roughness: 1
});

function createWall(x, y, z, sx, sy, sz) {

    const geometry = new THREE.BoxGeometry(
        sx,
        sy,
        sz
    );

    const wall = new THREE.Mesh(
        geometry,
        wallMaterial
    );

    wall.position.set(x, y, z);

    scene.add(wall);

    return wall;
}

createWall(0, 3, -15, 30, 6, 1);
createWall(0, 3, 15, 30, 6, 1);

createWall(-15, 3, 0, 1, 6, 30);
createWall(15, 3, 0, 1, 6, 30);


// =========================
// METRO TRACKS
// =========================

const trackMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.8,
    roughness: 0.4
});

function createTrack(x) {

    const geometry = new THREE.BoxGeometry(
        0.15,
        0.1,
        30
    );

    const track = new THREE.Mesh(
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


// =========================
// PLATFORM
// =========================

const platformGeometry =
    new THREE.BoxGeometry(8, 0.4, 30);

const platformMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x303238
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


// =========================
// LIGHTS
// =========================

for (let z = -12; z <= 12; z += 6) {

    const light = new THREE.PointLight(
        0x99bbff,
        30,
        12
    );

    light.position.set(
        5,
        4,
        z
    );

    scene.add(light);

    const bulbGeometry =
        new THREE.SphereGeometry(
            0.12,
            8,
            8
        );

    const bulbMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xaaccff
        });

    const bulb =
        new THREE.Mesh(
            bulbGeometry,
            bulbMaterial
        );

    bulb.position.copy(light.position);

    scene.add(bulb);
}


// =========================
// START SHIFT
// =========================

window.addEventListener("startShift", () => {

    gameStarted = true;

    console.log("NIGHT SHIFT STARTED");

    document.body.style.cursor = "none";

});


// =========================
// KEYBOARD
// =========================

const keys = {};

window.addEventListener("keydown", (event) => {

    keys[event.key.toLowerCase()] = true;

});

window.addEventListener("keyup", (event) => {

    keys[event.key.toLowerCase()] = false;

});


// =========================
// PLAYER MOVEMENT
// =========================

function updatePlayer() {

    if (!gameStarted) return;

    const speed = 0.08;

    if (keys["w"]) {
        camera.translateZ(-speed);
    }

    if (keys["s"]) {
        camera.translateZ(speed);
    }

    if (keys["a"]) {
        camera.translateX(-speed);
    }

    if (keys["d"]) {
        camera.translateX(speed);
    }

}


// =========================
// MOUSE LOOK
// =========================

let mouseDown = false;

let lastMouseX = 0;
let lastMouseY = 0;

window.addEventListener("mousedown", () => {

    if (!gameStarted) return;

    mouseDown = true;

});

window.addEventListener("mouseup", () => {

    mouseDown = false;

});

window.addEventListener("mousemove", (event) => {

    if (!gameStarted || !mouseDown) return;

    const movementX = event.movementX ||
        event.clientX - lastMouseX;

    const movementY = event.movementY ||
        event.clientY - lastMouseY;

    camera.rotation.y -= movementX * 0.002;

    camera.rotation.x -= movementY * 0.002;

    camera.rotation.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, camera.rotation.x)
    );

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;

});


// =========================
// GAME LOOP
// =========================

function animate() {

    requestAnimationFrame(animate);

    updatePlayer();

    renderer.render(
        scene,
        camera
    );

}

animate();


// =========================
// RESIZE
// =========================

window.addEventListener("resize", () => {

    camera.aspect =
        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

});