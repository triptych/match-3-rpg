let grid;
const gridSize = 8;
const tileSize = 50;
const emojiSize = 40;
const emojis = [
  { symbol: '⚔️', color: '#FF0000' },  // Red - sword
  { symbol: '🍃', color: '#00FF00' },  // Green - leaf
  { symbol: '💧', color: '#0000FF' },  // Blue - water drop
  { symbol: '⚡', color: '#FFFF00' },  // Yellow - lightning
  { symbol: '🔮', color: '#FF00FF' }   // Purple - crystal ball
];
const monsters = ['👹', '👻', '👽', '🐉', '🦖'];
let selectedTile = null;
let animations = [];
let particles = [];
let canSwap = true;
let score = 0;
let shakeTime = 0;
let shakeAmount = 5;

// Monster variables
let currentMonster;
let monsterHealth;
let monsterMaxHealth = 1000;
let monsterShakeTime = 0;
let monstersKilled = 0;
const totalMonsters = 5; // Set the total number of monsters to defeat

// Game state
let gameOver = false;

function setup() {
  createCanvas(gridSize * tileSize + 200, gridSize * tileSize + 50);
  textAlign(CENTER, CENTER);
  textSize(emojiSize);
  resetGame();
}

function resetGame() {
  grid = createGrid();
  score = 0;
  monstersKilled = 0;
  gameOver = false;
  spawnNewMonster();
}

function spawnNewMonster() {
  currentMonster = random(monsters);
  monsterHealth = monsterMaxHealth;
}

function draw() {
  background(220);
  
  // Draw score
  fill(0);
  textSize(24);
  text(`Score: ${score}`, width / 2, 25);
  
  // Apply shake effect to grid
  push();
  if (shakeTime > 0) {
    translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
    shakeTime--;
  }
  
  // Draw game area
  translate(0, 50);  // Move game area down to make room for score
  drawGrid();
  updateAnimations();
  updateAndDrawParticles();
  pop();
  
  // Draw monster and kill count
  drawMonster();
  
  // Draw win dialog if game is over
  if (gameOver) {
    drawWinDialog();
  }
}

function drawMonster() {
  push();
  translate(gridSize * tileSize + 100, height / 2);
  
  // Draw monster kills
  textSize(20);
  fill(0);
  text(`Monsters Killed: ${monstersKilled}/${totalMonsters}`, 0, -120);
  
  // Apply shake effect to monster
  if (monsterShakeTime > 0) {
    translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
    monsterShakeTime--;
  }
  
  // Draw monster emoji
  textSize(100);
  text(currentMonster, 0, -50);
  
  // Draw health bar
  let healthBarWidth = 150;
  let healthBarHeight = 20;
  noFill();
  stroke(0);
  rect(-healthBarWidth/2, 50, healthBarWidth, healthBarHeight);
  noStroke();
  fill(255, 0, 0);
  rect(-healthBarWidth/2, 50, (monsterHealth / monsterMaxHealth) * healthBarWidth, healthBarHeight);
  pop();
}

function drawWinDialog() {
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);
  
  fill(255);
  rect(width/2 - 150, height/2 - 100, 300, 200);
  
  fill(0);
  textSize(32);
  text("You Win!", width/2, height/2 - 50);
  
  textSize(24);
  text(`Final Score: ${score}`, width/2, height/2);
  
  // Draw play again button
  fill(0, 255, 0);
  rect(width/2 - 75, height/2 + 50, 150, 50);
  fill(0);
  textSize(20);
  text("Play Again", width/2, height/2 + 75);
}

function mousePressed() {
  if (gameOver) {
    // Check if play again button is clicked
    if (mouseX > width/2 - 75 && mouseX < width/2 + 75 && 
        mouseY > height/2 + 50 && mouseY < height/2 + 100) {
      resetGame();
    }
    return;
  }
  
  if (!canSwap) return;
  let x = floor(mouseX / tileSize);
  let y = floor((mouseY - 50) / tileSize);  // Adjust for score area
  if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
    selectedTile = { x, y };
  }
}

function mouseDragged() {
  if (gameOver || !canSwap || !selectedTile) return;
  let x = floor(mouseX / tileSize);
  let y = floor((mouseY - 50) / tileSize);  // Adjust for score area
  if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
    let dx = x - selectedTile.x;
    let dy = y - selectedTile.y;
    if ((Math.abs(dx) === 1 && dy === 0) || (Math.abs(dy) === 1 && dx === 0)) {
      swapTiles(selectedTile.x, selectedTile.y, x, y);
      selectedTile = null;
    }
  }
}

function mouseReleased() {
  selectedTile = null;
}

function createGrid() {
  let newGrid = [];
  for (let i = 0; i < gridSize; i++) {
    newGrid[i] = [];
    for (let j = 0; j < gridSize; j++) {
      let emoji = random(emojis);
      newGrid[i][j] = {
        symbol: emoji.symbol,
        color: emoji.color,
        displayColor: emoji.color,
        x: i * tileSize,
        y: j * tileSize
      };
    }
  }
  return newGrid;
}

function drawGrid() {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let tile = grid[i][j];
      fill(tile.displayColor);
      rect(tile.x, tile.y, tileSize, tileSize);
      fill(0);
      text(tile.symbol, tile.x + tileSize/2, tile.y + tileSize/2);
    }
  }
}

