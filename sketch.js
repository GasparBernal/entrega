let cols = 15;
let rows = 10;
let baseSpacing = 60;
let margin = 50;

let mic;
let fft;
let zoom = 1;

function setup() {
  createCanvas(800, 600);
  noStroke();
  colorMode(HSB, 360, 100, 100);

  mic = new p5.AudioIn();
  mic.start();
  userStartAudio();

  fft = new p5.FFT();
  fft.setInput(mic);
}

function draw() {
  background(255);

  let spectrum = fft.analyze();
  let lowFreq = fft.getEnergy(20, 250);
  let highFreq = fft.getEnergy(2000, 10000);
  let overallEnergy = fft.getEnergy(20, 10000);


  let threshold = 40;

  if (overallEnergy > threshold) {
    let zoomDelta = 0;

    zoomDelta -= map(lowFreq, 0, 255, 0, 0.4);
    zoomDelta += map(highFreq, 0, 255, 0, 0.6);

    zoom += zoomDelta;
    zoom = constrain(zoom, 0.5, 2);
  }

  push();
  translate(width / 2, height / 2);
  scale(zoom);
  translate(-width / 2, -height / 2);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = margin + i * baseSpacing;
      let y = margin + j * baseSpacing;

      fill((i * 30 + j * 20) % 360, 80, 90);
      ellipse(x, y, 30, 30);
    }
  }

  pop();
}