/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Game, INVALID_MOVE } from '@freeboardgame.org/boardgame.io/core';

import * as R from 'ramda';

export enum Phase {
  Place = 'Place',
  Move = 'Move',
}

export interface Piece {
  id: number | null,
  player: number | null,
  pieceType: number | null,
}

export interface IG {
  board: Piece[];
  piecesPlaced: number;
}

interface ICoord {
  x: number;
  y: number;
}

export interface IMove {
  from: ICoord;
  to: ICoord;
  jumped: ICoord;
}

export const EMPTY_FIELD = {
  id: null,
  player: null,
  pieceType: null,
};

const ALL_MOVES = [
  [
    { x: 1, y: 0 },
    { x: 1, y: -1 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: -1, y: 1 },
  ],
  [
    { x: 1, y: 0 },
    { x: 1, y: -1 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: -1, y: 1 },

    { x: 2, y: 0 },
    { x: 2, y: -2 },
    { x: 2, y: 2 },
    { x: 0, y: 2 },
    { x: 0, y: -2 },
    { x: -2, y: 0 },
    { x: -2, y: -2 },
    { x: -2, y: 2 },
  ],
  [
    { x: 1, y: 0 },
    { x: 1, y: -1 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: -1, y: 1 },

    { x: 2, y: 0 },
    { x: 2, y: -2 },
    { x: 2, y: 2 },
    { x: 0, y: 2 },
    { x: 0, y: -2 },
    { x: -2, y: 0 },
    { x: -2, y: -2 },
    { x: -2, y: 2 },

    { x: 3, y: 0 },
    { x: 3, y: -3 },
    { x: 3, y: 3 },
    { x: 0, y: 3 },
    { x: 0, y: -3 },
    { x: -3, y: 0 },
    { x: -3, y: -3 },
    { x: -3, y: 3 },
  ],
];

const ROWS = 7;
const COLUMNS = 6;

const initialBoard = Array(ROWS * COLUMNS).fill(EMPTY_FIELD);

function getStartingPieces() {
  const players = [0, 1];
  const pieceTypes = [1, 2, 3];
  const piecesPerPieceType = 3;
  let id = 0;
  const pieces: Piece[] = [];
  players.forEach(player => {
    pieceTypes.forEach(pieceType => {
      for (let i = 0; i < piecesPerPieceType; i++) {
        pieces.push({
          id,
          player,
          pieceType,
        });
        id += 1;
      };
    });
  });
  console.log('pieces', pieces);
  return pieces;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createStartingOrder(startingPieces: Piece[]) {
  // TODO generate 2 pieces arrays already...
  const startingOrder: Piece[] = [];
  const player0Pieces = [];
  const player1Pieces = [];
  startingPieces.forEach(piece => {
    if (piece.player === 0) {
      player0Pieces.push(piece);
    } else {
      player1Pieces.push(piece);
    }
  });
  shuffleArray(player0Pieces);
  shuffleArray(player1Pieces);
  for (let i = 0; i < startingPieces.length; i++) {
    if (i % 2 === 0) {
      startingOrder.push(player0Pieces[Math.floor(i / 2)]);
    } else {
      startingOrder.push(player1Pieces[Math.floor(i / 2)]);
    }
  }
  console.log(player0Pieces, player1Pieces);
  console.log('startingOrder', startingOrder);
  return startingOrder;
}

// to go around the table from top left -> top right -> bottom right -> bottom left.
// 0,0 is bottom right
function sortStartCoords(startCoords) {
  const topRow = [];
  const rightRow = []
  const bottomRow = [];
  const leftRow = [];
  startCoords.forEach(coord => {
    if (coord.x === 0) {
      rightRow.push(coord);
    } else if (coord.y === ROWS - 1) {
      topRow.push(coord);
    } else if (coord.x === COLUMNS - 1) {
      leftRow.push(coord)
    } else if (coord.y === 0) {
      bottomRow.push(coord)
    }
  })
  const sortedCoords = topRow.reverse()
    .concat(rightRow.reverse())
    .concat(bottomRow)
    .concat(leftRow);
  console.log('topRow, rightRow, bottomRow, leftRow', topRow, rightRow, bottomRow, leftRow);
  console.log('sortedCoords', sortedCoords);
  return sortedCoords;
}

function createBasicStartBoard(board) {
  const boardMatrix: Piece[][] = Array(COLUMNS).fill(null).map(() => Array(ROWS).fill(null));
  board.forEach((cell, index) => {
    const coords = toCoord(index);
    boardMatrix[coords.x][coords.y] = cell;
  });
  console.log('boardMatrix', boardMatrix);
  const piecesOrder = createStartingOrder(getStartingPieces());
  const startCoords = [];
  for (let col = 0; col < COLUMNS; col++) {
    for (let row = 0; row < ROWS; row++) {
      if ((col === 0 || row === 0 || col === COLUMNS - 1 || row === ROWS - 1)
        && !(col === 0 && row === 0)
        && !(col === 0 && row === ROWS - 1)
        && !(col === COLUMNS - 1 && row === 0)
        && !(col === COLUMNS - 1 && row === ROWS - 1)) {
        startCoords.push({
          x: col,
          y: row,
        })
      }
    }
  }
  console.log('startCoords', startCoords);
  const sortedCoords = sortStartCoords(startCoords);
  sortedCoords.forEach((startingCoord, index) => {
    boardMatrix[startingCoord.x][startingCoord.y] = piecesOrder[index];
  })

  const startingBoard = [];
  boardMatrix.forEach((col, colIndex) => {
    col.forEach((rowCell, rowIndex) => startingBoard[toIndex({ x: colIndex, y: rowIndex })] = rowCell);
  })
  // G.piecesPlaced = piecesOrder.length;
  return startingBoard;
}

function findGroup(matrixCopy: number[][], col: number, row: number, player: number) {
  if (matrixCopy[col][row] !== player) {
    return 0;
  }
  matrixCopy[col][row] = null;
  let size = 1;
  const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];

  directions.forEach(dir => {
    if (col + dir[0] < matrixCopy.length
      && col + dir[0] >= 0
      && row + dir[1] < matrixCopy[0].length
      && row + dir[1] >= 0) {
      size += findGroup(matrixCopy, col + dir[0], row + dir[1], player);
    }
  });
  return size;
}