function updateAnimations() {
  for (let i = animations.length - 1; i >= 0; i--) {
    let anim = animations[i];
    anim.update();
    if (anim.finished) {
      animations.splice(i, 1);
    }
  }
}

function updateAndDrawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].isFinished()) {
      particles.splice(i, 1);
    }
  }
}

function swapTiles(x1, y1, x2, y2) {
  if (!canSwap) return;
  canSwap = false;

  let tile1 = grid[x1][y1];
  let tile2 = grid[x2][y2];
  
  animations.push(new SwapAnimation(tile1, x2 * tileSize, y2 * tileSize));
  animations.push(new SwapAnimation(tile2, x1 * tileSize, y1 * tileSize));
  
  // Swap the tiles in the grid
  grid[x1][y1] = tile2;
  grid[x2][y2] = tile1;
  
  setTimeout(() => {
    if (!checkMatches()) {
      // If no matches, swap back
      animations.push(new SwapAnimation(tile1, x1 * tileSize, y1 * tileSize));
      animations.push(new SwapAnimation(tile2, x2 * tileSize, y2 * tileSize));
      
      // Swap the tiles back in the grid
      grid[x1][y1] = tile1;
      grid[x2][y2] = tile2;
    }
    setTimeout(() => {
      canSwap = true;
    }, 500); // Allow new swaps after animations complete
  }, 500); // Wait for initial swap animation to finish
}

function checkMatches() {
  let matched = false;
  let totalMatchLength = 0;
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      // Check horizontal matches
      let horizontalMatch = 1;
      for (let k = 1; k < gridSize - i; k++) {
        if (grid[i][j].symbol === grid[i + k][j].symbol) {
          horizontalMatch++;
        } else {
          break;
        }
      }
      if (horizontalMatch >= 3) {
        matched = true;
        for (let k = 0; k < horizontalMatch; k++) {
          destroyTile(i + k, j);
        }
        totalMatchLength += horizontalMatch;
      }
      
      // Check vertical matches
      let verticalMatch = 1;
      for (let k = 1; k < gridSize - j; k++) {
        if (grid[i][j].symbol === grid[i][j + k].symbol) {
          verticalMatch++;
        } else {
          break;
        }
      }
      if (verticalMatch >= 3) {
        matched = true;
        for (let k = 0; k < verticalMatch; k++) {
          destroyTile(i, j + k);
        }
        totalMatchLength += verticalMatch;
      }
    }
  }
  
  if (matched) {
    score += calculateScore(totalMatchLength);
    shakeGrid();
    damageMonster(totalMatchLength * 10);
  }
  
  return matched;
}

function calculateScore(matchLength) {
  return matchLength * 10;
}

function shakeGrid() {
  shakeTime = 10;  // Shake for 10 frames
}

function damageMonster(damage) {
  monsterHealth -= damage;
  monsterShakeTime = 10;  // Shake monster for 10 frames
  
  if (monsterHealth <= 0) {
    monstersKilled++;
    score += 500;  // Bonus for defeating a monster
    
    if (monstersKilled >= totalMonsters) {
      gameOver = true;
    } else {
      spawnNewMonster();
    }
  }
}

function destroyTile(i, j) {
  animations.push(new FadeOutAnimation(grid[i][j]));
  createParticles(i, j, grid[i][j].color);
  setTimeout(() => {
    let newEmoji = random(emojis);
    grid[i][j].symbol = newEmoji.symbol;
    grid[i][j].color = newEmoji.color;
    grid[i][j].displayColor = newEmoji.color;
  }, 300);
}

function createParticles(i, j, color) {
  let x = i * tileSize + tileSize / 2;
  let y = j * tileSize + tileSize / 2 + 50;  // Adjust for score area
  for (let k = 0; k < 10; k++) {
    particles.push(new Particle(x, y, color));
  }
}

class SwapAnimation {
  constructor(tile, targetX, targetY) {
    this.tile = tile;
    this.startX = tile.x;
    this.startY = tile.y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.progress = 0;
    this.speed = 0.1;
    this.finished = false;
  }
  
  update() {
    this.progress += this.speed;
    if (this.progress >= 1) {
      this.progress = 1;
      this.finished = true;
    }
    this.tile.x = lerp(this.startX, this.targetX, this.progress);
    this.tile.y = lerp(this.startY, this.targetY, this.progress);
  }
}

class FadeOutAnimation {
  constructor(tile) {
    this.tile = tile;
    this.originalColor = color(tile.color);
    this.progress = 0;
    this.speed = 0.1;
    this.finished = false;
  }
  
  update() {
    this.progress += this.speed;
    if (this.progress >= 1) {
      this.progress = 1;
      this.finished = true;
      this.tile.displayColor = this.tile.color; // Reset to the current color (which might be new)
    } else {
      let c = lerpColor(this.originalColor, color(255, 255, 255), this.progress);
      this.tile.displayColor = c.toString('#rrggbb');
    }
  }
}

class Particle {
  constructor(x, y, tileColor) {
    this.x = x;
    this.y = y;
    this.color = color(tileColor);
    this.size = random(5, 10);
    this.speedX = random(-2, 2);
    this.speedY = random(-5, -1);
    this.gravity = 0.2;
    this.life = 255;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += this.gravity;
    this.life -= 5;
  }

  draw() {
    noStroke();
    fill(red(this.color), green(this.color), blue(this.color), this.life);
    ellipse(this.x, this.y, this.size);
  }

  isFinished() {
    return this.life <= 0;
  }
}