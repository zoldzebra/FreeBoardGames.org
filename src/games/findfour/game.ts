/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Game } from '@freeboardgame.org/boardgame.io/core';
import { emptyCell, numOfColumns, numOfRows, p1disc, p2disc, playerDiscLookup } from './constants';

function isVictory(grid: any, player: any) {
  const playerDisc = playerDiscLookup[player];

  // Victory algorithm by ferdelOlmo: https://stackoverflow.com/a/38211417/129967
  let rowIdx = 0;
  let columnIdx = 0;

  // horizontalCheck
  for (columnIdx = 0; columnIdx < numOfColumns - 3; columnIdx++) {
    for (rowIdx = 0; rowIdx < numOfRows; rowIdx++) {
      if (
        grid[rowIdx][columnIdx] === playerDisc &&
        grid[rowIdx][columnIdx + 1] === playerDisc &&
        grid[rowIdx][columnIdx + 2] === playerDisc &&
        grid[rowIdx][columnIdx + 3] === playerDisc
      ) {
        return true;
      }
    }
  }

  // verticalCheck
  for (rowIdx = 0; rowIdx < numOfRows - 3; rowIdx++) {
    for (columnIdx = 0; columnIdx < numOfColumns; columnIdx++) {
      if (
        grid[rowIdx][columnIdx] === playerDisc &&
        grid[rowIdx + 1][columnIdx] === playerDisc &&
        grid[rowIdx + 2][columnIdx] === playerDisc &&
        grid[rowIdx + 3][columnIdx] === playerDisc
      ) {
        return true;
      }
    }
  }

  // ascendingDiagonalCheck
  for (rowIdx = 3; rowIdx < numOfRows; rowIdx++) {
    for (columnIdx = 0; columnIdx < numOfColumns - 3; columnIdx++) {
      if (
        grid[rowIdx][columnIdx] === playerDisc &&
        grid[rowIdx - 1][columnIdx + 1] === playerDisc &&
        grid[rowIdx - 2][columnIdx + 2] === playerDisc &&
        grid[rowIdx - 3][columnIdx + 3] === playerDisc
      ) {
        return true;
      }
    }
  }

  // descendingDiagonalCheck
  for (rowIdx = 3; rowIdx < numOfRows; rowIdx++) {
    for (columnIdx = 3; columnIdx < numOfColumns; columnIdx++) {
      if (
        grid[rowIdx][columnIdx] === playerDisc &&
        grid[rowIdx - 1][columnIdx - 1] === playerDisc &&
        grid[rowIdx - 2][columnIdx - 2] === playerDisc &&
        grid[rowIdx - 3][columnIdx - 3] === playerDisc
      ) {
        return true;
      }
    }
  }
}

export const Findfour = Game({
  name: 'findfour',

  setup: () => {
    const grid: any = {};
    for (var rowIdx = 0; rowIdx < numOfRows; rowIdx++) {
      grid[rowIdx] = Array(numOfColumns).fill(emptyCell);
    }
    return { grid: grid };
  },

  moves: {
    selectColumn(G, ctx, columnIdx) {
      let grid = Object.assign({}, G.grid);
      for (var rowIdx = numOfRows - 1; rowIdx >= 0; rowIdx--) {
        if (grid[rowIdx][columnIdx] === emptyCell) {
          grid[rowIdx][columnIdx] = playerDiscLookup[ctx.currentPlayer];
          break;
        }
      }
      return { ...G, grid };
    },
  },

  flow: {
    movesPerTurn: 1,

    endGameIf: (G, ctx) => {
      if (isVictory(G.cells, ctx.currentPlayer)) {
        return { winner: ctx.currentPlayer };
      }
    },
  },
});
