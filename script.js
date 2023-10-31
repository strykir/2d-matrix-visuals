var matrixSubmitted = false;
var matrixTransformed = false;
var vectorSubmitted = false;

var matrixTransforming = false;
var vectorTransforming = false;

var planeCanvas  = document.getElementById("cPlane");
var planeCtx = planeCanvas.getContext("2d");

var vectorCanvas  = document.getElementById("drawnVector");
var vectorCtx = vectorCanvas.getContext("2d");

var defaultGrid = new gridObj(500, 21);

var prevVector = [1,1];
//running code starts here
setSpace();
//running code ends here

//functions and methods
  // interacting with UI
function changeStatus(newString){
  document.getElementById("statusText").innerHTML = newString;
}

function submitMatrix() {
  var elements = document.getElementsByClassName("matrixInputs");
  
  for (let i = 0; i < elements.length; i++) {
      elements[i].value = parseFloat(elements[i].value);
  }
  
  for (let i = 0; i < elements.length; i++) {
    if (isNaN(elements[i].value)) {
      changeStatus("invalid matrix input (not a number)");
      return;
    }
  }
  // if (elements[0].value * elements[3].value - elements[1].value * elements[2].value == 0) {
  //   changeStatus("determinant equals zero");
  //   return;
  // }
  for (let i = 0; i < elements.length; i++) {
      elements[i].setAttribute("readonly", "true");
  }
  matrixSubmitted = true;
  changeStatus("submitted matrix");
}

function resetMatrix(){
  var elements = document.getElementsByClassName("matrixInputs");
  for (let i = 0; i < elements.length; i++) {
    elements[i].removeAttribute('readonly');
    if (i == 0 || i == 3) elements[i].value = 1;
    else elements[i].value = 0;
  }
  setSpace(); 
  matrixSubmitted = false;
  matrixTransformed = false;
  changeStatus("resetted matrix");
  matrixTransforming = false;
}
  
function submitVector() {
  if (matrixTransformed) {
    changeStatus("space is transformed");
    return;
  }
  
  let elements = document.getElementsByClassName("vectorInputs");
  let valid = true;
  
  for (let i = 0; i < elements.length; i++) {
    elements[i].value = parseFloat(elements[i].value);
  }
  
  for (let i = 0; i < elements.length; i++) {
    if (isNaN(elements[i].value)) {
      changeStatus("invalid vector (not a number)");
      return;
    }
  }
  
  for (let i = 0; i < elements.length; i++) {
    elements[i].setAttribute("readonly", "true");
  }
  drawCurrentVector();  
  vectorSubmitted = true;
  changeStatus("submitted vector");
}
  
function resetVector(grid = defaultGrid){
  var elements = document.getElementsByClassName("vectorInputs");
  for (let i = 0; i < elements.length; i++) {
    elements[i].removeAttribute('readonly');
    elements[i].value = 1;
  }
  vectorSubmitted = false;
  vectorCtx.clearRect(-1 * (grid.radius + 10), -1 * (grid.radius + 10), 2 * (grid.radius + 10), 2 * (grid.radius + 10));
  changeStatus("resetted vector");
  vectorTransforming = false;
}

  // transforming matrix space helpers
