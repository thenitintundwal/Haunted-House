import * as THREE from "three";
import { Timer } from "three/examples/jsm/Addons.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { sin, textureLoad } from "three/tsl";
import { Group } from "three/webgpu";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Create the scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(
  75, // Field of view
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1, // Near clipping plane
  1000 // Far clipping plane
);

// Position the camera so we can see the cube
camera.position.set(1, 3, 10);

// Get the canvas element if it exists
const canvas = document.getElementById("canvas");

// Create the renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas || undefined });
renderer.setSize(window.innerWidth, window.innerHeight);
if (!canvas) document.body.appendChild(renderer.domElement);

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// OrbitControls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Ambient light
const ambientLight = new THREE.AmbientLight(0x86cdff, 0.5); // Soft white light
scene.add(ambientLight);

// Directional light
const directionalLight1 = new THREE.DirectionalLight(0x86cdff, 1.5);
directionalLight1.position.set(10, 3, -8);
scene.add(directionalLight1);

// Optional: Directional light helper
// const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight1, 2);
// scene.add(dirLightHelper);

//Directional Light 2
const light = new THREE.DirectionalLight(0xffffff, 0); // Start with intensity 0
scene.add(light);

// Position the light (adjust based on your scene)
light.position.set(0, 10, 0);

// Lightning logic
let nextFlashTime = Date.now() + getRandomDelay();

function getRandomDelay() {
  return Math.random() * 5000 + 2000; // Wait between 2s and 7s
}

function lightningFlash() {
  // Flash pattern: one big flash followed by a couple of small flickers
  light.intensity = 3;
  setTimeout(() => {
    light.intensity = 0.8;
    setTimeout(() => {
      light.intensity = 2;
      setTimeout(() => {
        light.intensity = 0;
      }, 100);
    }, 100);
  }, 100);
}

//Ghost Light
const ghost1Light = new THREE.PointLight("#8800ff", 6);
const ghost2Light = new THREE.PointLight("#ff0088", 6);
const ghost3Light = new THREE.PointLight("#ff0000", 6);
scene.add(ghost1Light, ghost2Light, ghost3Light);

//Axis helper
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

//Texture loader
const textureLoader = new THREE.TextureLoader();

// GLTF Loader setup
const gltfLoader = new GLTFLoader();
let ghost1, ghost2, ghost3;
gltfLoader.load(
  "/assets/ghost/scene.gltf",
  (gltf) => {
    // First ghost
    ghost1 = gltf.scene;
    ghost1.position.set(4, 0.5, 0);
    ghost1.scale.set(0.5, 0.5, 0.5);
    scene.add(ghost1);

    // Second ghost (clone)
    ghost2 = ghost1.clone(true);
    ghost2.position.set(-4, 0.5, 0);
    ghost2.scale.set(0.5, 0.5, 0.5);

    scene.add(ghost2);

    // third ghost (clone)
    ghost3 = ghost1.clone(true);
    ghost3.position.set(0, 0.5, 3);
    ghost3.scale.set(0.5, 0.5, 0.5);

    scene.add(ghost3);
  },
  undefined,
  (error) => {
    console.error("An error happened while loading the GLTF model:", error);
  }
);

//Floor Texture
const floorAlphaMap = textureLoader.load("/assets/floor-alpha-map.jpg");
const floorTexture = textureLoader.load(
  "/assets/floor/coast_sand_rocks_02_diff_1k.jpg"
);
const floorAoTexture = textureLoader.load(
  "/assets/floor/coast_sand_rocks_02_arm_1k.jpg"
);
const floorNormalTexture = textureLoader.load(
  "/assets/floor/coast_sand_rocks_02_nor_gl_1k.jpg"
);
const floorDisplacementTexture = textureLoader.load(
  "/assets/floor/coast_sand_rocks_02_disp_1k.jpg"
);

floorTexture.colorSpace = THREE.SRGBColorSpace;

floorTexture.repeat.set(6, 6);
floorAoTexture.repeat.set(6, 6);
floorNormalTexture.repeat.set(6, 6);
floorDisplacementTexture.repeat.set(6, 6);

floorTexture.wrapS = THREE.RepeatWrapping;
floorAoTexture.wrapS = THREE.RepeatWrapping;
floorNormalTexture.wrapS = THREE.RepeatWrapping;
floorDisplacementTexture.wrapS = THREE.RepeatWrapping;

