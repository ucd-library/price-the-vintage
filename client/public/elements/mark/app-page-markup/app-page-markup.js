import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-page-markup.html"

import "../app-page-carousel"
import "../app-admin-markup-control"
import "../app-help-text-control"
import "../app-marker"

import PageMarkup_CatalogPageMixin from "./catalog-page-controls"
import PageMarkup_MapMixin from "./map-controls"
import PageMarkup_MarkMixin from "./mark-controls"

import leafletCSS from "leaflet/dist/leaflet.css"
import leafletDrawCSS from "leaflet-draw/dist/leaflet.draw.css"

export class AppPageMarkup extends Mixin(PolymerElement)
  .with(EventBusMixin, ToggleStateMixin, AuthMixin, AppStateMixin, 
        PagesMixin, MarksMixin, CatalogsMixin, ConfigMixin, InterestedPartyMixin,
        // flowing are partial mixins to break up this very big element
        PageMarkup_MarkMixin, PageMarkup_CatalogPageMixin, PageMarkup_MapMixin) {

  static get properties() {
    return {
      // should be one of: view, edit or create
      viewState : {
        type : String,
        value : 'view'
      },

      // for this to be set, everything must be rendered as this page.
      renderedPageId : {
        type : String,
        value : '--'
      }
    }
  }

  static get template() {
    return html([template]);
  }

  constructor() {
    super();

    this.bind = {
      'ui-show-mark-noop-popup' : '_showPopup'
    }
  }

  ready() { 
    super.ready();
  }

  _onActive() {
    if( !this.active ) {
      if( this.addMarker && this.drawTool ) {
        this._removeTmpMark();
        this.addMarker = null;
        this.drawTool.disable();
        this.drawTool.enable();
      }
      return;
    }
    
    this._render();
  }

  _onAuthUpdate(e) {
    this.userState = e;
    this._renderMapControls();
  }

  _onAppStateUpdate(appState) {
    if( !appState.catalogId ) return;
    this.appState = appState;

    this.selectedCatalogId = appState.catalogId;
    this.selectedPageId = appState.pageId;  
    
    // helper
    this.viewState = '';
    if( appState.viewingMark ) this.viewState = 'view';
    else if( appState.creatingMark ) this.viewState = 'create';
    else if( appState.editingMark ) this.viewState = 'edit';

    this._render();
  }

  _render() {
    this.debounce('_render', () => this._renderAsync(), 50);
  }

  _renderAsync() {
    this._hidePopup();

    // we need to be active and have a selected catalog
    if( !this.active || !this.selectedCatalogId ) return;

    // if we are not creating a mark, make sure we remove tmp mark
    if( this.viewState !== 'create' ) {
      this._removeTmpMark()
    }

    // don't repeat yourself.  if the currently rendered page is
    // the same as the selected page there is nothing todo
    if( this.selectedPageId === this.renderedPageId ) {
      // render map controls visibility states
      this._renderMapControls();

      // render edit form state
      this._renderForm();

      // make sure map size is good
      this._updateMapSize();
      return;
    }

    // show we are loading
    this.toggleState('loading');

    this._getCatalogPages()
        .then((pages) => {
          this.pages = pages;

          this._selectPage();

          // url only had a catalog id, go select first page
          // this will trip a state change and redo the render loop
          // so we will go ahead and quit out
          // there could have also been a bad page id passed
          if( !this.selectedPage ) {  
            return;
          }

          return this._loadImage();
        })
        .then(() => {
          // render the leaflet map and add controls
          this._renderMap();

          // render controls visibility states
          this._renderMapControls();

          // go grab pending and active marks for page
          // this will trigger _onMarksUpdate and will render a selected
          // mark when it's loaded
          this._loadMarks();

          this.renderedPageId = this.selectedPageId;
        });
  }

  // called from _onMarksUpdate after selected mark is loaded
  _renderForm() {
    if( this.viewState === 'create' ) {
      // handle from the pendingAddMark from the draw control
      if( this.pendingAddMark ) {
        this.$.priceItem.create(this.pendingAddMark._latlng);
        this.marksLayer.addLayer(this.pendingAddMark);
        this.addMarker = this.pendingAddMark;
        this.pendingAddMark = null;
      }
    } else if( this.viewState === 'edit' || this.viewState === 'view' ) {
      this.$.priceItem.show(this.marks[this.appState.markId]);
    } else {
      this.$.priceItem.hide();
    }
  }

  _onInterestedPartyRequest(e) {
    if( !this.selectedPageId ) return;
    this._sendInterestedPartyResponse(e);
  }

  _sendInterestedPartyResponse(e) {
    super._sendInterestedPartyResponse(this.selectedPageId, [e.TYPES.PAGE]);
  }

  _hidePopup() {
    this.$.nothingToDo.style.display = 'none';
  }

  _showPopup() {
    this.$.nothingToDo.style.display = 'block';
  }
}

window.customElements.define('app-page-markup', AppPageMarkup);