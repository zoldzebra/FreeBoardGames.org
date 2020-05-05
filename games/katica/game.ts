/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Game } from '@freeboardgame.org/boardgame.io/core';

import * as R from 'ramda';

export enum Phase {
  Place = 'Place',
  Move = 'Move',
}

export interface Piece {
  id: number | null,
  player: number | null,
  piece: number | null,
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
  piece: null,
};

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
  console.log('toCoord position, x, y', position, x, y);
  return { x, y };
}

export function areCoordsEqual(a: ICoord, b: ICoord) {
  return a.x === b.x && a.y === b.y;
}

export function placePiece(G: IG, ctx: any, coords: ICoord) {
  const board = [...G.board];
  const boardIndex = toIndex(coords);

  console.log('place to cell id', ctx.turn);
  if (R.equals(board[boardIndex], EMPTY_FIELD)) {
    board[toIndex(coords)] = {
      id: ctx.turn,
      player: Number(ctx.currentPlayer),
      piece: 1,
    };
    const newG: IG = {
      ...G,
      board,
      piecesPlaced: G.piecesPlaced + 1,
    }
    return { ...newG };
  }
}

export function movePiece(G: IG, ctx: any, moveFrom: number, moveTo: number) {
  console.log('movePiece: moveFrom, moveTo', moveFrom, moveTo);
  const board = [...G.board];
  board[moveTo] = board[moveFrom]
  board[moveFrom] = EMPTY_FIELD;
  const newG = {
    ...G,
    board,
  }
  return { ...newG };
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
        endPhaseIf: (G: IG) => G.piecesPlaced === 4,
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
