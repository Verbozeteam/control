
export const DIM_SCREEN = 'DIM_SCREEN';
export const UNDIM_SCREEN = 'UNDIM_SCREEN';

export function dim_screen(is_dim: boolean) {
    return {
        type: is_dim ? DIM_SCREEN : UNDIM_SCREEN
    }
}
