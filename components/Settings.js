/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet, Picker } from 'react-native';
import PropTypes from 'prop-types';
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

        var settings = [];

        /** Language setting */
        settings.push({
            name: (
                <Text style={styles.setting_header}>
                    {I18n.t("Language")}
                </Text>
            ),
            value: (
                <Picker selectedValue={this.props.language}
                    onValueChange={this.changeLanguage.bind(this)}
                    style={styles.picker}>
                    {language_items}
                </Picker>
            )
        });

        var settings_views = [];
        for (var i = 0; i < settings.length; i++) {
            settings_views.push(
                <View key={'setting-'+i}
                    style={styles.setting_container}>
                    {I18n.l2r() ? settings[i].name : settings[i].value}
                    {I18n.r2l() ? settings[i].name : settings[i].value}
                </View>
            );
        }

        return (
            <Panel layout={styles.container}
                name={{en: "Settings"}}
                viewType={'static'}>

                {settings_views}

                {device_discovery}
            </Panel>
        );
    }
}

Settings.contextTypes = {
    store: PropTypes.object
};

const styles = StyleSheet.create({
    container: {
    },
    setting_container: {
        flex: 1,
        flexDirection: 'row',
    },
    setting_header: {
        flex: 1,
        fontSize: 20,
        fontFamily: 'HKNova-MediumR',
        color: '#FFFFFF'
    },
    picker: {
        flex: 3,
        color: '#FFFFFF',
        width: 200,
        backgroundColor: '#0f0f0f'
    }
});

module.exports = connect(mapStateToProps, mapDispatchToProps) (Settings);
