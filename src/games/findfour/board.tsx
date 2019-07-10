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
import { Circle } from './Shapes';
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
    onClick(columnIdx: number) {
    if (this.isActive(columnIdx)) {
      this.props.moves.selectColumn(columnIdx);
    }
  }

  isActive(columnIdx: number) {
    if (this.props.ctx.winner !== null) return false;
    // If the top row of a column is not empty, we shouldn't allow another disc.
    if (this.props.G.grid[0][columnIdx] !== emptyCell) return false;
    return true;
  }

  render() {
    let message: JSX.Element;
    if (this.props.ctx.winner !== null) {
      message = <span>Winner: Player {playerDiscLookup[this.props.ctx.currentPlayer]}</span>;
    } else {
      message = <span>Current Player: Player {playerDiscLookup[this.props.ctx.currentPlayer]}</span>;
    }
    const selectors = Array(numOfColumns).fill(numOfColumns).map((_, i) => i).map(idx =>
      <ColumnSelector
        active={this.isActive(idx)}
        handleClick={() => this.onClick(idx)}
        key={idx}
      />
    );
    return (
      <div>
        <h1>Four In A Row</h1>
        <div>
          {message}
        </div>
        {selectors}
        <Grid grid={this.props.G.grid} />
      </div>
    )
  }
}

const ColumnSelector = ({ active, handleClick }: any) => {
  return (
    <div className="columnSelectorContainer">
      <button disabled={!active} onClick={handleClick} className="columnSelector">Select</button>
    </div>
  );
}

const Grid = ({ grid }: any) => {
  let rows: JSX.Element[] = [];
  for (var rowIdx = 0; rowIdx < numOfRows; rowIdx++) {
    rows = rows.concat(
      <div key={rowIdx}>
        <Row row={grid[rowIdx]} />
      </div>
    );
  }
  return <React.Fragment>{rows}</React.Fragment>;
}

const Row = ({ row } : any) => {
  const cells = row.map((c: any, idx: number) => <svg><Cell cell={c} idx={idx} /></svg>);
  return cells;
}

const Cell = (props: any) => {
  let cellColor;
  switch (props.cell) {
    case p1disc:
      cellColor = 'red';
      break;
    case p2disc:
      cellColor = 'blue';
      break;
    default:
      cellColor = 'white';
      break;
  }
  return (
    <circle
      key={`cir-${props.idx}`}
      r=".25"
      fill={cellColor}
      stroke="lime"
      style={{strokeWidth: 0.1}}
    />
  );
}
export default Board;
