import { IAIConfig } from '../index';
import { AI } from '@freeboardgame.org/boardgame.io/ai';

interface IPlayState {
  G: any;
  ctx: any;
}

class TictactoeRandomBot {
  async play(state: IPlayState, playerID: string) {
    const cell = this.generateRandomMove(state);
    return this.makeMove(playerID, cell);
  }
  generateRandomMove(state: IPlayState) {
    const freeCellsIndexes = [];
    const cells = state.G.cells;
    for (let i = 0; i < cells.length; i++) {
      if (cells[i] === null) {
        freeCellsIndexes.push(i);
      }
    }
    const randIndex = this.randomNumber(0, freeCellsIndexes.length - 1);
    const cell = freeCellsIndexes[randIndex];
    return cell;
  }
  makeMove(playerID: string, cell: number) {
    return { action: { type: 'MAKE_MOVE', payload: { type: 'clickCell', args: [cell], playerID } } };
  }
  randomNumber(min: number, max: number) {
    // return Math.floor(Math.random() * (max - min + 1) + min);  // https://github.com/babel/minify/issues/904
    return (Math.random() * (max - min + 1) + min) << 0;
  }
}
const config: IAIConfig = {
  bgioAI: (level: string) => {
    if (level === '2') {
      // Hard
      return AI({
        enumerate: (G: any) => {
          const moves = [];
          for (let i = 0; i < 9; i++) {
            if (G.cells[i] === null) {
              moves.push({ move: 'clickCell', args: [i] });
            }
          }
          return moves;
        },
      });
    } else if (level === '1') {
      // Easy
      return {
        bot: TictactoeRandomBot,
      };
    }
  },
};
export default config;
