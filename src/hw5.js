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


function createHoop(zPos) {
  const group = new THREE.Group();
  
  const backboard = createBackboard();
  const rim = createRim();
  const net = createNet();
  const pole = createPole();
  const supportArm = createSupportArm();
  
  group.add(backboard);
  group.add(rim);
  group.add(net);
  group.add(pole);
  group.add(supportArm);
  
  // Position and orient the entire hoop
  group.position.set(zPos, 0, 0);
  if (zPos > 0) {
    group.rotation.y = Math.PI + Math.PI/2;
  } else {
    group.rotation.y = Math.PI/2;
  }
  
  scene.add(group);
  return group;
}

const BOARD_WIDTH = 1.8;
const BOARD_HEIGHT = 1;
const BOARD_THICKNESS = 0.05;

const ARM_LENGTH = 1;
const ARM_THICKNESS = 0.08;

const RIM_HEIGHT = 3.05;
const RIM_RADIUS = 0.35;
const RIM_TUBE_RADIUS = 0.02;
const RIM_DISTANCE = 0.35;

const NET_SEGMENTS = 12;
const NET_DEPTH = 0.3;
const NET_POINTS = 7;

const POLE_RADIUS = 0.1;
const POLE_HEIGHT = 3.5;


function createBackboard() {
  const material = new THREE.MeshPhongMaterial({
    transparent: true,
    opacity: 0.75
  });
  
  const geometry = new THREE.BoxGeometry(BOARD_WIDTH, BOARD_HEIGHT, BOARD_THICKNESS);
  const backboard = new THREE.Mesh(geometry, material);
  
  const boardZ = ARM_LENGTH + BOARD_THICKNESS / 2;
  backboard.position.set(0, RIM_HEIGHT, boardZ);
  backboard.castShadow = true;
  backboard.receiveShadow = true;
  
  return backboard;
}

function createRim() {
  const geometry = new THREE.TorusGeometry(RIM_RADIUS, RIM_TUBE_RADIUS, 16, 64);
  const material = new THREE.MeshPhongMaterial({ color: 0xff6600 });
  const rim = new THREE.Mesh(geometry, material);
  
  rim.rotation.x = Math.PI / 2;
  
  const boardFrontZ = ARM_LENGTH + BOARD_THICKNESS / 2 + BOARD_THICKNESS / 2;
  const rimZ = boardFrontZ + RIM_DISTANCE;
  rim.position.set(0, RIM_HEIGHT, rimZ);
  rim.castShadow = true;
  
  return rim;
}

function createNet() {
  const netGroup = new THREE.Group();
  const lineMaterial = new THREE.LineBasicMaterial({ 
    color: 0xffffff, 
    linewidth: 3 
  });
  
  // Create net strands
  for (let i = 0; i < NET_SEGMENTS; i++) {
    const angle = (i / NET_SEGMENTS) * Math.PI * 2;
    const startX = Math.cos(angle) * RIM_RADIUS * 0.85;
    const startZ = Math.sin(angle) * RIM_RADIUS * 0.85;
    
    const points = [];
    for (let j = 0; j < NET_POINTS; j++) {
      const t = j / (NET_POINTS - 1);
      const y = -t * NET_DEPTH;
      const taper = 1 - t * 0.4;
      const x = startX * taper;
      const z = startZ * taper;
      points.push(new THREE.Vector3(x, y, z));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, lineMaterial);
    netGroup.add(line);
  }
  
  // Position net at rim location
  const boardFrontZ = ARM_LENGTH + BOARD_THICKNESS / 2 + BOARD_THICKNESS / 2;
  const rimZ = boardFrontZ + RIM_DISTANCE;
  netGroup.position.set(0, RIM_HEIGHT, rimZ);
  
  return netGroup;
}

function createPole() {  
  const geometry = new THREE.CylinderGeometry(POLE_RADIUS, POLE_RADIUS, POLE_HEIGHT, 16);
  const material = new THREE.MeshPhongMaterial({ color: 0x666666 });
  const pole = new THREE.Mesh(geometry, material);
  
  pole.position.set(0, POLE_HEIGHT / 2, 0);
  pole.castShadow = true;
  
  return pole;
}

function createSupportArm() {
  const geometry = new THREE.BoxGeometry(ARM_THICKNESS, ARM_THICKNESS, ARM_LENGTH);
  const material = new THREE.MeshPhongMaterial({ color: 0x666666 });
  const supportArm = new THREE.Mesh(geometry, material);
  
  supportArm.position.set(0, RIM_HEIGHT, ARM_LENGTH / 2);
  supportArm.castShadow = true;
  
  return supportArm;
}

function createStaticBall() {
  const BALL_RADIUS = 0.24;
  const BALL_HEIGHT_OFFSET = 0.1;
  
  const ball = createBallMesh(BALL_RADIUS);
  positionBall(ball, BALL_RADIUS, BALL_HEIGHT_OFFSET);
  
  const seams = createRealisticBasketballSeams(BALL_RADIUS);
  seams.forEach(seam => ball.add(seam));
  
  scene.add(ball);
  return ball;
}

function createBallMesh(radius) {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshPhongMaterial({ color: 0xffa500 });
  const ball = new THREE.Mesh(geometry, material);
  
  ball.castShadow = true;
  return ball;
}

function positionBall(ball, radius, heightOffset) {
  ball.position.set(0, radius + heightOffset, 0);
}

function createRealisticBasketballSeams(ballRadius) {
  const SEAM_THICKNESS = 0.005;
  const seamMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const seams = [];

  const baseGeo = new THREE.TorusGeometry(ballRadius, SEAM_THICKNESS, 8, 128);
  const equator = new THREE.Mesh(baseGeo, seamMaterial);
  seams.push(equator);

  const vertical = new THREE.Mesh(baseGeo, seamMaterial);
  vertical.rotation.y = Math.PI / 2;
  seams.push(vertical);

  [ Math.PI/4, -Math.PI/4 ].forEach(offset => {
    const side = new THREE.Mesh(baseGeo, seamMaterial);
    side.rotation.y = Math.PI / 2 + offset;
    seams.push(side);
  });

  return seams;
}

createCourtLines();
createHoop(HALF_COURT_LENGTH);
createHoop(-HALF_COURT_LENGTH);
createStaticBall();
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