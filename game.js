import * as THREE from "three";

/* =========================================================
   NIGHT SHIFT: 3:17 AM
   Main character: Ethan Cole
   ========================================================= */

let scene, camera, renderer;
let flashlight;
let gameStarted = false;
let locked = false;

let keys = {};
let battery = 100;
let gameMinutes = 23 * 60; // 11:00 PM
let event317Triggered = false;
let passenger;
let ghostTrain;
let trainActive = false;

const clock = new THREE.Clock();

const player = {
    speed: 3.5,
    sprint: 6.5,
    height: 1.7
};

const interactables = [];

/* =========================================================
   START
   ========================================================= */

window.addEventListener("startShift", () => {
    if (gameStarted) return;

    gameStarted = true;

    initGame();

    // Pointer lock must happen after the START SHIFT click.
    if (renderer.domElement.requestPointerLock) {
        renderer.domElement.requestPointerLock();
    }
});

/* =========================================================
   INIT
   ========================================================= */

function initGame() {

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x020306);
    scene.fog = new THREE.FogExp2(0x020306, 0.045);

    /* CAMERA */

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.05,
        150
    );

    camera.position.set(0, player.height, 5);

    /* RENDERER */

    renderer = new THREE.WebGLRenderer({
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

    document.body.appendChild(renderer.domElement);

    /* LIGHTING */

    const ambient = new THREE.HemisphereLight(
        0x5c6680,
        0x050505,
        0.25
    );

    scene.add(ambient);

    const moon = new THREE.DirectionalLight(
        0x8a9bbd,
        0.35
    );

    moon.position.set(10, 15, 5);
    moon.castShadow = true;

    scene.add(moon);

    /* FLASHLIGHT */

    flashlight = new THREE.SpotLight(
        0xffffff,
        4,
        22,
        Math.PI / 7,
        0.55,
        1.2
    );

    flashlight.position.set(0, 0, 0);
    flashlight.castShadow = true;

    camera.add(flashlight);

    scene.add(camera);

    /* STATION */

    createStation();

    /* SECURITY ROOM */

    createSecurityRoom();

    /* GHOST TRAIN */

    createGhostTrain();

    /* PASSENGER */

    createPassenger();

    /* EVENTS */

    createElectricalPanel();
    createDoor();

    /* INPUT */

    setupInput();

    /* RESIZE */

    window.addEventListener(
        "resize",
        onResize
    );

    /* LOOP */

    animate();

    updateObjective(
        "Check the electrical panel."
    );
}

/* =========================================================
   MATERIALS
   ========================================================= */

const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x191b1f,
    roughness: 0.95
});

const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x24262b,
    roughness: 0.9
});

const concreteMaterial = new THREE.MeshStandardMaterial({
    color: 0x303238,
    roughness: 1
});

const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0x15171a,
    metalness: 0.7,
    roughness: 0.45
});

const yellowMaterial = new THREE.MeshStandardMaterial({
    color: 0x7c6b22,
    roughness: 0.8
});

const redMaterial = new THREE.MeshStandardMaterial({
    color: 0x551111,
    emissive: 0x220000
});

/* =========================================================
   BASIC BOX
   ========================================================= */

function box(
    x,
    y,
    z,
    sx,
    sy,
    sz,
    material,
    cast = true
) {

    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(sx, sy, sz),
        material
    );

    mesh.position.set(x, y, z);

    mesh.castShadow = cast;
    mesh.receiveShadow = true;

    scene.add(mesh);

    return mesh;
}

/* =========================================================
   STATION
   ========================================================= */

