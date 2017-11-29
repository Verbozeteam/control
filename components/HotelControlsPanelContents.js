/* @flow */

import * as React from 'react';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet }
    from 'react-native';
import PropTypes from 'prop-types';
const connectionActions = require('../redux-objects/actions/connection');
const SocketCommunication = require('../lib/SocketCommunication');

import type { ViewType } from '../config/flowtypes';

const I18n = require('../i18n/i18n');

type PropsType = {
    id: string,
    viewType: ViewType,
};

type StateType = {
    service_state: number,
    dnd_state: number,
};

class HotelControlsPanelContents extends React.Component<PropsType, StateType> {
    _unsubscribe: () => null = () => {return null;};

    state = {
        service_state: 0,
        dnd_state: 0,
    };

    _room_service_on_img = require('../assets/images/room_service_on.png');
    _room_service_off_img = require('../assets/images/room_service_off.png');
    _do_not_disturb_on_img = require('../assets/images/do_not_disturb_on.png');
    _do_not_disturb_off_img = require('../assets/images/do_not_disturb_off.png');

    componentWillMount() {
        const { store } = this.context;
        this._unsubscribe = store.subscribe(this.onReduxStateChanged.bind(this));
        this.onReduxStateChanged();
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    onReduxStateChanged() {
        const { store } = this.context;
        const reduxState = store.getState();
        const { service_state, dnd_state } = this.state;
        const { id } = this.props;

        if (reduxState && reduxState.connection && reduxState.connection.thingStates) {
            const my_redux_state = reduxState.connection.thingStates[id];
            if (my_redux_state && my_redux_state.room_service != undefined && my_redux_state.do_not_disturb != undefined) {
                if (my_redux_state.room_service != service_state || my_redux_state.do_not_disturb != dnd_state) {
                    this.setState({
                        service_state: my_redux_state.room_service,
                        dnd_state: my_redux_state.do_not_disturb
                    });
                }
            }
        }
    }

    toggleRoomService() {
        const { id } = this.props;
        var { service_state, dnd_state } = this.state;
        service_state = 1 - service_state;
        dnd_state = 0;

        SocketCommunication.sendMessage({
            thing: this.props.id,
            room_service: service_state,
            do_not_disturb: dnd_state,
        });
        this.context.store.dispatch(connectionActions.set_thing_partial_state(this.props.id, {room_service: service_state, do_not_disturb: dnd_state}));
    }

    toggleDoNotDisturb() {
        const { id } = this.props;
        var { service_state, dnd_state } = this.state;
        dnd_state = 1 - dnd_state;
        service_state = 0;

        SocketCommunication.sendMessage({
            thing: this.props.id,
            room_service: service_state,
            do_not_disturb: dnd_state,
        });
        this.context.store.dispatch(connectionActions.set_thing_partial_state(this.props.id, {room_service: service_state, do_not_disturb: dnd_state}));
    }

    render() {
        const { service_state, dnd_state } = this.state;
        const { viewType } = this.props;

        const card_defs = [{
            on_image: this._room_service_on_img,
            off_image: this._room_service_off_img,
            text: I18n.t("Room Service"),
            toggler: this.toggleRoomService.bind(this),
            state: service_state,
        }, {
            on_image: this._do_not_disturb_on_img,
            off_image: this._do_not_disturb_off_img,
            text: I18n.t("Do Not Disturb"),
            toggler: this.toggleDoNotDisturb.bind(this),
            state: dnd_state,
        }]

        var cards = [];

        for (var i = 0; i < 2; i++) {
            cards[i] = (
                <View style={styles.card_container}
                    key={'card-'+i}>
                    <TouchableWithoutFeedback
                    onPress={card_defs[i].toggler}>
                        <Image style={styles.card}
                            resizeMode='contain'
                            source={(card_defs[i].state) ? card_defs[i].on_image : card_defs[i].off_image}>
                        </Image>
                    </TouchableWithoutFeedback>
                    <View pointerEvents={'none'}
                      style={[styles.text_container, viewType !== 'detail' ? styles.text_container_sm : {}]}>
                        <Text style={styles.text}>{viewType === 'detail' ? card_defs[i].text : ""}</Text>
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
HotelControlsPanelContents.contextTypes = {
    store: PropTypes.object
};

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
        height: '100%',
        width: '100%',
    },

});

module.exports = HotelControlsPanelContents;
