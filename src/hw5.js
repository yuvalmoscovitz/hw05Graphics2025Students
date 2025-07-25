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
// const instructionsElement = document.createElement('div');
// instructionsElement.style.position = 'absolute';
// instructionsElement.style.bottom = '20px';
// instructionsElement.style.left = '20px';
// instructionsElement.style.color = 'white';
// instructionsElement.style.fontSize = '16px';
// instructionsElement.style.fontFamily = 'Arial, sans-serif';
// instructionsElement.style.textAlign = 'left';
// instructionsElement.innerHTML = `
//   <h3>Controls:</h3>
//   <p>O - Toggle orbit camera</p>
// `;
//document.body.appendChild(instructionsElement);

// Handle key events
// function handleKeyDown(e) {
//   if (e.key === "o") {
//     isOrbitEnabled = !isOrbitEnabled;
//   }
// }

document.addEventListener('keydown', handleKeyDown);

///////////////////////////////////////////////////////////////
function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize);

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
  
  // Bonus
  const nbaLogo = createNBALogo();
  backboard.add(nbaLogo);
  
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
  
  const texture = createBasketballTexture();
  const material = new THREE.MeshPhongMaterial({ 
    color: 0xffa500,
    map: texture
  });
  
  const ball = new THREE.Mesh(geometry, material);
  ball.castShadow = true;
  return ball;
}

function createBasketballTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#ff8c00';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const dotSize = 2;
  const spacing = 8;
  const rows = Math.floor(canvas.height / spacing);
  const cols = Math.floor(canvas.width / spacing);
  
  ctx.fillStyle = '#e67300';
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = (row % 2) * (spacing / 2);
      const x = col * spacing + offsetX;
      const y = row * spacing;
      
      if (x < canvas.width && y < canvas.height) {
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  ctx.fillStyle = '#d4590a';
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 1.5 + 0.5;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  return new THREE.CanvasTexture(canvas);
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

function setupLighting() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.05);
  directionalLight.position.set(10, 20, 15);
  directionalLight.castShadow = true;
  
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -25;
  directionalLight.shadow.camera.right = 25;
  directionalLight.shadow.camera.top = 25;
  directionalLight.shadow.camera.bottom = -25;
  
  scene.add(directionalLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.25);
  fillLight.position.set(-10, 10, -10);
  scene.add(fillLight);
}

function createBasicUI() {
  createGlobalStyles();
  
  const scoreContainer = createScoreDisplay();
  document.body.appendChild(scoreContainer);
  
  const controlsContainer = createControlsDisplay();
  document.body.appendChild(controlsContainer);
  
  const statusContainer = createGameStatus();
  document.body.appendChild(statusContainer);
  
  const feedbackEl = document.createElement('div');
  feedbackEl.id = 'feedback';
  feedbackEl.style.position = 'absolute';
  feedbackEl.style.top = '50%';
  feedbackEl.style.left = '50%';
  feedbackEl.style.transform = 'translate(-50%, -50%)';
  feedbackEl.style.color = '#ffcc00';
  feedbackEl.style.fontSize = '28px';
  feedbackEl.style.fontWeight = 'bold';
  feedbackEl.style.textAlign = 'center';
  feedbackEl.style.zIndex = '1000';
  feedbackEl.style.pointerEvents = 'none';
  feedbackEl.style.display = 'none';
  document.body.appendChild(feedbackEl);
  
  setupCameraToggle();
}

function createGlobalStyles() {
  const style = document.createElement('style');
  style.textContent = `
    body {
      margin: 0;
      overflow: hidden;
      font-family: 'Arial', sans-serif;
    }
    
    .ui-container {
      position: absolute;
      color: white;
      font-family: 'Arial', sans-serif;
      font-size: 16px;
      background: rgba(0, 0, 0, 0.7);
      padding: 20px;
      border-radius: 12px;
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      min-width: 200px;
    }
    
    .ui-container h3 {
      margin: 0 0 15px 0;
      font-size: 20px;
      font-weight: bold;
      text-align: center;
      color: #fff;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
    
    .ui-container p {
      margin: 8px 0;
      line-height: 1.6;
      font-size: 14px;
    }
    
    #score-value {
      color: #ffcc00;
      font-weight: bold;
      font-size: 18px;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }
    
    #power-value {
      color: #00ff88;
      font-weight: bold;
      font-size: 16px;
    }
    
    #shots-attempted, #shots-made {
      color: #00bfff;
      font-weight: bold;
    }
    
    #accuracy {
      color: #ff6b6b;
      font-weight: bold;
    }
    
    .control-key {
      background: rgba(255, 255, 255, 0.3);
      padding: 4px 8px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-weight: bold;
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      display: inline-block;
      margin-right: 5px;
    }
    
    #feedback {
      background: rgba(0, 0, 0, 0.8);
      padding: 15px 25px;
      border-radius: 10px;
      border: 2px solid #ffcc00;
      box-shadow: 0 0 20px rgba(255, 204, 0, 0.5);
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    }
    
    .stat-highlight {
      background: rgba(255, 255, 255, 0.1);
      padding: 8px;
      border-radius: 6px;
      margin: 5px 0;
      border-left: 4px solid #00ff88;
    }
  `;
  document.head.appendChild(style);
}

