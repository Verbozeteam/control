
import { SET_LANGUAGE, SET_DEV_MODE, TOGGLE_DEV_MODE } from '../actions/settings';

let defaultState = {
    language: 'en',
    devMode: false,
};

let cloneObject = function(obj) {
    return JSON.parse(JSON.stringify(obj));
}

module.exports = function (state=defaultState, action) {
    var newState = cloneObject(state);
    switch(action.type) {
        case SET_LANGUAGE:
            newState.language = action.language;
            break;
        case SET_DEV_MODE:
            newState.devMode = action.devMode;
            break;
        case TOGGLE_DEV_MODE:
            newState.devMode = !newState.devMode;
            break;
    }
    return newState;
};