function getMatchResult(G: IG) {
  const boardMatrix: number[][] = Array(COLUMNS).fill(null).map(() => Array(ROWS).fill(null));
  G.board.forEach((cell, index) => {
    const coords = toCoord(index);
    boardMatrix[coords.x][coords.y] = cell.player;
  });
  const matrixCopy = R.clone(boardMatrix);
  const players = [0, 1];
  const result = {
    0: [],
    1: [],
  };

  let size = 0;

  for (let col = 0; col < COLUMNS; col++) {
    for (let row = 0; row < ROWS; row++) {
      players.forEach(player => {
        if (matrixCopy[col][row] === player) {
          size = findGroup(matrixCopy, col, row, player);
          if (size > 0) {
            result[player].push(size);
          };
        };
      })
    }
  }
  // TODO refactor this part, its ugly
  if (result[0].length === 1 || result[1].length === 1) {
    if (result[0].length === 1 && result[1].length !== 1) {
      return {
        winner: '0'
      };
    } else if (result[1].length === 1 && result[0].length !== 1) {
      return {
        winner: '1'
      };
    } else if (result[1].length === 1 && result[0].length === 1) {
      return {
        draw: true
      };
    }
  }
  return null;
}

export function toIndex(coord: ICoord) {
  return coord.x + coord.y * 6;
}

export function toCoord(position: number): ICoord {
  const x = position % 6;
  const y = Math.floor(position / 6);
  return { x, y };
}

export function areCoordsEqual(a: ICoord, b: ICoord) {
  return a.x === b.x && a.y === b.y;
}

export function placePiece(G: IG, ctx: any, boardIndex: number) {
  const board = [...G.board];
  let pieceType = null;
  if (ctx.turn < 2) {
    pieceType = 1;
  } else if (ctx.turn >= 2 && ctx.turn < 4) {
    pieceType = 2;
  } else {
    pieceType = 3;
  }
  board[boardIndex] = {
    id: ctx.turn,
    player: Number(ctx.currentPlayer),
    pieceType,
  };
  const newG: IG = {
    ...G,
    board,
    piecesPlaced: G.piecesPlaced + 1,
  }
  return { ...newG };
}

