/* @flow */

import * as React from 'react';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import { ConfigManager } from './ConfigManager';
import type { ThingStateType, ThingMetadataType } from './ConfigManager';

const I18n = require('../i18n/i18n');

type PropsType = {
    id: string,
    layout: Object,
};

type StateType = {
    service_state: number,
    dnd_state: number,
};

class HotelControlsPanelContents extends React.Component<PropsType, StateType> {
    _unsubscribe: () => null = () => null;

    state = {
        service_state: 0,
        dnd_state: 0,
    };

    _room_service_on_img = require('../assets/images/room_service_on.png');
    _room_service_off_img = require('../assets/images/room_service_off.png');
    _do_not_disturb_on_img = require('../assets/images/do_not_disturb_on.png');
    _do_not_disturb_off_img = require('../assets/images/do_not_disturb_off.png');

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

        const card_defs = [{
            on_image: this._do_not_disturb_on_img,
            off_image: this._do_not_disturb_off_img,
            text: I18n.t("Do Not Disturb"),
            toggler: this.toggleDoNotDisturb.bind(this),
            state: dnd_state,
        }, {
            on_image: this._room_service_on_img,
            off_image: this._room_service_off_img,
            text: I18n.t("Room Service"),
            toggler: this.toggleRoomService.bind(this),
            state: service_state,
        }]

        var cards = [];

        for (var i = 0; i < 2; i++) {
            cards[i] = (
                <View style={styles.card_container}
                    key={'card-'+i}>
                    <TouchableWithoutFeedback
                    onPress={card_defs[i].toggler}>
                        <View style={styles.card}>
                            <Image style={[styles.card, {opacity: card_defs[i].state}]}
                                fadeDuration={0}
                                resizeMode='contain'
                                source={card_defs[i].on_image}>
                            </Image>
                            <Image style={[styles.card, {opacity: 1-card_defs[i].state}]}
                                fadeDuration={0}
                                resizeMode='contain'
                                source={card_defs[i].off_image}>
                            </Image>
                        </View>
                    </TouchableWithoutFeedback>
                    <View pointerEvents={'none'}
                      style={styles.text_container}>
                        <Text style={[styles.text, card_defs[i].state ? {'color': 'white'} : {'color': '#666666'}]}>{card_defs[i].text}</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.container}>
                {cards}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        overflow: 'visible'
    },
    card_container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text_container: {
        width: 140,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        bottom: 160
    },
    text_container_sm: {
    },
    text: {
        fontSize: 34,
        fontFamily: 'HKNova-MediumR',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    card: {
        position: 'absolute',
        height: '100%',
        width: '100%',
    },

});

module.exports = HotelControlsPanelContents;
