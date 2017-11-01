/* @flow */

'use strict';

import type { ActionType } from '../actions/types';

type StateType = {
    language: string,
    lang_direction: 'left_to_right' | 'right_to_left'
};

const initialState = {
    language: 'en',
    lang_direction: 'left_to_right'
};

function language(state: StateType = initialState,  action: ActionType):
    StateType {

    switch (action.type) {
        case 'CHANGE_LANGUAGE_TO_ENGLISH':
            return {
                language: 'en',
                lang_direction: 'left_to_right'
            };

        case 'CHANGE_LANGUAGE_TO_ARABIC':
            return {
                language: 'ar',
                lang_direction: 'right_to_left'
            };
            
        default:
            return state
    }
}