function setSpace(grid = defaultGrid, LU = 1, LD = 0, RU = 0, RD = -1){
  planeCtx.setTransform(1,0,0,-1, grid.radius, grid.radius);
  planeCtx.clearRect(-1 * (grid.radius + 10), -1 * (grid.radius + 10), 2 * (grid.radius + 10), 2 * (grid.radius + 10));
  planeCtx.setTransform(LU,LD,RU,RD, grid.radius, grid.radius);
  
  let maxR = grid.getMaxValueOfInverseCoords() * 2;
  
  grid.defineGridPoints(maxR);    

  planeCtx.beginPath();
  
  // main axis
  planeCtx.lineWidth = 5;
  planeCtx.moveTo(grid.getVerticalLinePoints(0)[0][0], grid.getVerticalLinePoints(0)[0][1]);
  planeCtx.lineTo(grid.getVerticalLinePoints(0)[1][0], grid.getVerticalLinePoints(0)[1][1]);
  planeCtx.moveTo(grid.getHorizontalLinePoints(0)[0][0], grid.getHorizontalLinePoints(0)[0][1]);
  planeCtx.lineTo(grid.getHorizontalLinePoints(0)[1][0], grid.getHorizontalLinePoints(0)[1][1]);
  planeCtx.stroke();
  
  // grid lines
  planeCtx.lineWidth = 2;
  for (let i = 1; i < grid.verticalLinePoints.length; i++){
  planeCtx.moveTo(grid.getVerticalLinePoints(i)[0][0], grid.getVerticalLinePoints(i)[0][1]);
  planeCtx.lineTo(grid.getVerticalLinePoints(i)[1][0], grid.getVerticalLinePoints(i)[1][1]);
  planeCtx.moveTo(grid.getHorizontalLinePoints(i)[0][0], grid.getHorizontalLinePoints(i)[0][1]);
  planeCtx.lineTo(grid.getHorizontalLinePoints(i)[1][0], grid.getHorizontalLinePoints(i)[1][1]);
  }
  
  planeCtx.stroke();
}

function setSpaceDetZero(grid = defaultGrid, LU, LD){
  planeCtx.setTransform(1,0,0,-1, grid.radius, grid.radius);
  planeCtx.clearRect(-1 * (grid.radius + 10), -1 * (grid.radius + 10), 2 * (grid.radius + 10), 2 * (grid.radius + 10));
  
  let P1 = [LU * 1000, LD * 1000];
  let P2 = [LU * -1000, LD * -1000];
  
  planeCtx.beginPath();
  planeCtx.moveTo(P1[0], P1[1]);
  planeCtx.lineTo(P2[0], P2[1]);
  planeCtx.stroke();
}

function gridObj(canvasRadius, linesPerCanvas){ // expect LPC to be odd
  this.defineGridPoints = function(maxR = this.radius){
    this.verticalLinePoints = new Array();
    this.horizontalLinePoints = new Array();
    
    // main vertical axis
    let linePointPair = [[0, maxR + 10], [0, -1 * (maxR + 10)]];
    this.verticalLinePoints[0] = linePointPair;
    // minor vertical lines
    let count = 1;
    for (let i = this.spacing; i <= maxR; i+= this.spacing){
      linePointPair = [[i, maxR + 10], [i, -1 * (maxR + 10)]];
      this.verticalLinePoints[count] = linePointPair;
      count ++;
    }
    for (let i = -1 * this.spacing; i >= -1 * maxR; i -= this.spacing){
      linePointPair = [[i, maxR + 10],[i, -1 *(maxR + 10)]];
      this.verticalLinePoints[count] = linePointPair;
      count++;
    }
    
    //main horizontal axis
    linePointPair = [[(maxR + 10),0],[-1 * (maxR + 10),0]];
    this.horizontalLinePoints[0] = linePointPair;
    // minor horizontal lines
    count = 1;
    for (let i = this.spacing; i <= maxR; i += this.spacing){
      linePointPair = [[maxR + 10, i],[-1 *(maxR + 10) , i]];
      this.horizontalLinePoints[count] = linePointPair;
      count++;
    }
    for (let i = -1 * this.spacing; i >= -1 * maxR; i -= this.spacing){
      linePointPair = [[maxR + 10, i], [-1 *(maxR + 10), i]];
      this.horizontalLinePoints[count] = linePointPair;
      count++;
    }
  }
  
  this.getVerticalLinePoints = function(index){
    return this.verticalLinePoints[index];
  }// returns a pair of points
  
  this.getHorizontalLinePoints = function(index){
    return this.horizontalLinePoints[index];
  } // returns a pair of points
  
  this.getMaxValueOfInverseCoords = function(){
    // gets the max value of any components on the transformed grid
    let matrix = getMatrix();
    let det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    if (det == 0) return 500;
    let inverse = computeInverse();
    let values = [matrixVectorMultiply(inverse, [-500,500]), matrixVectorMultiply(inverse, [500,500])]; // only does 2 of the 4 corners since excluded points are opposites of the 2 used here (are negatives)
    let max = 0;
    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < values[i].length; j++){
        if (values[i][j] <= 0) values[i][j] *= -1;
        if (values[i][j] > max) max = values[i][j]; 
      }
    }
    return max;
  }
  
  this.getSpacing = function(){
    let space = 2 * this.radius / this.lineCount;
    return space;
  }
  
  this.radius = canvasRadius;
  this.lineCount = linesPerCanvas - 1;
  this.spacing = this.getSpacing();
  
  this.defineGridPoints();
}

