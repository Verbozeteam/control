/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet, Picker } from 'react-native';
import { connect } from 'react-redux';

const connectionActions = require ('../redux-objects/actions/connection');
const settingsActions = require ('../redux-objects/actions/settings');

const I18n = require('../i18n/i18n');
const UserPreferences = require('../lib/UserPreferences');

const Panel = require('./Panel');
const DeviceDiscoveryView = require('./DeviceDiscoveryView');

import type { LanguageType } from '../config/flowtypes';
import { LanguageName } from '../config/flowtypes';

function mapStateToProps(state) {
    return {
        language: state.settings.language,
        devMode: state.settings.devMode,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setLanguage: l => {dispatch(settingsActions.set_language(l));},
    };
}

class Settings extends React.Component<any> {
    _unsubscribe: () => null = () => {return null;};

    componentWillMount() {
        const { store } = this.context;
        this._unsubscribe = store.subscribe(() => {});
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    changeLanguage(itemValue: string, itemIndex: number) {
        UserPreferences.save({'language': itemValue});
        I18n.setLanguage(itemValue);
        this.props.setLanguage(itemValue);
    }

    render() {
        var language_items = Object.keys(LanguageName).map((slang, i) =>
            <Picker.Item key={'language-option-' + i}
                label={LanguageName[slang]}
                value={slang} />
        );

        var device_discovery = null;
        if (this.props.devMode) {
            device_discovery = <DeviceDiscoveryView />
        }

        return (
            <Panel layout={styles.container}
                name={{en: "Settings"}}
                viewType={'static'}>

                <Text style={styles.setting_header}>
                    {I18n.t("Language")}
                </Text>
                <Picker selectedValue={this.props.language}
                    onValueChange={this.changeLanguage.bind(this)}
                    style={styles.picker}>
                    {language_items}
                </Picker>

                {device_discovery}
            </Panel>
        );
    }
}

Settings.contextTypes = {
    store: Object
};

const styles = StyleSheet.create({
    container: {
        margin: 10,
    },
    setting_container: {
        flex: 1,
    },
    setting_header: {
        fontSize: 20,
        fontFamily: 'HKNova-MediumR',
        color: '#FFFFFF'
    },
    picker: {
        color: '#FFFFFF',
    }
});

module.exports = connect(mapStateToProps, mapDispatchToProps) (Settings);