floorTexture.wrapT = THREE.RepeatWrapping;
floorAoTexture.wrapT = THREE.RepeatWrapping;
floorNormalTexture.wrapT = THREE.RepeatWrapping;
floorDisplacementTexture.wrapT = THREE.RepeatWrapping;

//Floor Plane
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({
    alphaMap: floorAlphaMap,
    transparent: true,
    map: floorTexture,
    aoMap: floorAoTexture,
    roughnessMap: floorAoTexture,
    metalnessMap: floorAoTexture,
    normalMap: floorNormalTexture,
    displacementMap: floorDisplacementTexture,
    displacementScale: 0.3,
    displacementBias: -0.1,
  })
);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, 0, 0);

scene.add(floor);

//Wall Texture
const wallTexture = textureLoader.load(
  "/assets/wall/castle_brick_broken_06_diff_1k.jpg"
);
const wallAoTexture = textureLoader.load(
  "/assets/wall/castle_brick_broken_06_arm_1k.jpg"
);
const wallNormalTexture = textureLoader.load(
  "/assets/wall/castle_brick_broken_06_nor_gl_1k.jpg"
);
const wallDiplacementTexture = textureLoader.load(
  "/assets/wall/castle_brick_broken_06_disp_1k.jpg"
);

wallTexture.colorSpace = THREE.SRGBColorSpace;

//Roof Texture
const roofTexture = textureLoader.load(
  "/assets/roof/roof_tiles_14_diff_1k.jpg"
);
const roofAoTexture = textureLoader.load(
  "/assets/roof/roof_tiles_14_arm_1k.jpg"
);
const roofNormalTexture = textureLoader.load(
  "/assets/roof/roof_tiles_14_nor_gl_1k.jpg"
);

roofTexture.colorSpace = THREE.SRGBColorSpace;

roofTexture.repeat.set(1, 1);
roofAoTexture.repeat.set(1, 1);
roofNormalTexture.repeat.set(1, 1);

roofTexture.wrapS = THREE.RepeatWrapping;
roofAoTexture.wrapS = THREE.RepeatWrapping;
roofNormalTexture.wrapS = THREE.RepeatWrapping;

roofTexture.wrapT = THREE.RepeatWrapping;
roofAoTexture.wrapT = THREE.RepeatWrapping;
roofNormalTexture.wrapT = THREE.RepeatWrapping;

//Window Texture
const windowTexture = textureLoader.load(
  "/assets/window/Wood_Window_001_basecolor.jpg"
);
const windowAoTexture = textureLoader.load(
  "/assets/window/Wood_Window_001_ambientOcclusion.jpg"
);
const windowNormalTexture = textureLoader.load(
  "/assets/window/Wood_Window_001_normal.jpg"
);
const windowRoughnessTexture = textureLoader.load(
  "/assets/window/Wood_Window_001_roughness.jpg"
);
const windowMetalTexture = textureLoader.load(
  "/assets/window/Wood_Window_001_metallic.jpg"
);
const windowalphaMap = textureLoader.load(
  "/assets/window/Wood_Window_001_height.png"
);
const windowOpacityTexture = textureLoader.load(
  "/assets/window/Wood_Window_001_opacity.jpg"
);

windowTexture.colorSpace = THREE.SRGBColorSpace;

//House
const House = new THREE.Group();
scene.add(House);

//LeftWall
const LeftWall = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 3, 2.2),
  new THREE.MeshStandardMaterial({
    map: wallTexture,
    aoMap: wallAoTexture,
    roughnessMap: wallAoTexture,
    metalnessMap: wallAoTexture,
    normalMap: wallNormalTexture,
    // opacityMap: windowOpacityTexture,
  })
);
LeftWall.position.y += 3 / 2;
LeftWall.position.x = -2;
House.add(LeftWall);

//leftWindow
const leftWindow = new THREE.Mesh(
  new THREE.PlaneGeometry(0.5, 1),
  new THREE.MeshStandardMaterial({
    map: windowTexture,
    alphaMap: windowalphaMap,
    // transparent: true,
    aoMap: windowAoTexture,
    roughnessMap: windowRoughnessTexture,
    metalnessMap: windowMetalTexture,
    normalMap: windowNormalTexture,
  })
);
leftWindow.position.y += 1.6;
leftWindow.position.x = -2;
leftWindow.position.z = 1.11;
House.add(leftWindow);

