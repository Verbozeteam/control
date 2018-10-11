/* @flow */

import * as React from 'react';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../js-api-utils/ConfigManager';

import MagicButton from '../react-components/MagicButton';

import { TypeFaces } from '../constants/styles';

const I18n = require('../js-api-utils/i18n/i18n');

type PropsType = {
    id: string,
    layout: Object,
    displayConfig: Object,
};

type StateType = {
    currentDial: string,
};

function mapStateToProps(state) {
    return {
        displayConfig: state.screen.displayConfig,
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

class TelephonePanelContents extends React.Component<PropsType, StateType> {
    _unsubscribe: () => any = () => null;

    state = {
        currentDial: "",
    };

    componentWillMount() {
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(newProps: PropsType) {
        this._unsubscribe();
        this._unsubscribe = ConfigManager.registerThingStateChangeCallback(newProps.id, this.onTelephoneChanged.bind(this));
        if (newProps.id in ConfigManager.things)
            this.onTelephoneChanged(ConfigManager.thingMetas[newProps.id], ConfigManager.things[newProps.id]);
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    onTelephoneChanged(meta: ThingMetadataType, tpState: ThingStateType) {
    }

    render() {
        const { currentDial } = this.state;
        const { displayConfig } = this.props;

        var numbers = [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['*', '0', '#'],
        ];

        var rows = numbers.map(rowNumbers =>
            <View key={'np-row-'+rowNumbers[0]} style={styles.numpadRow}>
                {rowNumbers.map(number =>
                    <View key={'np-column-'+number} style={styles.numpadColumn}>
                        <View key={'np-button-container-'+number} style={styles.numpadButton}>
                            <MagicButton
                                key={'np-button-'+number}
                                width={80}
                                height={80}
                                text={number}
                                textStyle={{...TypeFaces.light}}
                                onPressIn={(() => {this.setState({currentDial: this.state.currentDial + number})}).bind(this)}
                                isOn={false}
                                sideTextStyle={{...TypeFaces.light}}
                                glowColor={displayConfig.accentColor}
                                textColor={displayConfig.textColor}
                                />
                        </View>
                    </View>
                )}
            </View>
        );

        var numpad =
            <View style={styles.numpadContainer}>
                <View style={styles.numpadRow}>
                    <View style={styles.numpadColumn}>
                        <View style={{borderBottomColor: displayConfig.accentColor, borderBottomWidth: 2}}>
                            <Text style={{color: 'white', fontSize: Math.max(40, Math.floor(50 - (0.8*currentDial.length)))}}>{currentDial}</Text>
                        </View>
                    </View>
                </View>
                {rows}
            </View>;

        return (
            <View style={styles.container}>
                <View style={styles.phoneCol}>
                    {numpad}
                </View>
                <View style={styles.instantCol}>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    instantCol: {
        flex: 2,
        flexDirection: 'column',
    },
    phoneCol: {
        flex: 3,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    numpadContainer: {
        width: 300,
        height: 500,
        flexDirection: 'column',
    },
    numpadRow: {
        flex: 1,
        flexDirection: 'row',
    },
    numpadColumn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    numpadButton: {
        width: 80,
        height: 80,
    },
});

module.exports = connect(mapStateToProps, mapDispatchToProps) (TelephonePanelContents);
