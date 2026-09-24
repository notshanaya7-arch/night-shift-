import * as THREE from "three";

export function createStation(scene) {
    const root = new THREE.Group();
    root.name = "NightShiftStation";
    scene.add(root);

    function mat(color, roughness=0.85, metalness=0.05) {
        return new THREE.MeshStandardMaterial({
            color,
            roughness,
            metalness
        });
    }

    const mats = {
        floor: mat(0x34373b,0.9),
        floorDark: mat(0x202327,0.95),
        concrete: mat(0x4a4d50),
        concreteDark: mat(0x292c30,0.98),
        metal: mat(0x50545a,0.8,0.35),
        rust: mat(0x4b3028),
        yellow: mat(0xb08b34,0.8),
        white: mat(0xc8c8c2,0.85),
        black: mat(0x08090a,1),
        glass: new THREE.MeshStandardMaterial({
            color:0x182126,
            roughness:0.25,
            metalness:0.2,
            transparent:true,
            opacity:0.72
        }),
        red:mat(0x5c1818,0.8),
        green:mat(0x294438,0.8)
    };

    function box(name,x,y,z,sx,sy,sz,material,cast=false) {
        const m=new THREE.Mesh(
            new THREE.BoxGeometry(sx,sy,sz),
            material
        );
        m.name=name;
        m.position.set(x,y,z);
        m.castShadow=cast;
        m.receiveShadow=true;
        root.add(m);
        return m;
    }

    function cyl(name,x,y,z,r,h,material,rx=0,rz=0) {
        const m=new THREE.Mesh(
            new THREE.CylinderGeometry(r,r,h,16),
            material
        );
        m.name=name;
        m.position.set(x,y,z);
        m.rotation.x=rx;
        m.rotation.z=rz;
        m.castShadow=true;
        m.receiveShadow=true;
        root.add(m);
        return m;
    }

    function textSprite(text,x,y,z,size=0.7,color="#b8b8b0") {
        const c=document.createElement("canvas");
        c.width=512;
        c.height=128;

        const ctx=c.getContext("2d");
        ctx.clearRect(0,0,512,128);
        ctx.font="bold 42px Arial";
        ctx.fillStyle=color;
        ctx.textAlign="center";
        ctx.textBaseline="middle";
        ctx.fillText(text,256,64);

        const tex=new THREE.CanvasTexture(c);
        tex.colorSpace=THREE.SRGBColorSpace;

        const sprite=new THREE.Sprite(
            new THREE.SpriteMaterial({
                map:tex,
                transparent:true,
                depthWrite:false
            })
        );

        sprite.position.set(x,y,z);
        sprite.scale.set(size*4,size,1);

        root.add(sprite);
        return sprite;
    }

    function light(x,y,z,intensity=2.2,color=0xd9e2e8,distance=18) {
        const l=new THREE.PointLight(
            color,
            intensity,
            distance,
            2
        );

        l.position.set(x,y,z);
        l.castShadow=false;
        root.add(l);

        return l;
    }

    function fluorescent(x,y,z,length=5,broken=false) {
        box(
            "CeilingLight",
            x,y,z,
            length,0.10,0.22,
            mats.white
        );

        const l=light(
            x,y-0.15,z,
            broken?0.35:2.2,
            0xdce8ef,
            15
        );

        if(broken) {
            l.userData.flicker=true;
            l.userData.base=0.35;
        }

        return l;
    }


    /* =========================
       HUGE STATION STRUCTURE
    ========================= */

    box(
        "MainFloor",
        17,-0.25,-23,
        49,0.5,210,
        mats.floor
    );

    box(
        "Ceiling",
        17,10,-23,
        49,0.35,210,
        mats.concreteDark
    );

    box(
        "WestWall",
        -8.7,5,-23,
        0.7,10,210,
        mats.concreteDark
    );

    box(
        "EastWall",
        42.7,5,-23,
        0.7,10,210,
        mats.concreteDark
    );


    /* =========================
       MAIN PLATFORM
    ========================= */

    box(
        "Platform",
        17,0.15,-3,
        22,0.5,126,
        mats.concrete
    );

    box(
        "PlatformEdge",
        17,0.43,-3,
        1,0.10,126,
        mats.yellow
    );


    /* =========================
       TRACKS
    ========================= */

    box(
        "TrackBed",
        2.8,-0.15,-3,
        7.2,0.25,126,
        mats.black
    );

    box(
        "TrackBed2",
        7.5,-0.15,-3,
        1.5,0.25,126,
        mats.black
    );

    for(let z=-64;z<=58;z+=3.2) {
        box(
            "Sleeper",
            5.2,0.02,z,
            6.8,0.18,0.42,
            mats.rust
        );
    }

    box(
        "RailA",
        3.8,0.28,-3,
        0.14,0.18,126,
        mats.metal
    );

    box(
        "RailB",
        6.6,0.28,-3,
        0.14,0.18,126,
        mats.metal
    );


    /* second distant track */

    box(
        "FarTrack",
        31,-0.12,-3,
        8,0.22,126,
        mats.black
    );

    box(
        "FarRailA",
        29.2,0.28,-3,
        0.13,0.16,126,
        mats.metal
    );

    box(
        "FarRailB",
        33.4,0.28,-3,
        0.13,0.16,126,
        mats.metal
    );


    /* =========================
       PILLARS + LIGHTS
    ========================= */

    for(let z=-58;z<=52;z+=11) {

        box(
            "Pillar",
            12,4.8,z,
            1.2,9,1.2,
            mats.concreteDark,
            true
        );

        box(
            "Pillar",
            22,4.8,z,
            1.2,9,1.2,
            mats.concreteDark,
            true
        );

        fluorescent(
            17,
            9.55,
            z,
            5,
            z%22===0
        );
    }


    /* =========================
       BENCHES
    ========================= */

    for(let z=-42;z<=38;z+=20) {

        box(
            "BenchSeat",
            17,1.35,z,
            5.4,0.22,0.8,
            mats.metal,
            true
        );

        box(
            "BenchBack",
            17,2.15,z+0.3,
            5.4,1,0.18,
            mats.metal,
            true
        );

        for(let x=15.2;x<=18.8;x+=1.8) {
            box(
                "BenchLeg",
                x,0.7,z,
                0.18,1.2,0.18,
                mats.metal
            );
        }
    }


    /* =========================
       SIGNS
    ========================= */

    textSprite(
        "PLATFORM 02",
        17,4.3,48,
        0.8
    );

    textSprite(
        "EXIT",
        17,3.4,28,
        0.65
    );

    textSprite(
        "SECURITY",
        31,3.4,28,
        0.55
    );

    textSprite(
        "MAINTENANCE",
        35,3.4,-43,
        0.5
    );

    textSprite(
        "DO NOT ENTER",
        4,3.3,-92,
        0.55,
        "#9a7770"
    );


    /* =========================
       TICKET HALL
    ========================= */

    box(
        "TicketHallFloor",
        17,0.25,66,
        49,0.5,28,
        mats.floorDark
    );

    box(
        "TicketDesk",
        17,1.5,58,
        18,2.4,1.2,
        mats.concreteDark
    );

    for(let x=10;x<=24;x+=3.5) {

        box(
            "Turnstile",
            x,0.9,53,
            1,1.8,1.8,
            mats.metal,
            true
        );

        box(
            "Gate",
            x,1.6,52.1,
            0.12,1.2,1.2,
            mats.glass
        );
    }

    fluorescent(7,9,61,6,false);
    fluorescent(27,9,61,6,true);

    textSprite(
        "LAST SERVICE 22:40",
        17,5.4,72,
        0.55
    );


    /* ticket booths */

    for(let x=7;x<=27;x+=5) {

        box(
            "TicketBooth",
            x,2.8,61,
            3.8,5.2,0.45,
            mats.concreteDark
        );

        box(
            "TicketGlass",
            x,3.4,60.7,
            2.5,1.5,0.08,
            mats.glass
        );
    }
    /* =========================
       SECURITY WING
    ========================= */

    box(
        "SecurityFloor",
        33,0.25,37,
        16,0.5,22,
        mats.floorDark
    );

    box(
        "SecurityBackWall",
        33,4.5,47,
        16,9,0.5,
        mats.concreteDark
    );

    box(
        "SecuritySideWall",
        25,4.5,37,
        0.5,9,20,
        mats.concreteDark
    );

    box(
        "SecuritySideWall",
        41,4.5,37,
        0.5,9,20,
        mats.concreteDark
    );

    box(
        "SecurityDesk",
        33,1.2,34,
        9,1.6,2,
        mats.metal,
        true
    );

    textSprite(
        "SECURITY",
        33,7,46.5,
        0.7
    );


    /* =========================
       12 CCTV CAMERAS
    ========================= */

    for(let i=0;i<12;i++) {

        const x=27+(i%4)*4;
        const z=46.7;
        const y=2.8+Math.floor(i/4)*1.45;

        const screen=box(
            "CCTV_"+(i+1),
            x,y,z,
            2.8,1.05,0.12,
            mats.black
        );

        screen.userData.isCCTV=true;
        screen.userData.cameraNumber=i+1;

        const glow=mat(
            i%3===0
                ? 0x293b35
                : 0x252a30,
            0.4
        );

        box(
            "CCTVScreen_"+(i+1),
            x,y,z-0.08,
            2.35,0.72,0.03,
            glow
        );
    }

    fluorescent(
        33,9,39,
        6,
        false
    );


    /* =========================
       MAINTENANCE WING
    ========================= */

    box(
        "MaintenanceFloor",
        35,0.2,-50,
        14,0.4,46,
        mats.floorDark
    );

    box(
        "MaintenanceBack",
        35,4.5,-73,
        14,9,0.5,
        mats.concreteDark
    );

    box(
        "MaintenanceSide",
        28,4.5,-50,
        0.5,9,46,
        mats.concreteDark
    );

    box(
        "MaintenanceSide",
        42,4.5,-50,
        0.5,9,46,
        mats.concreteDark
    );


    /* pipes */

    for(let z=-66;z<=-38;z+=9) {

        box(
            "Pipe",
            29,6,z,
            0.35,0.35,8,
            mats.rust
        );

        box(
            "Pipe",
            41,6,z,
            0.35,0.35,8,
            mats.metal
        );
    }


    /* electrical panel */

    const panel=box(
        "ElectricalPanel",
        35,2,-61,
        3.5,4,0.35,
        mats.metal,
        true
    );

    panel.name="ElectricalPanel";

    textSprite(
        "AUTHORIZED STAFF ONLY",
        35,5.1,-60.7,
        0.42
    );


    fluorescent(
        35,9,-43,
        6,
        true
    );

    fluorescent(
        35,9,-58,
        6,
        false
    );

    fluorescent(
        35,9,-70,
        6,
        true
    );


    /* generators */

    for(let x=31;x<=39;x+=4) {

        box(
            "Generator",
            x,1.2,-53,
            2.5,2.4,2.5,
            mats.rust,
            true
        );

        cyl(
            "Vent",
            x,2.65,-53,
            0.45,
            0.3,
            mats.metal
        );
    }


    /* =========================
       LOWER SERVICE LEVEL
    ========================= */

    box(
        "LowerLevelFloor",
        17,-2.6,-83,
        30,0.5,36,
        mats.floorDark
    );

    for(let i=0;i<9;i++) {

        box(
            "LowerStep",
            24-i*0.45,
            -0.15-i*0.28,
            -69-i*0.75,
            5,0.3,1,
            mats.concrete
        );
    }

    box(
        "LowerCeiling",
        17,1.5,-83,
        30,0.3,36,
        mats.concreteDark
    );

    textSprite(
        "SERVICE LEVEL B",
        17,0.7,-76,
        0.55
    );


    /* lower corridor */

    box(
        "LowerLeft",
        2,0,-83,
        0.5,4,36,
        mats.concreteDark
    );

    box(
        "LowerRight",
        32,0,-83,
        0.5,4,36,
        mats.concreteDark
    );

    fluorescent(
        17,1.25,-78,
        5,
        true
    );

    fluorescent(
        17,1.25,-90,
        5,
        false
    );

    fluorescent(
        17,1.25,-102,
        5,
        true
    );


    /* =========================
       DEEP TUNNEL
    ========================= */

    box(
        "TunnelFloor",
        17,-0.1,-116,
        30,0.3,28,
        mats.black
    );

    box(
        "TunnelLeft",
        2,4.5,-116,
        0.5,9,28,
        mats.concreteDark
    );

    box(
        "TunnelRight",
        32,4.5,-116,
        0.5,9,28,
        mats.concreteDark
    );

    box(
        "TunnelRoof",
        17,9,-116,
        30,0.5,28,
        mats.concreteDark
    );


    /* tunnel arches */

    for(let z=-106;z>=-126;z-=6) {

        cyl(
            "TunnelArch",
            17,4.5,z,
            14.8,
            0.35,
            mats.concreteDark,
            0,
            Math.PI/2
        );

        fluorescent(
            17,8.3,z,
            4,
            z%12===0
        );
    }


    /* distant tunnel end */

    box(
        "DistantTunnelEnd",
        17,4.5,-130,
        29,9,0.5,
        mats.black
    );

    textSprite(
        "LINE CLOSED",
        17,5,-127.5,
        0.6,
        "#6b5750"
    );


    /* =========================
       ABANDONED DETAILS
    ========================= */

    for(let i=0;i<18;i++) {

        const x=9+(i*7)%27;
        const z=-60+(i*13)%105;

        box(
            "Debris",
            x,
            0.35,
            z,
            0.8+(i%3)*0.4,
            0.7,
            0.6+(i%2)*0.4,
            i%2
                ? mats.rust
                : mats.concreteDark
        );
    }


    /* trash bins */

    for(let z=-25;z<=35;z+=30) {

        cyl(
            "Bin",
            24,0.8,z,
            0.45,
            1.5,
            mats.metal
        );
    }


    /* old posters */

    for(let z=-35;z<=45;z+=20) {

        box(
            "OldPoster",
            8,2.8,z,
            0.08,2.8,1.8,
            mats.red
        );

        box(
            "OldPoster",
            26,2.8,z+6,
            0.08,2.8,1.8,
            mats.green
        );
    }
    /* =========================
       ATMOSPHERIC LIGHTING
    ========================= */

    const guideLights = [
        [17,8.8,-82],
        [17,8.8,-70],
        [17,8.8,-55],
        [17,8.8,-40],
        [17,8.8,-25],
        [17,8.8,-10],
        [17,8.8,8],
        [17,8.8,25],
        [17,8.8,42],
        [17,8.8,60]
    ];

    guideLights.forEach((p,i) => {
        fluorescent(
            p[0],
            p[1],
            p[2],
            5,
            i%4===0
        );
    });


    /* =========================
       RED EMERGENCY LIGHTS
    ========================= */

    for(const z of [-72,-45,-18,10,34,58]) {

        box(
            "EmergencyLight",
            3.2,3.2,z,
            0.18,0.7,1.2,
            mats.red
        );

        light(
            3.5,3.1,z,
            0.45,
            0xff3333,
            8
        );
    }


    /* =========================
       DISTANT VISUAL EXTENSIONS
    ========================= */

    box(
        "DistantWestConcourse",
        -4.5,3,-3,
        7,6,190,
        mats.concreteDark
    );

    box(
        "DistantEastConcourse",
        38.5,3,-3,
        7,6,190,
        mats.concreteDark
    );


    /* =========================
       HORROR SET PIECES
    ========================= */

    for(const z of [-74,-105]) {

        const silhouette = box(
            "DistantSilhouette",
            20,3.2,z,
            0.5,5.5,0.35,
            mats.black
        );

        silhouette.userData.horrorSetPiece=true;
    }


    /* =========================
       LOCKED DISTANT GATES
    ========================= */

    for(const z of [-91,-126]) {

        for(let x=7;x<=27;x+=4) {

            box(
                "LockedGate",
                x,2.5,z,
                0.22,5,0.18,
                mats.rust
            );
        }

        box(
            "GateTop",
            17,5,z,
            21,0.35,0.25,
            mats.rust
        );

        textSprite(
            "RESTRICTED",
            17,5.8,z+0.3,
            0.5,
            "#80635a"
        );
    }


    /* =========================
       FINAL MAP DATA
    ========================= */

    return {

        root,

        spawn: new THREE.Vector3(
            17,
            2,
            20
        ),

        bounds: {
            minX: -7.5,
            maxX: 41.5,
            minZ: -128,
            maxZ: 82
        },

        locations: {

            platform: new THREE.Vector3(
                17,
                2,
                -10
            ),

            ticketHall: new THREE.Vector3(
                17,
                2,
                65
            ),

            security: new THREE.Vector3(
                33,
                2,
                36
            ),

            maintenance: new THREE.Vector3(
                35,
                2,
                -50
            ),

            lowerLevel: new THREE.Vector3(
                17,
                2,
                -83
            ),

            deepTunnel: new THREE.Vector3(
                17,
                2,
                -116
            )
        }
    };
}