//leftTopRoof
const leftTopRoof = new THREE.Mesh(
  new THREE.ConeGeometry(2.3, 1, 4),
  new THREE.MeshStandardMaterial({
    map: roofTexture,
    aoMap: roofAoTexture,
    roughnessMap: roofAoTexture,
    metalnessMap: roofAoTexture,
    normalMap: roofNormalTexture,
  })
);
leftTopRoof.position.y += 3.45;
leftTopRoof.position.x = -1.28;
leftTopRoof.rotation.y = Math.PI * 0.25;
House.add(leftTopRoof);

//Left Wall Light
const leftWall = new THREE.PointLight(0xff7d46, 1.5);
leftWall.position.y = 2.7;
leftWall.position.x = -2;
leftWall.position.z = 1.4;
scene.add(leftWall);

//CenterWall
const centerWall = new THREE.Mesh(
  new THREE.BoxGeometry(2.5, 3, 3.5),
  new THREE.MeshStandardMaterial({
    map: wallTexture,
    aoMap: wallAoTexture,
    roughnessMap: wallAoTexture,
    metalnessMap: wallAoTexture,
    normalMap: wallNormalTexture,
  })
);
centerWall.position.y += 3 / 2;
House.add(centerWall);

//Door Texture
const doorTexture = textureLoader.load(
  "/assets/door/Door_Wood_001_basecolor.jpg"
);
const doorAoTexture = textureLoader.load(
  "/assets/door/Door_Wood_001_ambientOcclusion.jpg"
);
const doorRoughnessTexture = textureLoader.load(
  "/assets/door/Door_Wood_001_roughness.jpg"
);
const doorMetalnessTexture = textureLoader.load(
  "/assets/door/Door_Wood_001_metallic.jpg"
);
const doorNormalTexture = textureLoader.load(
  "/assets/door/Door_Wood_001_normal.jpg"
);
const doorDisplacementTexture = textureLoader.load(
  "/assets/door/Door_Wood_001_normal.jpg"
);
const doorAlphaMap = textureLoader.load(
  "/assets/door/Door_Wood_001_opacity.jpg"
);

doorTexture.colorSpace = THREE.SRGBColorSpace;

//Door
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
  new THREE.MeshStandardMaterial({
    alphaMap: doorAlphaMap,
    transparent: true,
    map: doorTexture,
    aoMap: doorAoTexture,
    roughnessMap: doorRoughnessTexture,
    metalnessMap: doorMetalnessTexture,
    normalMap: doorNormalTexture,
    displacementMap: doorDisplacementTexture,
    displacementScale: 0.15,
    displacementBias: -0.04,
  })
);
door.position.y = 1.5;
door.position.z = 1.77;

House.add(door);

//RightWall
const RightWall = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 3, 2.2),
  new THREE.MeshStandardMaterial({
    map: wallTexture,
    aoMap: wallAoTexture,
    roughnessMap: wallAoTexture,
    metalnessMap: wallAoTexture,
    normalMap: wallNormalTexture,
  })
);
RightWall.position.y += 3 / 2;
RightWall.position.x = 2;
House.add(RightWall);

//Right Wall Light
const rightLight = new THREE.PointLight(0xff7d46, 1.5);
rightLight.position.y = 2.7;
rightLight.position.x = 2;
rightLight.position.z = 1.4;
scene.add(rightLight);

//rightWindow
const rightWindow = new THREE.Mesh(
  new THREE.PlaneGeometry(0.5, 1),
  new THREE.MeshStandardMaterial({
    map: windowTexture,
    alphaMap: windowalphaMap,
    // transparent: true,
    aoMap: windowAoTexture,
    roughnessMap: windowRoughnessTexture,
    metalnessMap: windowMetalTexture,
    normalMap: windowNormalTexture,
  })
);
rightWindow.position.y += 1.6;
rightWindow.position.x = 2;
rightWindow.position.z = 1.11;
House.add(rightWindow);

//RightTopRoof
const RightTopRoof = new THREE.Mesh(
  new THREE.ConeGeometry(2.3, 1, 4),
  new THREE.MeshStandardMaterial({
    map: roofTexture,
    aoMap: roofAoTexture,
    roughnessMap: roofAoTexture,
    metalnessMap: roofAoTexture,
    normalMap: roofNormalTexture,
  })
);
RightTopRoof.position.y += 3.45;
RightTopRoof.position.x = 1.28;
RightTopRoof.rotation.y = Math.PI * 0.25;

House.add(RightTopRoof);

//TopWall
const TopWall = new THREE.Mesh(
  new THREE.BoxGeometry(2.49, 1.3, 2.8),
  new THREE.MeshStandardMaterial({
    map: wallTexture,
    aoMap: wallAoTexture,
    roughnessMap: wallAoTexture,
    metalnessMap: wallAoTexture,
    normalMap: wallNormalTexture,
  })
);
TopWall.position.y += 3 + 1 / 2;
House.add(TopWall);

