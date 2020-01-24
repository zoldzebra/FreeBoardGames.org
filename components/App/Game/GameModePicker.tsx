import React from 'react';
import AndroidIcon from '@material-ui/icons/Android';
import GroupIcon from '@material-ui/icons/Group';
import WifiIcon from '@material-ui/icons/Wifi';
import PersonIcon from '@material-ui/icons/Person';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Slider from '@material-ui/core/Slider';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Link from 'next/link';
import { IGameDef } from 'games';
import { LobbyService } from '../Lobby/LobbyService';
import Router from 'next/router';

interface IGameModePickerProps {
  gameDef: IGameDef;
}

interface IGameModePickerState {
  extraInfo: { [mode: string]: number };
  playButtonDisabled: boolean;
  playButtonError: boolean;
}

export interface IGameModeInfo {
  mode: GameMode;
  extraInfo?: IGameModeExtraInfo;
}

interface IGameModeExtraInfo {
  type: string;
}

export interface IGameModeExtraInfoSlider extends IGameModeExtraInfo {
  type: 'slider';
  min: number;
  max: number;
}

export interface IGameModeExtraInfoDropdown extends IGameModeExtraInfo {
  type: 'dropdown';
  options: string[];
}

export enum GameMode {
  AI = 'AI',
  OnlineFriend = 'online',
  LocalFriend = 'local',
}

export class GameModePicker extends React.Component<IGameModePickerProps, IGameModePickerState> {
  constructor(props: IGameModePickerProps) {
    super(props);
    this.state = {
      playButtonDisabled: false,
      playButtonError: false,
      extraInfo: { online: this.props.gameDef.minPlayers },
    };
  }

  render() {
    const modes = [];
    for (const mode of this.props.gameDef.modes) {
      modes.push(this._getCard(mode));
    }
    const mediaRules = this._getMediaRules();
    return (
      <div>
        <Typography variant="subtitle1" style={{ marginBottom: '16px' }}>
          Choose game mode
        </Typography>
        <style jsx>{`
          .modes {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-gap: 1.25rem;
            align-self: center;
            justify-self: center;
          }
        `}</style>
        {mediaRules}
        <div className="modes">{modes}</div>
      </div>
    );
  }

  _getMediaRules() {
    let mediaRules = '';
    const numberOfGameModes = this.props.gameDef.modes.length;
    if (numberOfGameModes >= 3) {
      mediaRules += `
          @media (min-width: 900px) {
            .modes {
              grid-template-columns: repeat(3, 1fr);
            }
          }`;
    }
    if (numberOfGameModes >= 2) {
      mediaRules += `
          @media (min-width: 600px) {
            .modes {
              grid-template-columns: repeat(2, 1fr);
            }
          }`;
    }
    return <style jsx>{mediaRules}</style>;
  }

  _getCard(info: IGameModeInfo) {
    let title;
    let description;
    let icon;
    switch (info.mode) {
      case GameMode.AI:
        title = 'Computer (AI)';
        description = 'Play against the computer in your browser.';
        icon = <AndroidIcon />;
        break;
      case GameMode.LocalFriend:
        title = 'Local Friend';
        description = 'Share your device and play against a friend locally.';
        icon = <GroupIcon />;
        break;
      case GameMode.OnlineFriend:
        title = 'Online Friend';
        description = 'Share a link and play against a friend online.';
        icon = <WifiIcon />;
        break;
    }
    const extraInfo = this._getExtraInfo(info);
    let btnText = 'Play';
    let color = 'primary'; // FIXME: couldn't find the type
    if (this.state.playButtonError) {
      btnText = 'Error';
      color = 'secondary';
    } else if (this.state.playButtonDisabled) {
      btnText = 'Loading';
    }
    // const color = this.state.playButtonError ? 'secondary' : 'primary';
    let button;
    if (info.mode === GameMode.OnlineFriend) {
      button = (
        <Button
          data-testid="playButton"
          variant="contained"
          color={color as any}
          style={{ marginLeft: 'auto' }}
          onClick={this._playOnlineGame(info)}
          disabled={this.state.playButtonDisabled}
        >
          {btnText}
        </Button>
      );
    } else {
      const linkInfo = this._getLink(info);
      const linkHref = linkInfo[0],
        linkAs = linkInfo[1];
      button = (
        <Link href={linkHref} as={linkAs}>
          <Button
            data-testid={`playbutton-${this.props.gameDef.code}-${info.mode}`}
            component="a"
            variant="contained"
            color="primary"
            style={{ marginLeft: 'auto' }}
          >
            Play
          </Button>
        </Link>
      );
    }
    return (
      <Card key={title} style={{ maxWidth: '500px', marginBottom: '16px' }}>
        <CardHeader avatar={<Avatar aria-label={title}>{icon}</Avatar>} title={title} />
        <CardContent>
          <Typography component="p">{description}</Typography>
        </CardContent>
        <CardActions>
          {extraInfo}
          {button}
        </CardActions>
      </Card>
    );
  }

  _playOnlineGame = (info: IGameModeInfo) => () => {
    // second param was e: any
    this.setState({ ...this.state, playButtonDisabled: true });
    const gameCode = this.props.gameDef.code;
    const numPlayers = this._getExtraInfoValue(info);
    // `/room/new/${this.props.gameDef.code}/${this._getExtraInfoValue(info)}`,
    LobbyService.newRoom(gameCode, numPlayers).then(
      roomID => {
        // we use .replace instead of .push so that the browser back button works correctly
        Router.replace(`/room/${gameCode}/${roomID}`);
      },
      () => {
        // was _err => { ...
        this.setState({ ...this.state, playButtonError: true, playButtonDisabled: false });
      },
    );
  };

