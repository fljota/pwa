import { Scene, PerspectiveCamera, WebGLRenderer, DodecahedronBufferGeometry, MeshPhongMaterial, Mesh, DirectionalLight, Color } from './three';

const scene = new Scene();
const camera = new PerspectiveCamera(25, 500 / 500, 1, 1000);
export const renderer = new WebGLRenderer();
// renderer.setSize(500, 500);

// document.body.appendChild(renderer.domElement);

const geometry = new DodecahedronBufferGeometry();
const material = new MeshPhongMaterial({ color: 0x3E0080 });
const dodekaeder = new Mesh(geometry, material);

const light = new DirectionalLight(0xffffff);
light.position.set(0, 1, 1).normalize();

scene.add(light);
scene.add(dodekaeder);
scene.background = new Color(0xFFFFFF);

camera.position.z = 5;

export const animate = () => {

    requestAnimationFrame(animate);

    if (false) {
        // dodekaeder.rotation.x += 0.005;
        // dodekaeder.rotation.y += 0.005;
        // dodekaeder.rotation.z += 0.001;
    } else {
        dodekaeder.rotation.x = 1.1;
        dodekaeder.rotation.y = -0.15;
        dodekaeder.rotation.z = 0.15;
    }

    renderer.render(scene, camera);

};
