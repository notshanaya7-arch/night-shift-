/* ============================================================
   NIGHT SHIFT: 3:17 AM
   FINAL ACTUAL RAILWAY STATION
   station.js — PART 1/3
   ============================================================ */

function buildStation(THREE) {

    const root = new THREE.Group();
    root.name = "ACTUAL_RAILWAY_STATION";

    /* ---------- MATERIALS ---------- */

    const M = (color, roughness = 0.8, metalness = 0) =>
        new THREE.MeshStandardMaterial({
            color,
            roughness,
            metalness
        });

    const concrete      = M(0x777777);
    const concreteDark  = M(0x454545);
    const concreteLight = M(0x999999);
    const floor         = M(0x55585a);
    const tile          = M(0x747474);
    const tileDark      = M(0x292b2d);
    const metal         = M(0x606467, 0.45, 0.75);
    const darkMetal     = M(0x25282a, 0.5, 0.8);
    const railMat       = M(0x777d80, 0.25, 0.9);
    const wood          = M(0x513a2c);
    const rust          = M(0x673d29);
    const yellow        = M(0xc3a400);
    const white         = M(0xd5d5d5);
    const black         = M(0x090909);
    const red           = M(0x8c1717);
    const green         = M(0x187447);

    const fluorescent = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 2.4,
        roughness: 0.25
    });

    const redGlow = new THREE.MeshStandardMaterial({
        color: 0xff2222,
        emissive: 0xff0000,
        emissiveIntensity: 2.2
    });

    /* ---------- HELPERS ---------- */

    function box(name, x, y, z, sx, sy, sz, material, parent = root) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(sx, sy, sz),
            material
        );

        mesh.name = name;
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        parent.add(mesh);
        return mesh;
    }

    function cylinder(name, x, y, z, radius, height, material, parent = root) {
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, height, 12),
            material
        );

        mesh.name = name;
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        parent.add(mesh);
        return mesh;
    }

    function pointLight(name, x, y, z, color, intensity, distance) {
        const l = new THREE.PointLight(color, intensity, distance);
        l.name = name;
        l.position.set(x, y, z);
        root.add(l);
        return l;
    }

    function textSign(name, text, x, y, z, width = 4, height = 0.9) {

        const group = new THREE.Group();
        group.name = name;

        const board = box(
            name + "_BOARD",
            x, y, z,
            width, height, 0.16,
            black,
            group
        );

        if (typeof document !== "undefined") {

            const canvas = document.createElement("canvas");
            canvas.width = 1024;
            canvas.height = 256;

            const ctx = canvas.getContext("2d");

            ctx.fillStyle = "#111111";
            ctx.fillRect(0, 0, 1024, 256);

            ctx.fillStyle = "#eeeeee";
            ctx.font = "bold 72px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text, 512, 128);

            const texture = new THREE.CanvasTexture(canvas);

            const label = new THREE.Mesh(
                new THREE.PlaneGeometry(width * 0.92, height * 0.78),
                new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true
                })
            );

            label.position.set(x, y, z - 0.1);
            group.add(label);
        }

        root.add(group);
        return group;
    }

    function fluorescentLight(x, y, z, length = 4) {

        box(
            "FLUORESCENT_TUBE",
            x, y, z,
            length, 0.12, 0.16,
            fluorescent
        );

        pointLight(
            "STATION_LIGHT",
            x, y - 0.25, z,
            0xffffff,
            1.15,
            13
        );
    }

    function railing(x, y, z, length, horizontal = true) {

        if (horizontal) {
            box("RAILING_TOP", x, y + 0.9, z, length, 0.09, 0.09, metal);
            box("RAILING_MID", x, y + 0.48, z, length, 0.07, 0.07, metal);

            for (let i = -length / 2; i <= length / 2; i += 1.8) {
                cylinder("RAILING_POST", x + i, y + 0.45, z, 0.045, 0.9, metal);
            }

        } else {

            box("RAILING_TOP", x, y + 0.9, z, 0.09, 0.09, length, metal);
            box("RAILING_MID", x, y + 0.48, z, 0.07, 0.07, length, metal);

            for (let i = -length / 2; i <= length / 2; i += 1.8) {
                cylinder("RAILING_POST", x, y + 0.45, z + i, 0.045, 0.9, metal);
            }
        }
    }

    /* ========================================================
       MAIN STATION FLOOR
       ======================================================== */

    box(
        "MAIN_FLOOR",
        0, -0.25, -5,
        40, 0.5, 118,
        floor
    );

    /* platform */

    box(
        "MAIN_PLATFORM",
        -4, 0, -5,
        15, 0.7, 112,
        concreteLight
    );

    /* yellow safety line */

    box(
        "YELLOW_PLATFORM_LINE",
        3.0, 0.39, -5,
        0.18, 0.035, 110,
        yellow
    );

    /* platform edge */

    box(
        "PLATFORM_EDGE",
        3.5, 0.15, -5,
        0.35, 0.5, 112,
        concreteDark
    );

    /* ========================================================
       TWO RAILWAY TRACKS
       ======================================================== */

    function track(centerX) {

        /* ballast */

        box(
            "TRACK_BALLAST",
            centerX, 0.02, -5,
            8, 0.12, 112,
            tileDark
        );

        /* sleepers */

        for (let z = -59; z <= 49; z += 2.1) {

            box(
                "RAILWAY_SLEEPER",
                centerX,
                0.18,
                z,
                7.2,
                0.22,
                0.38,
                wood
            );
        }

        /* rails */

        box(
            "RAIL_LEFT",
            centerX - 2.55,
            0.38,
            -5,
            0.16,
            0.22,
            112,
            railMat
        );

        box(
            "RAIL_RIGHT",
            centerX + 2.55,
            0.38,
            -5,
            0.16,
            0.22,
            112,
            railMat
        );

        /* third rail / electrical rail */

        box(
            "THIRD_RAIL",
            centerX,
            0.42,
            -5,
            0.11,
            0.2,
            112,
            darkMetal
        );
    }

    track(11);

    track(27);

    /* central safety divider */

    box(
        "TRACK_DIVIDER",
        19, 0.25, -5,
        0.4, 0.5, 112,
        concreteDark
    );

    /* ========================================================
       PILLARS
       ======================================================== */

    for (let z = -57; z <= 47; z += 13) {

        cylinder(
            "CONCRETE_SUPPORT",
            -12,
            5.0,
            z,
            0.65,
            10,
            concrete
        );

        cylinder(
            "CONCRETE_SUPPORT",
            0,
            5.0,
            z,
            0.65,
            10,
            concrete
        );

        cylinder(
            "CONCRETE_SUPPORT",
            8,
            5.0,
            z,
            0.65,
            10,
            concreteDark
        );

        cylinder(
            "CONCRETE_SUPPORT",
            19,
            5.0,
            z,
            0.65,
            10,
            concrete
        );

        cylinder(
            "CONCRETE_SUPPORT",
            35,
            5.0,
            z,
            0.65,
            10,
            concreteDark
        );
    }

    /* ========================================================
       ROOF
       ======================================================== */

    box(
        "STATION_ROOF",
        9,
        10.2,
        -5,
        49,
        0.45,
        116,
        concreteDark
    );

    /* roof beams */

    for (let z = -55; z <= 45; z += 10) {

        box(
            "ROOF_CROSS_BEAM",
            9,
            9.55,
            z,
            48,
            0.45,
            0.55,
            darkMetal
        );
    }

    /* roof pipes */

    for (let x = -7; x <= 35; x += 7) {

        box(
            "OVERHEAD_PIPE",
            x,
            9.2,
            -5,
            0.22,
            0.22,
            112,
            metal
        );
    }

    /* ========================================================
       LIGHTING
       ======================================================== */

    for (let z = -51; z <= 43; z += 9) {

        fluorescentLight(-8, 9.65, z, 4);
        fluorescentLight(5, 9.65, z, 4);
        fluorescentLight(17, 9.65, z, 4);
        fluorescentLight(30, 9.65, z, 4);
    }

    /* extra ambient illumination */

    pointLight("PLATFORM_FILL", -4, 5, 0, 0xffffff, 2.2, 32);
    pointLight("TRACK_FILL", 18, 4, -20, 0xffffff, 1.8, 28);
    pointLight("TRACK_FILL_2", 28, 4, 25, 0xffffff, 1.8, 28);

    /* red emergency lamps */

    for (let z = -50; z <= 40; z += 18) {

        box(
            "RED_EMERGENCY_LAMP",
            -13.2,
            5.8,
            z,
            0.25,
            0.4,
            0.8,
            redGlow
        );

        pointLight(
            "RED_EMERGENCY_LIGHT",
            -13,
            5.6,
            z,
            0xff2222,
            0.5,
            8
        );
    }

    /* ========================================================
       PLATFORM FURNITURE
       ======================================================== */

    for (let z = -38; z <= 35; z += 14) {

        box("BENCH_SEAT", -7, 1.05, z, 5.2, 0.22, 0.75, wood);

        box("BENCH_BACK", -7, 1.8, z + 0.25, 5.2, 1.1, 0.18, wood);

        box("BENCH_LEG", -8.8, 0.55, z, 0.15, 1, metal);
        box("BENCH_LEG", -5.2, 0.55, z, 0.15, 1, metal);
    }

    /* bins */

    for (let z = -28; z <= 30; z += 29) {

        box("TRASH_BIN", -1.2, 0.75, z, 0.8, 1.5, 0.8, darkMetal);
    }

    /* station signs */

    textSign("PLATFORM_SIGN", "PLATFORM 02", -6, 6.8, 39, 5, 1);
    textSign("TRACK_SIGN", "TRACK 01", 10, 6.8, 35, 4, 0.9);
    textSign("EXIT_SIGN", "EXIT", -8, 6.8, 8, 3, 0.9);

    /* platform railing */

    railing(-12.2, 0.3, -5, 108, false);

    return root;
}
/* ============================================================
   NIGHT SHIFT: 3:17 AM
   station.js — PART 2/3
   ============================================================ */

