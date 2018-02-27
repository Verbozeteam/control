
import type { DiscoveredDeviceType } from '../config/flowtypes';

export const SET_CONNECTION_STATUS = 'SET_CONNECTION_STATUS';
export const ADD_DISCOVERED_DEVICE = 'ADD_DISCOVERED_DEVICE';
export const CLEAR_DISCOVERED_DEVICES = 'CLEAR_DISCOVERED_DEVICES';
export const SET_CURRENT_DEVICE = 'SET_CURRENT_DEVICE';
export const SET_CONNECTION_QRCODE = 'SET_CONNECTION_QRCODE';
export const SET_CONFIG = 'SET_CONFIG';
export const SET_THING_STATE = 'SET_THING_STATE';
export const SET_THINGS_STATES = 'SET_THINGS_STATES';
export const SET_THING_PARTIAL_STATE = 'SET_THING_PARTIAL_STATE';
export const SET_THINGS_PARTIAL_STATES = 'SET_THINGS_PARTIAL_STATES';

export function set_connection_status(is_connected: boolean) {
    return {
        type: SET_CONNECTION_STATUS,
        isConnected: is_connected,
    }
}

export function add_discovered_device(device: DiscoveredDeviceType) {
    return {
        type: ADD_DISCOVERED_DEVICE,
        device: device,
    }
}

export function clear_discovered_devices() {
    return {
        type: CLEAR_DISCOVERED_DEVICES,
    }
}

export function set_current_device(device: DiscoveredDeviceType) {
    return {
        type: SET_CURRENT_DEVICE,
        device: device,
    }
}

export function set_connection_qr_code(qr_code: string) {
    return {
        type: SET_CONNECTION_QRCODE,
        code: qr_code,
    }
}

export function set_config(config: ConfigType) {
    return {
        type: SET_CONFIG,
        config: config,
    }
}

export function set_things_states(thing_to_state: Object) {
    return {
        type: SET_THINGS_STATES,
        thingsToStates: thing_to_state,
    }
}

export function set_thing_state(id: string, state: Object) {
    return {
        type: SET_THING_STATE,
        thingId: id,
        state: state,
    }
}

export function set_thing_partial_state(id: string, state: Object) {
    return {
        type: SET_THING_PARTIAL_STATE,
        thingId: id,
        state: state,
    }
}

export function set_things_partial_states(thing_to_partial_state: Object) {
    return {
        type: SET_THINGS_PARTIAL_STATES,
        thingsToPartialStates: thing_to_partial_state,
    }
}