function createStation() {

    /* FLOOR */

    box(
        0,
        -0.1,
        0,
        22,
        0.2,
        70,
        floorMaterial,
        false
    );

    /* CEILING */

    box(
        0,
        5,
        0,
        22,
        0.3,
        70,
        concreteMaterial,
        false
    );

    /* SIDE WALLS */

    box(
        -11,
        2.5,
        0,
        0.5,
        5,
        70,
        wallMaterial
    );

    box(
        11,
        2.5,
        0,
        0.5,
        5,
        70,
        wallMaterial
    );

    /* BACK WALL */

    box(
        0,
        2.5,
        -35,
        22,
        5,
        0.5,
        wallMaterial
    );

    /* PLATFORM EDGES */

    box(
        -5.5,
        0.05,
        -2,
        0.15,
        0.12,
        64,
        yellowMaterial,
        false
    );

    box(
        5.5,
        0.05,
        -2,
        0.15,
        0.12,
        64,
        yellowMaterial,
        false
    );

    /* TRACKS */

    box(
        -2,
        -0.12,
        -2,
        0.15,
        0.08,
        64,
        metalMaterial,
        false
    );

    box(
        2,
        -0.12,
        -2,
        0.15,
        0.08,
        64,
        metalMaterial,
        false
    );

    /* SLEEPERS */

    for (let z = -32; z < 31; z += 2) {

        box(
            0,
            -0.15,
            z,
            6,
            0.12,
            0.25,
            metalMaterial,
            false
        );
    }

    /* COLUMNS */

    for (let z = -30; z <= 28; z += 8) {

        box(
            -7,
            2.3,
            z,
            0.7,
            4.6,
            0.7,
            concreteMaterial
        );

        box(
            7,
            2.3,
            z,
            0.7,
            4.6,
            0.7,
            concreteMaterial
        );
    }

    /* CEILING LIGHTS */

    for (let z = -28; z <= 28; z += 7) {

        const light = new THREE.PointLight(
            0xffe6bd,
            1.0,
            10
        );

        light.position.set(
            0,
            4.5,
            z
        );

        scene.add(light);

        box(
            0,
            4.82,
            z,
            2.5,
            0.08,
            0.35,
            new THREE.MeshStandardMaterial({
                color: 0xd8d8d8,
                emissive: 0xffffff,
                emissiveIntensity: 0.5
            }),
            false
        );
    }

    /* BENCHES */

    for (let z = -20; z <= 20; z += 10) {

        box(
            4,
            0.8,
            z,
            3,
            0.15,
            0.6,
            metalMaterial
        );

        box(
            3,
            0.4,
            z,
            0.12,
            0.8,
            0.12,
            metalMaterial
        );

        box(
            5,
            0.4,
            z,
            0.12,
            0.8,
            0.12,
            metalMaterial
        );
    }

    /* WARNING SIGNS */

    for (let z = -25; z <= 25; z += 12) {

        box(
            -10.7,
            2.2,
            z,
            0.05,
            1.2,
            1.5,
            redMaterial,
            false
        );
    }
}

/* =========================================================
   SECURITY ROOM
   ========================================================= */

function createSecurityRoom() {

    const x = -7.5;
    const z = -25;

    /* BACK WALL */

    box(
        x,
        2.5,
        z - 3,
        6,
        5,
        0.3,
        wallMaterial
    );

    /* SIDE WALL */

    box(
        x - 3,
        2.5,
        z,
        0.3,
        5,
        6,
        wallMaterial
    );

    /* OTHER SIDE */

    box(
        x + 3,
        2.5,
        z,
        0.3,
        5,
        6,
        wallMaterial
    );

    /* SIGN */

    const signMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x222222,
            emissive: 0x330000,
            emissiveIntensity: 0.6
        });

    box(
        x,
        4.1,
        z - 2.8,
        3,
        0.7,
        0.08,
        signMaterial,
        false
    );

    /* DESK */

    box(
        x,
        0.8,
        z + 0.7,
        4,
        0.15,
        1.5,
        metalMaterial
    );

    /* CCTV MONITORS */

    for (let i = 0; i < 12; i++) {

        const row = Math.floor(i / 4);
        const col = i % 4;

        const monitor = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.9,
                0.6,
                0.08
            ),
            new THREE.MeshStandardMaterial({
                color: 0x071010,
                emissive: 0x001f20,
                emissiveIntensity: 0.5
            })
        );

        monitor.position.set(
            x - 1.5 + col,
            1.35 + row * 0.75,
            z - 0.05
        );

        scene.add(monitor);
    }

    /* CCTV LIGHT */

    const cctvLight =
        new THREE.PointLight(
            0x00ffff,
            0.5,
            5
        );

    cctvLight.position.set(
        x,
        2,
        z
    );

    scene.add(cctvLight);
}