function createScoreDisplay() {
  const scoreContainer = document.createElement('div');
  scoreContainer.id = 'scoreboard';
  scoreContainer.className = 'ui-container';
  
  scoreContainer.style.top = '20px';
  scoreContainer.style.left = '20px';
  
  scoreContainer.innerHTML = `
    <h3>STATS</h3>
    <div class="stat-highlight">
      <p><strong>Score:</strong> <span id="score-value">0</span> points</p>
    </div>
    <p><strong>Shot Power:</strong> <span id="power-value">30%</span></p>
    <p><strong>Attempts:</strong> <span id="shots-attempted">0</span></p>
    <p><strong>Makes:</strong> <span id="shots-made">0</span></p>
    <p><strong>Accuracy:</strong> <span id="accuracy">0%</span></p>
  `;
  
  return scoreContainer;
}

let ball;
let isFlying = false;
let velocity = new THREE.Vector3();
let acceleration = new THREE.Vector3(0, -9.8, 0);

function createInteractiveBall() {
  const BALL_RADIUS = 0.24;
  const BALL_HEIGHT_OFFSET = 0.1;
  
  ball = createBallMesh(BALL_RADIUS);
  positionBall(ball, BALL_RADIUS, BALL_HEIGHT_OFFSET);
  
  const seams = createRealisticBasketballSeams(BALL_RADIUS);
  seams.forEach(seam => ball.add(seam));
  
  scene.add(ball);
  return ball;
}

let shotPower = 0.3;
let targetZ = 0;
const floorY = 0.34;
const rimHeight = 3.05;

let hasScored = false;
const restitution = 0.7;
const rimRadius = 0.35;

let spinAxis = new THREE.Vector3(1, 0, 0);
let spinSpeed = 0;

let shotsAttempted = 0;
let shotsMade = 0;
let score = 0;
let feedbackTimeout;

function updateUI() {
  document.getElementById('power-value').textContent = `${Math.round(shotPower * 100)}%`;
  document.getElementById('shots-attempted').textContent = shotsAttempted;
  document.getElementById('shots-made').textContent = shotsMade;
  document.getElementById('accuracy').textContent = `${shotsAttempted ? Math.round(shotsMade/shotsAttempted*100) : 0}%`;
  document.getElementById('score-value').textContent = score;
  updateGameStatus();
}

function showFeedback(text) {
  clearTimeout(feedbackTimeout);
  const el = document.getElementById('feedback');
  if (text && text.trim() !== '') {
    el.textContent = text;
    el.style.display = 'block';
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = 'pulse 0.5s ease-in-out';
  } else {
    el.style.display = 'none';
  }
  feedbackTimeout = setTimeout(() => {
    el.textContent = '';
    el.style.animation = 'none';
    el.style.display = 'none';
  }, 2000);
}

function handleKeyDown(e) {
  switch(e.key.toLowerCase()) {
    case 'o': 
      isOrbitEnabled = !isOrbitEnabled; 
      break;
    
    case 'arrowleft':  
      if (!isFlying) {
        ball.position.x = Math.max(-COURT_WIDTH/2 + 1, ball.position.x - 0.5);
        ball.rotateZ(0.2);
      }
      break;
    case 'arrowright': 
      if (!isFlying) {
        ball.position.x = Math.min(COURT_WIDTH/2 - 1, ball.position.x + 0.5);
        ball.rotateZ(-0.2);
      }
      break;
    case 'arrowup':    
      if (!isFlying) {
        ball.position.z = Math.max(-COURT_LENGTH/2 + 1, ball.position.z - 0.5);
        ball.rotateX(0.2);
      }
      break;
    case 'arrowdown':  
      if (!isFlying) {
        ball.position.z = Math.min(COURT_LENGTH/2 - 1, ball.position.z + 0.5);
        ball.rotateX(-0.2);
      }
      break;
    
    case 'w':          
      shotPower = Math.min(1, shotPower + 0.03); 
      updatePowerDisplay(); 
      break;
    case 's':          
      shotPower = Math.max(0, shotPower - 0.03); 
      updatePowerDisplay(); 
      break;
    
    case ' ':          
      if (!isFlying) { 
        launchShot(); 
      } 
      break;
    
    case 'r':          
      resetBall(); 
      break;
  }
}

