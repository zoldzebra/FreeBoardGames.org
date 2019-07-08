/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as React from 'react';
import { IGameArgs } from '../../App/Game/GameBoardWrapper';
import { GameLayout } from '../../App/Game/GameLayout';
import { GameMode } from '../../App/Game/GameModePicker';
import { Circle, Cross, Lines } from './Shapes';
import { emptyCell, numOfColumns, numOfRows, p1disc, p2disc, playerDiscLookup } from './constants';

interface IBoardProps {
  G: any;
  ctx: any;
  moves: any;
  playerID: string;
  isActive: boolean;
  gameArgs?: IGameArgs;
  step?: any;
}

export class Board extends React.Component<IBoardProps, {}> {
  onClick = (columnIdx: number) => () => {
    if (this.isActive(columnIdx)) {
      this.props.moves.selectColumn(columnIdx);
    }
  };

  isActive(columnIdx: number) {
    if (this.props.ctx.winner !== null) return false;
    // If the top row of a column is not empty, we shouldn't allow another disc.
    if (this.props.G.grid[0][columnIdx] !== emptyCell) return false;
    return true;
  }

  isOnlineGame() {
    return this.props.gameArgs && this.props.gameArgs.mode === GameMode.OnlineFriend;
  }

  isAIGame() {
    return this.props.gameArgs && this.props.gameArgs.mode === GameMode.AI;
  }

  _getStatus() {
    if (this.isOnlineGame()) {
      if (this.props.ctx.currentPlayer === this.props.playerID) {
        return 'YOUR TURN';
      } else {
        return 'Waiting for opponent...';
      }
    } else {
      // Local or AI game
      switch (this.props.ctx.currentPlayer) {
        case '0':
          return "Red's turn";
        case '1':
          return "Green's turn";
      }
    }
  }

  _getGameOver() {
    if (this.isOnlineGame()) {
      // Online game
      if (this.props.ctx.gameover.winner !== undefined) {
        if (this.props.ctx.gameover.winner === this.props.playerID) {
          return 'you won';
        } else {
          return 'you lost';
        }
      } else {
        return 'draw';
      }
    } else if (this.isAIGame()) {
      switch (this.props.ctx.gameover.winner) {
        case '0':
          return 'you won';
        case '1':
          return 'you lost';
        case undefined:
          return 'draw';
      }
    } else {
      // Local game
      switch (this.props.ctx.gameover.winner) {
        case '0':
          return 'red won';
        case '1':
          return 'green won';
        case undefined:
          return 'draw';
      }
    }
  }

  render() {
    if (this.props.ctx.gameover) {
      return (
        <GameLayout
          gameOver={this._getGameOver()}
          extraCardContent={this._getGameOverBoard()}
          gameArgs={this.props.gameArgs}
        />
      );
    }
    return <GameLayout>{this._getBoard()}</GameLayout>;
  }

  _getCells() {
    const cells = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const id = 3 * i + j;
        cells.push(<rect key={`${id}`} x={i} y={j} width="1" height="1" fill="black" onClick={this.onClick(id)} />);
        let overlay;
        if (this.props.G.cells[id] === '0') {
          overlay = <Cross x={i} y={j} key={`cross${id}`} />;
        } else if (this.props.G.cells[id] === '1') {
          overlay = <Circle x={i} y={j} key={`circle${id}`} />;
        }
        if (overlay) {
          cells.push(overlay);
        }
      }
    }
    return cells;
  }
  _getBoard() {
    const selectors = Array(numOfColumns)
      .fill(null)
      .map((_, i) => i)
      .map(idx => <ColumnSelector active={this.isActive(idx)} handleClick={() => this.onClick(idx)} key={idx} />);
    return selectors;
  }

  _getGameOverBoard() {
    return (
      <div style={{ textAlign: 'center' }}>
        <svg width="50%" height="50%" viewBox="0 0 3 3">
          {this._getCells()}
          {Lines}
        </svg>
      </div>
    );
  }
}

const ColumnSelector = ({ active, handleClick }: any) => {
  return (
    <div className="columnSelectorContainer">
      <button disabled={!active} onClick={handleClick} className="columnSelector">
        Select
      </button>
    </div>
  );
};

export default Board;