export function getValidMoves(G: IG, ctx: any, moveFrom: ICoord) {
  const board = [...G.board];
  const actualPieceType = board[toIndex(moveFrom)].pieceType;
  const moveSet = actualPieceType - 1;
  if (moveSet < 0) {
    return;
  }

  const possibleMoves = ALL_MOVES[moveSet]
    .map(move => {
      let newX = moveFrom.x + move.x;
      let newY = moveFrom.y + move.y;
      return {
        x: newX,
        y: newY,
      }
    })
    .filter(coords => (coords.x <= 5 && coords.x >= 0) && (coords.y <= 6 && coords.y >= 0))
    .filter(coords => board[toIndex(coords)].player !== Number(ctx.currentPlayer));
  const otherPlayer = ctx.currentPlayer === '0' ? 1 : 0;
  const opponentFields = possibleMoves.filter(coords => board[toIndex(coords)].player === otherPlayer);
  // dont jump over opponent + cant move over (knock out) too close opp
  let validMoves = [];
  if (opponentFields) {
    const vectorsToOpponents = opponentFields.map(opponent => {
      return {
        x: opponent.x - moveFrom.x,
        y: opponent.y - moveFrom.y,
        distance: Math.max(Math.abs(opponent.x - moveFrom.x), Math.abs(opponent.y - moveFrom.y)),
      };
    });
    validMoves = possibleMoves
      .filter(coords => {
        const vectorToMove = {
          x: coords.x - moveFrom.x,
          y: coords.y - moveFrom.y
        };
        const standsInTheWayOrTooClose = vectorsToOpponents.some(vectorToOpp => {
          // vertically
          if (vectorToOpp.y === 0
            && vectorToMove.y === 0
            && vectorToOpp.x !== vectorToMove.x
            && Math.sign(vectorToOpp.x) === Math.sign(vectorToMove.x)
            && Math.abs(vectorToMove.x) > Math.abs(vectorToOpp.x)) {
            return true;
          }
          // horizontally
          if (vectorToOpp.x === 0
            && vectorToMove.x === 0
            && vectorToOpp.y !== vectorToMove.y
            && Math.sign(vectorToOpp.y) === Math.sign(vectorToMove.y)
            && Math.abs(vectorToMove.y) > Math.abs(vectorToOpp.y)) {
            return true;
          }
          // diagonally
          if (Math.abs(vectorToOpp.x) === Math.abs(vectorToOpp.y)
            && Math.abs(vectorToMove.x) === Math.abs(vectorToMove.y)
            && Math.sign(vectorToOpp.x) === Math.sign(vectorToMove.x)
            && Math.sign(vectorToOpp.y) === Math.sign(vectorToMove.y)
            && Math.abs(vectorToMove.x) > Math.abs(vectorToOpp.x)
            && Math.abs(vectorToMove.y) > Math.abs(vectorToOpp.y)) {
            return true;
          }
          // opponent too close
          if (areCoordsEqual(vectorToOpp, vectorToMove)
            && vectorToOpp.distance < actualPieceType) {
            return true;
          }
          return false;
        });
        if (!standsInTheWayOrTooClose) {
          return coords;
        }
      });
  } else {
    validMoves = [...possibleMoves];
  }
  return validMoves;
}

export function movePiece(G: IG, ctx: any, moveFrom: ICoord, moveTo: ICoord) {
  const validMoves = getValidMoves(G, ctx, moveFrom);
  const board = [...G.board];

  if (!validMoves.find(dir => R.equals(dir, moveTo))) {
    return INVALID_MOVE;
  } else {
    board[toIndex(moveTo)] = board[toIndex(moveFrom)];
    board[toIndex(moveFrom)] = EMPTY_FIELD;
    const newG = {
      ...G,
      board,
    }
    return { ...newG };
  }
}

export const KaticaGame = Game({
  name: 'katica',

  setup: (): IG => ({
    board: createBasicStartBoard(initialBoard),
    piecesPlaced: 18,
  }),

  moves: {
    placePiece,
    movePiece,
  },


  flow: {
    movesPerTurn: 1,
    startingPhase: Phase.Move,
    phases: {
      Place: {
        allowedMoves: ['placePiece'],
        next: Phase.Move,
        endPhaseIf: (G: IG) => G.piecesPlaced >= 18,
      },
      Move: {
        allowedMoves: ['movePiece'],
      },
    },

    endGameIf: (G, ctx) => {
      if (ctx.turn > 5) {
        const result = getMatchResult(G);
        if (result) {
          return result;
        }
      }
    },
  },
});
