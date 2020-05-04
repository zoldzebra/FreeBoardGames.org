/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Game } from '@freeboardgame.org/boardgame.io/core';

export enum Phase {
  Place = 'Place',
  Move = 'Move',
}

export interface IG {
  cells: string[]
  piecesPlaced: number;
}

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

export function placePiece(G: IG, ctx: any, id: number) {
  console.log('placePiece cell id', id);

  const cells = [...G.cells];

  if (cells[id] === null) {
    cells[id] = `player${ctx.currentPlayer}-1pointsPiece`;
    const newG: IG = {
      ...G,
      cells,
      piecesPlaced: G.piecesPlaced + 1,
    }
    return { ...newG };
  }
}

export function dummyMovePiece(G: IG, ctx: any, moveFrom: number, moveTo: number) {
  console.log('move fn: moveFrom, moveTo', moveFrom, moveTo);
  const cells = [...G.cells];
  console.log('cells moveTo content', cells[moveTo]);
  if (cells[moveTo] === null) {
    console.log('move piece on cell id', moveTo);
    cells[moveTo] = cells[moveFrom]
    cells[moveFrom] = null;
    const newG = {
      ...G,
      cells,
    }
    console.log('newG', newG);
    return { ...newG };
  }
}

export const KaticaGame = Game({
  name: 'katica',

  setup: () => ({
    cells: Array(6 * 7).fill(null),
    piecesPlaced: 0,
  }),

  moves: {
    placePiece,
    dummyMovePiece,
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
        allowedMoves: ['dummyMovePiece'],
      },
    },

    endGameIf: (G, ctx) => {
      if (isVictory(G.cells)) {
        return { winner: ctx.currentPlayer };
      }
      if (G.cells.filter((c: any) => c === null).length === 0) {
        return { draw: true };
      }
    },
  },
});