  _getExtraInfoValue(info: IGameModeInfo): number {
    return (this.state.extraInfo as any)[info.mode] || 1;
  }

  _getExtraInfo(info: IGameModeInfo) {
    if (info.mode == GameMode.OnlineFriend) {
      if (this.props.gameDef.minPlayers < this.props.gameDef.maxPlayers) {
        return this._getExtraInfoNumPlayers(info, this.props.gameDef.minPlayers, this.props.gameDef.maxPlayers);
      }
    }
    if (info.extraInfo) {
      const extraInfo = info.extraInfo;
      if (extraInfo.type === 'slider') {
        const slider = extraInfo as IGameModeExtraInfoSlider;
        return this._getExtraInfoSlider(info, slider);
      } else if (extraInfo.type === 'dropdown') {
        const dropdown = extraInfo as IGameModeExtraInfoDropdown;
        return this._getExtraInfoDropdown(info, dropdown);
      }
    }
    return null;
  }

  _getExtraInfoNumPlayers(info: IGameModeInfo, minPlayers: number, maxPlayers: number) {
    const options = [];
    for (let i = minPlayers; i <= maxPlayers; i++) {
      options.push(
        <MenuItem value={i} key={i}>
          {i} Players
        </MenuItem>,
      );
    }
    return (
      <div style={{ marginBottom: '8px' }}>
        <PersonIcon style={{ position: 'relative', top: '8px', padding: '0 8px' }} />
        <Select value={this._getExtraInfoValue(info)} onChange={this._handleNumPlayersSelect}>
          {options}
        </Select>
      </div>
    );
  }

  _handleNumPlayersSelect = (event: any) => {
    const newState: IGameModePickerState = {
      ...this.state,
      extraInfo: {
        ...this.state.extraInfo,
      },
    };
    newState.extraInfo[GameMode.OnlineFriend] = event.target.value;
    this.setState(newState);
  };

  _getExtraInfoSlider(info: IGameModeInfo, slider: IGameModeExtraInfoSlider) {
    const value = this._getExtraInfoValue(info);
    return (
      <div style={{ marginBottom: '18px', width: '80%' }}>
        <Typography id="label" style={{ marginBottom: '8px' }}>
          Difficulty {value}/{slider.max}
        </Typography>
        <Slider
          value={value}
          min={slider.min}
          max={slider.max}
          step={1}
          onChange={this._handleSliderChange(info.mode)}
        />
      </div>
    );
  }

  _handleSliderChange = (mode: GameMode) => (event: any, value: number) => {
    const newState: IGameModePickerState = {
      ...this.state,
      extraInfo: {
        ...this.state.extraInfo,
      },
    };
    newState.extraInfo[mode] = value;
    this.setState(newState);
  };

  _getExtraInfoDropdown(info: IGameModeInfo, dropdown: IGameModeExtraInfoDropdown) {
    const list: JSX.Element[] = dropdown.options.map((option, idx) => {
      idx++;
      return (
        <MenuItem
          onClick={this._handleClickSelection(info.mode, idx)}
          key={option}
          value={option}
          selected={this._getExtraInfoValue(info) === idx}
        >
          {option}
        </MenuItem>
      );
    });
    return (
      <div>
        <MenuList
          style={{
            paddingTop: 0,
            paddingBottom: 0,
            display: 'flex',
          }}
        >
          {list}
        </MenuList>
      </div>
    );
  }

  _getNumOfCardsToDisplay(cardsToDisplay) {
    const numberOfGameModes = this.props.gameDef.modes.length;
    return Math.max(cardsToDisplay, numberOfGameModes);
  }

  _handleClickSelection = (mode: GameMode, value: any) => () => {
    const newState: IGameModePickerState = {
      ...this.state,
      extraInfo: {
        ...this.state.extraInfo,
      },
    };
    newState.extraInfo[mode] = value;
    this.setState(newState);
  };

  _getLink(info: IGameModeInfo) {
    const mode = info.mode;
    let hrefAndAs: string[];
    switch (mode) {
      case GameMode.AI:
        if (info.extraInfo) {
          hrefAndAs = [
            '/play/[gameCode]/[mode]/[aiLevel]',
            `/play/${this.props.gameDef.code}/AI/${this._getExtraInfoValue(info)}`,
          ];
          break;
        } else {
          hrefAndAs = ['/play/[gameCode]/[mode]', `/play/${this.props.gameDef.code}/AI`];
          break;
        }
      case GameMode.LocalFriend:
        hrefAndAs = ['/play/[gameCode]/[mode]', `/play/${this.props.gameDef.code}/local`];
        break;
      case GameMode.OnlineFriend:
        hrefAndAs = [
          '/room/new/[gameCode]/[numPlayers]',
          `/room/new/${this.props.gameDef.code}/${this._getExtraInfoValue(info)}`,
        ];
        break;
    }
    return hrefAndAs;
  }
  static async getInitialProps(router) {
    const gameCode = router.query.gameCode as string;
    return { gameCode };
  }
}
