import {OrbitControls} from './OrbitControls.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Set background color
scene.background = new THREE.Color(0x000000);

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 15);
scene.add(directionalLight);

// Enable shadows
renderer.shadowMap.enabled = true;
directionalLight.castShadow = true;

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

// Create basketball court
function createBasketballCourt() {
  // Court floor - just a simple brown surface
  const courtGeometry = new THREE.BoxGeometry(30, 0.2, 15);
  const courtMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xc68642,  // Brown wood color
    shininess: 50
  });
  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  scene.add(court);
  
  // Note: All court lines, hoops, and other elements have been removed
  // Students will need to implement these features
}

// Create all elements
createBasketballCourt();

// Set camera position for better view
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;

// Instructions display
const instructionsElement = document.createElement('div');
instructionsElement.style.position = 'absolute';
instructionsElement.style.bottom = '20px';
instructionsElement.style.left = '20px';
instructionsElement.style.color = 'white';
instructionsElement.style.fontSize = '16px';
instructionsElement.style.fontFamily = 'Arial, sans-serif';
instructionsElement.style.textAlign = 'left';
instructionsElement.innerHTML = `
  <h3>Controls:</h3>
  <p>O - Toggle orbit camera</p>
`;
document.body.appendChild(instructionsElement);

// Handle key events
function handleKeyDown(e) {
  if (e.key === "o") {
    isOrbitEnabled = !isOrbitEnabled;
  }
}

document.addEventListener('keydown', handleKeyDown);

///////////////////////////////////////////////////////////////
const Y_LINE = 0.11;
const COURT_LENGTH = 30;
const COURT_WIDTH = 15;
const HALF_COURT_LENGTH  = COURT_LENGTH / 2;
const HALF__COURT_WIDTH  = COURT_WIDTH / 2;

function createCourtLines() {
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

  createCenterLine(lineMaterial);
  createCenterCircle(lineMaterial);
  createThreePointArcs(lineMaterial);
}

function createCenterLine(material) {
  const centerLineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, Y_LINE, -HALF__COURT_WIDTH),
    new THREE.Vector3(0, Y_LINE, HALF__COURT_WIDTH)
  ]);
  
  const centerLine = new THREE.Line(centerLineGeometry, material);
  scene.add(centerLine);
}

function createCenterCircle(material) {
  const CIRCLE_RADIUS = 2;
  const CIRCLE_SEGMENTS = 128;
  
  const circlePoints = [];
  for (let i = 0; i <= CIRCLE_SEGMENTS; i++) {
    const angle = (i / CIRCLE_SEGMENTS) * Math.PI * 2;
    const x = Math.sin(angle) * CIRCLE_RADIUS;
    const z = Math.cos(angle) * CIRCLE_RADIUS;
    circlePoints.push(new THREE.Vector3(x, Y_LINE, z));
  }
  
  const circleGeometry = new THREE.BufferGeometry().setFromPoints(circlePoints);
  const centerCircle = new THREE.LineLoop(circleGeometry, material);
  scene.add(centerCircle);
}

function createThreePointArcs(material) {
  const ARC_RADIUS = 6;
  const ARC_SEGMENTS = 128;
  const courtEnds = [-HALF_COURT_LENGTH, HALF_COURT_LENGTH];
  
  courtEnds.forEach(baselineX => {
    const arcPoints = [];
    
    for (let i = 0; i <= ARC_SEGMENTS; i++) {
      const angle = -Math.PI / 2 + (i / ARC_SEGMENTS) * Math.PI;
      
      const z = Math.sin(angle) * ARC_RADIUS;
      const x = baselineX - Math.sign(baselineX) * Math.cos(angle) * ARC_RADIUS;
      
      arcPoints.push(new THREE.Vector3(x, Y_LINE, z));
    }
    
    const arcGeometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const threePointArc = new THREE.Line(arcGeometry, material);
    scene.add(threePointArc);
  });
}

createCourtLines();
///////////////////////////////////////////////////////////////

// Animation function
function animate() {
  requestAnimationFrame(animate);
  
  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();
  
  renderer.render(scene, camera);
}

animate();