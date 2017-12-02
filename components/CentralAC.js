/* @flow */

import * as React from 'react';
import PropTypes from 'prop-types';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import type { LayoutType, ViewType } from '../config/flowtypes';

const GenericCircularSlider = require('../react-components/GenericCircularSlider');
const GenericToggle = require('../react-components/GenericToggle');
const GenericButton = require('../react-components/GenericButton');

const connectionActions = require('../redux-objects/actions/connection');
const SocketCommunication = require('../lib/SocketCommunication');

const I18n = require('../i18n/i18n');

type StateType = {
    set_pt: number,
    temp: number,
    fan: number,

    minusButtonPressed: boolean,
    plusButtonPressed: boolean,
};

type PropsType = {
    id: string,
    layout: LayoutType,
    viewType: ViewType,
};

class CentralAC extends React.Component<PropsType, StateType> {
    _unsubscribe: () => null = () => {return null;};

    state = {
        set_pt: 0,
        temp: 0,
        fan: 0,

        minusButtonPressed: false,
        plusButtonPressed: false,
    };

    _fan_speeds = [
        I18n.t('Off'),
        I18n.t('Low'),
        I18n.t('High')
    ];

    _selectedGradient = ['#36DBFD', '#178BFB'];
    _highlightGradient = ['#41FFFF', '#1CA7FF'];

    _fan_icon = require('../assets/images/fan.png');

    _fan_actions = [
        () => this.changeFan(0),
        () => this.changeFan(1),
        () => this.changeFan(2)
    ];

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
        const { set_pt, temp, fan } = this.state;
        const { id } = this.props;

        if (reduxState && reduxState.connection && reduxState.connection.thingStates) {
            const my_redux_state = reduxState.connection.thingStates[id];
            if (my_redux_state &&
                ((my_redux_state.set_pt != undefined && my_redux_state.set_pt != set_pt) ||
                 (my_redux_state.temp != undefined && my_redux_state.temp != temp) ||
                 (my_redux_state.fan != undefined && my_redux_state.fan != fan))) {
                this.setState({
                    set_pt: my_redux_state.set_pt,
                    temp: my_redux_state.temp,
                    fan: my_redux_state.fan,
                });
            }
        }
    }

    round(value: number) {
        return (Math.round(value * 2) / 2);
    }

    changeTemperature(send_socket: boolean) {
        return ((new_set_pt: number) => {
            if (send_socket) {
                SocketCommunication.sendMessage({
                    thing: this.props.id,
                    set_pt: new_set_pt,
                });
            }
            this.context.store.dispatch(connectionActions.set_thing_partial_state(this.props.id, {set_pt: new_set_pt}));
        }).bind(this);
    }

    changeFan(speed: number) {
        SocketCommunication.sendMessage({
            thing: this.props.id,
            fan: speed,
        });
        this.context.store.dispatch(connectionActions.set_thing_partial_state(this.props.id, {fan: speed}));
    }

    render() {
        const { id, layout, viewType } = this.props;
        const { set_pt, temp, fan, minusButtonPressed, plusButtonPressed } = this.state;

        var room_temp_text = temp.toFixed(1) + "°C";
        var set_temp_text = "";
        var set_temp_title_text = "";
        var slider = null;
        var toggles = null;
        var hiding_style = null;

        if (viewType === 'detail') {
            room_temp_text = I18n.t("Room Temperature is") + " " + temp.toFixed(1) + "°C";
            set_temp_text = fan ? set_pt.toFixed(1)+'°C' : I18n.t('Off');
            set_temp_title_text = I18n.t("Set temperature");

            slider = (
                <GenericCircularSlider value={set_pt}
                    minimum={16} maximum={30}
                    round={this.round.bind(this)}
                    onMove={this.changeTemperature(false).bind(this)}
                    onRelease={this.changeTemperature(true).bind(this)}
                    diameter={layout.height/1.5}
                    disabled={fan === 0}/>
            );

            toggles = (
                <GenericToggle values={this._fan_speeds}
                    icon={this._fan_icon}
                    layout={{
                        height: 80,
                        width: 350
                    }}
                    actions={this._fan_actions}
                    selected={fan} />
            );
        } else {
            hiding_style = {
                display: "none",
            }
        }

        return (
            <View style={styles.container}>
                <View>
                    {slider}
                </View>

                <View>
                    {toggles}
                </View>

                <Text style={viewType === 'detail' ? styles.room_temperature : styles.room_temperature_collapsed}>
                    {room_temp_text}
                </Text>

                <View style={styles.minus_container}>
                  <GenericButton
                    disabled={fan === 0}
                    icon={require('../assets/images/minus.png')}
                    style={hiding_style}
                    action={() => {
                      this.changeTemperature(true)(Math.max(16, this.state.set_pt - 0.5))
                    }} />
                </View>

                <View style={styles.plus_container}>
                  <GenericButton
                    disabled={fan === 0}
                    icon={require('../assets/images/plus.png')}
                    style={hiding_style}
                    action={() => {
                      this.changeTemperature(true)(Math.max(16, this.state.set_pt + 0.5))
                    }} />
                </View>

                <View style={styles.set_point_container}>
                    <Text style={styles.set_point_title_text}>{set_temp_title_text}</Text>
                    <Text style={styles.set_point_text}>{set_temp_text}</Text>
                </View>
            </View>
        );
    }
}

CentralAC.contextTypes = {
    store: PropTypes.object
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    room_temperature: {
        marginTop: 20,
        fontSize: 22,
        color: '#aaaaaa',
        fontFamily: 'HKNova-MediumR'
    },
    room_temperature_collapsed: {
        fontSize: 70,
        color: '#ffffff',
        fontFamily: 'HKNova-MediumR'
    },
    set_point_container: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
    },
    set_point_title_text: {
        fontSize: 24,
        color: '#ffffff',
        fontFamily: 'HKNova-MediumR',
        marginTop: -110,
    },
    set_point_text: {
        fontSize: 70,
        color: '#ffffff',
        fontFamily: 'HKNova-MediumR',
        marginTop: -20,
    },
    set_point_offset: {
    },
    minus_container: {
        position: 'absolute',
        top: 180,
        left: 15,
    },
    plus_container: {
        position: 'absolute',
        top: 180,
        right: 15,
    },
});

module.exports = CentralAC;
