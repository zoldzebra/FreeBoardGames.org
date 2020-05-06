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
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';
import grey from '@material-ui/core/colors/grey';

import { IGameArgs } from 'components/App/Game/GameBoardWrapper';
import { GameLayout } from 'components/App/Game/GameLayout';
import { Circle, Cross, Field, Lines } from './Shapes';
import { isOnlineGame, isAIGame } from '../common/gameMode';
import { IG, Piece, EMPTY_FIELD, toCoord, toIndex, IMove, areCoordsEqual } from './game';
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

function roundCoords(coords: ICartesianCoords) {
  return { x: Math.round(coords.x), y: Math.round(coords.y) };
}

export class Board extends React.Component<IBoardProps, {}> {
  state: IBoardState = {
    selectedCellId: null,
    selected: null,
  };

  isInverted() {
    // return isOnlineGame(this.props.gameArgs) && this.props.playerID === '1';
    return true;
  }

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

  shouldPlace = (coords: ICartesianCoords) => {
    return R.equals(this.props.G.board[toIndex(coords)], EMPTY_FIELD);
  }

  _shouldDrag = (coords: ICartesianCoords) => {
    if (this.props.ctx.phase === 'Move') {
      const invertedCoords = applyInvertion(coords, this.isInverted());
      console.log('coords inverted', applyInvertion(coords, this.isInverted()))
      return this.props.G.board[toIndex(invertedCoords)].player === Number(this.props.ctx.currentPlayer);
    }
  };

  _onClick = (coords: IAlgebraicCoords) => {
    const position = algebraicToCartesian(coords.square);
    if (this.props.ctx.phase === 'Place') {
      const boardIndex = toIndex(position);
      if (this.shouldPlace(position)) {
        this.props.moves.placePiece(boardIndex);
      }
    }
  };

  _onDrag = (coords: IOnDragData) => {
    const x = coords.x;
    const y = coords.y;
    const originalX = coords.originalX;
    const originalY = coords.originalY;
    if (Math.sqrt((x - originalX) ** 2 + (y - originalY) ** 2) > 0.2) {
      this.setState({
        ...this.state,
        selected: applyInvertion({ x: originalX, y: originalY }, this.isInverted()),
      });
    } else {
      this.setState({
        ...this.state,
        selected: null,
      });
    }
  };

  _onDrop = async (coords: ICartesianCoords) => {
    if (this.state.selected) {
      console.log('onDrop');
      this._move(applyInvertion(roundCoords(coords), this.isInverted()));
    }
  };

  _move = async (coords: ICartesianCoords) => {
    if (this.state.selected === null || coords === null) {
      return;
    }

    await this.props.moves.movePiece(this.state.selected, coords);
    this.setState({
      ...this.state,
      selected: null,
    });
    // if (isAIGame(this.props.gameArgs) && this.props.ctx.currentPlayer === '1') {
    //   this.stepAI();
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

  drawPiece = (piece: { data: Piece, index: number }) => {
    if (piece.data.pieceType === 1) {
      return (
        <g>
          <circle r="0.4" fill={piece.data.player === 0 ? red[500] : green[500]} cx="0.5" cy="0.5" />
          <circle r="0.1" fill={grey[900]} cx="0.5" cy="0.5" />
        </g>
      )
    }
    if (piece.data.pieceType === 2) {
      return (
        <g>
          <circle r="0.4" fill={piece.data.player === 0 ? red[500] : green[500]} cx="0.5" cy="0.5" />
          <circle r="0.1" fill={grey[900]} cx="0.35" cy="0.5" />
          <circle r="0.1" fill={grey[900]} cx="0.65" cy="0.5" />
        </g>
      )
    }
    if (piece.data.pieceType === 3) {
      return (
        <g>
          <circle r="0.4" fill={piece.data.player === 0 ? red[500] : green[500]} cx="0.5" cy="0.5" />
          <circle r="0.1" fill={grey[900]} cx="0.35" cy="0.4" />
          <circle r="0.1" fill={grey[900]} cx="0.65" cy="0.4" />
          <circle r="0.1" fill={grey[900]} cx="0.5" cy="0.7" />
        </g>
      )
    }
  }

  getPieces = () => {
    return this.props.G.board
      .map((piece, index) => ({ data: piece, index }))
      .filter(piece => piece.data.id !== null)
      .map(piece => {
        const { x, y } = toCoord(piece.index);
        return (
          <Token
            x={x}
            y={y}
            draggable={true}
            shouldDrag={this._shouldDrag}
            onDrop={this._onDrop}
            onDrag={this._onDrag}
            animate={true}
            key={piece.data.id}
          >
            {this.drawPiece(piece)}
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
