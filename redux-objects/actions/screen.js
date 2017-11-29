
export const DIM_SCREEN = 'DIM_SCREEN';
export const UNDIM_SCREEN = 'UNDIM_SCREEN';
export const SET_PAGING_LOCK = 'SET_PAGING_LOCK';

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
