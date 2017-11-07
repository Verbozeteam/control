/* @flow */

import * as React from 'react';
import { View, Text, Image, PanResponder, TouchableWithoutFeedback, StyleSheet }
    from 'react-native';

import type { GenericThingType, ViewType } from '../config/flowtypes';

const I18n = require('../i18n/i18n');

import LinearGradient from 'react-native-linear-gradient';
const interpolateRGB = require('interpolate-rgb');
const rgbHex = require('rgb-hex');
const hexRgb = require('hex-rgb');

type PropsType = {
    ...GenericThingType,
    viewType?: ViewType,
    aCState?: {
        temp: number,
        set_pt: number,
        fan: number
    },
    updateThing?: (id: string, update: Object, remote_only?: boolean) => null,
    blockThing?: (id: string) => null,
    unblockThing?: (id: string) => null
};

type StateType = {
    touch: boolean,
    touch_set_pt: number,
    touch_start_set_pt: number
}

class CentralAC extends React.Component<PropsType, StateType> {
    static defaultProps = {
        viewType: 'present',
        aCState: {
            temp: 25,
            set_pt: 25,
            fan: 0
        }
    };

    state = {
        touch: false,
        touch_set_pt: 0,
        touch_start_set_pt: 0,
    };

    _cold_gradient = [hexRgb('#2463E2'), hexRgb('#163F93')];
    _warm_gradient = [hexRgb('#F2616E'), hexRgb('#9C1E31')];

    _button_gradient: [string, string] = ['#DDDDDD', '#AAAAAA'];
    _pressed_button_gradient: [string, string] = ['#2463E2', '#163F93'];

    _min_temperature: number = 16;
    _max_temperature: number = 30;

    _temperature_detail_width: number = 400;
    _ratio: number;

    _fan_speeds: Array<[number, string]> = [
        [0, I18n.t('Off')],
        [1, I18n.t('Low')],
        [2, I18n.t('High')]
    ];

    _panResponder: Object;

