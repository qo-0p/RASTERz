let notes = [60, 62, 64, 65, 67, 69, 71, 72]; // MIDI note numbers for each square
let squareSize = 37.5; // Size of each square adjusted to 75% of original size
let osc = null; // Initialize oscillator to null
let leftGrid = []; // 2D array to store the state of each grid square on the left side
let rightPoints = []; // Array to store coordinates clicked on the left side
let playButton; // Button to play the pattern
let resetButton; // Button to reset the pattern
let progressWidth = 0; // Width of the play progress bar

function setup() {
  createCanvas(675, squareSize * 13); // Adjust canvas width to accommodate both rows and space in between

  // Initialize grid state for left side
  for (let i = 0; i < 8; i++) {
    leftGrid[i] = [];
    for (let j = 0; j < 8; j++) {
      leftGrid[i][j] = false; // Set all grid squares on the left side to false (not clicked)
    }
  }

  // Create play button
  playButton = createButton('');
  playButton.position(0, squareSize * 10); // Position the button half a square distance under the left grid
  playButton.size(squareSize, squareSize); // Set the button size to match MIDI note squares
  playButton.mousePressed(playPattern); // Call playPattern function when the button is clicked
  playButton.style('background-color', 'transparent'); // Set button background color to transparent
  playButton.style('border', 'none'); // Remove button border
  playButton.html('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="20px" height="20px"><path d="M8 5v14l11-7z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'); // Insert play symbol as HTML content

  // Create reset button
  resetButton = createButton('');
  resetButton.position(0, squareSize * 11 + squareSize / 2); // Position the reset button below the play button and progress bar
  resetButton.size(squareSize, squareSize); // Set the button size
  resetButton.mousePressed(resetPattern); // Call resetPattern function when the button is clicked
  resetButton.style('background-color', 'black'); // Set button background color to black
  resetButton.style('border', 'none'); // Remove button border
  resetButton.html('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="20px" height="20px"><rect width="20" height="20" fill="none"/><path d="M12 15l-6-6h4V4h4v5h4l-6 6z"/></svg>'); // Insert reset symbol as HTML content
}

function draw() {
  background(255);

  // Draw grid of 8x8 squares on the left side
  stroke(0); // Set stroke color to black
  strokeWeight(0.5); // Set stroke weight to 0.5
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let x = j * squareSize;
      let y = i * squareSize + squareSize * 1.5;
      if (leftGrid[i][j]) {
        fill(0); // Set fill color to black if the grid square is clicked
      } else {
        fill(255); // Set fill color to white if the grid square is not clicked
      }
      rect(x, y, squareSize, squareSize); // Draw grid square
    }
  }

  // Draw play progress bar on the left side
  fill(0); // Set fill color to black
  noStroke(); // No stroke for the progress bar
  let progressBarX = squareSize + 10; // x-coordinate of the progress bar
  let progressBarWidth = squareSize * 7; // width of the progress bar (spanning 7 grid cells)
  rect(progressBarX, squareSize * 10 + squareSize / 4, progressWidth, squareSize / 2); // Draw progress bar

  // Draw grid of 8x8 squares on the right side
  stroke(0); // Set stroke color to black
  strokeWeight(0.5); // Set stroke weight to 0.5
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let x = (j + 9) * squareSize;
      let y = i * squareSize + squareSize * 1.5;
      rect(x, y, squareSize, squareSize); // Draw grid square
    }
  }

  // Draw points and connect with lines on the right side
  drawRightGrid();
}

function mouseClicked() {
  // Check if clicked on the grid on the left side
  if (mouseX < squareSize * 8) {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        let x = j * squareSize;
        let y = i * squareSize + squareSize * 1.5;
        if (mouseX > x && mouseX < x + squareSize && mouseY > y && mouseY < y + squareSize) {
          leftGrid[i][j] = !leftGrid[i][j]; // Toggle the state of the clicked grid square on the left side
          if (leftGrid[i][j]) {
            rightPoints.push(createVector((j + 9.5) * squareSize, (i + 0.5) * squareSize + squareSize * 1.5)); // Store the clicked point coordinates for the right side
          }
        }
      }
    }
  }
}

function playPattern() {
  let pattern = []; // Array to store the clicked squares pattern on the left side
  // Store the clicked squares pattern on the left side
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (leftGrid[i][j]) {
        pattern.push(notes[j]); // Store the MIDI note corresponding to the column
      }
    }
  }

  // Play the pattern
  if (pattern.length > 0) {
    let index = 0;
    let interval = setInterval(() => {
      progressWidth = map(index, 0, pattern.length, 0, squareSize * 7); // Update progress bar width
      playNote(pattern[index]);
      index++;
      if (index === pattern.length) {
        clearInterval(interval);
        progressWidth = 0; // Reset progress bar width
        if (rightPoints.length > 0) {
          rightPoints[rightPoints.length - 1].played = true; // Mark the last point as played
        }
      }
    }, 150); // Play each note with a 0.25 second interval
  }
}

function playNote(note) {
  if (osc === null) {
    osc = new p5.Oscillator();
    osc.setType('triangle');
    osc.start();
  }
  let freq = midiToFreq(note);
  osc.freq(freq);
  osc.amp(0.5);
  setTimeout(() => {
    osc.amp(0);
  }, 100); // Stop the sound after 0.1 second
}

function resetPattern() {
  // Reset left grid and right points
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      leftGrid[i][j] = false;
    }
  }
  rightPoints = [];
}

function drawRightGrid() {
  // Draw lines for the pattern on the right side
  stroke(255); // Set stroke color to white
  strokeWeight(2); // Set stroke weight to 2
  let endPoint = map(progressWidth, 0, squareSize * 7, 0, rightPoints.length - 1);
  for (let i = 0; i < endPoint; i++) {
    line(rightPoints[i].x, rightPoints[i].y, rightPoints[i + 1].x, rightPoints[i + 1].y);
  }
  // Draw points on the right side
  fill(0); // Set fill color to black
  noStroke(); // No stroke for points
  for (let i = 0; i < rightPoints.length; i++) {
    ellipse(rightPoints[i].x, rightPoints[i].y, 8, 8); // Draw point
  }
  // Draw a white circle at the last point if it has been played
  if (rightPoints.length > 0 && rightPoints[rightPoints.length - 1].played) {
    fill(255); // Set fill color to white
    ellipse(rightPoints[rightPoints.length - 1].x, rightPoints[rightPoints.length - 1].y, 12, 12); // Draw circle
  }
}