function transformSpace(grid = defaultGrid){
  if (!matrixSubmitted) {
    changeStatus("matrix not submitted");
    return;
  }
  
  if (matrixTransformed) {
    changeStatus("already transformed");
    return;
  }
  
  matrixTransformed = true;
  
  let matrix = getMatrix();
  
  if (matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0] == 0){
    setSpaceDetZero(grid, matrix[0][0], matrix[0][1]);
  } else{
    matrix[0][1] *= -1;
    matrix[1][0] *= -1;
    setSpace(grid, matrix[0][0], matrix[0][1], matrix[1][0], matrix[1][1]);
  }
}

function getMatrix(){
  let matrix = [[document.getElementById("LU").value, document.getElementById("LD").value] , [document.getElementById("RU").value, document.getElementById("RD").value]];
  return matrix;
}

function resetSpaceToDefault(){
  setSpace(); 
  matrixTransformed = false;
  changeStatus("resetted space");
  matrixTransforming = false;
}

  // transforming vector helpers
function getVector(){
  return [parseDouble(document.getElementById("X").value), parseDouble(document.getElementById("Y").value)];
}

function drawCurrentVector(grid = defaultGrid, X = document.getElementById("X").value, Y = document.getElementById("Y").value){
  vectorCtx.clearRect(-1 * (grid.radius + 10), -1 * (grid.radius + 10), 2 * (grid.radius + 10), 2 * (grid.radius + 10));
  X *= grid.spacing;
  Y *= grid.spacing;
  
  vectorCtx.setTransform(1,0,0,-1, grid.radius, grid.radius);
  vectorCtx.lineWidth = 4;
  vectorCtx.strokeStyle = "#0000FF";
  vectorCtx.beginPath();
  
  vectorCtx.moveTo(0, 0);
  vectorCtx.lineTo(X, Y);
  
  // arrowhead
  if (Y == 0){
    vectorCtx.lineTo(0.85 * X, 0.05 * X);
    vectorCtx.moveTo(X,Y);
    vectorCtx.lineTo(0.85 * X, -0.05 * X);
  } else if(X == 0){
    vectorCtx.lineTo(0.05 * Y, 0.85 * Y);
    vectorCtx.moveTo(X,Y);
    vectorCtx.lineTo(-0.05 * Y, 0.85 * Y);
  } else{
    let perpSlope = -1 * X/Y;
    vectorCtx.lineTo(0.85 * X + 0.05 * X / perpSlope, 0.85 * Y + 0.05 * X);
    vectorCtx.moveTo(X,Y);
    vectorCtx.lineTo(0.85 * X - 0.05 * X / perpSlope, 0.85 * Y - 0.05 * X);
  }
  vectorCtx.stroke();
}

