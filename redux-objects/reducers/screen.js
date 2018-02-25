
import { DIM_SCREEN, UNDIM_SCREEN, SET_PAGING_LOCK, SET_LIGHT_MODE } from '../actions/screen';

let defaultState = {
    isDimmed: false,
    pagingLock: false,
    isLight: true,
};

let cloneObject = function(obj) {
    return JSON.parse(JSON.stringify(obj));
}

module.exports = function (state=defaultState, action) {
    var newState = cloneObject(state);
    switch(action.type) {
        case DIM_SCREEN:
            newState.isDimmed = true;
            break;
        case UNDIM_SCREEN:
            newState.isDimmed = false;
            break;
        case SET_PAGING_LOCK:
            newState.pagingLock = action.lock;
            break;
        case SET_LIGHT_MODE:
            newState.isLight = action.mode;
            break;
    }
    return newState;
};
