// Checks if the current move results in a win.
export const IsWinner = (gameBoard, currentMove, currentPlayer) => {
  let boar = [...gameBoard];
  boar[currentMove] = currentPlayer;

  const winLines = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, 15], // Horizontals
    [0, 4, 8, 12],
    [1, 5, 9, 13],
    [2, 6, 10, 14],
    [3, 7, 11, 15], // Verticals
    [0, 5, 10, 15],
    [3, 6, 9, 12], // Diagonals
  ];

  for (let i = 0; i < winLines.length; i++) {
    const [c1, c2, c3, c4] = winLines[i];
    if (
      boar[c1] > 0 &&
      boar[c1] === boar[c2] &&
      boar[c2] === boar[c3] &&
      boar[c3] === boar[c4]
    ) {
      return true;
    }
  }
  return false;
};

// Checks if the game has ended in a draw.
export const isDraw = (gameBoard, currentMove, currentPlayer) => {
  let boar = [...gameBoard];
  boar[currentMove] = currentPlayer;
  return boar.reduce((n, x) => n + (x === 0), 0) === 0;
};

// Master AI Engine: Evaluates every empty square dynamically to pick the move
// that either wins, prevents a loss, or builds an offensive trap (fork).
export const getComputerMove = (
  gameBoard,
  computerPlayer = 2,
  humanPlayer = 1,
) => {
  const winLines = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, 15],
    [0, 4, 8, 12],
    [1, 5, 9, 13],
    [2, 6, 10, 14],
    [3, 7, 11, 15],
    [0, 5, 10, 15],
    [3, 6, 9, 12],
  ];

  // Base positional weights to favor the center/corners if tactical scores tie
  const positionalWeights = [3, 1, 1, 3, 1, 4, 4, 1, 1, 4, 4, 1, 3, 1, 1, 3];

  let bestScore = -Infinity;
  let bestMoves = [];

  // 1. Loop through every single cell on the board
  for (let cell = 0; cell < 16; cell++) {
    if (gameBoard[cell] !== 0) continue; // Skip filled slots

    let tacticalScore = 0;

    // 2. Simulate what happens if a player takes this cell
    for (let line of winLines) {
      if (!line.includes(cell)) continue;

      // Extract the state of the other 3 spaces in this specific line
      const lineValues = line.map((idx) =>
        idx === cell ? "M" : gameBoard[idx],
      );
      const computerCount = lineValues.filter(
        (v) => v === computerPlayer,
      ).length;
      const humanCount = lineValues.filter((v) => v === humanPlayer).length;
      const emptyCount = lineValues.filter((v) => v === 0).length;

      // --- OFFENSIVE LOGIC (Computer) ---
      if (computerCount === 3) {
        // Instantly Win
        tacticalScore += 10000;
      } else if (computerCount === 2 && emptyCount === 1) {
        // Creates an unblocked 3-in-a-row (Forced Trap)
        tacticalScore += 100;
      } else if (computerCount === 1 && emptyCount === 2) {
        // Sets up future 3-in-a-rows
        tacticalScore += 15;
      } else if (emptyCount === 3) {
        // Plants a seed in an open row
        tacticalScore += 2;
      }

      // --- DEFENSIVE LOGIC (Human) ---
      if (humanCount === 3) {
        // Critical Block (Stop human from winning)
        tacticalScore += 1000;
      } else if (humanCount === 2 && emptyCount === 1) {
        // Soft Block (Stop human from building a 3-in-a-row trap)
        tacticalScore += 40;
      }
    }

    // Add positional weight so AI prefers centers/corners during opening turns
    tacticalScore += positionalWeights[cell];

    // 3. Track the absolute best-performing cell configurations
    if (tacticalScore > bestScore) {
      bestScore = tacticalScore;
      bestMoves = [cell];
    } else if (tacticalScore === bestScore) {
      bestMoves.push(cell);
    }
  }

  // Pick randomly from the tied highest scoring strategic moves
  const finalChoice = Math.floor(Math.random() * bestMoves.length);
  return bestMoves[finalChoice];
};
