/* @flow */

import * as React from 'react';
import QRCode from 'react-native-qrcode';
import { View, Button, Text, StyleSheet, Picker, TouchableWithoutFeedback }
  from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TypeFaces } from '../../constants/styles';

const connectionActions = require ('../../redux-objects/actions/connection');
const settingsActions = require ('../../redux-objects/actions/settings');

const I18n = require('../../js-api-utils/i18n/i18n');
const UserPreferences = require('../../js-api-utils/UserPreferences');
import { SocketCommunication } from '../../js-api-utils/SocketCommunication';

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
        displayConfig: state.screen.displayConfig,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setLanguage: l => {dispatch(settingsActions.set_language(l));},
    };
}

type PropsType = {
  language: string,
  devMode: boolean,
  displayConfig: Object,
  setLanguage: string => null,
  width: number,
  height: number
};

type StateType = {
};

class SettingsPanelClass extends React.Component<PropsType, StateType> {
    _unsubscribe: () => any = () => null;

    state: StateType = {
    };


    _last_qr_click = new Date();
    _num_qr_clicks = 0;

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

    // crashApp() {
    //   console.log('Crash me pressed');
    //   const will_crash = crash;
    // }

    qrcodePressed() {
        var now = new Date();
        this._num_qr_clicks += 1;
        if (now - this._last_qr_click < 800) {
            if (this._num_qr_clicks >= 6) {
                SocketCommunication.sendMessage({code: 3});
                this._num_qr_clicks = 0;
            }
        } else
            this._num_qr_clicks = 1;
        this._last_qr_click = now;
    }

    render() {
        const { language, devMode, displayConfig } = this.props;

        var language_items = Object.keys(I18n._supported_languages).map((abbreviation, i) =>
            <Picker.Item key={'language-option-' + i}
                label={LanguageName[abbreviation]}
                value={abbreviation}
            />
        );

        var device_discovery = null;
        var force_connect = null;
        // var crash_button = null;

        if (devMode) {
            device_discovery = <DeviceDiscoveryView />
            force_connect = <Button title={'Force Connect'}
              onPress={() => SocketCommunication.startConnecting()} />;
            // crash_button = <Button title={'Crash me'} onPress={this.crashApp.bind(this)}
            //   color={'red'} />;
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
                        onValueChange={(itemValue, itemIndex) => this.changeLanguage(itemValue, itemIndex)}
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
        if (displayConfig.QRCodeAddress !== "") {
            qr_code_view = (
                <View>
                    <Text style={styles.qrcode_text}>{I18n.t("Scan from Verboze Mobile app")}</Text>
                    <View style={styles.qrcode_background}>
                        <TouchableWithoutFeedback
                            onPress={this.qrcodePressed.bind(this)}>
                            <View style={styles.qrcode_component}>
                                <QRCode
                                    value={displayConfig.QRCodeAddress}
                                    size={200}
                                    bgColor='black'
                                    fgColor='white' />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
            );
        }

        var settings_panel = (
            <View key={"settings_panel"} style={{ flex: 5 }}>
                {settings_views}
                {/* {crash_button} */}
                {device_discovery}
                {force_connect}
            </View>
        );
        var qrcode_panel = (
            <View key={"qrcode_panel"} style={{ flex: 3, justifyContent: 'flex-end', alignItems: 'flex-end'}}>
                {qr_code_view}
            </View>
        );

        return (
            <View style={styles.container}>
                {I18n.l2r() ? [settings_panel, qrcode_panel] : [qrcode_panel, settings_panel]}
            </View>
        );
    }
}

SettingsPanelClass.contextTypes = {
    store: PropTypes.object
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        padding: 20,
    },
    setting_container: {
        flex: 1,
        flexDirection: 'row',
    },
    setting_header: {
        flex: 1,
        fontSize: 20,
        color: '#FFFFFF',
        ...TypeFaces.light,
        height: 50,
        marginTop: 10,
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
    qrcode_background: {
        width: 235,
        height: 235,
        backgroundColor: 'white',
        alignItems:'center',
        justifyContent: 'space-between'
    },
    qrcode_component: {
        flex: 1,
        justifyContent: 'center',
    },
    qrcode_text: {
        width: 235,
        fontSize: 22,
        textAlign: 'center',
        color: '#FFFFFF',
        ...TypeFaces.regular,
    }
});

const SettingsPanel = connect(mapStateToProps, mapDispatchToProps) (SettingsPanelClass);

export default SettingsPanel;