/* =========================================================
   ELECTRICAL PANEL
   ========================================================= */

function createElectricalPanel() {

    const panel = box(
        -8.8,
        1.8,
        -10,
        0.1,
        1.8,
        1.4,
        metalMaterial
    );

    panel.userData.type = "panel";
    panel.userData.used = false;

    interactables.push(panel);
}

/* =========================================================
   DOOR
   ========================================================= */

function createDoor() {

    const door = box(
        -7.5,
        1.5,
        -21.8,
        2.5,
        3,
        0.25,
        metalMaterial
    );

    door.userData.type = "door";
    door.userData.open = false;

    interactables.push(door);
}

/* =========================================================
   GHOST TRAIN
   ========================================================= */

function createGhostTrain() {

    ghostTrain = new THREE.Group();

    ghostTrain.visible = false;

    const trainBody =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                8,
                3,
                18
            ),
            new THREE.MeshStandardMaterial({
                color: 0x15191d,
                metalness: 0.5,
                roughness: 0.7
            })
        );

    trainBody.position.y = 1.6;

    ghostTrain.add(trainBody);

    /* WINDOWS */

    for (let z = -7; z <= 7; z += 3.5) {

        const windowMesh =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    5.5,
                    1.1,
                    0.08
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x05080b,
                    emissive: 0x020607
                })
            );

        windowMesh.position.set(
            0,
            2.0,
            z
        );

        ghostTrain.add(windowMesh);
    }

    /* HEADLIGHT */

    const trainLight =
        new THREE.PointLight(
            0xffdddd,
            5,
            20
        );

    trainLight.position.set(
        0,
        2,
        9
    );

    ghostTrain.add(trainLight);

    ghostTrain.position.set(
        0,
        0,
        -28
    );

    scene.add(ghostTrain);
}

/* =========================================================
   PASSENGER
   ========================================================= */

function createPassenger() {

    passenger = new THREE.Group();

    passenger.visible = false;

    const bodyMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x050505,
            roughness: 1
        });

    const body =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.35,
                0.55,
                1.7,
                12
            ),
            bodyMaterial
        );

    body.position.y = 1;

    passenger.add(body);

    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.32,
                16,
                16
            ),
            bodyMaterial
        );

    head.position.y = 2.05;

    passenger.add(head);

    passenger.position.set(
        0,
        0,
        -18
    );

    scene.add(passenger);
}

/* =========================================================
   INPUT
   ========================================================= */

function setupInput() {

    window.addEventListener(
        "keydown",
        e => {

            keys[e.code] = true;

            /* FLASHLIGHT */

            if (
                e.code === "KeyF" &&
                gameStarted
            ) {

                flashlight.visible =
                    !flashlight.visible;
            }

            /* RECHARGE */

            if (
                e.code === "KeyR" &&
                gameStarted
            ) {

                battery = Math.min(
                    100,
                    battery + 20
                );
            }

            /* INTERACT */

            if (
                e.code === "KeyE" &&
                gameStarted
            ) {

                interact();
            }

            /* PAUSE */

            if (
                e.code === "Escape" &&
                gameStarted
            ) {

                if (
                    document.pointerLockElement
                ) {
                    document.exitPointerLock();
                }
            }
        }
    );

    window.addEventListener(
        "keyup",
        e => {
            keys[e.code] = false;
        }
    );

    /* MOUSE LOOK */

    document.addEventListener(
        "mousemove",
        e => {

            if (
                !gameStarted ||
                !document.pointerLockElement
            ) {
                return;
            }

            camera.rotation.y -=
                e.movementX * 0.002;

            camera.rotation.x -=
                e.movementY * 0.002;

            camera.rotation.x =
                THREE.MathUtils.clamp(
                    camera.rotation.x,
                    -Math.PI / 2,
                    Math.PI / 2
                );
        }
    );

    renderer?.domElement.addEventListener(
        "click",
        () => {

            if (
                gameStarted &&
                renderer.domElement.requestPointerLock
            ) {
                renderer.domElement.requestPointerLock();
            }
        }
    );
}

