import SSRHelper from './SSRHelper';

export default class AddressHelper {
  /** Gets bgio host:port address. */
  public static getServerAddress() {
    const backendUrl = 'http://localhost:8001'; // 'https://katicabackend.herokuapp.com';
    if (!SSRHelper.isSSR()) {
      // return process.env.BGIO_SERVER_URL || `http://${window.location.hostname}:8001`;
      return backendUrl;
    }
  }
}
