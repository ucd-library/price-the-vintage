var service = require('../../../services/pages');

/**
 * STATE ENUMs
 */
var ACTIONS = {
  SAVE_MARK_REQUEST : 'SAVE_MARK_REQUEST',
  SAVE_MARK_SUCCESS : 'SAVE_MARK_SUCCESS',
  SAVE_MARK_FAILURE : 'SAVE_MARK_FAILURE',
  
  MARK_CHANGE : 'MARK_CHANGE',
  SELECT_CATALOG_PAGE_MARKS : 'SELECT_CATALOG_PAGE_MARKS'
}

function saveMarkFailure(pageId, markId, error) {
  return {
    type : ACTIONS.SAVE_MARK_FAILURE,
    pageId : pageId,
    id: markId,
    error : error
  }
}

function saveMarkSuccess(pageId, markId) {
  return {
    type : ACTIONS.SAVE_MARK_SUCCESS,
    pageId : pageId,
    id: markId
  }
}

function saveMarkStart(pageId, markId, mark) {
  return {
    type : ACTIONS.SAVE_MARK_REQUEST,
    pageId : pageId,
    id : markId,
    mark : mark
  }
}

function markChange(pageId, markId, mark) {
  return {
    type : ACTIONS.MARK_CHANGE,
    pageId : pageId,
    id : markId,
    mark : mark
  }
}

function select(id) {
  return {
    type : ACTIONS.SELECT_CATALOG_PAGE_MARKS,
    id : id
  }
}


module.exports = {
  ACTIONS, select,
  saveMarkStart,
  saveMarkSuccess,
  saveMarkFailure,
  markChange
}