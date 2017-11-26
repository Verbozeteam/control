/* @flow */

import * as React from 'react';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet }
    from 'react-native';
import PropTypes from 'prop-types';
const connectionActions = require('../redux-objects/actions/connection');
const SocketCommunication = require('../lib/SocketCommunication');

import type { ViewType } from '../config/flowtypes';

type PropsType = {
    id: string,
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

        const room_service_card = <TouchableWithoutFeedback
            onPress={this.toggleRoomService.bind(this)}>
                <Image style={styles.card}
                    resizeMode='contain'
                    source={(service_state) ?
                        this._room_service_on_img : this._room_service_off_img}>
                </Image>
            </TouchableWithoutFeedback>

        const do_not_disturb_card = <TouchableWithoutFeedback
            onPress={this.toggleDoNotDisturb.bind(this)}>
                <Image style={styles.card}
                    resizeMode='contain'
                    source={(dnd_state) ?
                        this._do_not_disturb_on_img : this._do_not_disturb_off_img}>
                </Image>
            </TouchableWithoutFeedback>;

        return (
            <View style={styles.container}>
                {room_service_card}
                {do_not_disturb_card}
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
    card: {
        flex: 1,
        height: undefined,
        width: undefined,
    }
});

module.exports = HotelControlsPanelContents;
