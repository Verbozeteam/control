
import { DIM_SCREEN, UNDIM_SCREEN } from '../actions/screen';

let defaultState = {
    isDimmed: false,
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
    }
    return newState;
};