/* =========================================================
   MOVEMENT
   ========================================================= */

function updatePlayer(delta) {

    if (
        !gameStarted ||
        !document.pointerLockElement
    ) {
        return;
    }

    const direction =
        new THREE.Vector3();

    if (keys["KeyW"]) {
        direction.z -= 1;
    }

    if (keys["KeyS"]) {
        direction.z += 1;
    }

    if (keys["KeyA"]) {
        direction.x -= 1;
    }

    if (keys["KeyD"]) {
        direction.x += 1;
    }

    if (direction.lengthSq() === 0) {
        return;
    }

    direction.normalize();

    const speed =
        keys["ShiftLeft"] ||
        keys["ShiftRight"]
            ? player.sprint
            : player.speed;

    direction.applyEuler(
        new THREE.Euler(
            0,
            camera.rotation.y,
            0
        )
    );

    camera.position.addScaledVector(
        direction,
        speed * delta
    );

    /* KEEP PLAYER INSIDE STATION */

    camera.position.x =
        THREE.MathUtils.clamp(
            camera.position.x,
            -9.5,
            9.5
        );

    camera.position.z =
        THREE.MathUtils.clamp(
            camera.position.z,
            -32,
            30
        );

    camera.position.y =
        player.height;
}

/* =========================================================
   FLASHLIGHT
   ========================================================= */

function updateFlashlight(delta) {

    if (
        !flashlight ||
        !flashlight.visible
    ) {
        return;
    }

    battery -= delta * 0.7;

    battery =
        Math.max(0, battery);

    if (battery <= 0) {
        flashlight.visible = false;
    }

    updateBattery();
}

/* =========================================================
   GAME CLOCK
   ========================================================= */

function updateGameClock(delta) {

    if (!gameStarted) return;

    /*
       1 real second = 1 game minute
    */

    gameMinutes += delta;

    gameMinutes %= 1440;

    const hours =
        Math.floor(gameMinutes / 60);

    const minutes =
        Math.floor(gameMinutes % 60);

    const timeText =
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    const timeElement =
        document.getElementById("time");

    if (timeElement) {
        timeElement.textContent =
            timeText;
    }

    if (
        !event317Triggered &&
        Math.floor(gameMinutes) === 197
    ) {
        trigger317();
    }
}

/* =========================================================
   3:17 EVENT
   ========================================================= */

function trigger317() {

    event317Triggered = true;

    showEvent(
        "03:17 AM\n\nTHE STATION HAS CHANGED."
    );

    /* DARKEN STATION */

    scene.traverse(
        object => {

            if (
                object.isPointLight &&
                object !== flashlight
            ) {
                object.userData.oldIntensity =
                    object.intensity;

                object.intensity *= 0.08;
            }
        }
    );

    scene.fog.color.set(0x000000);
    scene.fog.density = 0.07;

    scene.background.set(0x000000);

    /* GHOST TRAIN */

    setTimeout(
        () => {

            ghostTrain.visible = true;
            trainActive = true;

            showEvent(
                "A TRAIN IS APPROACHING..."
            );

            ghostTrain.position.z = -35;

            const trainTimer =
                setInterval(
                    () => {

                        ghostTrain.position.z +=
                            0.45;

                        if (
                            ghostTrain.position.z >
                            -4
                        ) {

                            clearInterval(
                                trainTimer
                            );

                            showEvent(
                                "PLEASE REMAIN ON THE PLATFORM."
                            );

                            passenger.visible = true;

                            setTimeout(
                                () => {
                                    showEvent(
                                        "27 PASSENGERS WERE NEVER FOUND."
                                    );
                                },
                                3500
                            );
                        }

                    },
                    50
                );

        },
        3500
    );

    /* PASSENGER APPEARS */

    setTimeout(
        () => {

            passenger.visible = true;

            passenger.position.set(
                0,
                0,
                -10
            );

        },
        7000
    );

       /* FLICKERING */

    flickerLights();
}

