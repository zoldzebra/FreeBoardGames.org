import React from 'react';
import getMessagePage from '../../../../components/App/MessagePage';
import { LobbyService, IRoomMetadata, IPlayerInRoom } from '../../../../components/App/Lobby/LobbyService';
import { GAMES_MAP } from '../../../../games';
import AlertLayer from '../../../../components/App/Game/AlertLayer';
import FreeBoardGamesBar from '../../../../components/App/FreeBoardGamesBar';
import { GameSharing } from '../../../../components/App/Game/GameSharing';
import Game from '../../../../components/App/Game/Game';
import { ListPlayers } from '../../../../components/App/Lobby/ListPlayers';
import { GameCard } from '../../../../components/App/Game/GameCard';
import { NicknamePrompt } from '../../../../components/App/Lobby/NicknamePrompt';
import { useRouter, NextRouter } from 'next/router';
import { AuthUserContext, GoToSignInPage } from '../../../../components/Session';

interface IRoomProps {
  gameCode: string;
  roomID: string;
  router: NextRouter;
}

interface IRoomState {
  roomMetadata?: IRoomMetadata;
  nameTextField?: string;
  loading: boolean;
  gameReady: boolean;
  error: string;
  editingName: boolean;
  interval: number | undefined;
}

class Room extends React.Component<IRoomProps, IRoomState> {
  state: IRoomState = { error: '', loading: true, gameReady: false, editingName: false, interval: undefined };
  private timer: any; // fixme loads state of room
  private promise: Promise<IRoomMetadata | void>;

  constructor(props) {
    super(props);
    this._componentCleanup = this._componentCleanup.bind(this);
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this._componentCleanup);
    this.timer = setInterval(() => this.updateMetadata(), 2000);
    this.updateMetadata(true);
  }

  render() {
    const LoadingPage = getMessagePage('loading', 'Loading...');
    const nickname = LobbyService.getNickname();
    if (!nickname) {
      return <FreeBoardGamesBar>{this._getNamePrompt()}</FreeBoardGamesBar>;
    }
    if (this.state.error) {
      const ErrorPage = getMessagePage('error', this.state.error);
      return <ErrorPage />;
    }
    if (this.state.loading) {
      return <LoadingPage />;
    }
    if (this.state.gameReady) {
      const room = this.state.roomMetadata;
      return <Game room={room} />;
    }
    const nicknamePrompt = this.state.editingName ? (
      <AlertLayer>{this._getNamePrompt(this.state.roomMetadata.currentUser.name)}</AlertLayer>
    ) : null;
    return (
      <AuthUserContext.Consumer>
        {authUser =>
          authUser
            ? <FreeBoardGamesBar>
              {nicknamePrompt}
              <GameCard game={GAMES_MAP[this.state.roomMetadata.gameCode]} />
              {this._getGameSharing()}
              <ListPlayers roomMetadata={this.state.roomMetadata} editNickname={this._toggleEditingName} />
            </FreeBoardGamesBar>
            : <GoToSignInPage />
        }
      </AuthUserContext.Consumer>
    );
  }

  updateMetadata = (firstRun?: boolean) => {
    const gameCode = this.props.router.query.gameCode as string;
    const roomID = this.props.router.query.roomID as string;
    if (!firstRun) {
      if (this.state.editingName) {
        return;
      }
    }
    if (!LobbyService.getNickname()) {
      return;
    }
    this.promise = LobbyService.getRoomMetadata(gameCode, roomID)
      .then(async metadata => {
        if (!metadata.currentUser) {
          const player: IPlayerInRoom = {
            playerID: metadata.players.length,
            roomID,
            name: LobbyService.getNickname(),
          };
          await LobbyService.joinRoom(gameCode, player);
          return LobbyService.getRoomMetadata(gameCode, roomID);
        }
        return metadata;
      })
      .then(
        metadata => {
          if (metadata.numberOfPlayers === metadata.players.length) {
            this.setState(oldState => ({ ...oldState, gameReady: true }));
            this._componentCleanup();
          }
          this.setState(oldState => ({ ...oldState, roomMetadata: metadata, loading: false }));
          return metadata;
        },
        () => {
          const error = 'Failed to fetch room metadata.';
          this.setState(oldState => ({ ...oldState, error }));
        },
      );
  };

  _getNamePrompt = (name?: string) => {
    const togglePrompt = this.state.editingName ? this._toggleEditingName : null;
    return <NicknamePrompt setNickname={this._setNickname} nickname={name} togglePrompt={togglePrompt} />;
  };

  _toggleEditingName = () => {
    this.setState(oldState => ({ ...oldState, editingName: !this.state.editingName }));
  };

  _setNickname = (nickname: string) => {
    LobbyService.setNickname(nickname);
    if (this.state.editingName) {
      const room = this.state.roomMetadata;
      LobbyService.renameUser(room.gameCode, room.currentUser, nickname);
      this._toggleEditingName();
    }
    this.updateMetadata();
  };

  componentWillUnmount() {
    this._componentCleanup();
    window.removeEventListener('beforeunload', this._componentCleanup);
  }

  _componentCleanup = () => {
    clearInterval(this.timer);
    this.timer = undefined;
  };

  _getGameSharing = () => {
    const gameCode = this.props.router.query.gameCode as string;
    const roomID = this.props.router.query.roomID as string;
    return <GameSharing gameCode={gameCode} roomID={roomID} roomMetadata={this.state.roomMetadata} />;
  };
}

const roomWithRouter = props => {
  const router = useRouter();
  return <Room {...props} router={router} />;
};

export default roomWithRouter;
