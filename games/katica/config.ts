import { IGameConfig } from '../';
import { KaticaGame } from './game';
import { Board } from './board';

const config: IGameConfig = {
  bgioGame: KaticaGame,
  bgioBoard: Board,
  debug: true,
};

export default config;
