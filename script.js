// Austin Cultra

var origBoard; // represents the board
var humanSymbol = ""; // represents the human player's symbol
var computerSymbol = ""; // represents the computer player's symbol
var humanTurn = 0; // 1 if it is the human player's turn
var computerTurn = 0; // 1 if it is the computer player's turn
var turns = 0; // counts the number of turns made

const spaces = document.querySelectorAll('.cell'); // defines the squares on the board

// starts the game
function startGame() {
  turns = 0;
  humanTurn = 0;
  computerTurn = 0;
  chooseSymbol(humanSymbol); // choose x for the human symbol by default if needed
  document.querySelector(".picksymbol").style.display = "none"; // hides the picksymbol menu
  document.querySelector(".humanwin").style.display = "none"; // hides the picksymbol menu
  document.querySelector(".computerwin").style.display = "none"; // hides the picksymbol menu
  document.querySelector(".tie").style.display = "none"; // hides the picksymbol menu
  origBoard = Array.from(Array(9).keys()); // creates an array from 0 to 8 to hold the spaces
  for (var i = 0; i < spaces.length; i++) {
    spaces[i].innerText = ''; // no text in the spaces by default
    spaces[i].addEventListener('click',turnClick,false); // lets the player click on each square
  }

  // places the first x token automatically if the computer player goes first
  if (turns === 0 && computerTurn === 1) {
    turn(bestSpot(),computerSymbol);
  }
}

// assigns symbols to players
function chooseSymbol(player) {
  // if the human player chooses x
  if (player === 'x') {
    humanSymbol = "x";
    computerSymbol = "o";
    humanTurn = 1; // human player goes first
  }

  // if the human player chooses o
  else if (player === 'o') {
    humanSymbol = "o";
    computerSymbol = "x";
    computerTurn = 1; // computer player goes first
  }

  // defaults to x if the human player doesn't choose a symbol
  else {
    humanSymbol = "x";
    computerSymbol = "o";
    humanTurn = 1; // human player goes first
  }

}

// inserts an x or o in the grid square that the player clicks on and swaps turns
function turnClick(square) {
  // if the human player goes first and the board square is open
    if (humanTurn === 1 && typeof origBoard[square.target.id] == 'number') {
        turn(square.target.id, humanSymbol); // the human player places their symbol in an open spot

        // if the game is not over after the human player's turn
        if(!gameOver(square.target.id)) {
            turn(bestSpot(), computerSymbol); // the computer player places its symbol in the best open spot if the game is not over
        }
    }

    // if the computer player goes first and the board square is open
    if (computerTurn === 1 && typeof origBoard[square.target.id] == 'number') {
        turn(bestSpot(),computerSymbol); // the computer player places its symbol in the best open spot

        // if the game is not over after the computer player's turn
        if(!gameOver(square.target.id)) {
            turn(square.target.id, humanSymbol); // the human player places their symbol in an open spot if the game is not over
        }

    }
}

// helper function for turnClick()
function turn(squareId, player) {
  origBoard[squareId] = player;
  document.getElementById(squareId).innerText = player; // fills the square that the player picked with their symbol
  spaces[squareId].removeEventListener('click', turnClick, false); // removes click functionality from square

  // prevents any symbols from being inserted into empty squares after the game is over
  if (gameOver(squareId)) {
    for (var i = 0; i < origBoard.length; i++) {
      spaces[i].removeEventListener('click', turnClick, false);
    }
  }
  turns++; // increments the turn counter

  // swaps turns
  // if the human just went and the game did not end, the computer will go
  if (!gameOver(squareId) && humanTurn === 1) {
    humanTurn = 0;
    computerTurn = 1;
  }

  // if the computer just went and the game did not end, the human will go
  else if (!gameOver(squareId) && computerTurn === 1) {
    computerTurn = 0;
    humanTurn = 1;
  }
}

// checks for a winning row
function checkRow(a,b,c,move) {
  var result = false;

  // helper for checkRow to check for winning combos
  if (getBox(a) == move && getBox(b) == move && getBox(c) == move) {
    result = true;
  }

  return result;
}

// returns the number of the box
function getBox(number) {
  return origBoard[number];
}