/* ============================================================
   ADDITIONAL STATION ROOMS
   ============================================================ */

function buildStationRooms(THREE, root) {

    const M = (color, roughness = 0.8, metalness = 0) =>
        new THREE.MeshStandardMaterial({
            color,
            roughness,
            metalness
        });

    const concrete = M(0x777777);
    const dark = M(0x303234);
    const floor = M(0x505254);
    const metal = M(0x5d6265, 0.4, 0.75);
    const black = M(0x080808);
    const glass = new THREE.MeshStandardMaterial({
        color: 0x8caeb8,
        transparent: true,
        opacity: 0.3
    });

    const fluorescent = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 2.5
    });

    function box(name, x, y, z, sx, sy, sz, material, parent = root) {

        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(sx, sy, sz),
            material
        );

        mesh.name = name;
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        parent.add(mesh);
        return mesh;
    }

    function light(x, y, z, intensity = 1.2) {

        const l = new THREE.PointLight(
            0xffffff,
            intensity,
            14
        );

        l.position.set(x, y, z);
        root.add(l);
    }

    function tube(x, y, z, sx = 4) {

        box(
            "HALL_FLUORESCENT",
            x, y, z,
            sx, 0.12, 0.18,
            fluorescent
        );

        light(x, y - 0.25, z, 1.1);
    }

    /* ========================================================
       TICKET HALL
       ======================================================== */

    const hall = new THREE.Group();
    hall.name = "TICKET_HALL";
    root.add(hall);

    box(
        "TICKET_HALL_FLOOR",
        -7, 0.05, 61,
        23, 0.35, 24,
        floor,
        hall
    );

    /* walls */

    box(
        "HALL_BACK_WALL",
        -7, 4, 73,
        23, 8, 0.5,
        concrete,
        hall
    );

    box(
        "HALL_LEFT_WALL",
        -18.2, 4, 61,
        0.5, 8, 24,
        concrete,
        hall
    );

    box(
        "HALL_RIGHT_WALL",
        4.2, 4, 61,
        0.5, 8, 24,
        concrete,
        hall
    );

    /* roof */

    box(
        "HALL_ROOF",
        -7, 8.2, 61,
        23, 0.45, 24,
        dark,
        hall
    );

    /* ticket counters */

    for (let i = 0; i < 4; i++) {

        const x = -15 + i * 4.5;

        box(
            "TICKET_COUNTER",
            x, 1.5, 68,
            3.8, 2.8, 1,
            dark,
            hall
        );

        box(
            "TICKET_WINDOW",
            x, 3.1, 67.45,
            2.6, 1.4, 0.12,
            glass,
            hall
        );
    }

    /* turnstiles */

    for (let i = 0; i < 4; i++) {

        const x = -14 + i * 3.7;

        box(
            "TURNSTILE_BASE",
            x, 0.8, 55,
            1.2, 1.6, 0.65,
            metal,
            hall
        );

        box(
            "TURNSTILE_ARM",
            x, 1.35, 54.45,
            0.08, 0.08, 1.5,
            metal,
            hall
        );
    }

    tube(-12, 7.5, 55, 4);
    tube(-3, 7.5, 55, 4);
    tube(-12, 7.5, 66, 4);
    tube(-3, 7.5, 66, 4);

    light(-8, 5, 61, 1.5);

    /* signs */

    function simpleSign(text, x, y, z, w = 4) {

        const board = box(
            "SIGN_" + text,
            x, y, z,
            w, 0.9, 0.15,
            black,
            hall
        );

        if (typeof document !== "undefined") {

            const c = document.createElement("canvas");
            c.width = 512;
            c.height = 128;

            const ctx = c.getContext("2d");
            ctx.fillStyle = "#111";
            ctx.fillRect(0, 0, 512, 128);

            ctx.fillStyle = "#fff";
            ctx.font = "bold 55px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text, 256, 64);

            const tex = new THREE.CanvasTexture(c);

            const label = new THREE.Mesh(
                new THREE.PlaneGeometry(w * 0.9, 0.65),
                new THREE.MeshBasicMaterial({
                    map: tex,
                    transparent: true
                })
            );

            label.position.set(x, y, z - 0.1);
            hall.add(label);
        }

        return board;
    }

    simpleSign("TICKETS", -12, 6.1, 72, 5);
    simpleSign("WAITING HALL", -3, 6.1, 72, 6);
    simpleSign("LAST SERVICE 22:40", -7, 4.5, 55, 6);

    /* ========================================================
       WAITING ROOM
       ======================================================== */

    const waiting = new THREE.Group();
    waiting.name = "WAITING_ROOM";
    root.add(waiting);

    box(
        "WAITING_FLOOR",
        11, 0.1, 61,
        12, 0.3, 22,
        floor,
        waiting
    );

    box(
        "WAITING_BACK",
        11, 4, 72,
        12, 8, 0.5,
        concrete,
        waiting
    );

    box(
        "WAITING_RIGHT",
        17, 4, 61,
        0.5, 8, 22,
        concrete,
        waiting
    );

    box(
        "WAITING_ROOF",
        11, 8, 61,
        12, 0.4, 22,
        dark,
        waiting
    );

    for (let z = 55; z <= 67; z += 6) {

        box(
            "WAITING_BENCH",
            11, 1, z,
            8, 0.25, 0.8,
            metal,
            waiting
        );
    }

    tube(11, 7.4, 56, 5);
    tube(11, 7.4, 66, 5);

    light(11, 5, 61, 1.6);

    /* ========================================================
       STAIRS TO FOOTBRIDGE
       ======================================================== */

    function stairs(x, y, z, direction = 1) {

        const stairGroup = new THREE.Group();
        stairGroup.name = "FOOTBRIDGE_STAIRS";
        root.add(stairGroup);

        for (let i = 0; i < 12; i++) {

            const step = new THREE.Mesh(
                new THREE.BoxGeometry(4.5, 0.35, 1.1),
                concrete
            );

            step.position.set(
                x,
                y + i * 0.32,
                z + i * 0.72 * direction
            );

            step.castShadow = true;
            step.receiveShadow = true;

            stairGroup.add(step);
        }

        /* side rails */

        for (const side of [-2.25, 2.25]) {

            const rail = new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.1,
                    0.1,
                    11
                ),
                metal
            );

            rail.position.set(
                x + side,
                y + 3.5,
                z + 4 * direction
            );

            stairGroup.add(rail);
        }
    }

    stairs(-2, 0.3, 46, -1);

    stairs(-2, 0.3, -38, 1);

    /* ========================================================
       FOOTBRIDGE
       ======================================================== */

    box(
        "FOOTBRIDGE_FLOOR",
        -2,
        7,
        -2,
        8,
        0.5,
        42,
        concrete
    );

    box(
        "FOOTBRIDGE_LEFT",
        -6,
        8,
        -2,
        0.15,
        2,
        42,
        metal
    );

    box(
        "FOOTBRIDGE_RIGHT",
        2,
        8,
        -2,
        0.15,
        2,
        42,
        metal
    );

    /* bridge lights */

    for (let z = -18; z <= 14; z += 8) {
        tube(-2, 8.4, z, 3);
    }

    /* ========================================================
       SECURITY / CCTV ROOM
       ======================================================== */

    const security = new THREE.Group();
    security.name = "SECURITY_ROOM";
    root.add(security);

    box(
        "SECURITY_FLOOR",
        -12,
        0.1,
        29,
        8,
        0.3,
        12,
        floor,
        security
    );

    box(
        "SECURITY_BACK",
        -12,
        3.5,
        35,
        8,
        7,
        0.4,
        concrete,
        security
    );

    box(
        "SECURITY_LEFT",
        -16,
        3.5,
        29,
        0.4,
        7,
        12,
        concrete,
        security
    );

    box(
        "SECURITY_ROOF",
        -12,
        7,
        29,
        8,
        0.4,
        12,
        dark,
        security
    );

    /* CCTV desk */

    box(
        "CCTV_DESK",
        -12,
        1.1,
        32,
        6,
        1.1,
        1.2,
        dark,
        security
    );

    /* 12 monitors */

    for (let row = 0; row < 3; row++) {

        for (let col = 0; col < 4; col++) {

            const x = -14.4 + col * 1.6;
            const y = 2.5 + row * 1.25;

            const screen = new THREE.Mesh(
                new THREE.BoxGeometry(1.35, 0.9, 0.12),
                new THREE.MeshStandardMaterial({
                    color: 0x111b20,
                    emissive: 0x13262c,
                    emissiveIntensity: 0.7
                })
            );

            screen.position.set(x, y, 34.35);

            screen.userData.isCCTV = true;
            screen.userData.cameraNumber = row * 4 + col + 1;

            security.add(screen);
        }
    }

    tube(-12, 6.3, 28, 4);

    light(-12, 4.5, 29, 1.5);

    /* security sign */

    box(
        "SECURITY_SIGN",
        -12,
        6,
        34.5,
        5,
        0.9,
        0.15,
        black,
        security
    );

    /* ========================================================
       SERVICE DOOR
       ======================================================== */

    const serviceDoor = box(
        "MAINTENANCE_DOOR",
        3.7,
        2.3,
        29,
        0.25,
        4.5,
        2.4,
        dark,
        root
    );

    serviceDoor.userData.interactable = true;
    serviceDoor.userData.type = "maintenance_door";

    return root;
}
/* ============================================================
   NIGHT SHIFT: 3:17 AM
   station.js — PART 3/3
   ============================================================ */