function launchShot() {
  targetZ = (Math.abs(ball.position.x - COURT_LENGTH/2) < Math.abs(ball.position.x + COURT_LENGTH/2))
            ? COURT_LENGTH/2 : -COURT_LENGTH/2;

  const targetVector = new THREE.Vector3(
    targetZ - ball.position.x,
    rimHeight - ball.position.y,
    -ball.position.z
  );

  targetVector.y += 30;
  const direction = targetVector.normalize();
  const speed = shotPower * 30;
  velocity.copy(direction.multiplyScalar(speed));
  
  isFlying = true;
  hasScored = false;
  shotsAttempted++;
  updateUI();
  
  console.log(`Shot launched with power ${Math.round(shotPower * 100)}% toward hoop at x=${targetZ}`);
}

function updatePowerDisplay() {
  const powerElement = document.getElementById('power-value');
  if (powerElement) {
    powerElement.textContent = `${Math.round(shotPower * 100)}%`;
  }
}

function resetBall() {
  if (ball) {
    isFlying = false;
    hasScored = false;
    velocity.set(0, 0, 0);
    ball.position.set(0, 0.24 + 0.1, 0);
    shotPower = 0.3;
    updatePowerDisplay();
    console.log('Ball reset to center court');
  }
}

function createControlsDisplay() {
  const controlsContainer = document.createElement('div');
  controlsContainer.id = 'controls';
  controlsContainer.className = 'ui-container';
  
  controlsContainer.style.bottom = '20px';
  controlsContainer.style.left = '20px';
  
  controlsContainer.innerHTML = `
    <h3>Controls:</h3>
    <p><span class="control-key">O</span> - Toggle orbit camera</p>
    <p><span class="control-key">⬆️ ⬇️ ⬅️ ➡️</span> - Move ball</p>
    <p><span class="control-key">W</span> / <span class="control-key">S</span> - Adjust shot power</p>
    <p><span class="control-key">SPACE</span> - Shoot ball</p>
    <p><span class="control-key">R</span> - Reset ball</p>
  `;
  
  return controlsContainer;
}

function createGameStatus() {
  const statusContainer = document.createElement('div');
  statusContainer.id = 'game-status';
  statusContainer.className = 'ui-container';
  
  statusContainer.style.top = '20px';
  statusContainer.style.right = '20px';
  statusContainer.style.textAlign = 'center';
  
  statusContainer.innerHTML = `
    <h3>GAME STATUS</h3>
    <p id="target-info">Aim for the nearest hoop!</p>
    <p id="ball-status">Ball ready to shoot</p>
  `;
  
  return statusContainer;
}

function updateGameStatus() {
  const targetInfo = document.getElementById('target-info');
  const ballStatus = document.getElementById('ball-status');
  
  if (targetInfo && ballStatus) {
    if (isFlying) {
      targetInfo.textContent = `Shooting toward ${targetZ > 0 ? 'right' : 'left'} hoop`;
      ballStatus.textContent = 'Ball in flight...';
    } else {
      targetInfo.textContent = 'Aim for the nearest hoop!';
      ballStatus.textContent = 'Ball ready to shoot';
    }
  }
}

