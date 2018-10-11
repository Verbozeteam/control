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
    old_fan: number,
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

class ClimateStatusClass extends React.Component<PropsType, StateType> {
    _unsubscribe: () => any = () => null;

    state = {
        set_pt: 0,
        temp: 0,
        fan: 0,
        fan_speeds: ['Lo', 'Hi'],
        temp_range: [16, 30],
        old_fan: 0,
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
                fan_speeds: meta.fan_speeds || ['Lo', 'Hi'],
                temp_range: meta.temp_range || [16, 30],
            });
        }
    }

    changeFan(speed: number) {
        const { id } = this.props;
        if (!id)
            return;

        this.setState({old_fan: this.state.fan});
        ConfigManager.setThingState(id, {fan: speed}, true);
    }

    render() {
        const { id, name, displayConfig } = this.props;
        const { set_pt, temp, fan, fan_speeds, temp_range, old_fan } = this.state;

        var isActive: number = fan > 0 ? 1 : 0;
        var cooling = set_pt + 1 < temp;
        var warming = set_pt - 1 > temp;
        var color = cooling ? '#3737AA' : displayConfig.accentColor;
        var rounded_set_pt = set_pt.toFixed(1);

        return (
            <Panel active={isActive} blocks={2} onPress={() => this.changeFan(isActive ? 0 : old_fan)}>
                <View style={styles.texts}>
                    <View style={styles.icon}>
                        <Text style={[styles.name, {fontWeight: 'bold'}]}>{I18n.t(isActive ? 'AC Is On' : 'AC Is Off')}</Text>
                    </View>
                    <Text style={styles.name}>{I18n.t('Temperature: ' + temp)}</Text>
                    <Text style={[styles.info, {color}]}>{I18n.t(isActive ? (cooling ? 'Cooling down to ' + rounded_set_pt : (warming ? 'Warming up to ' + rounded_set_pt : ' ')) : ' ')}</Text>
                </View>
            </Panel>
        );
    }
};

const styles = StyleSheet.create({
    icon: {
        width: '100%',
        height: 40,
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

const ClimateStatus = connect(mapStateToProps, mapDispatchToProps) (ClimateStatusClass);
export default ClimateStatus;
