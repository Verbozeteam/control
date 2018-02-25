
export const DIM_SCREEN = 'DIM_SCREEN';
export const UNDIM_SCREEN = 'UNDIM_SCREEN';
export const SET_PAGING_LOCK = 'SET_PAGING_LOCK';
export const SET_LIGHT_MODE = 'SET_LIGHT_MODE';

export function dim_screen(is_dim: boolean) {
    return {
        type: is_dim ? DIM_SCREEN : UNDIM_SCREEN
    };
}

export function set_paging_lock(is_locked: boolean) {
    return {
        type: SET_PAGING_LOCK,
        lock: is_locked,
    };
}

export function set_light_mode(is_light: boolean) {
    return {
        type: SET_LIGHT_MODE,
        mode: is_light,
    };
}
