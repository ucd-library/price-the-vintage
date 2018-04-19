const BaseStore = require('@ucd-lib/cork-app-utils').BaseStore;
const deepEqual = require('fast-deep-equal');

class CatalogsStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      search : {
        state : 'init'
      },
      byId : {}
    }

    this.events = {
      CATALOG_UPDATE : 'catalog-update',
      CATALOG_SEARCH_UDPATE : 'catalog-search-update'
    }
  }

  setCatalogLoading(id, promise) {
    this.data.byId[id] = {
      id, 
      request : promise,
      state: this.STATE.LOADING
    };

    this.emit(this.events.CATALOG_UPDATE, this.data.byId[id]);
  }

  setCatalogLoaded(id, catalog) {
    catalog = {
      id: id, 
      payload: catalog, 
      state: this.STATE.LOADED
    };

    // nothing changed
    if( this.data.byId[id] && 
        this.data.byId[id].state === this.STATE.LOADED &&
        deepEqual(this.data.byId[id], catalog) ) {
      return;
    }

    this.data.byId[id] = catalog;
    this.emit(this.events.CATALOG_UPDATE, this.data.byId[id]);
  }

  setCatalogError(id, error) {
    this.data.byId[id] = {
      id, error, 
      state: this.STATE.ERROR
    };

    this.emit(this.events.CATALOG_UPDATE, this.data.byId[id]);
  }

  setSearchLoading(params, text = '') {
    this.data.search = {
      state : this.STATE.LOADING,
      params,
      originalText : text
    };

    this.emit(this.events.CATALOG_SEARCH_UDPATE, this.data.search);
  }

  setSearchLoaded(payload) {
    // first set and send search update
    this.data.search = {
      state : this.STATE.LOADED,
      payload
    }
    this.emit(this.events.CATALOG_SEARCH_UDPATE, this.data.search);

    // set and send individual catalog updates
    if( payload && payload.results ) {
      payload.results.forEach(item => this.setCatalogLoaded(item.catalog_id, item));
    }
  }

  setSearchError(error) {
    this.data.search = {state: this.STATE.ERROR, error: error};
    this.emit(this.events.CATALOG_SEARCH_UDPATE, this.data.search);
  }

  clear() {
    this.data.byId = {};
  }

}

module.exports = new CatalogsStore();