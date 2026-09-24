import * as THREE from "three";

export function createStation(scene) {
    const root = new THREE.Group();
    root.name = "NightShift_RealisticMetro";
    scene.add(root);

    // ================= MATERIALS =================

    function mat(color, roughness=0.85, metalness=0.05) {
        return new THREE.MeshStandardMaterial({
            color,
            roughness,
            metalness
        });
    }

    const mats = {
        concrete: mat(0x4b4d4e,0.98),
        concrete2: mat(0x36383a,1),
        darkConcrete: mat(0x242628,1),
        floor: mat(0x303234,0.95),
        tile: mat(0x55585a,0.88),
        tileDark: mat(0x202224,0.98),
        metal: mat(0x4c5154,0.72,0.55),
        darkMetal: mat(0x17191a,0.92,0.35),
        rust: mat(0x49352d,0.96,0.18),
        yellow: mat(0xb19a43,0.72,0.1),
        black: mat(0x080909,1),
        rubber: mat(0x111213,1),

        glass: new THREE.MeshStandardMaterial({
            color:0x263036,
            roughness:0.2,
            metalness:0.25,
            transparent:true,
            opacity:0.52
        }),

        dirtyGlass: new THREE.MeshStandardMaterial({
            color:0x384044,
            roughness:0.5,
            metalness:0.15,
            transparent:true,
            opacity:0.38
        }),

        red: mat(0x651c1c,0.75),
        green: mat(0x263d34,0.85),
        white: mat(0xd0d0c7,0.7)
    };

    // ================= HELPERS =================

    function box(name,x,y,z,sx,sy,sz,material,cast=false) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(sx,sy,sz),
            material
        );

        mesh.name = name;
        mesh.position.set(x,y,z);
        mesh.castShadow = cast;
        mesh.receiveShadow = true;

        root.add(mesh);
        return mesh;
    }

    function cyl(name,x,y,z,radius,height,material,rotX=0,rotZ=0) {
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radius,radius,height,12),
            material
        );

        mesh.name = name;
        mesh.position.set(x,y,z);
        mesh.rotation.x = rotX;
        mesh.rotation.z = rotZ;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        root.add(mesh);
        return mesh;
    }

    function beam(name,x,y,z,sx,sy,sz,material=mats.metal) {
        return box(name,x,y,z,sx,sy,sz,material,true);
    }

    function pointLight(name,x,y,z,intensity,color,distance) {
        const l = new THREE.PointLight(
            color,
            intensity,
            distance,
            2
        );

        l.name = name;
        l.position.set(x,y,z);
        l.castShadow = false;

        root.add(l);
        return l;
    }

    function fluorescent(x,y,z,length=4.5,broken=false) {

        box(
            "FluorescentTube",
            x,y,z,
            length,0.09,0.18,
            mats.white
        );

        const l = pointLight(
            "FluorescentLight",
            x,y-0.15,z,
            broken ? 0.18 : 1.55,
            0xdde7eb,
            13
        );

        if(broken) {
            l.userData.flicker = true;
            l.userData.base = 0.18;
        }

        return l;
    }

    function textSprite(text,x,y,z,scale=0.65,color="#c7c7bd") {

        const canvas = document.createElement("canvas");

        canvas.width = 512;
        canvas.height = 128;

        const ctx = canvas.getContext("2d");

        ctx.clearRect(0,0,512,128);

        ctx.font = "bold 38px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = color;

        ctx.fillText(text,256,64);

        const texture = new THREE.CanvasTexture(canvas);

        texture.colorSpace = THREE.SRGBColorSpace;

        const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map:texture,
                transparent:true,
                depthWrite:false
            })
        );

        sprite.position.set(x,y,z);
        sprite.scale.set(scale*4,scale,1);

        root.add(sprite);

        return sprite;
    }

    function railingRun(x,y,z,length,alongX=true,height=1.15) {

        const railMat = mats.darkMetal;

        const count = Math.max(
            2,
            Math.floor(length/2.4)+1
        );

        if(alongX) {

            beam(
                "RailTop",
                x,y+height,z,
                length,0.11,0.11,
                railMat
            );

            beam(
                "RailMid",
                x,y+height*0.5,z,
                length,0.07,0.07,
                railMat
            );

            for(let i=0;i<count;i++) {

                const px =
                    x-length/2+
                    (length/(count-1))*i;

                cyl(
                    "RailPost",
                    px,
                    y+height/2,
                    z,
                    0.055,
                    height,
                    railMat
                );
            }

        } else {

            beam(
                "RailTop",
                x,y+height,z,
                0.11,0.11,length,
                railMat
            );

            beam(
                "RailMid",
                x,y+height*0.5,z,
                0.07,0.07,length,
                railMat
            );

            for(let i=0;i<count;i++) {

                const pz =
                    z-length/2+
                    (length/(count-1))*i;

                cyl(
                    "RailPost",
                    x,
                    y+height/2,
                    pz,
                    0.055,
                    height,
                    railMat
                );
            }
        }
    }

    function stairFlight(x,y,z,steps,width,direction=1) {

        for(let i=0;i<steps;i++) {

            box(
                "ConcreteStep",
                x,
                y+i*0.28,
                z+direction*i*0.62,
                width,
                0.32,
                0.72,
                mats.concrete
            );
        }

        const total = steps*0.62;

        railingRun(
            x-width/2-0.22,
            y,
            z+direction*(total/2),
            total+1,
            false,
            1.1
        );

        railingRun(
            x+width/2+0.22,
            y,
            z+direction*(total/2),
            total+1,
            false,
            1.1
        );
    }

    // ================= MAIN STATION =================

    box(
        "MainFloor",
        18,-0.25,-5,
        48,0.5,150,
        mats.floor
    );

    box(
        "MainCeiling",
        18,10.5,-5,
        48,0.35,150,
        mats.darkConcrete
    );

    box(
        "LeftStructuralWall",
        -6.5,5,-5,
        0.65,10,150,
        mats.darkConcrete
    );

    box(
        "RightStructuralWall",
        42.5,5,-5,
        0.65,10,150,
        mats.darkConcrete
    );

    // OVERHEAD STRUCTURE

    for(let z=-72;z<=62;z+=8) {

        beam(
            "CeilingCrossBeam",
            18,9.9,z,
            47,0.45,0.5,
            mats.darkMetal
        );
    }

    // COLUMNS

    for(let z=-68;z<=58;z+=9) {

        beam(
            "ColumnL",
            3.5,4.8,z,
            0.8,9.6,0.8,
            mats.concrete2
        );

        beam(
            "ColumnR",
            32.5,4.8,z,
            0.8,9.6,0.8,
            mats.concrete2
        );

        box(
            "ColumnCollar",
            3.5,7.4,z,
            1.05,0.18,1.05,
            mats.metal
        );

        box(
            "ColumnCollar",
            32.5,7.4,z,
            1.05,0.18,1.05,
            mats.metal
        );
    }

    // ================= PLATFORM =================

    box(
        "Platform",
        18,0.1,-6,
        27,0.45,112,
        mats.tile
    );

    box(
        "SafetyLine",
        30.6,0.36,-6,
        0.22,0.08,112,
        mats.yellow
    );

    // ================= TRACK =================

    box(
        "TrackTrench",
        37.2,-0.55,-6,
        7.5,0.65,112,
        mats.black
    );

    box(
        "GravelBed",
        37.2,-0.16,-6,
        6.8,0.25,112,
        mats.rubber
    );

    for(let z=-59;z<=47;z+=2.2) {

        box(
            "RailSleeper",
            37.2,0.03,z,
            6.5,0.18,0.35,
            mats.rust
        );
    }

    box(
        "Rail1",
        35.5,0.25,-6,
        0.13,0.16,112,
        mats.metal
    );

    box(
        "Rail2",
        39,0.25,-6,
        0.13,0.16,112,
        mats.metal
    );

    box(
        "ThirdRail",
        41,0.16,-6,
        0.12,0.12,112,
        mats.darkMetal
    );

    // ================= BENCHES =================

    for(let z=-48;z<=40;z+=18) {

        box(
            "BenchSeat",
            19,1.35,z,
            5.8,0.22,0.8,
            mats.metal,
            true
        );

        box(
            "BenchBack",
            19,2.1,z+0.28,
            5.8,1,0.16,
            mats.metal,
            true
        );

        for(let x=17;x<=21;x+=2) {

            box(
                "BenchLeg",
                x,0.72,z,
                0.16,1.2,0.16,
                mats.darkMetal
            );
        }
    }

    // ================= RAILINGS =================

    railingRun(
        4.8,0.2,-32,
        16,false
    );

    railingRun(
        4.8,0.2,18,
        14,false
    );

    // ================= STAIRS =================

    stairFlight(
        9,-0.1,-48,
        12,5.5,-1
    );

    stairFlight(
        27,-0.1,42,
        11,5.2,1
    );

    railingRun(
        27,3,49,
        8,true
    );

    railingRun(
        27,3,35,
        8,true
    );

    // ================= LIGHTS =================

    for(let z=-66;z<=60;z+=9) {

        fluorescent(
            18,9.65,z,
            5.5,
            z%27===0
        );
    }

    for(let z=-58;z<=52;z+=14) {

        fluorescent(
            7,7.2,z,
            3.2,
            z%28===0
        );
    }

    // ================= RED EMERGENCY LIGHTS =================

    for(const z of [-60,-31,-3,24,51]) {

        box(
            "EmergencyLamp",
            2.8,3.1,z,
            0.2,0.75,1.1,
            mats.red
        );

        pointLight(
            "RedEmergencyGlow",
            3.1,3,z,
            0.35,
            0xff2222,
            7
        );
    }

    // ================= OVERHEAD PIPES =================

    for(let z=-62;z<=54;z+=10) {

        cyl(
            "OverheadPipeA",
            8,8.6,z,
            0.18,26,
            mats.rust,
            0,Math.PI/2
        );

        cyl(
            "OverheadPipeB",
            10,8.9,z+0.8,
            0.13,26,
            mats.metal,
            0,Math.PI/2
        );

        cyl(
            "OverheadPipeC",
            12,8.35,z-0.7,
            0.1,26,
            mats.darkMetal,
            0,Math.PI/2
        );
    }

    for(const x of [5.5,7,9.2]) {

        box(
            "LongPipe",
            x,7.9,-5,
            0.22,0.22,146,
            mats.rust
        );
    }

    for(let z=-60;z<=50;z+=11) {

        box(
            "PipeBracket",
            8,7.7,z,
            5,0.18,0.18,
            mats.darkMetal
        );
    }

    // ================= SIGNS =================

    textSprite(
        "PLATFORM 02",
        18,4.8,43,
        0.72
    );

    textSprite(
        "EXIT",
        18,4.2,52,
        0.58
    );

    textSprite(
        "TRACK 01",
        27,3.7,14,
        0.45
    );

    // PART 2 CONTINUES BELOW
    // ================= TICKET CONCOURSE =================

    box(
        "TicketFloor",
        18,0.15,62,
        40,0.45,31,
        mats.tileDark
    );

    box(
        "TicketCeiling",
        18,9.5,62,
        40,0.3,31,
        mats.darkConcrete
    );

    box(
        "TicketBackWall",
        18,4.7,77,
        40,9,0.45,
        mats.concrete2
    );

    box(
        "TicketLeftWall",
        -1.5,4.7,62,
        0.45,9,31,
        mats.concrete2
    );

    box(
        "TicketRightWall",
        38,4.7,62,
        0.45,9,31,
        mats.concrete2
    );

    // TICKET BOOTHS

    for(let x=5;x<=31;x+=6.5) {

        box(
            "TicketBooth",
            x,2.7,69,
            5.4,5.2,0.5,
            mats.concreteDark
        );

        box(
            "TicketGlass",
            x,3.7,68.7,
            3.8,1.7,0.08,
            mats.dirtyGlass
        );

        box(
            "TicketCounter",
            x,2.45,68.25,
            4.5,0.25,0.7,
            mats.metal
        );
    }

    // TURNSTILES

    for(let x=7;x<=29;x+=3.7) {

        box(
            "TurnstileBody",
            x,0.9,57,
            0.75,1.8,1.1,
            mats.darkMetal
        );

        box(
            "TurnstileArm",
            x,1.35,56.35,
            0.08,0.08,1.7,
            mats.metal
        );
    }

    textSprite(
        "TICKETS",
        18,5.6,76.4,
        0.72
    );

    textSprite(
        "LAST SERVICE 22:40",
        18,4.5,70.2,
        0.42,
        "#918f86"
    );

    textSprite(
        "TICKET HALL",
        18,4.3,48,
        0.46
    );

    fluorescent(
        7,8.7,61,
        5,false
    );

    fluorescent(
        18,8.7,61,
        5,true
    );

    fluorescent(
        29,8.7,61,
        5,false
    );

    fluorescent(
        18,8.7,72,
        5,true
    );

    // ================= SECURITY ROOM =================

    box(
        "SecurityFloor",
        -1,0.15,35,
        15,0.45,22,
        mats.floor
    );

    box(
        "SecurityBack",
        -1,4.6,46,
        15,9,0.45,
        mats.concrete2
    );

    box(
        "SecurityLeft",
        -8.2,4.6,35,
        0.45,9,22,
        mats.concrete2
    );

    // Security doorway.

    box(
        "SecurityDoorTop",
        -1,5,24,
        6,0.3,0.5,
        mats.darkMetal
    );

    box(
        "SecurityDoorL",
        -4,2.5,24,
        0.3,5,0.5,
        mats.darkMetal
    );

    box(
        "SecurityDoorR",
        2,2.5,24,
        0.3,5,0.5,
        mats.darkMetal
    );

    textSprite(
        "SECURITY",
        -1,6,23.8,
        0.52
    );

    box(
        "SecurityDesk",
        -1,1.1,32,
        8,1.5,2.2,
        mats.metal,
        true
    );

    box(
        "SecurityChair",
        -1,1,28.8,
        1.3,2,1.3,
        mats.darkMetal,
        true
    );

    // ================= 12 CCTV SCREENS =================

    for(let i=0;i<12;i++) {

        const col = i%4;
        const row = Math.floor(i/4);

        const x = -6 + col*3.4;
        const y = 2.7 + row*1.45;
        const z = 45.55;

        const screen = box(
            "CCTV_"+(i+1),
            x,y,z,
            2.55,1.05,0.14,
            mats.black
        );

        screen.userData.isCCTV = true;
        screen.userData.cameraNumber = i+1;

        box(
            "CCTV_Glow_"+(i+1),
            x,y,z-0.09,
            2.15,0.68,0.03,
            i%3===0
                ? mats.green
                : mats.concrete2
        );
    }

    textSprite(
        "CAMERA CONTROL",
        -1,7.2,45.5,
        0.46
    );

    fluorescent(
        -1,8.8,38,
        5.5,false
    );

    // ================= MAINTENANCE =================

    box(
        "MaintenanceFloor",
        7,-0.05,-44,
        14,0.4,28,
        mats.tileDark
    );

    box(
        "MaintenanceBack",
        7,4.6,-58,
        14,9,0.45,
        mats.concrete2
    );

    box(
        "MaintenanceSide",
        0,4.6,-44,
        0.45,9,28,
        mats.concrete2
    );

    // MAINTENANCE DOOR

    box(
        "MaintenanceDoorTop",
        7,5,-29.7,
        6,0.3,0.5,
        mats.darkMetal
    );

    box(
        "MaintenanceDoorL",
        4,2.5,-29.7,
        0.3,5,0.5,
        mats.darkMetal
    );

    box(
        "MaintenanceDoorR",
        10,2.5,-29.7,
        0.3,5,0.5,
        mats.darkMetal
    );

    textSprite(
        "MAINTENANCE",
        7,6,-29.5,
        0.48
    );

    // ELECTRICAL CABINETS

    for(let z=-53;z<=-36;z+=5.5) {

        box(
            "ElectricalCabinet",
            12.4,2.4,z,
            1.6,4.2,0.5,
            mats.metal,
            true
        );

        box(
            "CabinetPanel",
            11.55,2.5,z,
            0.06,2.5,0.8,
            mats.black
        );
    }

    // MAIN ELECTRICAL PANEL

    const panel = box(
        "ElectricalPanel",
        4.3,2.3,-52,
        2.8,4.2,0.4,
        mats.metal,
        true
    );

    panel.userData.interactable = true;
    panel.userData.type = "electrical_panel";

    textSprite(
        "AUTHORIZED STAFF ONLY",
        7,6.1,-57.6,
        0.38,
        "#8e6d63"
    );

    // GENERATORS

    for(let x=3;x<=10;x+=3.5) {

        box(
            "Generator",
            x,1.3,-43,
            2.5,2.5,2.2,
            mats.rust,
            true
        );

        cyl(
            "GeneratorVent",
            x,2.75,-43,
            0.42,0.3,
            mats.metal
        );
    }

    fluorescent(
        7,8.5,-36,
        5,true
    );

    fluorescent(
        7,8.5,-48,
        5,false
    );

    fluorescent(
        7,8.5,-56,
        5,true
    );

    // ================= SERVICE LEVEL =================

    box(
        "ServiceFloor",
        18,-1.9,-78,
        24,0.45,37,
        mats.floorDark
    );

    box(
        "ServiceCeiling",
        18,6.5,-78,
        24,0.3,37,
        mats.darkConcrete
    );

    box(
        "ServiceLeftWall",
        6,2.3,-78,
        0.45,8.5,37,
        mats.concrete2
    );

    box(
        "ServiceRightWall",
        30,2.3,-78,
        0.45,8.5,37,
        mats.concrete2
    );

    // Stairs into underground level.

    stairFlight(
        18,-1.5,-61,
        10,5.2,-1
    );

    // Service doors.

    for(let z=-67;z>=-91;z-=8) {

        box(
            "ServiceDoor",
            6.3,2.1,z,
            0.15,4.2,2.8,
            mats.rust
        );

        box(
            "DoorHandle",
            6.1,2.1,z,
            0.12,0.18,0.4,
            mats.metal
        );
    }

    for(let z=-67;z>=-91;z-=8) {

        box(
            "ServiceDoorR",
            29.7,2.1,z,
            0.15,4.2,2.8,
            mats.rust
        );
    }

    textSprite(
        "SERVICE LEVEL B",
        18,5,-64,
        0.52
    );

    fluorescent(
        18,5.7,-68,
        4.5,true
    );

    fluorescent(
        18,5.7,-80,
        4.5,false
    );

    fluorescent(
        18,5.7,-92,
        4.5,true
    );

    // SERVICE LEVEL RAILINGS

    railingRun(
        7.2,-1.4,-79,
        25,false,1.05
    );

    railingRun(
        28.8,-1.4,-79,
        25,false,1.05
    );

    // ================= MORE PIPEWORK =================

    for(let z=-70;z<=-45;z+=5) {

        cyl(
            "MaintenancePipe",
            2.8,6,z,
            0.16,7,
            mats.rust,
            0,Math.PI/2
        );

        cyl(
            "MaintenancePipe2",
            11,6.5,z+1,
            0.11,6,
            mats.metal,
            0,Math.PI/2
        );
    }

    // PART 3 CONTINUES BELOW
    // ================= DEEP TUNNEL =================

    box(
        "TunnelFloor",
        18,-2.1,-111,
        24,0.35,28,
        mats.black
    );

    box(
        "TunnelLeft",
        6,2.5,-111,
        0.45,9,28,
        mats.darkConcrete
    );

    box(
        "TunnelRight",
        30,2.5,-111,
        0.45,9,28,
        mats.darkConcrete
    );

    box(
        "TunnelRoof",
        18,7,-111,
        24,0.4,28,
        mats.darkConcrete
    );

    // Tunnel structural ribs.

    for(let z=-99;z>=-123;z-=5) {

        cyl(
            "TunnelRib",
            18,3.2,z,
            11.4,0.28,
            mats.concrete2,
            0,Math.PI/2
        );

        fluorescent(
            18,6.2,z,
            3.8,
            z%10===0
        );
    }

    // Tunnel pipes.

    for(const x of [8.2,9.3,26.7,27.8]) {

        box(
            "TunnelPipe",
            x,5.5,-111,
            0.18,0.18,27,
            mats.rust
        );
    }

    // ================= END GATE =================

    for(let x=9;x<=27;x+=3) {

        box(
            "TunnelGateBar",
            x,1.5,-126,
            0.18,5,0.18,
            mats.rust
        );
    }

    box(
        "TunnelGateTop",
        18,4.1,-126,
        20,0.3,0.25,
        mats.rust
    );

    textSprite(
        "LINE CLOSED",
        18,5.1,-125.5,
        0.55,
        "#70574e"
    );

    // ================= ABANDONED CLUTTER =================

    for(let i=0;i<24;i++) {

        const x =
            9+(i*7)%21;

        const z =
            -56+(i*11)%104;

        box(
            "DebrisBox",
            x,
            0.35,
            z,

            0.8+(i%3)*0.4,
            0.6+(i%2)*0.3,
            0.6,

            i%2
                ? mats.rust
                : mats.concrete2
        );
    }

    // Trash bins.

    for(let z=-42;z<=42;z+=21) {

        cyl(
            "TrashBin",
            24,0.8,z,
            0.42,1.5,
            mats.metal
        );

        box(
            "BinLid",
            24,1.58,z,
            0.85,0.08,0.85,
            mats.darkMetal
        );
    }

    // ================= OLD POSTERS =================

    function poster(x,y,z,material) {

        box(
            "OldPoster",
            x,y,z,
            0.06,2.4,1.55,
            material
        );

        box(
            "PosterStrip",
            x-0.04,
            y+0.72,
            z,
            0.03,0.08,1.3,
            mats.white
        );

        box(
            "PosterStrip",
            x-0.04,
            y-0.1,
            z,
            0.03,0.08,0.9,
            mats.white
        );
    }

    for(let z=-49;z<=49;z+=16) {

        poster(
            -5.9,
            3,
            z,
            z%32===0
                ? mats.red
                : mats.green
        );

        poster(
            32.15,
            3,
            z+5,
            z%32===0
                ? mats.green
                : mats.red
        );
    }

    // ================= CABLE BUNDLES =================

    for(let z=-60;z<=55;z+=13) {

        cyl(
            "CableBundle",
            25,8.15,z,
            0.09,16,
            mats.darkMetal,
            0,Math.PI/2
        );

        cyl(
            "CableBundleRust",
            27,8,z+1,
            0.07,14,
            mats.rust,
            0,Math.PI/2
        );
    }

    // ================= MORE STRUCTURAL DETAIL =================

    for(let z=-64;z<=58;z+=16) {

        beam(
            "SideBeam",
            -1,6,z,
            8,0.28,0.35,
            mats.darkMetal
        );

        beam(
            "SideBeamR",
            37,6,z,
            8,0.28,0.35,
            mats.darkMetal
        );
    }

    // Hanging cables.

    for(let z=-55;z<=45;z+=12) {

        box(
            "HangingCable",
            15,7.8,z,
            0.08,2.8,0.08,
            mats.black
        );

        box(
            "HangingCable2",
            21,7.5,z+2,
            0.08,3.2,0.08,
            mats.black
        );
    }

    // ================= SIGNS =================

    textSprite(
        "DO NOT ENTER",
        18,4.5,-96,
        0.5,
        "#927067"
    );

    textSprite(
        "SERVICE B",
        18,4.7,-64,
        0.46
    );

    textSprite(
        "MAINTENANCE",
        7,6,-29.5,
        0.48
    );

    // ================= HORROR SET PIECES =================

    // THE PASSENGER silhouettes.

    const horrorPositions = [
        [24,2.7,-37],
        [18,2.4,-86],
        [21,2.7,-118]
    ];

    for(const p of horrorPositions) {

        const figure = box(
            "HorrorSilhouette",
            p[0],
            p[1],
            p[2],
            0.5,
            5.1,
            0.35,
            mats.black
        );

        figure.userData.horrorSetPiece = true;
        figure.userData.entity = "THE_PASSENGER";
    }

    // ================= LOCKED STORY GATES =================

    for(const z of [-58,-95]) {

        for(let x=10;x<=26;x+=3) {

            box(
                "LockedGate",
                x,2.2,z,
                0.16,4.4,0.16,
                mats.rust
            );
        }

        box(
            "LockedGateTop",
            18,4.35,z,
            18,0.3,0.25,
            mats.rust
        );

        textSprite(
            "RESTRICTED",
            18,5,z-0.3,
            0.45,
            "#7b5d55"
        );
    }

    // ================= SMALL ATMOSPHERIC LIGHTS =================

    for(const z of [-52,-26,0,26,52]) {

        pointLight(
            "WeakStationGlow",
            15,2.8,z,
            0.25,
            0xb9c5c8,
            9
        );
    }

    // ================= EXTRA PLATFORM DETAILS =================

    // Yellow warning blocks.

    for(let z=-50;z<=42;z+=12) {

        box(
            "WarningBlock",
            29.8,0.55,z,
            0.35,0.25,2.5,
            mats.yellow
        );
    }

    // Metal utility boxes.

    for(let z=-45;z<=45;z+=15) {

        box(
            "UtilityBox",
            2.2,1.1,z,
            1.4,2.2,1.1,
            mats.darkMetal,
            true
        );

        box(
            "UtilityPanel",
            1.45,1.1,z,
            0.05,1.2,0.7,
            mats.metal
        );
    }

    // ================= FINAL STORY AREA =================

    box(
        "FinalRoomFloor",
        18,-1.8,-119,
        22,0.35,10,
        mats.tileDark
    );

    box(
        "FinalRoomBack",
        18,3,-124,
        22,7,0.4,
        mats.darkConcrete
    );

    box(
        "FinalRoomLeft",
        7,3,-119,
        0.4,7,10,
        mats.darkConcrete
    );

    box(
        "FinalRoomRight",
        29,3,-119,
        0.4,7,10,
        mats.darkConcrete
    );

    fluorescent(
        18,6.2,-119,
        4,
        true
    );

    textSprite(
        "3:17",
        18,4.5,-123.6,
        0.85,
        "#8f7068"
    );

    // ================= RETURN DATA =================

    return {

        root,

        spawn: new THREE.Vector3(
            18,
            2,
            54
        ),

        bounds: {

            minX: -6,
            maxX: 42,

            minZ: -127,
            maxZ: 78
        },

        locations: {

            platform:
                new THREE.Vector3(18,2,0),

            ticketHall:
                new THREE.Vector3(18,2,63),

            security:
                new THREE.Vector3(-1,2,35),

            maintenance:
                new THREE.Vector3(7,2,-44),

            lowerLevel:
                new THREE.Vector3(18,0,-78),

            deepTunnel:
                new THREE.Vector3(18,0,-111)
        }
    };
}