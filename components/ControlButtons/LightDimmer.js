/* @flow */

import * as React from 'react';

import PropTypes from 'prop-types';
import { View, Text, Image, TouchableOpacity, StyleSheet, PanResponder } from 'react-native';
import { connect } from 'react-redux';

import { ConfigManager } from '../../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../../js-api-utils/ConfigManager';

import Panel from './Panel';

import { TypeFaces } from '../../constants/styles';

const I18n = require('../../js-api-utils/i18n/i18n');

type StateType = {
    intensity: number,
    dragging: boolean,
    lastValue: number,
    currentValue: number,
};

type PropsType = {
    id: ?string,
    name: string,
    onSwitch?: number => any,
    intensity?: number,
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

class LightDimmerClass extends React.Component<PropsType, StateType> {
    _unsubscribe: () => any = () => null;

    state = {
        intensity: 0,
        dragging: false,
        lastValue: 0,
        currentValue: 0,
    };

    _light_bulb_img_on = require('../../assets/images/icons/lighton.png');
    _light_bulb_img_off = require('../../assets/images/icons//lightoff.png');

    _panResponder: Object;      /* touch responder, AKA the 'abomination' */
    _initial_press_pos: number; /* inital x position of the click */
    _initial_press_value: number;/* initial value when first clicked */
    _is_drag: boolean;          /* whether or not this movement is a drag to dim */
    _x_pos: number;             /* component x-axis position relative to screen */
    _panelWidth: number = 300;  /* width of the panel */
    _measured: boolean = false; /* whether or not measure has been called */
    _container_ref: Object;     /* reference to container object used to obtain component position */

    onPanResponderStart(evt: Object, gestureState: Object) {
        this._is_drag = false;
    }

    onPanResponderGrant(evt: Object, gestureState: Object) {
        this.measure(() => this.onKnobMove(gestureState.x0));
    }

    onPanResponderMove(evt: Object, gestureState: Object) {
        if (this._measured) {
            this.onKnobMove(gestureState.moveX);
        }
    }

    onPanResponderRelease() {
        const { dragging, lastValue } = this.state;
        const maxValue = 100;
        this._measured = false;

        if (this._is_drag || this._initial_press_value !== lastValue) {
            this._is_drag = false;
            this.setState({
                dragging: false,
            });
        } else { // was just a click
            var presets = [0, maxValue * 1 / 4, maxValue * 2 / 4, maxValue * 3 / 4, maxValue];
            var bracket = 0;
            for (var i = 1; i < presets.length; i++) {
                if (lastValue <= presets[i]) {
                    bracket = i;
                    break;
                }
            }
            var newValue = 0;
            if (presets[bracket] - lastValue >= 15)
                newValue = presets[bracket];
            else
                newValue = presets[(bracket+1) % presets.length];
            this.changeIntensity(newValue);
            this.setState({
                dragging: false,
                lastValue: newValue,
                currentValue: newValue
            });
        }
    }

    onKnobMove(x: number) {
        const { lastValue, dragging } = this.state;
        const maxValue = 100;

        if (!dragging) {
            this._initial_press_pos = x;
            this._initial_press_value = lastValue;
        }

        var diff = x - this._initial_press_pos;
        var diffInValue = maxValue * diff / this._panelWidth;
        var cur_pos = Math.min(Math.max(this._initial_press_value + diffInValue, 0), maxValue);
        var cur_value = parseInt(cur_pos);

        if (diff > 5)
            this._is_drag = true;

        if (cur_value !== lastValue)
            this.changeIntensity(cur_value, Math.abs(cur_value - lastValue) >= 3);

        this.setState({
            dragging: true,
            lastValue: cur_value,
            currentValue: cur_pos
        });
    }

    measure(callback?: () => void = () => {}) {
        this._container_ref.measure((x, y, width, height, pageX, pageY) => {
            this._x_pos = pageX;
            callback();
            this._measured = true;
        });
    }

    componentWillMount() {
        this.componentWillReceiveProps(this.props);

        /* create touch responder */
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
            onPanResponderTerminationRequest: (evt, gestureState) => true,

            onPanResponderGrant: this.onPanResponderGrant.bind(this),
            onPanResponderMove: this.onPanResponderMove.bind(this),
            onPanResponderRelease: this.onPanResponderRelease.bind(this),

            onPanResponderStart: this.onPanResponderStart.bind(this),
            onPanResponderEnd: () => {},
            onPanResponderTerminate: () => {}
        });
    }

    componentWillReceiveProps(newProps: PropsType) {
        this._unsubscribe();
        if (newProps.id) {
            this._unsubscribe = ConfigManager.registerThingStateChangeCallback(newProps.id, this.onLightChanged.bind(this));
            if (newProps.id && newProps.id in ConfigManager.things)
                this.onLightChanged(ConfigManager.thingMetas[newProps.id], ConfigManager.things[newProps.id]);
        }
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    onLightChanged(meta: ThingMetadataType, lightState: ThingStateType) {
        const { intensity } = this.state;

        var total_change = {};
        if (lightState.intensity !== intensity)
            total_change.intensity = lightState.intensity;

        if (Object.keys(total_change).length > 0)
            this.setState(total_change);
    }

    changeIntensity(intensity: number, send_msg: ?boolean) {
        if (this.props.onSwitch)
            this.props.onSwitch(intensity);
        if (this.props.id) {
            ConfigManager.setThingState(this.props.id, {intensity}, send_msg || (send_msg === undefined));
        }
    }

    render() {
        const { id, name, displayConfig } = this.props;
        const { intensity, dragging } = this.state;

        var isActive = intensity > 0;

        return (
            <Panel containerProps={{
                        ...this._panResponder.panHandlers,
                        ref: c => {this._container_ref = c},
                        onLayout: () => null,
                    }} blocks={2} active={dragging} progress={intensity / 100}>
                <Image style={styles.icon} source={isActive ? this._light_bulb_img_on : this._light_bulb_img_off} />
                <View style={I18n.l2r() ? styles.texts : styles.texts_r2l}>
                    <Text style={[styles.name, isActive ? TypeFaces.bold : {}]}>{I18n.t(name)}</Text>
                    <Text style={styles.comment}>{I18n.t("(Slide to dim)")}</Text>
                    <Text style={[styles.info, isActive ? {color: displayConfig.accentColor} : {}, I18n.r2l() ? {textAlign: 'right'} : {}]}>{intensity + "%"}</Text>
                </View>
            </Panel>
        );
    }
};


const styles = StyleSheet.create({
    icon: {
        width: 40,
        height: 40,
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
        height: 27,
        ...TypeFaces.light,
    },
    comment: {
        color: '#444444',
        fontSize: 17,
        height: 27,
        ...TypeFaces.light,
    },
    info: {
        color: '#000000',
        fontSize: 17,
        ...TypeFaces.light,
    },
});

const LightDimmer = connect(mapStateToProps, mapDispatchToProps) (LightDimmerClass);
export default LightDimmer;
