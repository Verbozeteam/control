/* @flow */

import { AsyncStorage } from 'react-native';

import type { LanguageType, LanguageDirectionType } from './flowtypes';

type UserPreferencesType = {
    language: LanguageType,
};

class UserPreferences {

    _user_preferences = {};
    _loaded: boolean = false;

    get(key: string) {
        if (!key || !this._user_preferences) {
            return null;
        }
        if (key in this._user_preferences) {
            return this._user_preferences[key];
        }
        return null;
    }

    async load(callback: Function) {
        // load user preferences from AsyncStorage then call callback
        await AsyncStorage.getItem('_user_preferences').then((value) => {
            this._user_preferences = JSON.parse(value);
            this._loaded = true;
            callback();
        });
    }

    async save(preferences: Object) {
        // update class instance user preferences
        this._user_preferences = {
            ...this._user_preferences,
            ...preferences
        };

        // update AsyncStorage
        try {
            await AsyncStorage.setItem('_user_preferences',
                JSON.stringify(this._user_preferences));
        } catch (error) {
            console.log('AsyncStorage error:', error);
        }
    }
}

module.exports = new UserPreferences();