//Right Wall Light
const topLight = new THREE.PointLight(0xff7d46, 1.5);
topLight.position.y = 4.1;

topLight.position.z = 1.6;
scene.add(topLight);

//TopWindow
const toWindow = new THREE.Mesh(
  new THREE.PlaneGeometry(0.5, 0.5),
  new THREE.MeshStandardMaterial({
    map: windowTexture,
    alphaMap: windowalphaMap,
    // transparent: true,
    aoMap: windowAoTexture,
    roughnessMap: windowRoughnessTexture,
    metalnessMap: windowMetalTexture,
    normalMap: windowNormalTexture,
  })
);
toWindow.position.y += 3.6;
toWindow.position.z = 1.42;
House.add(toWindow);

//CenterTopRoof
const TopRoof = new THREE.Mesh(
  new THREE.ConeGeometry(2.6, 1, 4),
  new THREE.MeshStandardMaterial({
    map: roofTexture,
    aoMap: roofAoTexture,
    roughnessMap: roofAoTexture,
    metalnessMap: roofAoTexture,
    normalMap: roofNormalTexture,
  })
);
TopRoof.position.y += 4.65;
TopRoof.rotation.y = Math.PI * 0.25;

House.add(TopRoof);

//RoofGroup
const roofGroup = new THREE.Group();

//CenterRoof1
const centerRoof1 = new THREE.Mesh(
  new THREE.BoxGeometry(2.5, 0.08, 0.8),
  new THREE.MeshStandardMaterial({
    map: roofTexture,
    aoMap: roofAoTexture,
    roughnessMap: roofAoTexture,
    metalnessMap: roofAoTexture,
    normalMap: roofNormalTexture,
  })
);
centerRoof1.position.y = 3;
centerRoof1.position.z = 1.8;
centerRoof1.rotation.x = Math.PI * 0.1;

roofGroup.add(centerRoof1);
//CenterRoof2
const centerRoof2 = new THREE.Mesh(
  new THREE.BoxGeometry(1.95, 0.06, 0.5),
  new THREE.MeshStandardMaterial({
    map: roofTexture,
    aoMap: roofAoTexture,
    roughnessMap: roofAoTexture,
    metalnessMap: roofAoTexture,
    normalMap: roofNormalTexture,
  })
);
centerRoof2.position.y = 2.85;
centerRoof2.position.z = 2.2;
centerRoof2.rotation.x = Math.PI * 0.1;

// roofGroup.position.y = 0.1;
roofGroup.add(centerRoof2);
House.add(roofGroup);

//Steps Texture
const stepTexture = textureLoader.load(
  "/assets/steps-textures/worn_tile_floor_diff_1k.jpg"
);
const stepAoTexture = textureLoader.load(
  "/assets/steps-textures/worn_tile_floor_arm_1k.jpg"
);
const stepNormalTexture = textureLoader.load(
  "/assets/steps-textures/worn_tile_floor_nor_gl_1k.jpg"
);
// const stepDisplacementTexture = textureLoader.load(
//   "/assets/steps-textures/worn_tile_floor_nor_gl_1k.jpg"
// );

stepTexture.colorSpace = THREE.SRGBColorSpace;

//Steps
const Steps = new THREE.Group();
//Step1
const step1 = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 0.2, 1, 100, 100),
  new THREE.MeshStandardMaterial({
    map: stepTexture,
    aoMap: stepAoTexture,
    roughnessMap: stepAoTexture,
    metalnessMap: stepAoTexture,
    normalMap: stepNormalTexture,
  })
);

step1.position.y += 0.2 / 2 + 0.001;
step1.position.z = 2.1;

Steps.add(step1);

//Step2
const step2 = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 0.2, 0.6),
  new THREE.MeshStandardMaterial({
    map: stepTexture,
    aoMap: stepAoTexture,
    roughnessMap: stepAoTexture,
    metalnessMap: stepAoTexture,
    normalMap: stepNormalTexture,
  })
);

step2.position.y += 0.2 / 2 + 0.2;
step2.position.z = 2;
Steps.position.y = 0.1;

Steps.add(step2);
House.add(Steps);

//Grave Group
const graveGroup = new THREE.Group();