// checks to see if either player has won
function checkWin(move) {
  var result = false;

  // checks each win combo to see if any have been achieved
  if (checkRow(0,1,2,move) ||
      checkRow(3,4,5,move) ||
      checkRow(6,7,8,move) ||
      checkRow(0,3,6,move) ||
      checkRow(1,4,7,move) ||
      checkRow(2,5,8,move) ||
      checkRow(0,4,8,move) ||
      checkRow(2,4,6,move)) {
    result = true;
  }
  return result;
}

//checks to see if the players have tied
function checkTie() {
  var result = false;
  if (!checkWin(humanSymbol) && !checkWin(computerSymbol) && turns === 9) { // if neither player has won and every spot on the board is filled
    result = true;
  }
  return result;
}

// returns all of the empty squares left
function emptySquares() {
  return origBoard.filter(s => typeof s == 'number'); // filters all squares that are already taken out of the array
}

// finds best spot for the computer player through the minimax function
function bestSpot() {
  return minimax(origBoard, computerSymbol).index;
}

/* minimax algorithm that makes the computer player unbeatable
(computer player is the maximizing player, human player is the minimizing player)*/
function minimax(newGrid, player) {
  var availableSpots = emptySquares(); // all empty spots on the board

  // checks terminal states
  // if the human wins, the score for the AI is -10
  if (checkWin(humanSymbol)) {
    return {score: -10};
  }

  // if the computer wins, the score for the AI is +10
  else if (checkWin(computerSymbol)) {
    return {score: 10};
  }

  // if there are no empty squares left, the game is a tie and the score for the AI is 0
  else if (availableSpots.length === 0) {
    return {score: 0};
  }


  var moves = []; // collects the scores and indices of each move
  for (let i = 0; i < availableSpots.length; i ++) {
    var move = {}; // stores the index and score of each move
    move.index = newGrid[availableSpots[i]]; // places the index in the move variable
    newGrid[availableSpots[i]] = player; // assigns the empty spot on the new board to the current player

    // the current player is the computer
    if (player === computerSymbol) {
      move.score = minimax(newGrid, humanSymbol).score; // recursively call the minimax function to record scores by each possible human player move until the game reaches a terminal state
    }

    // the current player is the human
    else {
       move.score =  minimax(newGrid, computerSymbol).score; // recursively call the minimax function to record scores made by each possible computer player move until the game reaches a terminal state
    }

    newGrid[availableSpots[i]] = move.index; // resets the board to what it was before each possible move was simulated

    // if either the computer player or the human player wins, the move is returned instead of inserted into the moves array
    if ((player === computerSymbol && move.score === 10) || (player === humanSymbol && move.score === -10)) {
      return move;
    }
    else {
      moves.push(move); // inserts the score and index of the move into the moves array
    }
  }

  let bestMove, bestScore;

  // if the current player is the computer player
  if (player === computerSymbol) {
    bestScore = -1000; // since the computer player is the maximizing player, a low best score needs to be established
    for(let i = 0; i < moves.length; i++) {

      // if the moves[i] is greater than the best (or highest) score
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score; // the highest score will be that move
        bestMove = i; // the best move will be at the index with the highest score
      }
    }
  }

  // if the current player is the human player
  else {
      bestScore = 1000; // since the human player is the minimizing player, a high best score needs to be established
      for(let i = 0; i < moves.length; i++) {

      // if the moves[i] is greater than the best (or lowest) score
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score; // the lowest score will be that move
        bestMove = i; // the best move will be at the index with the lowest score
      }
    }
  }

  return moves[bestMove]; // the best move in the moves array will be returned
}

// returns true if the game is over
function gameOver(squareId) {
  var result = false;

  // human wins
  if (checkWin(humanSymbol)) {
    document.querySelector(".humanwin").style.display = "inline"; // displays human victory popup
    result = true; // will return true
  }

  // computer wins
  else if (checkWin(computerSymbol)) {
    document.querySelector(".computerwin").style.display = "inline"; // displays computer victory popup
    result = true; // will return true
  }

  // tie game
  else if (checkTie()){
    document.querySelector(".tie").style.display = "inline"; // displays tie game popup
    result = true; // will return true
  }
  return result;
}
