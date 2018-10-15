/* @flow */

import * as React from 'react';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../js-api-utils/ConfigManager';

import MagicButton from '../react-components/MagicButton';
import Panel from './ControlButtons/Panel';

import { TypeFaces } from '../constants/styles';

const I18n = require('../js-api-utils/i18n/i18n');

type PropsType = {
    id: string,
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

class TelephonePanelClass extends React.Component<PropsType, StateType> {
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
                                onPressIn={() => this.setState({currentDial: this.state.currentDial + (this.state.currentDial.length >= 22 ? '' : number)})}
                                isOn={false}
                                sideTextStyle={{...TypeFaces.light}}
                                glowColor={displayConfig.accentColor}
                                textColor={'#000000'}
                                offColor={'#FFFFFF'}
                                extraStyle={{backgroundColor: '#FFFFFF', borderRadius: 20000}}
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
                <View style={sideButtonStyles.container}>
                    <Panel active style={sideButtonStyles.panel} onPress={() => this.setState({currentDial: ''})}>
                        <Text style={sideButtonStyles.text}>{I18n.t('Clear')}</Text>
                    </Panel>
                    <Panel active style={[sideButtonStyles.panel, {backgroundColor: '#37BA37'}]} onPress={() => null}>
                        <Text style={sideButtonStyles.text}>{I18n.t('Call')}</Text>
                    </Panel>
                </View>
                <View style={quickAccessStyles.container}>
                    <Text style={quickAccessStyles.heading}>{I18n.t('Quick Access')}</Text>
                    <Panel active style={[quickAccessStyles.panel, {backgroundColor: displayConfig.accentColor}]} onPress={() => null}>
                        <Text style={quickAccessStyles.text}>{I18n.t('Call front desk')}</Text>
                    </Panel>
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

const sideButtonStyles = StyleSheet.create({
    container: {
        flex: 2,
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 110,
        borderRightWidth: 1,
        borderColor: '#FFFFFF',
    },
    panel: {
        width: 160,
        height: 80,
        marginTop: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 20,
        ...TypeFaces.light,
    }
});

const quickAccessStyles = StyleSheet.create({
    container: {
        flex: 3,
        flexDirection: 'column',
        alignItems: 'center',
    },
    panel: {
        width: 260,
        height: 80,
        marginTop: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heading: {
        margin: 30,
        marginBottom: 35,
        fontSize: 30,
        color: '#FFFFFF',
        ...TypeFaces.light,
    },
    text: {
        fontSize: 20,
        ...TypeFaces.light,
    }
});

const TelephonePanel = connect(mapStateToProps, mapDispatchToProps) (TelephonePanelClass);
export default TelephonePanel;
