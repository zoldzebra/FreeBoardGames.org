import { GAMES_LIST } from '../games';
import noCache from 'koa-no-cache';
const cors = require('@koa/cors'); // tslint:disable-line
const { Server } = require('@freeboardgame.org/boardgame.io/server'); // tslint:disable-line

const PORT = process.env.PORT || process.env.BGIO_PORT || 8001;
const LOCAL_ADDRESS = process.env.LOCAL_ADDRESS || '0.0.0.0';

const startServer = async () => {
  const configs = Promise.all(GAMES_LIST.map(gameDef => gameDef.config()));
  const games = (await configs).map(config => config.default.bgioGame);
  const server = Server({ games });
  server.app.use(noCache({ global: true }));
  server.app.use(cors());
  server.run(PORT, () => {
    console.log(`Serving boardgame.io KATICABACKEND at: http://${LOCAL_ADDRESS}:${PORT}/`); // tslint:disable-line
  });
};

startServer();
