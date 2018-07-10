
import {
    SET_CONNECTION_STATUS,
    ADD_DISCOVERED_DEVICE,
    CLEAR_DISCOVERED_DEVICES,
    SET_CURRENT_DEVICE,
    SET_CONNECTION_QRCODE,
    SET_CONFIG,
    SET_THING_STATE,
    SET_THINGS_STATES,
    SET_THING_PARTIAL_STATE,
    SET_THINGS_PARTIAL_STATES,
    SET_TARGET_SSID,
    SET_USING_SSL
} from '../actions/connection';

import {
    default_ip,
    default_port,
    default_ssid,
    default_passphrase,
    default_QRCode,
} from '../../deployment';

let defaultState = {
    isConnected: false,
    currentDevice: {
        ip: default_ip,
        port: default_port,
        name: "QSTP Device",
    },
    discoveredDevices: [],
    QRCodeAddress: default_QRCode,
    targetSSID: default_ssid,
    targetPassphrase: default_passphrase,

    config: null,
    thingStates: {},

    usingSSL: false
};

let cloneObject = function(obj) {
    return JSON.parse(JSON.stringify(obj));
}

module.exports = function (state=defaultState, action) {
    var newState = cloneObject(state);

    switch(action.type) {
        case SET_CONNECTION_STATUS:
            newState.isConnected = action.isConnected;
            break;
        case SET_TARGET_SSID:
            newState.targetSSID = action.ssid;
            newState.targetPassphrase = action.passphrase;
            break;
        case SET_USING_SSL:
            newState.usingSSL = action.usingSSL;
            break;
        case ADD_DISCOVERED_DEVICE:
            var index = -1;
            for (var i = 0; i < newState.discoveredDevices.length; i++)
                if (newState.discoveredDevices[i].name == action.device.name)
                    index = i;
            if (index == -1)
                newState.discoveredDevices.push(action.device);
            else {
                newState.discoveredDevices[index] = action.device;
                if (JSON.stringify(newState.discoveredDevices) === JSON.stringify(state.discoveredDevices))
                    return state;
                if (newState.currentDevice && newState.currentDevice.name == action.device.name)
                    newState.currentDevice = action.device;
            }
            break;
        case CLEAR_DISCOVERED_DEVICES:
            if (newState.discoveredDevices.length === 0)
                return state;
            newState.discoveredDevices = [];
            break;
        case SET_CURRENT_DEVICE:
            newState.currentDevice = action.device;
            break;
        case SET_CONNECTION_QRCODE:
            newState.QRCodeAddress = action.code;
            break;
        case SET_CONFIG:
            newState.config = action.config;
            break;
        case SET_THING_STATE:
            newState.thingStates[action.thingId] = action.state;
            break;
        case SET_THINGS_STATES:
            newState.thingStates = {
                ...newState.thingStates,
                ...action.thingsToStates
            };
            break;
        case SET_THING_PARTIAL_STATE:
            newState.thingStates[action.thingId] = {
                ...newState.thingStates[action.thingId],
                ...action.state
            };
            break;
        case SET_THINGS_PARTIAL_STATES:
            for (var k in action.thingsToPartialStates)
                newState.thingStates[k] = {
                    ...newState.thingStates[k],
                    ...action.thingsToPartialStates[k],
                };
            break;
        default:
            return state;
    }
    return newState;
};