/* =========================================================
   LIGHT FLICKER
   ========================================================= */

function flickerLights() {

    let count = 0;

    const flickerTimer = setInterval(() => {

        scene.traverse(object => {

            if (
                object.isPointLight &&
                object !== flashlight
            ) {
                object.visible =
                    !object.visible;
            }
        });

        count++;

        if (count >= 16) {

            clearInterval(flickerTimer);

            scene.traverse(object => {

                if (
                    object.isPointLight &&
                    object !== flashlight
                ) {
                    object.visible = true;
                }
            });
        }

    }, 180);
}

/* =========================================================
   INTERACTION
   ========================================================= */

function interact() {

    if (!gameStarted) return;

    const raycaster = new THREE.Raycaster();

    raycaster.setFromCamera(
        new THREE.Vector2(0, 0),
        camera
    );

    const hits =
        raycaster.intersectObjects(
            interactables,
            true
        );

    if (
        hits.length === 0 ||
        hits[0].distance > 3
    ) {
        return;
    }

    const object = hits[0].object;

    /* ELECTRICAL PANEL */

    if (object.userData.type === "panel") {

        if (!object.userData.used) {

            object.userData.used = true;

            showEvent(
                "ELECTRICAL SYSTEM RESTORED."
            );

            updateObjective(
                "Find the security room."
            );
        }

        return;
    }

    /* DOOR */

    if (object.userData.type === "door") {

        if (!object.userData.open) {

            object.userData.open = true;

            object.rotation.y =
                Math.PI / 2;

            showEvent(
                "MAINTENANCE DOOR OPENED."
            );

            updateObjective(
                "Investigate the underground tunnels."
            );
        }

        return;
    }
}

/* =========================================================
   UI
   ========================================================= */

function updateObjective(text) {

    const objective =
        document.getElementById("objective");

    if (objective) {
        objective.textContent = text;
    }
}

function updateBattery() {

    const batteryElement =
        document.getElementById("battery");

    if (batteryElement) {

        batteryElement.textContent =
            `BATTERY ${Math.round(battery)}%`;
    }
}

function showEvent(text) {

    const event =
        document.getElementById("eventMessage");

    if (!event) return;

    event.textContent = text;

    event.style.display = "block";

    clearTimeout(window.eventTimeout);

    window.eventTimeout = setTimeout(() => {

        event.style.display = "none";

    }, 4000);
}

/* =========================================================
   INTERACTION PROMPT
   ========================================================= */

function updateInteractionPrompt() {

    const prompt =
        document.getElementById("interaction");

    if (!prompt) return;

    const raycaster =
        new THREE.Raycaster();

    raycaster.setFromCamera(
        new THREE.Vector2(0, 0),
        camera
    );

    const hits =
        raycaster.intersectObjects(
            interactables,
            true
        );

    if (
        hits.length > 0 &&
        hits[0].distance < 3
    ) {

        prompt.textContent =
            "E — INTERACT";

        prompt.style.display =
            "block";

    } else {

        prompt.style.display =
            "none";
    }
}

/* =========================================================
   ANIMATION LOOP
   ========================================================= */

function animate() {

    requestAnimationFrame(animate);

    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );

    if (gameStarted) {

        updatePlayer(delta);

        updateFlashlight(delta);

        updateGameClock(delta);

        updateInteractionPrompt();

        /* Passenger watches the player */

        if (
            passenger &&
            passenger.visible
        ) {

            passenger.lookAt(
                camera.position.x,
                1.5,
                camera.position.z
            );
        }

        /* Slight train movement */

        if (
            trainActive &&
            ghostTrain
        ) {

            ghostTrain.rotation.y =
                Math.sin(
                    performance.now() * 0.0005
                ) * 0.005;
        }
    }

    renderer.render(
        scene,
        camera
    );
}

/* =========================================================
   RESIZE
   ========================================================= */

function onResize() {

    if (!camera || !renderer) {
        return;
    }

    camera.aspect =
        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
}