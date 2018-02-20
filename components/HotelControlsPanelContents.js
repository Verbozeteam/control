/* @flow */

import * as React from 'react';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../js-api-utils/ConfigManager';

import { MagicButton } from '../react-components/MagicButton';

const I18n = require('../js-api-utils/i18n/i18n');

type PropsType = {
    id: string,
    layout: Object,
};

type StateType = {
    service_state: number,
    dnd_state: number,
};

class HotelControlsPanelContents extends React.Component<PropsType, StateType> {
    _unsubscribe: () => any = () => null;

    state = {
        service_state: 0,
        dnd_state: 0,
    };

    componentWillMount() {
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(newProps: PropsType) {
        this._unsubscribe();
        this._unsubscribe = ConfigManager.registerThingStateChangeCallback(newProps.id, this.onHotelControlsChanged.bind(this));
        if (newProps.id in ConfigManager.things)
            this.onHotelControlsChanged(ConfigManager.thingMetas[newProps.id], ConfigManager.things[newProps.id]);
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    onHotelControlsChanged(meta: ThingMetadataType, hcState: ThingStateType) {
        const { service_state, dnd_state } = this.state;
        if (service_state !== hcState.room_service || dnd_state !== hcState.do_not_disturb)
            this.setState({
                service_state: hcState.room_service,
                dnd_state: hcState.do_not_disturb
            });
    }

    toggleRoomService() {
        const { id } = this.props;
        var { service_state, dnd_state } = this.state;
        service_state = 1 - service_state;
        dnd_state = 0;

        ConfigManager.setThingState(this.props.id, {room_service: service_state, do_not_disturb: dnd_state}, true);
    }

    toggleDoNotDisturb() {
        const { id } = this.props;
        var { service_state, dnd_state } = this.state;
        dnd_state = 1 - dnd_state;
        service_state = 0;

        ConfigManager.setThingState(this.props.id, {room_service: service_state, do_not_disturb: dnd_state}, true);
    }

    render() {
        const { service_state, dnd_state } = this.state;

        return (
            <View style={styles.container}>
                <View style={styles.column} />
                <View style={styles.column}>
                    <View style={styles.buttonContainer} />

                    <View style={styles.buttonContainer}>
                        <MagicButton
                            width={70}
                            height={70}
                            onPressIn={this.toggleRoomService.bind(this)}
                            isOn={service_state == 1 ? true : false}
                            sideText={I18n.t("HOUSEKEEPING")}
                            glowColor={'#37BA37'}
                            textColor={'#FFFFFF'}
                            />
                    </View>

                    <View style={styles.buttonContainer}>
                        <MagicButton
                            width={70}
                            height={70}
                            onPressIn={this.toggleDoNotDisturb.bind(this)}
                            isOn={dnd_state == 1 ? true : false}
                            sideText={I18n.t("DO NOT DISTURB")}
                            glowColor={'#BA3737'}
                            textColor={'#FFFFFF'}
                            />
                    </View>

                    <View style={styles.buttonContainer} />
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
    column: {
        flex: 1,
        flexDirection: 'column',
    },
    buttonContainer: {
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

module.exports = HotelControlsPanelContents;
