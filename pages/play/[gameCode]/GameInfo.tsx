import React from 'react';
import FreeBoardGamesBar from 'components/App/FreeBoardGamesBar';
import { GameCard } from 'components/App/Game/GameCard';
import { GameModePicker } from 'components/App/Game/GameModePicker';
import { GameInstructions } from 'components/App/Game/GameInstructions';
import { IGameDef, GAMES_MAP } from 'games';
import { withRouter } from 'next/router';
import { generatePageError } from 'next-with-error';
import SEO from 'components/SEO';
import { AuthUserContext, GoToSignInPage } from '../../../components/Session';

interface gameInfoProps {
  gameDef: IGameDef;
}

class GameInfo extends React.Component<gameInfoProps, {}> {
  static context = AuthUserContext;
  render() {
    console.log('AuthUserContext', this.context);
    const gameDef = this.props.gameDef;
    return (
      <AuthUserContext.Consumer>
        {authUser =>
          authUser
            ? <FreeBoardGamesBar>
              <SEO title={`Play ${gameDef.name}, ${gameDef.description}`} description={gameDef.descriptionTag} />
              <GameCard game={gameDef} />
              <GameModePicker gameDef={gameDef} />
              <GameInstructions gameDef={gameDef} />
            </FreeBoardGamesBar>
            : <GoToSignInPage />
        }
      </AuthUserContext.Consumer>
    );
  }
  static async getInitialProps(router) {
    const gameCode = router.query.gameCode as string;
    const gameDef: IGameDef = GAMES_MAP[gameCode];
    if (!gameDef && router.res) {
      return generatePageError(404);
    }
    return { gameDef };
  }
}

export default withRouter(GameInfo as any);