    componentWillMount() {
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

            onPanResponderGrant: this._onPanResponderGrant.bind(this),
            onPanResponderMove: this._onPanResponderMove.bind(this),
            onPanResponderRelease: this._onPanResponderRelease.bind(this)
        });
    }

    _onPanResponderGrant(evt: Object, gestureState: Object) {
        const { blockThing, id } = this.props;
        const { set_pt } = this.props.aCState;

        blockThing(id);

        this.setState({
            touch: true,
            touch_set_pt: set_pt,
            touch_start_set_pt: set_pt
        });
    }

    _onPanResponderMove(evt: Object, gestureState: {dx: number}) {
        const { id, updateThing } = this.props;
        const { touch_set_pt, touch_start_set_pt } = this.state;

        var new_set_pt: number = Math.round((touch_start_set_pt +
            (gestureState.dx / this._ratio)) * 2) / 2.0;

        if (new_set_pt < this._min_temperature) {
            new_set_pt = this._min_temperature;
        }

        else if (new_set_pt > this._max_temperature) {
            new_set_pt = this._max_temperature;
        }

        if (new_set_pt !== touch_set_pt) {
            this.setState({
                touch_set_pt: new_set_pt
            });

            updateThing(id, {set_pt: new_set_pt}, true);
        }
    }

    _onPanResponderRelease(evt: Object, gestureState: Object) {
        const { unblockThing, id, updateThing } = this.props;
        const { touch_set_pt } = this.state;

        this.setState({
            touch: false
        });

        updateThing(id, {set_pt: touch_set_pt});

        unblockThing(id);
    }

    raiseTemperature() {
        const { updateThing, id } = this.props;
        const { set_pt, fan } = this.props.aCState;

        if (set_pt < this._max_temperature) {
            updateThing(id, {set_pt: set_pt + 0.5});
        }
    }


    lowerTemperature() {
        const { updateThing, id } = this.props;
        const { set_pt } = this.props.aCState;

        if (set_pt > this._min_temperature) {
            updateThing(id, {set_pt: set_pt - 0.5});
        }
    }

    setFanSpeed(speed: number) {
        const { updateThing, id } = this.props;

        updateThing(id, {fan: speed});
    }

    calculateRatio() {
        this._ratio = (this._temperature_detail_width - 60) / (this._max_temperature -
            this._min_temperature);
    }

    render() {
        const { viewType, aCState } = this.props;
        const { temp, fan } = this.props.aCState;
        var { set_pt } = this.props.aCState;
        const { touch, touch_set_pt,
            touch_start_set_pt } = this.state;

        this.calculateRatio();

        const temperature_attributes = viewType === 'detail' ?
            this._panResponder.panHandlers : {};

        if (touch) {
            set_pt = touch_set_pt;
        }

        // console.log(aCState);

        var set_temperature = null;
        if (!fan) {
            set_temperature = <View style={styles.set_temperature_container}>
                <Text style={styles.set_temperature}>
                    {I18n.t('Off')}
                </Text>
                <Text style={styles.fan_speed_display}></Text>
            </View>;
        } else {
            set_temperature = <View style={styles.set_temperature_container}>
                <Text style={styles.set_temperature}>
                    {parseFloat(set_pt).toFixed(1)}°C
                </Text>
                <Text style={styles.fan_speed_display}>
                    {viewType !== 'detail' ?
                        this._fan_speeds[fan][1] : null}
                </Text>
            </View>;
        }

        var temperature_setter = null;
        var fan_speed = null;
        var room_temperature = null;
        if (viewType === 'detail') {

            room_temperature = <View style={styles.room_temperature}>
                <Text style={styles.room_temperature_text}>
                    {I18n.t('Room Temperature')} {parseFloat(temp).toFixed(1)}°C
                </Text>
            </View>;


            const temperature_percentage = (set_pt - this._min_temperature) /
                (this._max_temperature - this._min_temperature);

            const color1 = interpolateRGB(this._cold_gradient[0],
                this._warm_gradient[0], temperature_percentage);
            const color2 = interpolateRGB(this._cold_gradient[1],
                this._warm_gradient[1], temperature_percentage);

            const knob_gradient = ['#' + rgbHex(color1[0], color1[1], color1[2]),
                '#' + rgbHex(color2[0], color2[1], color2[2])];

            temperature_setter = (
                <View style={styles.temperature_setter}>
                    <TouchableWithoutFeedback onPressIn={() =>
                         this.lowerTemperature()}>
                         <LinearGradient colors={this._button_gradient}
                             start={{x: 0, y: 0}}
                             end={{x: 1, y: 1}}
                             style={styles.button}>
                             <Text style={styles.button_text}>
                                 -
                             </Text>
                         </LinearGradient>
                    </TouchableWithoutFeedback>
                    <View {...temperature_attributes}
                        style={[{width: this._temperature_detail_width},
                        styles.temperature_slider]}>
                        <LinearGradient colors={knob_gradient}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 1}}
                            style={[{left: this._ratio * (set_pt - this._min_temperature)},
                                styles.temperature_knob, {borderColor: knob_gradient[1]}]}>
                        </LinearGradient>
                    </View>
                    <TouchableWithoutFeedback onPressIn={() =>
                         this.raiseTemperature()}>
                         <LinearGradient colors={this._button_gradient}
                             start={{x: 0, y: 0}}
                             end={{x: 1, y: 1}}
                             style={styles.button}>
                             <Text style={styles.button_text}>
                                 +
                             </Text>
                         </LinearGradient>
                    </TouchableWithoutFeedback>
                </View>
            );

            var fan_speed_buttons = [];
            for (var i = 0; i < this._fan_speeds.length; i++) {
                const gradient = fan === this._fan_speeds[i][0] ?
                    this._pressed_button_gradient : this._button_gradient;
                const speed = this._fan_speeds[i][0];
                fan_speed_buttons.push(<TouchableWithoutFeedback
                    key={'fan-speed-' + i}
                    onPress={() => this.setFanSpeed(speed)}>
                        <LinearGradient colors={gradient}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 1}}
                            style={styles.fan_speed_button}>
                            <Text style={styles.button_text}>
                                {this._fan_speeds[i][1]}
                            </Text>
                        </LinearGradient>
                    </TouchableWithoutFeedback>);
            }

            fan_speed = <View style={styles.fan_speed}>
                <Image style={styles.fan}
                    source={require('../assets/images/fan.png')}></Image>
                {fan_speed_buttons}
            </View>;
        }

        return (
            <View style={styles.container}>
                {set_temperature}
                {temperature_setter}
                {fan_speed}
                {room_temperature}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0)'
    },
    set_temperature_container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    fan_speed_display: {
        fontFamily: 'HKNova-MediumR',
        fontSize: 17,
        color: '#FFFFFF'
    },
    set_temperature: {
        fontFamily: 'HKNova-MediumR',
        fontSize: 64,
        color: '#FFFFFF'
    },
    room_temperature: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    room_temperature_text: {
        fontFamily: 'HKNova-MediumR',
        fontSize: 25,
        color: '#FFFFFF'
    },
    temperature_setter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    temperature_slider: {
        height: 70,
        borderRadius: 5,
        backgroundColor: '#444444',
    },
    temperature_knob: {
        position: 'absolute',
        top: 0,
        height: '100%',
        borderRadius: 5,
        width: 60,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
    },
    button: {
        height: 70,
        width: 60,
        borderRadius: 5,
        marginRight: 20,
        marginLeft: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 10
    },
    fan_speed_button: {
        height: 70,
        width: 120,
        borderRadius: 5,
        marginRight: 20,
        marginLeft: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    button_text: {
        fontFamily: 'HKNova-MediumR',
        fontSize: 32,
        color: '#FFFFFF'
    },
    fan_speed: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    fan: {
        height: 70,
        width: 70,
        marginLeft: 20,
        marginRight: 20
    }
});

module.exports = CentralAC;
