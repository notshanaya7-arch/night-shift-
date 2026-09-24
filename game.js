import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const canvas = document.getElementById("gameCanvas");

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x202840);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.z = 5;

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


/* RED CUBE */

const geometry = new THREE.BoxGeometry(
    2,
    2,
    2
);

const material = new THREE.MeshBasicMaterial({
    color: 0xff0000
});

const cube = new THREE.Mesh(
    geometry,
    material
);

scene.add(cube);


/* LIGHT BLUE FLOOR */

const floorGeometry =
    new THREE.PlaneGeometry(20, 20);

const floorMaterial =
    new THREE.MeshBasicMaterial({
        color: 0x303030
    });

const floor =
    new THREE.Mesh(
        floorGeometry,
        floorMaterial
    );

floor.rotation.x =
    -Math.PI / 2;

floor.position.y =
    -1.5;

scene.add(floor);


/* ANIMATION */

function animate() {

    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.02;

    renderer.render(
        scene,
        camera
    );
}

animate();


/* RESIZE */

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