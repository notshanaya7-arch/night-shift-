// ============================================================
// NIGHT SHIFT: 3:17 AM
// S1 — LARGE METRO STATION
// ============================================================

import * as THREE from "three";

export function createStation(scene) {
    const station = new THREE.Group();
    station.name = "NightShiftStation";
    scene.add(station);

    // --------------------------------------------------------
    // MATERIALS
    // --------------------------------------------------------

    const concrete = new THREE.MeshStandardMaterial({
        color: 0x383b40,
        roughness: 0.95
    });

    const darkConcrete = new THREE.MeshStandardMaterial({
        color: 0x202329,
        roughness: 1
    });

    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x565960,
        roughness: 0.9
    });

    const tileMat = new THREE.MeshStandardMaterial({
        color: 0x73767b,
        roughness: 0.75
    });

    const blackMat = new THREE.MeshStandardMaterial({
        color: 0x111317,
        roughness: 0.9
    });

    const metalMat = new THREE.MeshStandardMaterial({
        color: 0x4d5259,
        metalness: 0.75,
        roughness: 0.35
    });

    const yellowMat = new THREE.MeshStandardMaterial({
        color: 0xb59b32,
        roughness: 0.7
    });

    const redMat = new THREE.MeshStandardMaterial({
        color: 0x761d1d,
        roughness: 0.8
    });

    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x15252a,
        transparent: true,
        opacity: 0.45,
        roughness: 0.15,
        metalness: 0.2
    });

    const whiteMat = new THREE.MeshStandardMaterial({
        color: 0xbfc3c7,
        roughness: 0.8
    });

    // --------------------------------------------------------
    // HELPERS
    // --------------------------------------------------------

    function box(
        x, y, z,
        sx, sy, sz,
        material = concrete,
        parent = station
    ) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(sx, sy, sz),
            material
        );

        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        parent.add(mesh);
        return mesh;
    }

    function cylinder(
        x, y, z,
        radius,
        height,
        material = metalMat,
        parent = station
    ) {
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, height, 16),
            material
        );

        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        parent.add(mesh);
        return mesh;
    }

    function textSign(text, x, y, z, rotationY = 0) {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 128;

        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#111111";
        ctx.fillRect(0, 0, 512, 128);

        ctx.fillStyle = "#dddddd";
        ctx.font = "bold 48px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 256, 64);

        const texture = new THREE.CanvasTexture(canvas);

        const material = new THREE.MeshBasicMaterial({
            map: texture
        });

        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(4.5, 1.1),
            material
        );

        mesh.position.set(x, y, z);
        mesh.rotation.y = rotationY;

        station.add(mesh);

        return mesh;
    }

    function ceilingLight(x, y, z) {
        const fixture = box(
            x,
            y,
            z,
            2.8,
            0.12,
            0.35,
            whiteMat
        );

        const light = new THREE.PointLight(
            0xffffff,
            1.4,
            18
        );

        light.position.set(x, y - 0.1, z);
        light.castShadow = true;

        station.add(light);

        fixture.userData.light = light;

        return fixture;
    }

    function bench(x, y, z, rotation = 0) {
        const group = new THREE.Group();

        const seat = box(
            0,
            0.9,
            0,
            3.5,
            0.18,
            0.65,
            metalMat,
            group
        );

        const back = box(
            0,
            1.55,
            0.25,
            3.5,
            1.1,
            0.12,
            metalMat,
            group
        );

        for (const px of [-1.35, 0, 1.35]) {
            box(
                px,
                0.45,
                0,
                0.12,
                0.9,
                0.12,
                metalMat,
                group
            );
        }

        group.position.set(x, y, z);
        group.rotation.y = rotation;

        station.add(group);

        return group;
    }

    function trashBin(x, y, z) {
        cylinder(
            x,
            y + 0.55,
            z,
            0.35,
            1.1,
            blackMat
        );

        box(
            x,
            y + 1.15,
            z,
            0.5,
            0.12,
            0.5,
            metalMat
        );
    }

    function pillar(x, y, z) {
        cylinder(
            x,
            y + 2.8,
            z,
            0.42,
            5.6,
            concrete
        );

        box(
            x,
            y + 5.55,
            z,
            1.2,
            0.35,
            1.2,
            darkConcrete
        );
    }

    // ========================================================
    // MAIN PLATFORM
    // ========================================================

    // Platform 1
    box(
        0,
        -0.5,
        -20,
        20,
        1,
        100,
        floorMat
    );

    // Platform 2
    box(
        28,
        -0.5,
        -20,
        16,
        1,
        100,
        floorMat
    );

    // Track trench
    box(
        14,
        -1.2,
        -20,
        12,
        0.5,
        100,
        blackMat
    );

    // --------------------------------------------------------
    // RAILS
    // --------------------------------------------------------

    for (const x of [11, 17]) {
        box(
            x,
            -0.7,
            -20,
            0.18,
            0.18,
            100,
            metalMat
        );
    }

    for (let z = -68; z <= 28; z += 2.2) {
        box(
            14,
            -0.9,
            z,
            8,
            0.15,
            0.22,
            metalMat
        );
    }

    // --------------------------------------------------------
    // PLATFORM EDGE
    // --------------------------------------------------------

    box(
        8.9,
        0.05,
        -20,
        0.35,
        0.15,
        100,
        yellowMat
    );

    box(
        35.9,
        0.05,
        -20,
        0.35,
        0.15,
        100,
        yellowMat
    );

    // ========================================================
    // WALLS / CEILING
    // ========================================================

    box(
        -10,
        4,
        -20,
        1,
        9,
        110,
        darkConcrete
    );

    box(
        44,
        4,
        -20,
        1,
        9,
        110,
        darkConcrete
    );

    box(
        17,
        9,
        -20,
        56,
        0.5,
        110,
        darkConcrete
    );

    // Back wall
    box(
        17,
        4,
        35,
        56,
        9,
        1,
        concrete
    );

    // ========================================================
    // PILLARS
    // ========================================================

    for (let z = 27; z >= -66; z -= 12) {
        pillar(3, 0, z);
        pillar(32, 0, z);
    }

    // ========================================================
    // CEILING LIGHTS
    // ========================================================

    for (let z = 27; z >= -65; z -= 9) {
        ceilingLight(2, 8.5, z);
        ceilingLight(32, 8.5, z);
    }

    // ========================================================
    // BENCHES
    // ========================================================

    bench(-2, 0, 18, Math.PI / 2);
    bench(-2, 0, 4, Math.PI / 2);
    bench(-2, 0, -12, Math.PI / 2);
    bench(-2, 0, -30, Math.PI / 2);
    bench(38, 0, 12, -Math.PI / 2);
    bench(38, 0, -8, -Math.PI / 2);
    bench(38, 0, -28, -Math.PI / 2);

    // Trash bins
    trashBin(5, 0, 18);
    trashBin(5, 0, -18);
    trashBin(36, 0, 5);
    trashBin(36, 0, -35);

    // ========================================================
    // STATION SIGNS
    // ========================================================

    textSign(
        "PLATFORM 1",
        -5,
        4.8,
        -8,
        Math.PI / 2
    );

    textSign(
        "PLATFORM 2",
        39,
        4.8,
        -8,
        -Math.PI / 2
    );

    textSign(
        "LAST TRAIN",
        3,
        4.5,
        25
    );

    // ========================================================
    // TICKET HALL
    // ========================================================

    const hallZ = 58;

    // Floor
    box(
        17,
        -0.5,
        hallZ,
        56,
        1,
        42,
        tileMat
    );

    // Walls
    box(
        -10,
        4,
        hallZ,
        1,
        9,
        42,
        concrete
    );

    box(
        44,
        4,
        hallZ,
        1,
        9,
        42,
        concrete
    );

    box(
        17,
        4,
        79,
        56,
        9,
        1,
        concrete
    );

    box(
        17,
        9,
        hallZ,
        56,
        0.5,
        42,
        darkConcrete
    );

    // Hall pillars
    for (let x = -5; x <= 39; x += 11) {
        pillar(x, 0, 50);
        pillar(x, 0, 67);
    }

    // Hall lights
    for (let x = -3; x <= 37; x += 10) {
        ceilingLight(x, 8.5, 48);
        ceilingLight(x, 8.5, 65);
        ceilingLight(x, 8.5, 75);
    }

    // ========================================================
    // TICKET BOOTHS
    // ========================================================

    for (let x = -4; x <= 28; x += 8) {
        box(
            x,
            1.3,
            70,
            5.5,
            2.6,
            1.2,
            darkConcrete
        );

        box(
            x,
            2.4,
            69.3,
            4.5,
            1,
            0.1,
            glassMat
        );
    }

    textSign(
        "TICKETS",
        17,
        5.5,
        76
    );

    // ========================================================
    // TURNSTILES
    // ========================================================

    for (let x = -2; x <= 34; x += 4) {
        box(
            x,
            0.7,
            45,
            1.2,
            1.4,
            1,
            metalMat
        );

        box(
            x,
            1.5,
            45,
            0.12,
            0.8,
            1.8,
            glassMat
        );
    }

    // ========================================================
    // STAIRCASE
    // ========================================================

    function staircase(x, z) {
        for (let i = 0; i < 12; i++) {
            box(
                x,
                i * 0.22,
                z + i * 0.65,
                7,
                0.44,
                0.7,
                concrete
            );
        }

        box(
            x,
            3,
            z + 4,
            7.5,
            0.15,
            8.5,
            metalMat
        );
    }

    staircase(-3, 50);
    staircase(37, 50);

    textSign(
        "EXIT",
        -3,
        5,
        48,
        Math.PI / 2
    );

    // ========================================================
    // VENDING MACHINES
    // ========================================================

    function vendingMachine(x, z) {
        box(
            x,
            1.8,
            z,
            1.5,
            3.6,
            0.7,
            blackMat
        );

        box(
            x,
            2,
            z - 0.38,
            1.15,
            1.8,
            0.04,
            glassMat
        );

        box(
            x,
            0.65,
            z - 0.4,
            1.15,
            0.35,
            0.05,
            redMat
        );
    }

    vendingMachine(37, 65);
    vendingMachine(34, 65);

    // ========================================================
    // SECURITY ROOM
    // ========================================================

    const security = new THREE.Group();
    security.name = "SecurityRoom";
    station.add(security);

    // Room located on side of ticket hall
    box(
        -5,
        3,
        60,
        9,
        6,
        13,
        darkConcrete,
        security
    );

    // Door opening look
    box(
        -5,
        2.5,
        53.3,
        3,
        5,
        0.3,
        blackMat,
        security
    );

    textSign(
        "SECURITY",
        -5,
        5,
        53
    );

    // CCTV monitors
    for (let i = 0; i < 12; i++) {
        const row = Math.floor(i / 4);
        const col = i % 4;

        const monitor = box(
            -8 + col * 2,
            3.5 - row * 2,
            61,
            1.5,
            1,
            0.25,
            blackMat,
            security
        );

        monitor.userData.cameraNumber = i + 1;
        monitor.userData.isCCTV = true;
    }

    // Security desk
    box(
        -5,
        1,
        66,
        7,
        1.8,
        2.5,
        darkConcrete,
        security
    );

    // ========================================================
    // MAINTENANCE AREA
    // ========================================================

    const maintenanceZ = -78;

    // Tunnel entrance walls
    box(
        -6,
        3,
        maintenanceZ,
        5,
        6,
        20,
        darkConcrete
    );

    box(
        37,
        3,
        maintenanceZ,
        5,
        6,
        20,
        darkConcrete
    );

    // Tunnel ceiling
    box(
        15.5,
        7,
        maintenanceZ,
        38,
        1,
        20,
        darkConcrete
    );

    // Tunnel floor
    box(
        15.5,
        -0.5,
        maintenanceZ,
        38,
        1,
        20,
        darkConcrete
    );

    // Maintenance corridor lights
    for (let z = -72; z >= -86; z -= 5) {
        ceilingLight(15, 6.5, z);
    }

    textSign(
        "MAINTENANCE",
        15,
        4.5,
        -70
    );

    // ========================================================
    // ELECTRICAL ROOM
    // ========================================================

    box(
        6,
        2.5,
        -72,
        10,
        5,
        7,
        darkConcrete
    );

    box(
        6,
        2,
        -68.4,
        5,
        4,
        0.3,
        metalMat
    );

    // Electrical panels
    for (let x = 3.5; x <= 8.5; x += 1.5) {
        box(
            x,
            2.2,
            -68.1,
            1,
            3,
            0.2,
            blackMat
        );
    }

    textSign(
        "ELECTRICAL",
        6,
        5.2,
        -68
    );

    // ========================================================
    // STORAGE ROOM
    // ========================================================

    box(
        34,
        2.5,
        -72,
        10,
        5,
        7,
        darkConcrete
    );

    // Storage shelves
    for (let z = -74; z >= -76; z -= 2) {
        box(
            34,
            2.5,
            z,
            7,
            4.5,
            0.25,
            metalMat
        );
    }

    textSign(
        "STORAGE",
        34,
        5.2,
        -68
    );

    // ========================================================
    // TUNNEL BEYOND
    // ========================================================

    box(
        15.5,
        4,
        -100,
        38,
        9,
        1,
        blackMat
    );

    box(
        -3,
        4,
        -100,
        1,
        9,
        45,
        blackMat
    );

    box(
        34,
        4,
        -100,
        1,
        9,
        45,
        blackMat
    );

    // Tunnel lights
    for (let z = -90; z >= -130; z -= 10) {
        ceilingLight(15, 7.5, z);
    }

    // ========================================================
    // WARNING SIGNS
    // ========================================================

    for (let z = 20; z >= -60; z -= 20) {
        textSign(
            "⚠ DANGER",
            8.2,
            2.5,
            z,
            Math.PI / 2
        );
    }

    // ========================================================
    // INVISIBLE BOUNDARIES
    // ========================================================

    // These are intentionally invisible walls.
    // They prevent the player from walking outside the map.

    const invisible = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0
    });

    box(
        -14,
        4,
        -20,
        1,
        10,
        140,
        invisible
    );

    box(
        48,
        4,
        -20,
        1,
        10,
        140,
        invisible
    );

    box(
        17,
        4,
        88,
        65,
        10,
        1,
        invisible
    );

    box(
        17,
        4,
        -140,
        65,
        10,
        1,
        invisible
    );

    // ========================================================
    // RETURN OBJECT
    // ========================================================

    return {
        station,
        materials: {
            concrete,
            darkConcrete,
            floorMat,
            tileMat,
            metalMat,
            yellowMat,
            redMat,
            glassMat
        }
    };
}