//Grave Texture
const graveTexture = textureLoader.load(
  "/assets/grave/cracked_concrete_wall_diff_1k.jpg"
);
const graveAoTexture = textureLoader.load(
  "/assets/grave/cracked_concrete_wall_arm_1k.jpg"
);
const graveNormalTexture = textureLoader.load(
  "/assets/grave/cracked_concrete_wall_nor_gl_1k.jpg"
);

//Grave
const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({
  map: graveTexture,
  aoMap: graveAoTexture,
  roughnessMap: graveAoTexture,
  metalnessMap: graveAoTexture,
  normalMap: graveNormalTexture,
});

for (let i = 0; i < 50; i++) {
  const graveMesh = new THREE.Mesh(graveGeometry, graveMaterial);

  const angle = Math.random() * Math.PI * 2;
  const radius = 4 + Math.random() * 4;
  graveMesh.position.y = Math.random() * 0.5;
  graveMesh.position.z = Math.sin(angle) * radius;
  graveMesh.position.x = Math.cos(angle) * radius;
  graveMesh.rotation.x = (Math.random() - 0.5) * 0.4;
  graveMesh.rotation.y = (Math.random() - 0.5) * 0.4;
  graveMesh.rotation.z = (Math.random() - 0.5) * 0.4;

  graveGroup.add(graveMesh);
  scene.add(graveGroup);
}

// HDRI environment
// const rgbeLoader = new RGBELoader();
// rgbeLoader.load("/hdri/moonlit_golf_1k.hdr", function (texture) {
//   texture.mapping = THREE.EquirectangularReflectionMapping;
//   scene.environment = texture;
//   scene.background = texture;
// });

//Render Shadow
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

//Cast and Recive Shadow
directionalLight1.castShadow = true;
ghost1Light.castShadow = true;
ghost2Light.castShadow = true;
ghost3Light.castShadow = true;
House.castShadow = true;
House.receiveShadow = true;
floor.castShadow = true;
floor.receiveShadow = true;
graveGeometry.castShadow = true;
graveGeometry.receiveShadow = true;
graveGroup.castShadow = true;
graveGroup.receiveShadow = true;

//Timer
const timer = new Timer();
// Animation loop
function animate() {
  requestAnimationFrame(animate);

  timer.update();
  const elapsedTime = timer.getElapsed();

  //Ghost Control
  const ghost1LightAngle = elapsedTime * 0.5;
  const ghost1LightX = Math.cos(ghost1LightAngle) * 4;
  const ghost1LightZ = Math.sin(ghost1LightAngle) * 4;
  const ghost1LightY =
    Math.sin(ghost1LightAngle) *
    Math.sin(ghost1LightAngle * 2.34) *
    Math.sin(ghost1LightAngle * 0.345);

  const ghost2LightAngle = -elapsedTime * 0.38;
  const ghost2LightX = Math.cos(ghost2LightAngle) * 5;
  const ghost2LightZ = Math.sin(ghost2LightAngle) * 5;
  const ghost2LightY =
    Math.sin(ghost2LightAngle) *
    Math.sin(ghost2LightAngle * 2.34) *
    Math.sin(ghost2LightAngle * 0.345);

  const ghost3LightAngle = elapsedTime * 0.23;
  const ghost3LightX = Math.cos(ghost3LightAngle) * 6;
  const ghost3LightZ = Math.sin(ghost3LightAngle) * 6;
  const ghost3LightY =
    Math.sin(ghost3LightAngle) *
    Math.sin(ghost3LightAngle * 2.34) *
    Math.sin(ghost3LightAngle * 0.345);

  ghost1Light.position.x = ghost1LightX;
  ghost1Light.position.y = ghost1LightY;
  ghost1Light.position.z = ghost1LightZ;

  ghost2Light.position.x = ghost2LightX;
  ghost2Light.position.y = ghost2LightY;
  ghost2Light.position.z = ghost2LightZ;

  ghost3Light.position.x = ghost3LightX;
  ghost3Light.position.y = ghost3LightY;
  ghost3Light.position.z = ghost3LightZ;

  //Update Ghost Position
  if (ghost1 && ghost2 && ghost3) {
    ghost1.position.set(ghost1LightX, ghost1LightY, ghost1LightZ);
    ghost2.position.set(ghost2LightX, ghost2LightY, ghost2LightZ);
    ghost3.position.set(ghost3LightX, ghost3LightY, ghost3LightZ);
  }

  const now = Date.now();
  if (now >= nextFlashTime) {
    lightningFlash();
    nextFlashTime = now + getRandomDelay();
  }

  controls.update();

  renderer.render(scene, camera);
}
animate();