function setupCameraToggle() {
  document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'o') {
      isOrbitEnabled = !isOrbitEnabled;
      controls.enabled = isOrbitEnabled;
      
      const feedback = document.createElement('div');
      feedback.style.position = 'absolute';
      feedback.style.top = '50%';
      feedback.style.right = '20px';
      feedback.style.transform = 'translateY(-50%)';
      feedback.style.background = 'rgba(0, 0, 0, 0.9)';
      feedback.style.color = isOrbitEnabled ? '#00ff88' : '#ff6b6b';
      feedback.style.padding = '12px 20px';
      feedback.style.borderRadius = '8px';
      feedback.style.fontSize = '16px';
      feedback.style.fontWeight = 'bold';
      feedback.style.border = `2px solid ${isOrbitEnabled ? '#00ff88' : '#ff6b6b'}`;
      feedback.style.zIndex = '1000';
      feedback.textContent = `Camera: ${isOrbitEnabled ? 'FREE' : 'LOCKED'}`;
      
      document.body.appendChild(feedback);
      
      setTimeout(() => {
        if (document.body.contains(feedback)) {
          document.body.removeChild(feedback);
        }
      }, 1500);
    }
  });
}

function createBleachers() {
  const bleacherGroup = new THREE.Group();
  
  const leftBleachers = createBleacherSide('left');
  const rightBleachers = createBleacherSide('right');
  
  bleacherGroup.add(leftBleachers);
  bleacherGroup.add(rightBleachers);

  bleacherGroup.rotation.y = Math.PI / 2;
  
  scene.add(bleacherGroup);
  return bleacherGroup;
}

function createBleacherSide(side) {
  const BLEACHER_CONFIG = {
    levels: 6,
    stepHeight: 0.4,
    stepDepth: 0.8,
    seatWidth: 0.7,
    bleacherOffset: 0.4,
    railingHeight: 0.5,
    supportSpacing: 4
  };
  
  const sideGroup = new THREE.Group();
  const seatLength = COURT_LENGTH;
  const direction = side === 'left' ? -1 : 1;
  
  for (let level = 0; level < BLEACHER_CONFIG.levels; level++) {
    const seat = createBleacherLevel(level, seatLength, BLEACHER_CONFIG, direction);
    sideGroup.add(seat);
  }
  
  const supports = createBleacherSupports(BLEACHER_CONFIG, seatLength, direction);
  supports.forEach(support => sideGroup.add(support));
  
  const railings = createBleacherRailings(BLEACHER_CONFIG, seatLength, direction);
  railings.forEach(railing => sideGroup.add(railing));
  
  return sideGroup;
}

function createBleacherLevel(level, seatLength, config, direction) {
  const levelGroup = new THREE.Group();
  
  const height = config.stepHeight * level;
  const xOffset = (COURT_WIDTH / 2) + config.bleacherOffset + (level * config.stepDepth);
  const xPosition = direction * xOffset;
  
  const seatGeometry = new THREE.BoxGeometry(config.stepDepth, config.stepHeight, seatLength);
  const seatMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xe8e8e8,
    shininess: 30 
  });
  
  const seat = new THREE.Mesh(seatGeometry, seatMaterial);
  seat.position.set(xPosition, height + config.stepHeight / 2, 0);
  seat.castShadow = true;
  seat.receiveShadow = true;
  levelGroup.add(seat);
  
  const numSeats = Math.floor(seatLength / config.seatWidth);
  for (let i = 0; i < numSeats; i++) {
    const seatMarker = createSeatMarker(config, xPosition, height, seatLength, i, numSeats);
    levelGroup.add(seatMarker);
  }
  
  return levelGroup;
}

function createSeatMarker(config, xPosition, height, seatLength, seatIndex, totalSeats) {
  const markerGeometry = new THREE.BoxGeometry(0.05, 0.15, 0.05);
  const markerMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
  
  const marker = new THREE.Mesh(markerGeometry, markerMaterial);
  
  const startZ = -seatLength / 2 + config.seatWidth / 2;
  const zPosition = startZ + (seatIndex * config.seatWidth);
  
  marker.position.set(
    xPosition,
    height + config.stepHeight + 0.075,
    zPosition
  );
  
  marker.castShadow = true;
  return marker;
}

function createBleacherSupports(config, seatLength, direction) {
  const supports = [];
  const supportMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
  
  const numSupports = Math.ceil(seatLength / config.supportSpacing);
  const maxHeight = config.stepHeight * config.levels;
  
  for (let i = 0; i <= numSupports - 1; i++) {
    const zPosition = -seatLength / 2 + (i * config.supportSpacing);
    
    const supportGeometry = new THREE.BoxGeometry(0.2, maxHeight, 0.2);
    const support = new THREE.Mesh(supportGeometry, supportMaterial);
    
    const xPosition = direction * ((COURT_WIDTH / 2) + config.bleacherOffset - 0.2);
    support.position.set(xPosition, maxHeight / 2, zPosition);
    support.castShadow = true;
    support.receiveShadow = true;
    
    supports.push(support);
    
    if (i < numSupports -1 ) {
      const bracing = createDiagonalBracing(
        xPosition, 
        zPosition, 
        zPosition + config.supportSpacing, 
        maxHeight,
        supportMaterial
      );
      supports.push(bracing);
    }
  }
  
  return supports;
}

