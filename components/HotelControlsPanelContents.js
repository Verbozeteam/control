/* @flow */

import * as React from 'react';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../js-api-utils/ConfigManager';

import MagicButton from '../react-components/MagicButton';

import { TypeFaces } from '../constants/styles';

const I18n = require('../js-api-utils/i18n/i18n');

type PropsType = {
    id: string,
    layout: Object,
};

type StateType = {
    service_state: number,
    dnd_state: number,
};

function mapStateToProps(state) {
    return {
        displayConfig: state.screen.displayConfig,
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

class HotelControlsPanelContents extends React.Component<PropsType, StateType> {
    _unsubscribe: () => any = () => null;

    state = {
        service_state: 0,
        dnd_state: 0,
    };

    _room_service_on_img = require('../assets/images/basic_ui/room_service_on.png');
    _room_service_off_img = require('../assets/images/basic_ui/room_service_off.png');
    _do_not_disturb_on_img = require('../assets/images/basic_ui/do_not_disturb_on.png');
    _do_not_disturb_off_img = require('../assets/images/basic_ui/do_not_disturb_off.png');

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
        const { displayConfig } = this.props;

        switch (displayConfig.UIStyle) {
            case 'modern':
                return (
                    <View style={styles.container}>
                        <View style={styles.emptyColumn} />
                        <View style={styles.column}>
                            <View style={styles.buttonContainer} />

                            <View style={styles.buttonContainer}>
                                <MagicButton
                                    width={70}
                                    height={70}
                                    onPressIn={this.toggleRoomService.bind(this)}
                                    isOn={service_state == 1 ? true : false}
                                    sideText={I18n.t("Housekeeping")}
                                    sideTextStyle={{...TypeFaces.light}}
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
                                    sideText={I18n.t("Do Not Disturb")}
                                    sideTextStyle={{...TypeFaces.light}}
                                    glowColor={'#BA3737'}
                                    textColor={'#FFFFFF'}
                                    />
                            </View>

                            <View style={styles.buttonContainer} />
                        </View>
                    </View>
                );
            case 'simple':
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
                        <View style={simpleStyles.card_container}
                            key={'card-'+i}>
                            <TouchableWithoutFeedback
                            onPress={card_defs[i].toggler}>
                                <View style={simpleStyles.card}>
                                    <Image style={[simpleStyles.card, {opacity: card_defs[i].state}]}
                                        fadeDuration={0}
                                        resizeMode='contain'
                                        source={card_defs[i].on_image}>
                                    </Image>
                                    <Image style={[simpleStyles.card, {opacity: 1-card_defs[i].state}]}
                                        fadeDuration={0}
                                        resizeMode='contain'
                                        source={card_defs[i].off_image}>
                                    </Image>
                                </View>
                            </TouchableWithoutFeedback>
                            <View pointerEvents={'none'}
                            style={simpleStyles.text_container}>
                                <Text style={[simpleStyles.text, card_defs[i].state ? {color: 'white'} : {color: '#666666'}]}>{card_defs[i].text}</Text>
                            </View>
                        </View>
                    );
                }

                return (
                    <View style={simpleStyles.container}>
                        {cards}
                    </View>
                );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    column: {
        flex: 4,
        flexDirection: 'column',
    },
    emptyColumn: {
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'column',
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        marginLeft: 200
    },
});

const simpleStyles = StyleSheet.create({
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
        color: '#FFFFFF',
        textAlign: 'center',
        ...TypeFaces.regular,
    },
    card: {
        position: 'absolute',
        height: '100%',
        width: '100%',
    },
});

module.exports = connect(mapStateToProps, mapDispatchToProps) (HotelControlsPanelContents);
