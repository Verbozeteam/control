/* @flow */

import * as React from 'react';
import QRCode from 'react-native-qrcode';
import { View, Text, StyleSheet, Picker } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TypeFaces } from '../constants/styles';

const connectionActions = require ('../redux-objects/actions/connection');
const settingsActions = require ('../redux-objects/actions/settings');

const I18n = require('../js-api-utils/i18n/i18n');
const UserPreferences = require('../js-api-utils/UserPreferences');

import Panel from './Panel';
const DeviceDiscoveryView = require('./DeviceDiscoveryView');

type LanguageType = 'en' | 'ar' | 'ru' | 'de' | 'zh';

const LanguageName = {
    'en': 'English',
    'ar': 'العربية',
    'ru': 'Pусский',
    'de': 'Deutsch',
    'zh': '中文',
};

function mapStateToProps(state) {
    return {
        language: state.settings.language,
        devMode: state.settings.devMode,
        qrCode: state.connection.QRCodeAddress,
        displayConfig: state.screen.displayConfig,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setLanguage: l => {dispatch(settingsActions.set_language(l));},
    };
}

class Settings extends React.Component<any> {
    _unsubscribe: () => any = () => null;

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
        const { language, devMode, qrCode, displayConfig } = this.props;

        var language_items = I18n._supported_languages.map((abbreviation, i) =>
            <Picker.Item key={'language-option-' + i}
                label={LanguageName[abbreviation]}
                value={abbreviation}
            />
        );

        var device_discovery = null;
        if (devMode) {
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
                <View style={styles.picker_view}>
                    <Picker selectedValue={language}
                        onValueChange={this.changeLanguage.bind(this)}
                        style={styles.picker}>
                        {language_items}
                    </Picker>
                </View>
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

        var qr_code_view = null;
        if (displayConfig.displayQRCode && qrCode && qrCode !== "") {
            qr_code_view = (
                <View style={styles.qrcode_container}>
                    <View style={styles.qrcode_view}>
                        <Text style={styles.qrcode_text}>{I18n.t("Scan from Verboze Mobile app")}</Text>
                        <View style={styles.qrcode_background}>
                            <View style={{flex: 1}} />
                            <View style={{flex: 10}}>
                                <QRCode
                                    value={qrCode}
                                    size={200}
                                    bgColor='black'
                                    fgColor='white' />
                            </View>
                            <View style={{flex: 1}} />
                        </View>
                    </View>
                </View>
            );
        }

        return (
            <Panel layout={{}}
                name={"Settings"}
                viewType={'static'}>
                {qr_code_view}

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
        color: '#FFFFFF',
        ...TypeFaces.regular,
        height: 50,
        marginTop: 10
    },
    picker: {
        color: '#FFFFFF',
    },
    picker_view: {
        flex: 1,
        height: 50,
        width: 150,
        borderWidth: 1,
        borderColor: 'grey',
        justifyContent: 'flex-start'
    },
    qrcode_container: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    qrcode_view: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 200,
        height: 290,
        alignItems: 'center',
    },
    qrcode_background: {
        width: 235,
        height: 270,
        backgroundColor: 'white',
        alignItems:'center',
        justifyContent: 'space-between'
    },
    qrcode_text: {
        height: 90,
        width: 200,
        fontSize: 22,
        textAlign: 'center',
        color: '#FFFFFF',
        ...TypeFaces.regular,
    }
});

module.exports = connect(mapStateToProps, mapDispatchToProps) (Settings);
