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

const initialBoard = Array(6 * 7).fill(EMPTY_FIELD);

export function isVictory(cells: number[]) {

  const positions = [
    // [0, 1, 2],
    // [3, 4, 5],
    // [6, 7, 8],
    // [0, 3, 6],
    // [1, 4, 7],
    // [2, 5, 8],
    // [0, 4, 8],
    // [2, 4, 6],
  ];

  for (const pos of positions) {
    const symbol = cells[pos[0]];
    let winner = symbol;
    for (const i of pos) {
      if (cells[i] !== symbol) {
        winner = null;
        break;
      }
    }
    if (winner != null) {
      return true;
    }
  }

  return false;
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
  const moveSet = board[toIndex(moveFrom)].pieceType - 1;
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
  // check for jumping over opponent
  const otherPlayer = ctx.currentPlayer === '0' ? 1 : 0;
  const opponentFields = possibleMoves.filter(coords => board[toIndex(coords)].player === otherPlayer);
  console.log('opponentFields', opponentFields);
  let validMoves = [];
  if (opponentFields) {
    const vectorsToOpponents = opponentFields.map(opponent => {
      return {
        x: opponent.x - moveFrom.x,
        y: opponent.y - moveFrom.y,
      };
    });
    console.log('vectorsToOpponents', vectorsToOpponents);
    validMoves = possibleMoves.filter(coords => {
      const vectorToMove = {
        x: coords.x - moveFrom.x,
        y: coords.y - moveFrom.y
      };
      const standsInTheWay = vectorsToOpponents.some(vectorToOpp => {
        if (vectorToOpp.y === 0
          && vectorToMove.y === 0
          && vectorToOpp.x !== vectorToMove.x
          && Math.sign(vectorToOpp.x) === Math.sign(vectorToMove.x)
          && Math.abs(vectorToMove.x) > Math.abs(vectorToOpp.x)) {
          console.log('opponent on X, vector:', vectorToOpp);
          console.log('shadowing move vector', vectorToMove);
          return true;
        }
        if (vectorToOpp.x === 0
          && vectorToMove.x === 0
          && vectorToOpp.y !== vectorToMove.y
          && Math.sign(vectorToOpp.y) === Math.sign(vectorToMove.y)
          && Math.abs(vectorToMove.y) > Math.abs(vectorToOpp.y)) {
          console.log('opponent on y, vector:', vectorToOpp);
          console.log('shadowing move vector', vectorToMove);
          return true;
        }
        if (Math.abs(vectorToOpp.x) === Math.abs(vectorToOpp.y)
          && Math.abs(vectorToMove.x) === Math.abs(vectorToMove.y)
          && Math.sign(vectorToOpp.x) === Math.sign(vectorToMove.x)
          && Math.sign(vectorToOpp.y) === Math.sign(vectorToMove.y)
          && Math.abs(vectorToMove.x) > Math.abs(vectorToOpp.x)
          && Math.abs(vectorToMove.y) > Math.abs(vectorToOpp.y)) {
          console.log('diagonal shadow')
          return true;
        }
        return false;
      });
      if (!standsInTheWay) {
        return coords;
      }
    });
  } else {
    validMoves = [...possibleMoves];
  }

  // console.log('possibleMoves.length', possibleMoves.length);
  console.log('opponentFields.length', opponentFields.length);
  console.log('validMoves', validMoves);

  console.log('validMoves.length', validMoves.length);

  return validMoves;
}

export function movePiece(G: IG, ctx: any, moveFrom: ICoord, moveTo: ICoord) {
  const validMoves = getValidMoves(G, ctx, moveFrom);
  const board = [...G.board];

  // check if chosen move is in validMoves
  if (!validMoves.find(dir => R.equals(dir, moveTo))) {
    console.log('invalid move');
    return INVALID_MOVE;
  } else {
    console.log('valid move');
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
    board: initialBoard,
    piecesPlaced: 0,
  }),

  moves: {
    placePiece,
    movePiece,
  },


  flow: {
    movesPerTurn: 1,
    startingPhase: Phase.Place,
    phases: {
      Place: {
        allowedMoves: ['placePiece'],
        next: Phase.Move,
        endPhaseIf: (G: IG) => G.piecesPlaced === 6,
      },
      Move: {
        allowedMoves: ['movePiece'],
      },
    },

    endGameIf: (G, ctx) => {
      if (isVictory(G.cells)) {
        return { winner: ctx.currentPlayer };
      }
      // if (G.cells.filter((c: any) => c === null).length === 0) {
      //   return { draw: true };
      // }
    },
  },
});
