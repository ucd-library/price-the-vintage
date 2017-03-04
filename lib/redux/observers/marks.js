var observer = require('redux-observers').observer;
var eventBus = require('../../eventBus');

var byId = observer(
  (state) => state.collections.marks.byId,
  (dispatch, current, previous) => {
    for( var key in current ) {
      if( current[key] !== previous[key] ) {
        eventBus.emit('catalog-page-marks-update', current[key]);
      }
    }
  }
);

var selected = observer(
  (state) => state.collections.marks.selected,
  (dispatch, current, previous) => {
    eventBus.emit('selected-catalog-page-update', current);
  }
);

module.exports = [byId, selected];