function transformVector(grid = defaultGrid){
  if (matrixTransformed){
    setStatus("space is transformed; reset space to transform vector");
    return;
  }
  
  if (!vectorSubmitted || !matrixSubmitted){
    let statusString = "";
    if (!vectorSubmitted) statusString += "vector not submitted\n\n";
    if (!matrixSubmitted) statusString += "matrix not submitted";
    changeStatus(statusString);
    return;
  }
  
  let matrix = getMatrix();
  let vector = [document.getElementById("X").value, document.getElementById("Y").value];
  prevVector = vector;
  vector = matrixVectorMultiply(matrix, vector);
  
  document.getElementById("X").value = vector[0];
  document.getElementById("Y").value = vector[1];

  drawCurrentVector(grid, vector[0], vector[1]);
}

function matrixVectorMultiply(matrix, vector){
    // expect a 2d row vector; multiplies the matrix and the transpose of the vector; returns a transformed row vector
  let prevX = vector[0];
  let prevY = vector[1];
  let newVector = [0,0];
  newVector[0] = matrix[0][0] * prevX + matrix[1][0] * prevY;
  newVector[1] = matrix[0][1] * prevX + matrix[1][1] * prevY;
  return newVector;
}

function computeInverse(){
  // computes the inverse of the current matrix
  let matrix = getMatrix();
  let det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  let inverseDet = 1/det;
  if (det == 0) return [[0,0],
                        [0,0]];
  let inverseMatrix = [[inverseDet * matrix[1][1], -1 * inverseDet * matrix[0][1]],
                       [-1 * inverseDet * matrix[1][0], inverseDet * matrix[0][0]]];
  return inverseMatrix;
}

  // animate functions and helper
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function smoothstep(x){
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return 3 * x * x - 2 * x * x * x;
}

async function animateTransformSpace(grid = defaultGrid){
  if (!matrixSubmitted) {
    changeStatus("matrix not submitted");
    return;
  }
  
  if (vectorSubmitted){
    changeStatus("vector is currently displayed");
    return;
  }
  
  if (matrixTransforming) {
    changeStatus("matrix is currently transforming");
    return;
  }
  matrixTransforming = true;
  
  matrixTransformed = false;
  
  let matrix = getMatrix();
  
  matrix[0][0] -= 1;
  matrix[1][1] -= 1;
  
  matrix[0][1] *= -1;
  matrix[1][0] *= -1;
  
  for (let i = 0; i <= 1; i += 0.01){
    let j = smoothstep(i);
    setSpace(grid, j * matrix[0][0] + 1, j * matrix[0][1], j * matrix[1][0], j * matrix[1][1] + 1);
    await sleep(10);
  }
  transformSpace();
  matrixTransforming = false;
  changeStatus("matrix is transformed");
}

async function animateTransformVector(grid = defaultGrid){ //FIX THIS SOMETIME
    if (matrixTransformed){
    setStatus("space is transformed; reset space to transform vector");
    return;
  }
  
  if (vectorTransforming) {
    changeStatus("vector is currently transforming");
    return;
  }
  vectorTransforming = true;
  
  if (!vectorSubmitted || !matrixSubmitted){
    let statusString = "";
    if (!vectorSubmitted) statusString += "vector not submitted\n\n";
    if (!matrixSubmitted) statusString += "matrix not submitted";
    changeStatus(statusString);
    return;
  }
  
  let matrix = getMatrix();
  let X1 = parseFloat(document.getElementById("X").value);
  let Y1 = parseFloat(document.getElementById("Y").value);
  
  let X2 = matrixVectorMultiply(matrix, [X1, Y1])[0];
  let Y2 = matrixVectorMultiply(matrix, [X1, Y1])[1];
  
  let diffX = X2 - X1;
  let diffY = Y2 - Y1;
  
  for (let i = 0; i <= 1; i += 0.01){
    let j = smoothstep(i);
    drawCurrentVector(grid, X1 + j * diffX, Y1 + j * diffY);
    await sleep(5);
  }
  transformVector();
  vectorTransforming = false;
  changeStatus("vector is transformed");
}