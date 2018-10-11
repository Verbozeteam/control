/* @flow */

import * as React from 'react';

import PropTypes from 'prop-types';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import { ConfigManager } from '../../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../../js-api-utils/ConfigManager';

import Panel from './Panel';

import { TypeFaces } from '../../constants/styles';

const I18n = require('../../js-api-utils/i18n/i18n');

type StateType = {
    set_pt: number,
    temp: number,
    fan: number,
    fan_speeds: [string, string],
    temp_range: [number, number],
};

type PropsType = {
    id: ?string,
    name: string,
    warmer: boolean,
    displayConfig: Object,
};

function mapStateToProps(state) {
    return {
        displayConfig: state.screen.displayConfig,
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

class ClimateControlClass extends React.Component<PropsType, StateType> {
    _unsubscribe: () => any = () => null;

    state = {
        set_pt: 0,
        temp: 0,
        fan: 0,
        fan_speeds: ['Lo', 'Hi'],
        temp_range: [16, 30],
    };

    componentWillMount() {
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(newProps: PropsType) {
        this._unsubscribe();
        if (newProps.id) {
            this._unsubscribe = ConfigManager.registerThingStateChangeCallback(newProps.id, this.onACChanged.bind(this));
            if (newProps.id && newProps.id in ConfigManager.things)
                this.onACChanged(ConfigManager.thingMetas[newProps.id], ConfigManager.things[newProps.id]);
        }
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    onACChanged(meta: ThingMetadataType, acState: ThingStateType) {
        const { set_pt, temp, fan, fan_speeds, temp_range } = this.state;

        if (JSON.stringify(fan_speeds) !== JSON.stringify(meta.fan_speeds || []) ||
            JSON.stringify(temp_range) !== JSON.stringify(meta.temp_range || []) ||
            set_pt !== acState.set_pt || temp !== acState.temp || fan !== acState.fan) {
            this.setState({
                set_pt: acState.set_pt,
                temp: acState.temp,
                fan: acState.fan,
                fan_speeds: meta.fan_speeds || ['Low', 'High'],
                temp_range: meta.temp_range || [16, 30],
            });
        }
    }

    round(value: number) {
        return (Math.round(value * 2) / 2);
    }

    changeTemperature(new_set_pt: number) {
        const { id } = this.props;
        if (!id)
            return;

        new_set_pt = this.round(new_set_pt);
        ConfigManager.setThingState(id, {set_pt: new_set_pt}, true);
    }

    changeFan(speed: number) {
        const { id } = this.props;
        if (!id)
            return;

        ConfigManager.setThingState(id, {fan: speed}, true);
    }

    changeWarmth(new_set_pt: number) { // same as changeTemperature but also sets fan to auto (always)
        const { id, warmer } = this.props;
        const { set_pt, temp, fan, fan_speeds, temp_range } = this.state;
        if (!id)
            return;

        new_set_pt = this.round(new_set_pt);
        var new_fan_speed =
            fan_speeds[fan_speeds.length-1].toLowerCase() === 'auto'
                ? fan_speeds.length
                : Math.min(fan_speeds.length, fan_speeds.length - Math.round(fan_speeds.length * ((set_pt-temp_range[0]) / (temp_range[1]-temp_range[0]+1))) + 1);
        if (fan === 0 && warmer === true) // if its already off, and we want to make it warmer, don't turn on the AC
            new_fan_speed = 0;
        ConfigManager.setThingState(id, {
            set_pt: new_set_pt,
            fan: new_fan_speed,
        }, true);
    }

    render() {
        const { id, name, warmer, displayConfig } = this.props;
        const { set_pt, temp, fan, fan_speeds, temp_range } = this.state;

        var isActive: number = fan > 0 ? 1 : 0;
        var color = warmer ? displayConfig.accentColor : '#3737AA';

        return (
            <Panel active={isActive} onPress={(!isActive && warmer) ? (() => null) : () => this.changeWarmth(Math.min(Math.max(set_pt + (warmer ? 0.5 : -0.5), temp_range[0]), temp_range[1]))}>
                <View style={styles.texts}>
                    <View style={styles.icon}>
                        <View style={[styles.circle, {borderColor: color}]} />
                    </View>
                    <Text style={styles.name}>{I18n.t(warmer ? 'Make It Warmer' : 'Make It Cooler')}</Text>
                    <Text style={[styles.info, isActive ? {color: displayConfig.accentColor} : {}]}>{" "}</Text>
                </View>
            </Panel>
        );
    }
};

const styles = StyleSheet.create({
    icon: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    circle: {
        width: 30,
        height: 30,
        borderRadius: 10000,
        borderWidth: 2,
    },
    texts: {
        position: 'absolute',
        left: 10,
        bottom: 10,
    },
    name: {
        color: '#000000',
        fontSize: 18,
        height: 46,
        ...TypeFaces.light,
    },
    info: {
        color: '#000000',
        fontSize: 18,
        ...TypeFaces.light,
    },
});

const ClimateControl = connect(mapStateToProps, mapDispatchToProps) (ClimateControlClass);
export default ClimateControl;