function createDiagonalBracing(xPosition, z1, z2, height, material) {
  const braceLength = Math.sqrt(Math.pow(z2 - z1, 2) + Math.pow(height, 2));
  const braceGeometry = new THREE.BoxGeometry(0.1, 0.1, braceLength);
  const brace = new THREE.Mesh(braceGeometry, material);
  
  const midZ = (z1 + z2) / 2;
  const angle = Math.atan2(height, z2 - z1);
  
  brace.position.set(xPosition, height / 2, midZ);
  brace.rotation.x = -angle;
  brace.castShadow = true;
  
  return brace;
}

function createBleacherRailings(config, seatLength, direction) {
  const railings = [];
  const railingMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
  
  const topLevel = config.levels - 1;
  const railingHeight = config.stepHeight * topLevel + config.railingHeight;
  const xPosition = direction * ((COURT_WIDTH / 2) + config.bleacherOffset + (topLevel * config.stepDepth) + config.stepDepth / 2);
  
  const railGeometry = new THREE.BoxGeometry(0.08, 0.08, seatLength);
  const topRail = new THREE.Mesh(railGeometry, railingMaterial);
  topRail.position.set(xPosition, railingHeight, 0);
  topRail.castShadow = true;
  railings.push(topRail);
  
  const numPosts = Math.ceil(seatLength / 3);
  for (let i = 0; i <= numPosts; i++) {
    const postGeometry = new THREE.BoxGeometry(0.06, config.railingHeight, 0.06);
    const post = new THREE.Mesh(postGeometry, railingMaterial);
    
    const zPosition = -seatLength / 2 + (i * (seatLength / numPosts));
    const postHeight = config.stepHeight * topLevel + config.railingHeight / 2;
    
    post.position.set(xPosition, postHeight, zPosition);
    post.castShadow = true;
    railings.push(post);
  }
  
  return railings;
}

function create3DBanner() {
  const bannerGroup = new THREE.Group();
  
  const screen = createLEDScreen();
  
  bannerGroup.add(screen);
  
  bannerGroup.position.set(0, 8, 0);
  
  scene.add(bannerGroup);
  return bannerGroup;
}

function createLEDScreen() {
  const SCREEN_CONFIG = {
    size: 2,
    segments: 32
  };
  
  // Create animated LED texture
  const texture = createAnimatedLEDTexture();
  
  // Screen material with glow effect
  const screenMaterial = new THREE.MeshBasicMaterial({ 
    map: texture,
    transparent: true,
    opacity: 0.95
  });
  
  // Create cube screen
  const cubeScreen = new THREE.Mesh(
    new THREE.BoxGeometry(SCREEN_CONFIG.size, SCREEN_CONFIG.size, SCREEN_CONFIG.size, SCREEN_CONFIG.segments, SCREEN_CONFIG.segments, SCREEN_CONFIG.segments),
    screenMaterial
  );
  
  cubeScreen.position.set(0, 0, 0);
  
  // Add screen glow effect around the cube
  const glowGeometry = new THREE.BoxGeometry(SCREEN_CONFIG.size + 0.2, SCREEN_CONFIG.size + 0.2, SCREEN_CONFIG.size + 0.2);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x39FF14,
    transparent: true,
    opacity: 0.05,
    side: THREE.DoubleSide
  });
  
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.position.set(0, 0, 0);
  
  const screenGroup = new THREE.Group();
  screenGroup.add(glow);
  screenGroup.add(cubeScreen);
  
  return screenGroup;
}

function createAnimatedLEDTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Create LED grid background
  ctx.fillStyle = '#0d0d1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add LED dot pattern
  const dotSize = 3;
  const spacing = 12;
  ctx.fillStyle = '#1a1a2e';
  
  for (let x = spacing; x < canvas.width; x += spacing) {
    for (let y = spacing; y < canvas.height; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Main text with LED effect
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, '#00bfff');
  gradient.addColorStop(0.5, '#00ffff');
  gradient.addColorStop(1, '#00bfff');
  
  ctx.fillStyle = gradient;
  ctx.font = 'bold 120px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Add text glow effect
  ctx.shadowColor = '#00bfff';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  ctx.fillText('NBA', canvas.width / 2, canvas.height / 2);
  
  // Add LED scan line effect
  ctx.shadowBlur = 0;
  const scanLineGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  scanLineGradient.addColorStop(0, 'rgba(0, 191, 255, 0)');
  scanLineGradient.addColorStop(0.5, 'rgba(0, 191, 255, 0.08)');
  scanLineGradient.addColorStop(1, 'rgba(0, 191, 255, 0)');
  
  ctx.fillStyle = scanLineGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  return new THREE.CanvasTexture(canvas);
}

function createKeyArea(courtEnd, config, material) {
  const direction = Math.sign(courtEnd);
  const freeThrowLineX = courtEnd - (direction * config.length);
  
  const keyPoints = [
    new THREE.Vector3(courtEnd, Y_LINE, -config.width / 2),
    new THREE.Vector3(courtEnd, Y_LINE, config.width / 2),
    new THREE.Vector3(freeThrowLineX, Y_LINE, config.width / 2),
    new THREE.Vector3(freeThrowLineX, Y_LINE, -config.width / 2),
    new THREE.Vector3(courtEnd, Y_LINE, -config.width / 2)
  ];
  
  const keyGeometry = new THREE.BufferGeometry().setFromPoints(keyPoints);
  return new THREE.Line(keyGeometry, material);
}

function createFreeThrowCircle(courtEnd, config, material) {
  const direction = Math.sign(courtEnd);
  const freeThrowLineX = courtEnd - (direction * config.length);
  const radius = config.width / 2;
  
  const circlePoints = [];
  
  for (let i = 0; i <= config.segments; i++) {
    const angle = Math.PI * (i / config.segments); // Semicircle from 0 to π
    const z = Math.cos(angle) * radius;
    const x = freeThrowLineX - (direction * Math.sin(angle) * radius);
    
    circlePoints.push(new THREE.Vector3(x, Y_LINE, z));
  }
  
  const circleGeometry = new THREE.BufferGeometry().setFromPoints(circlePoints);
  return new THREE.Line(circleGeometry, material);
}

function createKeyAndFreeThrow() {
  const ENHANCED_CONFIG = {
    width: 3.92,            
    length: 3.28,           
    segments: 64,
    freeThrowRadius: 1.96,  
    hashMarkLength: 0.24,   
    hashMarkSpacing: 0.48   
  };
  
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const courtEnds = [-HALF_COURT_LENGTH, HALF_COURT_LENGTH];
  
  courtEnds.forEach(courtEnd => {
    const keyArea = createKeyArea(courtEnd, ENHANCED_CONFIG, lineMaterial);
    const freeThrowCircle = createFreeThrowCircle(courtEnd, ENHANCED_CONFIG, lineMaterial);
    
    const hashMarks = createLaneHashMarks(courtEnd, ENHANCED_CONFIG, lineMaterial);
    const freeThrowLine = createFreeThrowLine(courtEnd, ENHANCED_CONFIG, lineMaterial);
    
    scene.add(keyArea);
    scene.add(freeThrowCircle);
    hashMarks.forEach(mark => scene.add(mark));
    scene.add(freeThrowLine);
  });
}

function createLaneHashMarks(courtEnd, config, material) {
  const direction = Math.sign(courtEnd);
  const hashMarks = [];
  const numMarks = Math.floor(config.length / config.hashMarkSpacing);
  
  for (let i = 1; i < numMarks; i++) {
    const xPosition = courtEnd - (direction * i * config.hashMarkSpacing);
    
    // Top side hash marks
    const topHashPoints = [
      new THREE.Vector3(xPosition, Y_LINE, -config.width / 2 - config.hashMarkLength),
      new THREE.Vector3(xPosition, Y_LINE, -config.width / 2)
    ];
    
    // Bottom side hash marks
    const bottomHashPoints = [
      new THREE.Vector3(xPosition, Y_LINE, config.width / 2),
      new THREE.Vector3(xPosition, Y_LINE, config.width / 2 + config.hashMarkLength)
    ];
    
    hashMarks.push(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(topHashPoints), material),
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(bottomHashPoints), material)
    );
  }
  
  return hashMarks;
}

