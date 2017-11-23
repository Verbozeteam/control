/* @flow */

import * as React from 'react';
import { View, Text, Image,TouchableWithoutFeedback, StyleSheet }
    from 'react-native';

import type { ViewType } from '../config/flowtypes';
import type { GenericThingType } from '../config/ConnectionTypes';

type PropsType = {
    things: Array<GenericThingType>,
    viewType: ViewType,
};

type StateType = {
    service_state: number,
    dnd_state: number,
};

class HotelControlsPanelContents extends React.Component<PropsType, StateType> {
    state = {
        service_state: 0,
        dnd_state: 0,
    };

    _room_service_on_img = require('../assets/images/room_service_on.png');
    _room_service_off_img = require('../assets/images/room_service_off.png');
    _do_not_disturb_on_img = require('../assets/images/do_not_disturb_on.png');
    _do_not_disturb_off_img = require('../assets/images/do_not_disturb_off.png');

    toggleRoomService() {
        const { updateThing, id } = this.props;
        const { room_service, do_not_disturb } = this.props.hotelControlsState;

        if (!room_service) {
            updateThing(id, {room_service: 1, do_not_disturb: 0});
        } else {
            updateThing(id, {room_service: 0});
        }
    }

    toggleDoNotDisturb() {
        const { updateThing, id } = this.props;
        const { do_not_disturb, room_service } = this.props.hotelControlsState;

        if (!do_not_disturb) {
            updateThing(id, {do_not_disturb: 1, room_service: 0});
        } else {
            updateThing(id, {do_not_disturb: 0});
        }
    }

    render() {
        const { service_state, dnd_state } = this.state;

        const room_service_card = <TouchableWithoutFeedback
            onPress={() => this.toggleRoomService()}>
                <Image style={styles.card}
                    resizeMode='contain'
                    source={(service_state) ?
                        this._room_service_on_img : this._room_service_off_img}>
                </Image>
            </TouchableWithoutFeedback>



        const do_not_disturb_card = <TouchableWithoutFeedback
            onPress={() => this.toggleDoNotDisturb()}>
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
