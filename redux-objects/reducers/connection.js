
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
    SET_THINGS_PARTIAL_STATES
} from '../actions/connection';

var default_ip = "192.168.10.1";
var default_port = 7990;
try {
    if (__DEV__) {
        default_ip = "10.11.28.41";
        default_port = 4567;
    }
} catch (e) {}

let defaultState = {
    isConnected: false,
    currentDevice: {
        ip: default_ip,
        port: default_port,
        name: "QSTP Device",
    },
    discoveredDevices: [],
    QRCodeAddress: "ws://192.168.10.1:7986/demo",

    config: null,
    thingStates: {},
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
        case ADD_DISCOVERED_DEVICE:
            var index = -1;
            for (var i = 0; i < newState.discoveredDevices.length; i++)
                if (newState.discoveredDevices[i].name == action.device.name)
                    index = i;
            if (index == -1)
                newState.discoveredDevices.push(action.device);
            else {
                newState.discoveredDevices[index] = action.device;
                if (newState.currentDevice && newState.currentDevice.name == action.device.name)
                    newState.currentDevice = action.device;
            }
            break;
        case CLEAR_DISCOVERED_DEVICES:
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
    }
    return newState;
};
