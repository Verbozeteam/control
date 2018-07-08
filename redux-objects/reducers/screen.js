
import {
    DIM_SCREEN,
    UNDIM_SCREEN,
    SET_PAGING_LOCK,
    SET_DISPLAY_PARAMS,
} from '../actions/screen';

import {
    defaultUIStyle,
} from '../../deployment';

var displayConfig = {
    SIMPLE_UI: {
        UIStyle: 'simple',
        accentColor: '#3B9FFF',
        sidebar: {
            iconHeight: 60,
            color: '#3B9FFF',
            separator: true,
            topIcon: require('../../assets/images/basic_ui/iconhome.png'),
            topIconHeight: 200,
            pull: null,
            underlineColor: null,
            selectedColor: '#666666',
            borderColor: null,
            textColor: '#FFFFFF',
        },
        backgroundColor: '#666666',
        textColor: '#FFFFFF',
        acTextColor: '#000000',
        lightUI: false,
        displayQRCode: false,
        curtainsDisplayAllSwitch: false,
        allSwitchName: 'All',
    },
    SIMPLE_LIGHT_UI: { /* filled below... */ },
    MODERN_UI: {
        UIStyle: 'modern',
        accentColor: '#BA3737',
        sidebar: {
            iconHeight: null,
            color: null,
            separator: false,
            topIcon: null,
            pull: 'right',
            underlineColor: '#BA3737',
            selectedColor: '#FFFFFF22',
            borderColor: '#FFFFFF',
            textColor: '#FFFFFF',
        },
        backgroundColor: null,
        lightUI: false,
        textColor: '#FFFFFF',
        acTextColor: '#FFFFFF',
        displayQRCode: true,
        curtainsDisplayAllSwitch: true,
        allSwitchName: 'All',
    }
};
displayConfig.SIMPLE_LIGHT_UI = {
    ...displayConfig.SIMPLE_UI,
    sidebar: {
        ...displayConfig.SIMPLE_UI.sidebar,
        topIcon: require('../../assets/images/basic_ui/light_ui/iconhome.png'),
        textColor: '#FFFFFF',
    },
    lightUI: true
};

let defaultState = {
    isDimmed: false,
    pagingLock: false,

    displayConfig: displayConfig[defaultUIStyle],
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
        case SET_DISPLAY_PARAMS:
            mergeDicts(newState.displayConfig, action.params);
            break;
        default:
            return state;
    }
    return newState;
};

function mergeDicts(base_dict: Object, new_dict: Object) {
    var keys = Object.keys(new_dict);
    for (var kindex in keys) {
        k = keys[kindex];
        if (!(k in base_dict))
            base_dict[k] = cloneObject(new_dict[k]);
        else if (typeof(base_dict[k]) == 'object' && typeof(new_dict[k]) == 'object')
            mergeDicts(base_dict[k], new_dict[k]);
        else
            base_dict[k] = cloneObject(new_dict[k]);
    }
}
