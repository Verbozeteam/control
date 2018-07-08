
export const DIM_SCREEN = 'DIM_SCREEN';
export const UNDIM_SCREEN = 'UNDIM_SCREEN';
export const SET_PAGING_LOCK = 'SET_PAGING_LOCK';
export const SET_DISPLAY_PARAMS = 'SET_DISPLAY_PARAMS';

export function dim_screen(is_dim: boolean) {
    return {
        type: is_dim ? DIM_SCREEN : UNDIM_SCREEN
    }
}

export function set_paging_lock(is_locked: boolean) {
    return {
        type: SET_PAGING_LOCK,
        lock: is_locked,
    }
}

export function set_display_params(params: Object) {
    return {
        type: SET_DISPLAY_PARAMS,
        params: params,
    }
}
