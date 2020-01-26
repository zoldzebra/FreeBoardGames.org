import { GameMode } from 'components/App/Game/GameModePicker';
import { IGameModeExtraInfoDropdown } from 'components/App/Game/GameModePicker';
import KaticaThumbnail from './media/thumbnail.png';
import { IGameDef } from 'games';
import instructions from './instructions.md';

export const katicaGameDef: IGameDef = {
  code: 'katica',
  name: 'Katica Tülekedés',
  minPlayers: 2,
  maxPlayers: 2,
  imageURL: KaticaThumbnail,
  modes: [
    { mode: GameMode.OnlineFriend },
    { mode: GameMode.LocalFriend },
  ],
  description: 'Katicatulekedes',
  descriptionTag: `A jatek rovid leirasa kerul ide...`,
  instructions: {
    videoId: 'l4dfHBK9GRgTvcc',
    text: instructions,
  },
  config: () => import('./config'),
  aiConfig: () => import('./ai'),
};
