
import type { LanguageType } from '../config/flowtypes';

export const SET_LANGUAGE = 'SET_LANGUAGE';
export const SET_DEV_MODE = 'SET_DEV_MODE';
export const TOGGLE_DEV_MODE = 'TOGGLE_DEV_MODE';

export function set_language(language: LanguageType) {
    return {
        type: SET_LANGUAGE,
        language: language,
    }
}

export function set_dev_mode(mode: boolean) {
    return {
        type: SET_DEV_MODE,
        devMode: mode,
    }
}

export function toggle_dev_mode() {
    return {
        type: TOGGLE_DEV_MODE,
    }
}