function finishStation(THREE, root) {

    const M = (color, roughness = 0.8, metalness = 0) =>
        new THREE.MeshStandardMaterial({
            color,
            roughness,
            metalness
        });

    const concrete = M(0x666666);
    const dark = M(0x252729);
    const floor = M(0x484b4d);
    const metal = M(0x575c5f, 0.45, 0.75);
    const rust = M(0x673d29);
    const red = new THREE.MeshStandardMaterial({
        color: 0xff2222,
        emissive: 0xff0000,
        emissiveIntensity: 2
    });

    function box(name, x, y, z, sx, sy, sz, material, parent = root) {

        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(sx, sy, sz),
            material
        );

        mesh.name = name;
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        parent.add(mesh);
        return mesh;
    }

    function cylinder(name, x, y, z, radius, height, material, parent = root) {

        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, height, 12),
            material
        );

        mesh.name = name;
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        parent.add(mesh);
        return mesh;
    }

    function light(x, y, z, color = 0xffffff, intensity = 1.2, distance = 12) {

        const l = new THREE.PointLight(
            color,
            intensity,
            distance
        );

        l.position.set(x, y, z);
        root.add(l);

        return l;
    }

    /* ========================================================
       MAINTENANCE AREA
       ======================================================== */

    const maintenance = new THREE.Group();
    maintenance.name = "MAINTENANCE_AREA";
    root.add(maintenance);

    box(
        "MAINTENANCE_FLOOR",
        11,
        0.1,
        -48,
        12,
        0.3,
        20,
        floor,
        maintenance
    );

    box(
        "MAINTENANCE_BACK",
        11,
        4,
        -58,
        12,
        8,
        0.5,
        concrete,
        maintenance
    );

    box(
        "MAINTENANCE_LEFT",
        5,
        4,
        -48,
        0.5,
        8,
        20,
        concrete,
        maintenance
    );

    box(
        "MAINTENANCE_RIGHT",
        17,
        4,
        -48,
        0.5,
        8,
        20,
        concrete,
        maintenance
    );

    box(
        "MAINTENANCE_ROOF",
        11,
        8,
        -48,
        12,
        0.45,
        20,
        dark,
        maintenance
    );

    /* electrical cabinets */

    for (let i = 0; i < 4; i++) {

        const cabinet = box(
            "ELECTRICAL_CABINET_" + i,
            7.3 + i * 2.5,
            2.2,
            -55,
            1.8,
            4.2,
            0.7,
            dark,
            maintenance
        );

        cabinet.userData.interactable = true;
        cabinet.userData.type = "electrical_cabinet";
    }

    /* MAIN ELECTRICAL PANEL */

    const panel = box(
        "MAIN_ELECTRICAL_PANEL",
        14,
        2.3,
        -43,
        2.2,
        4.5,
        0.35,
        metal,
        maintenance
    );

    panel.userData.interactable = true;
    panel.userData.type = "electrical_panel";

    /* warning lights */

    for (let i = 0; i < 4; i++) {

        cylinder(
            "PANEL_WARNING_LIGHT",
            13.35 + i * 0.4,
            3.2,
            -42.78,
            0.08,
            0.12,
            red,
            maintenance
        );
    }

    /* work table */

    box(
        "WORK_TABLE",
        9,
        1.2,
        -49,
        5,
        0.3,
        2,
        metal,
        maintenance
    );

    /* tools */

    for (let i = 0; i < 5; i++) {

        cylinder(
            "TOOL",
            7.3 + i * 0.7,
            1.55,
            -49,
            0.06,
            0.5,
            rust,
            maintenance
        );
    }

    light(8, 5.5, -48, 0xffffff, 1.4, 14);
    light(14, 5.5, -48, 0xffffff, 1.4, 14);

    /* pipes */

    for (let x = 6; x <= 16; x += 2) {

        box(
            "MAINTENANCE_PIPE",
            x,
            6.7,
            -48,
            0.18,
            0.18,
            18,
            metal,
            maintenance
        );
    }

    /* ========================================================
       LOWER SERVICE CORRIDOR
       ======================================================== */

    box(
        "LOWER_SERVICE_FLOOR",
        0,
        -0.3,
        -77,
        18,
        0.4,
        38,
        floor
    );

    box(
        "LOWER_LEFT_WALL",
        -9,
        3,
        -77,
        0.5,
        6,
        38,
        concrete
    );

    box(
        "LOWER_RIGHT_WALL",
        9,
        3,
        -77,
        0.5,
        6,
        38,
        concrete
    );

    box(
        "LOWER_CEILING",
        0,
        6.2,
        -77,
        18,
        0.4,
        38,
        dark
    );

    /* corridor lights */

    for (let z = -61; z >= -93; z -= 7) {

        box(
            "LOWER_LIGHT",
            0,
            5.8,
            z,
            3.5,
            0.12,
            0.15,
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 1.8
            })
        );

        light(0, 5, z, 0xffffff, 1.0, 11);
    }

    /* cables */

    for (let x = -6; x <= 6; x += 2) {

        box(
            "LOWER_CABLE",
            x,
            5.2,
            -77,
            0.1,
            0.1,
            36,
            metal
        );
    }

    /* ========================================================
       DEEP TUNNEL
       ======================================================== */

    box(
        "DEEP_TUNNEL_FLOOR",
        0,
        -0.2,
        -111,
        16,
        0.4,
        35,
        floor
    );

    box(
        "DEEP_TUNNEL_LEFT",
        -8,
        3,
        -111,
        0.5,
        6,
        35,
        concrete
    );

    box(
        "DEEP_TUNNEL_RIGHT",
        8,
        3,
        -111,
        0.5,
        6,
        35,
        concrete
    );

    box(
        "DEEP_TUNNEL_TOP",
        0,
        6,
        -111,
        16,
        0.5,
        35,
        dark
    );

    /* tunnel ribs */

    for (let z = -96; z >= -126; z -= 4) {

        box(
            "TUNNEL_RIB_LEFT",
            -7.5,
            3,
            z,
            0.3,
            6,
            0.35,
            metal
        );

        box(
            "TUNNEL_RIB_RIGHT",
            7.5,
            3,
            z,
            0.3,
            6,
            0.35,
            metal
        );

        box(
            "TUNNEL_RIB_TOP",
            0,
            6,
            z,
            15,
            0.3,
            0.35,
            metal
        );
    }

    for (let z = -98; z >= -126; z -= 7) {

        box(
            "TUNNEL_LIGHT",
            0,
            5.5,
            z,
            2.8,
            0.12,
            0.15,
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 1.5
            })
        );

        light(0, 4.8, z, 0xffffff, 0.8, 9);
    }

    /* end gate */

    const gate = box(
        "LINE_CLOSED_GATE",
        0,
        3,
        -127,
        14,
        6,
        0.4,
        metal
    );

    gate.userData.interactable = true;
    gate.userData.type = "story_gate";

    /* ========================================================
       HORROR SET PIECES
       ======================================================== */

    function passenger(name, x, y, z) {

        const figure = new THREE.Group();
        figure.name = name;

        const body = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.38, 1.4, 6, 10),
            new THREE.MeshStandardMaterial({
                color: 0x111111,
                roughness: 1
            })
        );

        body.position.y = 1.25;

        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.32, 12, 12),
            new THREE.MeshStandardMaterial({
                color: 0x090909,
                roughness: 1
            })
        );

        head.position.y = 2.25;

        figure.add(body);
        figure.add(head);

        figure.position.set(x, y, z);

        figure.userData.horrorSetPiece = true;
        figure.userData.entity = "THE_PASSENGER";

        root.add(figure);

        return figure;
    }

    passenger("PASSENGER_PLATFORM", -5, 0, -20);

    passenger("PASSENGER_TUNNEL", 3, 0, -103);

    passenger("PASSENGER_TRACK", 27, 0, 17);

    /* ========================================================
       BROKEN EQUIPMENT / CLUTTER
       ======================================================== */

    for (let i = 0; i < 15; i++) {

        const x = -11 + (i % 5) * 4;
        const z = -52 + Math.floor(i / 5) * 4;

        box(
            "STATION_DEBRIS",
            x,
            0.35,
            z,
            0.7 + (i % 3) * 0.2,
            0.7,
            0.7,
            i % 2 ? metal : rust
        );
    }

    /* ========================================================
       3:17 FINAL ROOM
       ======================================================== */

    const finalRoom = new THREE.Group();
    finalRoom.name = "THREE_SEVENTEEN_ROOM";
    root.add(finalRoom);

    box(
        "FINAL_ROOM_FLOOR",
        0,
        0,
        -136,
        14,
        0.4,
        14,
        floor,
        finalRoom
    );

    box(
        "FINAL_ROOM_BACK",
        0,
        4,
        -143,
        14,
        8,
        0.5,
        concrete,
        finalRoom
    );

    box(
        "FINAL_ROOM_LEFT",
        -7,
        4,
        -136,
        0.5,
        8,
        14,
        concrete,
        finalRoom
    );

    box(
        "FINAL_ROOM_RIGHT",
        7,
        4,
        -136,
        0.5,
        8,
        14,
        concrete,
        finalRoom
    );

    box(
        "FINAL_ROOM_LIGHT",
        0,
        7,
        -136,
        5,
        0.12,
        0.15,
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 2.5
        }),
        finalRoom
    );

    light(0, 5, -136, 0xffffff, 1.8, 14);

    /* 3:17 sign */

    if (typeof document !== "undefined") {

        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 256;

        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#050505";
        ctx.fillRect(0, 0, 512, 256);

        ctx.fillStyle = "#ff2222";
        ctx.font = "bold 110px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("3:17", 256, 128);

        const texture = new THREE.CanvasTexture(canvas);

        const sign = new THREE.Mesh(
            new THREE.PlaneGeometry(5, 2.5),
            new THREE.MeshBasicMaterial({
                map: texture
            })
        );

        sign.position.set(0, 4, -142.65);
        finalRoom.add(sign);
    }

    /* ========================================================
       STORY OBJECTS
       ======================================================== */

    const storyDesk = box(
        "STORY_DESK",
        0,
        1,
        -132,
        4,
        1.6,
        1.5,
        dark,
        finalRoom
    );

    const oldRadio = box(
        "OLD_RADIO",
        0,
        2,
        -132.5,
        1.4,
        0.7,
        0.7,
        metal,
        finalRoom
    );

    oldRadio.userData.interactable = true;
    oldRadio.userData.type = "radio";

    /* ========================================================
       STORY GATES
       ======================================================== */

    const gate1 = box(
        "STORY_GATE_1",
        -4,
        2,
        45,
        3,
        4,
        0.3,
        metal
    );

    gate1.userData.interactable = true;
    gate1.userData.type = "story_gate";

    const gate2 = box(
        "STORY_GATE_2",
        5,
        2,
        -35,
        3,
        4,
        0.3,
        metal
    );

    gate2.userData.interactable = true;
    gate2.userData.type = "story_gate";

    /* ========================================================
       FINAL STATION DATA
       ======================================================== */

    root.userData.stationName = "NIGHT SHIFT METRO TERMINAL";
    root.userData.mainCharacter = "ETHAN COLE";

    return {
        root,

        /* starting position */
        spawn: new THREE.Vector3(-7, 2, 30),

        /* playable area */
        bounds: {
            minX: -18,
            maxX: 38,
            minZ: -143,
            maxZ: 74
        },

        /* important locations */
        locations: {

            platform:
                new THREE.Vector3(-7, 2, 10),

            ticketHall:
                new THREE.Vector3(-7, 2, 61),

            waitingRoom:
                new THREE.Vector3(11, 2, 61),

            security:
                new THREE.Vector3(-12, 2, 29),

            maintenance:
                new THREE.Vector3(11, 2, -48),

            lowerLevel:
                new THREE.Vector3(0, 2, -77),

            deepTunnel:
                new THREE.Vector3(0, 2, -111),

            finalRoom:
                new THREE.Vector3(0, 2, -136)
        }
    };
}


/* ============================================================
   FINAL BUILDER
   ============================================================ */

function createStation(THREE) {

    const result = buildStation(THREE);

    buildStationRooms(THREE, result);

    finishStation(THREE, result);

    return result;
}