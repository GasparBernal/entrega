let baseSpacing = 60;
let highDensitySpacing = 20; 
let margin = 50;
let mic, fft;
let zoom = 1;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;
let palette = [];
let broken = false;
let particles = [];
let savedParticles = []; 

function setup() {
  createCanvas(800, 600);
  noStroke();
  colorMode(HSB, 360, 100, 100);
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);
  
  palette = [
    [0, 50, 100], [30, 80, 100], [60, 80, 100], [120, 60, 100], [180, 50, 100],
    [200, 60, 100], [240, 60, 100], [270, 60, 100], [300, 60, 100], [330, 60, 100]
  ];
}

function draw() {
  background(255);
  let spectrum = fft.analyze();
  let lowFreq = fft.getEnergy(20, 250);     // Graves (20Hz-250Hz)
  let highFreq = fft.getEnergy(2000, 10000); // Agudos (2kHz-10kHz)
  let overallEnergy = fft.getEnergy(20, 10000);

  if (!broken && overallEnergy > 40) {
    // Aumentamos la sensibilidad (valores más altos que el intermedio)
    let zoomDelta = map(lowFreq, 0, 255, -0.25, 0) +  // Zoom OUT más rápido
                   map(highFreq, 0, 255, 0, 0.25);    // Zoom IN más rápido

    // Suavizado mínimo (15% por frame) para evitar saltos bruscos
    zoom = lerp(zoom, constrain(zoom + zoomDelta, ZOOM_MIN, ZOOM_MAX), 0.15);

    if (zoom <= ZOOM_MIN + 0.01 || overallEnergy > 230) {
      triggerBreak();
    }
  }

  if (!broken) {
    drawGrid();
  } else {
    drawParticles();
  }
}
function drawGrid() {
  push();
  translate(width / 2, height / 2);
  scale(zoom);
  translate(-width / 2, -height / 2);
  
  let extra = 2;
  let cols = ceil(width / baseSpacing / zoom) + extra;
  let rows = ceil(height / baseSpacing / zoom) + extra;
  let offsetX = width / 2 - (cols * baseSpacing) / 2;
  let offsetY = height / 2 - (rows * baseSpacing) / 2;

  randomSeed(1234);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = offsetX + i * baseSpacing;
      let y = offsetY + j * baseSpacing;
      let c = random(palette);
      fill(c[0], c[1], c[2]);
      ellipse(x, y, 30, 30);
    }
  }
  pop();
}

function drawParticles() {
  // Dibuja las partículas guardadas (sin movimiento)
  for (let p of savedParticles) {
    fill(p.c[0], p.c[1], p.c[2]);
    ellipse(p.pos.x, p.pos.y, 30, 30);
  }
}

function triggerBreak() {
  broken = true;
  savedParticles = [];

  push();
  translate(width / 2, height / 2);
  scale(zoom);
  translate(-width / 2, -height / 2);

  // Usamos highDensitySpacing solo aquí
  let extra = 4; 
  let cols = ceil(width / highDensitySpacing / zoom) + extra;
  let rows = ceil(height / highDensitySpacing / zoom) + extra;
  let offsetX = width / 2 - (cols * highDensitySpacing) / 2;
  let offsetY = height / 2 - (rows * highDensitySpacing) / 2;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = offsetX + i * highDensitySpacing;
      let y = offsetY + j * highDensitySpacing;
      let c = random(palette);

      // Desplazamiento mínimo y superposición
      let dispersion = 2;
      let overlapX = random(-8, 8);
      let overlapY = random(-8, 8);

      // 3 partículas por celda para máxima densidad
      for (let k = 0; k < 3; k++) {
        savedParticles.push({
          pos: createVector(
            x + random(-dispersion, dispersion) + overlapX,
            y + random(-dispersion, dispersion) + overlapY
          ),
          c: c,
          size: random(15, 25) // Tamaño pequeño
        });
      }
    }
  }
  pop();
}
function drawParticles() {
  for (let p of savedParticles) {
    fill(p.c[0], p.c[1], p.c[2]);
    noStroke();
    ellipse(p.pos.x, p.pos.y, p.size, p.size); // Usa tamaño variable
  }
}
function mousePressed() {
  // Resetear al hacer clic
  broken = false;
  zoom = 1;
}