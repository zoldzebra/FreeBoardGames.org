/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as React from 'react';
import * as R from 'ramda';
import Typography from '@material-ui/core/Typography';
import grey from '@material-ui/core/colors/grey';
import blue from '@material-ui/core/colors/blue';

import { IGameArgs } from 'components/App/Game/GameBoardWrapper';
import { GameLayout } from 'components/App/Game/GameLayout';
import { Circle, Cross, Field, Lines } from './Shapes';
import { isOnlineGame, isAIGame } from '../common/gameMode';
import { IG, Piece, EMPTY_FIELD, toCoord, IMove, areCoordsEqual } from './game';
import { Token } from '@freeboardgame.org/boardgame.io/ui';
import {
  Checkerboard,
  IAlgebraicCoords,
  ICartesianCoords,
  IOnDragData,
  applyInvertion,
  algebraicToCartesian,
  IColorMap,
  cartesianToAlgebraic,
} from './CheckerboardCustom';

interface IBoardProps {
  G: IG;
  ctx: any;
  moves: any;
  playerID: string;
  gameArgs?: IGameArgs;
  step?: any;
}

interface IBoardState {
  selectedCellId: number | null;
  selected: ICartesianCoords;
}

export class Board extends React.Component<IBoardProps, {}> {
  state: IBoardState = {
    selectedCellId: null,
    selected: null,
  };

  onClickField = (id: number) => () => {
    console.log('onClickField');
    if (this.props.ctx.phase === 'Place') {
      this.props.moves.placePiece(id);
    }
    if (this.props.ctx.phase === 'Move') {
      console.log('Move phase');
      if (!this.state.selectedCellId
        && !R.equals(this.props.G.board[id], EMPTY_FIELD)
        && Number(this.props.ctx.currentPlayer) === this.props.G.board[id].player) {
        console.log('Select cell');
        this.setState({
          selectedCellId: id
        });
      }
      if (this.state.selectedCellId
        && id !== this.state.selectedCellId
        && R.equals(this.props.G.board[id], EMPTY_FIELD)) {
        console.log('Move');
        const moveTo = id;
        const moveFrom = this.state.selectedCellId;
        this.props.moves.movePiece(moveFrom, moveTo);
        this.setState({
          selectedCellId: null,
        });
      }
      if (this.state.selectedCellId
        && id !== this.state.selectedCellId
        && this.props.G.board[id].player !== Number(this.props.ctx.currentPlayer)) {
        console.log('Knock out');
      }
    }
    if (isAIGame(this.props.gameArgs)) {
      setTimeout(this.props.step, 250);
    }
  };


  _onClick = (coords: IAlgebraicCoords) => {
    const position = algebraicToCartesian(coords.square);
    console.log('onClick');
    // if (this.state.selected === null && this._isSelectable(position)) {
    //   this.setState({
    //     ...this.state,
    //     selected: position,
    //   });
    // } else {
    //   this._move(position);
    // }
  };

  _getStatus() {
    if (isOnlineGame(this.props.gameArgs)) {
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
    if (isOnlineGame(this.props.gameArgs)) {
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
    } else if (isAIGame(this.props.gameArgs)) {
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
    console.log('state', this.state);
    if (this.props.ctx.gameover) {
      return (
        <GameLayout
          gameOver={this._getGameOver()}
          extraCardContent={this._getGameOverBoard()}
          gameArgs={this.props.gameArgs}
        />
      );
    }
    return <GameLayout gameArgs={this.props.gameArgs}>{this._getBoard()}</GameLayout>;
  }

  _getCells() {
    const cells = [];
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 7; j++) {
        const id = 7 * i + j;
        cells.push(
          <Field
            x={i}
            y={j}
            key={`${id}`}
            id={id}
            onClick={this.onClickField(id)}
            isSelected={id === this.state.selectedCellId}
          />
        );

        let overlay;
        if (this.props.G.board[id].player === 0) {
          overlay = <Cross x={i} y={j} key={`cross${id}`} />;
        } else if (this.props.G.board[id].player === 1) {
          overlay = <Circle x={i} y={j} key={`circle${id}`} />;
        }
        if (overlay) {
          cells.push(overlay);
        }
      }
    }
    return cells;
  }

  getPieces = () => {
    return this.props.G.board
      .map((piece, index) => ({ data: piece, index }))
      .filter(piece => piece.data !== null)
      .map(piece => {
        const { x, y } = toCoord(piece.index);
        return (
          <Token
            x={x}
            y={y}
            draggable={true}
            // shouldDrag={this._shouldDrag}
            // onDrop={this._onDrop}
            // onDrag={this._onDrag}
            animate={true}
            key={piece.data.id}
          >
            <g>
              <circle r="0.4" fill={piece.data.player === 0 ? grey[50] : grey[900]} cx="0.5" cy="0.5" />
              {/* {piece.data.isKing ? (
                <circle r="0.2" cx="0.5" cy="0.5" fill={piece.data.playerID === '1' ? grey[800] : grey[400]} />
              ) : null} */}
            </g>
          </Token>
        );
      });
  };

  _getBoard() {
    return (
      <div>
        <Typography variant="h5" style={{ textAlign: 'center', color: 'white', marginBottom: '16px' }}>
          {this._getStatus()}
        </Typography>
        {/* <svg width="100%" height="100%" viewBox="0 0 6 7">
          {this._getCells()}
          {Lines}
        </svg> */}
        <Checkerboard
          onClick={this._onClick}
          invert={true}
        // highlightedSquares={this._getHighlightedSquares()}
        >
          {this.getPieces()}
        </Checkerboard>
      </div>
    );
  }

  _getGameOverBoard() {
    return (
      <div style={{ textAlign: 'center' }}>
        <svg width="50%" height="50%" viewBox="0 0 6 7">
          {this._getCells()}
          {Lines}
        </svg>
      </div>
    );
  }
}

export default Board;
