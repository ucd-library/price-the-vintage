var BaseModel = require('cork-app-utils').BaseModel;
var ConfigStore = require('../stores/ConfigStore');

class ConfigModel extends BaseModel {

  constructor() {
    super();

    this.store = ConfigStore;
    this.getApiHost()
        .then(e => this.store.setHost(e));

    this.registerIOC('ConfigModel');
  }

  getEnv() {
    var location = 'remote';
    var env = 'dev';

    // browser land
    if( typeof window !== 'undefined' ) {


      if( getParameterByName('location') ) {
        location = getParameterByName('location');
      } else if( window.location.host.indexOf('localhost') > -1 ) {
        location = 'local';
      }

      if( getParameterByName('env') ) {
        env = getParameterByName('env');
      } else if( window.location.host === 'ptv.library.ucdavis.edu' ||
                window.location.host === 'price-the-vintage.firebaseapp.com' ) {
        env = 'prod';
      }
    
    // node land
    } else {
      env = process.env.PRICE_THE_VINTAGE_ENV || 'dev';
    }

    return {location, env};
  }

  /**
   * Get the current host provided in config file.
   * @returns {string} - host url
   */
  async getApiHost() {
    if( this.apiHost ) {
      return this.apiHost;
    }

    var host = this.store.data.apiHost;
    var envVars = this.getEnv();
    host = host[envVars.location][envVars.env];

    this.apiHost = host;
    console.log('Current API ENV', envVars);
    console.log('API HOST', host);

    return host;
  }

  get() {
    return this.store.data;
  }

}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

module.exports = new ConfigModel();