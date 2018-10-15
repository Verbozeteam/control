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
    room_service?: number,
    do_not_disturb?: number,
};

type PropsType = {
    id: ?string,
    name: string,
    propertyName: "room_service" | "do_not_disturb",
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

class RoomStatusClass extends React.Component<PropsType, StateType> {
    _unsubscribe: () => any = () => null;

    state = {
    };

    componentWillMount() {
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(newProps: PropsType) {
        this._unsubscribe();
        if (newProps.id) {
            this._unsubscribe = ConfigManager.registerThingStateChangeCallback(newProps.id, this.onRoomStatusChanged.bind(this));
            if (newProps.id && newProps.id in ConfigManager.things)
                this.onRoomStatusChanged(ConfigManager.thingMetas[newProps.id], ConfigManager.things[newProps.id]);
        }
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    onRoomStatusChanged(meta: ThingMetadataType, roomStatusState: ThingStateType) {
        const { room_service, do_not_disturb } = this.state;
        const { propertyName } = this.props;

        var total_change = {};
        if (propertyName === 'room_service' && room_service !== roomStatusState.room_service)
            total_change.room_service = roomStatusState.room_service;
        if (propertyName === 'do_not_disturb' && do_not_disturb !== roomStatusState.do_not_disturb)
            total_change.do_not_disturb = roomStatusState.do_not_disturb;

        if (Object.keys(total_change).length > 0)
            this.setState(total_change);
    }

    changeStatus(status: number) {
        const { propertyName } = this.props;
        const { room_service, do_not_disturb } = this.state;

        if (this.props.id) {
            ConfigManager.setThingState(this.props.id, {
                room_service: propertyName === 'room_service' ? status : 0,
                do_not_disturb: propertyName === 'do_not_disturb' ? status : 0,
            }, true);
        }
    }

    render() {
        const { id, name, propertyName, displayConfig } = this.props;
        const { room_service, do_not_disturb } = this.state;

        var isActive: number = (propertyName === 'room_service' && room_service !== undefined) ? room_service : ((propertyName === 'do_not_disturb' && do_not_disturb !== undefined) ? do_not_disturb : 0);
        var color: string = propertyName === 'room_service' ? '#37BA37' : displayConfig.accentColor;

        return (
            <Panel active={isActive} blocks={2} onPress={() => this.changeStatus(1 - isActive)}>
                <View style={styles.icon}>
                    <View style={[styles.circle, {borderColor: color, backgroundColor: isActive ? color : '#00000000'}]} />
                </View>
                <View style={I18n.l2r() ? styles.texts : styles.texts_r2l}>
                    <Text style={[styles.name, isActive ? TypeFaces.bold : {}]}>{I18n.t(propertyName === 'room_service' ? 'Housekeeping' : 'Do Not Disturb')}</Text>
                    <Text style={[styles.info, isActive ? {color: displayConfig.accentColor} : {}]}>{isActive ? I18n.t(propertyName === 'room_service' ? "Housekeeping on the way" : "No one will disturb you") : " "}</Text>
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
    texts_r2l: {
        position: 'absolute',
        right: 10,
        bottom: 10,
    },
    name: {
        color: '#000000',
        fontSize: 17,
        height: 54,
        ...TypeFaces.light,
    },
    info: {
        color: '#000000',
        fontSize: 17,
        ...TypeFaces.light,
    },
});

const RoomStatus = connect(mapStateToProps, mapDispatchToProps) (RoomStatusClass);
export default RoomStatus;
