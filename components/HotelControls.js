/* @flow */

import * as React from 'react';
import { View, Text, Image,TouchableWithoutFeedback, StyleSheet }
    from 'react-native';

import type { GenericThingType, ViewType } from '../config/flowtypes';

type PropsType = {
    ...GenericThingType,
    viewType?: ViewType,
    hotelControlsState?: {
        do_not_disturb: number,
        room_service: number,
        card: number,
        power: number
    },
    updateThing: (id: string, update: Object) => null,
};

class HotelControls extends React.Component<PropsType> {

    static defaultProps = {
        viewType: 'present',
        hotelControlsState: {
            do_not_disturb: 0,
            room_service: 0,
            card: 0,
            power: 0
        }
    };

    _room_service_on_img = require('../assets/images/room_service_on.png');
    _room_service_off_img = require('../assets/images/room_service_off.png');
    _do_not_disturb_on_img = require('../assets/images/do_not_disturb_on.png');
    _do_not_disturb_off_img = require('../assets/images/do_not_disturb_off.png');

    toggleRoomService() {
        const { updateThing, id } = this.props;
        const { room_service } = this.props.hotelControlsState;

        updateThing(id, {room_service: ~~!room_service});
    }

    toggleDoNotDisturb() {
        const { updateThing, id } = this.props;
        const { do_not_disturb } = this.props.hotelControlsState;

        updateThing(id, {do_not_disturb: ~~!do_not_disturb});
    }

    render() {
        const { viewType } = this.props;
        const { do_not_disturb, room_service, card, power }
            = this.props.hotelControlsState;

        //console.log('HOTEL CONTROl => ', this.props);

        const room_service_card = <TouchableWithoutFeedback
            onPress={() => this.toggleRoomService()}>
                <Image style={styles.card}
                    resizeMode='contain'
                    source={(room_service) ?
                        this._room_service_on_img : this._room_service_off_img}>
                </Image>
            </TouchableWithoutFeedback>



        const do_not_disturb_card = <TouchableWithoutFeedback
            onPress={() => this.toggleDoNotDisturb()}>
                <Image style={styles.card}
                    resizeMode='contain'
                    source={(do_not_disturb) ?
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

module.exports = HotelControls;