function createFreeThrowLine(courtEnd, config, material) {
  const direction = Math.sign(courtEnd);
  const freeThrowLineX = courtEnd - (direction * config.length);
  
  const linePoints = [
    new THREE.Vector3(freeThrowLineX, Y_LINE, -config.width / 2),
    new THREE.Vector3(freeThrowLineX, Y_LINE, config.width / 2)
  ];
  
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
  return new THREE.Line(lineGeometry, material);
}


function createNBALogo() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  
  const ctx = canvas.getContext('2d');
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#0066CC';
  ctx.font = 'bold 96px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  ctx.fillText('NBA', canvas.width / 2, canvas.height / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  const logoMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.1
  });
  
  const logoGeometry = new THREE.PlaneGeometry(0.6, 0.3);
  const logoMesh = new THREE.Mesh(logoGeometry, logoMaterial);
  
  logoMesh.position.set(0, 0.2, BOARD_THICKNESS / 2 + 0.001);
  
  return logoMesh;
}

createCourtLines();
createHoop(HALF_COURT_LENGTH);
createHoop(-HALF_COURT_LENGTH);
createInteractiveBall();
setupLighting();
createBasicUI();
createBleachers();
create3DBanner();
createKeyAndFreeThrow();
///////////////////////////////////////////////////////////////

function animate() {
  requestAnimationFrame(animate);
  
  if (isFlying) {
    const dt = 1/60;
    
    velocity.addScaledVector(acceleration, dt);
    ball.position.addScaledVector(velocity, dt);
    
    const tmp = new THREE.Vector3().crossVectors(velocity, new THREE.Vector3(0, 1, 0));
    const speed = velocity.length() / 0.24;

    if (tmp.lengthSq() > 1e-6) {
      spinAxis.copy(tmp.normalize());
      spinSpeed = speed;
    }

    const spinAngle = spinSpeed * dt;
    ball.rotateOnWorldAxis(spinAxis, spinAngle);
    
    updateGameStatus();
    
    if (ball.position.y <= floorY) {
      ball.position.y = floorY;
      velocity.y *= -restitution;
      
      if (Math.abs(velocity.y) < 1) {
        isFlying = false;
        velocity.y = 0;
        if (!hasScored) {
          showFeedback('MISSED SHOT!');
        }
        updateGameStatus();
        console.log('Ball stopped bouncing');
      }
    }
    
    const boardOffset = 1 + 0.05/2;
    const boardX = (targetZ > 0) ? COURT_LENGTH/2 - boardOffset : -COURT_LENGTH/2 + boardOffset;
    
    if (
      Math.abs(ball.position.x - boardX) < 0.24 &&
      ball.position.y > rimHeight - 1 &&
      ball.position.y < rimHeight + 1 &&
      Math.abs(ball.position.z) < 1
    ) {
      velocity.x = -velocity.x * restitution;
      console.log('Ball hit backboard');
    }
    
    const rimOffset = 1 + 0.05/2 + 0.35;
    const rimX = (targetZ > 0) ? COURT_LENGTH/2 - rimOffset : -COURT_LENGTH/2 + rimOffset;
    const dz = ball.position.z;
    const dx = ball.position.x - rimX;
    const horizDist = Math.hypot(dx, dz);
    
    if (
      !hasScored &&
      velocity.y < 0 &&
      Math.abs(ball.position.y - rimHeight) < 0.24 &&
      horizDist < (rimRadius - 0.24)
    ) {
      hasScored = true;
      shotsMade++;
      score += 2;
      showFeedback('SHOT MADE!');
      updateUI();
      console.log('SHOT MADE!');
      velocity.y = -1;
      velocity.x = 0;
      velocity.z = 0;
    }
    
    if (
      Math.abs(ball.position.y - rimHeight) < 0.1 &&
      horizDist > (rimRadius - 0.24) && 
      horizDist < (rimRadius + 0.1)
    ) {
      const normal = new THREE.Vector3(dx, 0, dz).normalize();
      const dotProduct = velocity.dot(normal);
      velocity.addScaledVector(normal, -2 * dotProduct * restitution);
      console.log('Ball hit rim');
    }
    
    if (ball.position.x < -COURT_LENGTH/2 - 5 || ball.position.x > COURT_LENGTH/2 + 5) {
      isFlying = false;
      showFeedback('MISSED SHOT!');
      updateUI();
      updateGameStatus();
      console.log('Ball went out of bounds');
    }
  }
  
  controls.enabled = isOrbitEnabled;
  controls.update();
  renderer.render(scene, camera);
}

animate();