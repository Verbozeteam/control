/* @flow */

import * as React from 'react';
import { View, Text, PanResponder, StyleSheet } from 'react-native';

import type { GenericThingType, ViewType } from '../config/flowtypes';

const I18n = require('../i18n/i18n');

import LinearGradient from 'react-native-linear-gradient';

type PropsType = {
    ...GenericThingType,
    viewType?: ViewType,
    dimmerState?: {
        intensity: number
    },
    updateThing?: (id: string, update: Object, remote_only?: boolean) => null,
    blockThing?: (id: string) => null,
    unblockThing?: (id: string) => null
};

type StateType = {
    touch: boolean,
    touch_intensity: number,
    touch_start_intensity: number,
};

class Dimmer extends React.Component<PropsType, StateType> {

    static defaultProps = {
        viewType: 'present',
        dimmerState: {
            intensity: 50
        }
    };

    state = {
        touch: false,
        touch_intensity: 0,
        touch_start_intensity: 0,
    };

    _dimmer_gradient: [string, string] = ['#666666', '#333333'];
    _slider_gradient: [string, string] = ['#2463E2', '#163F93'];

    _min_value: number = 0;
    _max_value: number = 100;

    _dimmer_detail_height: number = 200;
    _dimmer_present_height: number = 100;
    _dimmer_height: number;
    _ratio: number;

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
        const { intensity } = this.props.dimmerState;

        blockThing(id);

        this.setState({
            touch: true,
            touch_intensity: intensity,
            touch_start_intensity: intensity
        });
    }

    _onPanResponderMove(evt: Object, gestureState: {dy: number}) {
        const { id, updateThing } = this.props;
        const { touch_intensity, touch_start_intensity } = this.state;

        var new_intensity: number = Math.round(touch_start_intensity -
            (gestureState.dy / this._ratio));

        if (new_intensity < this._min_value) {
            new_intensity = this._min_value;
        }

        else if (new_intensity > this._max_value) {
            new_intensity = this._max_value;
        }

        if (new_intensity !== touch_intensity) {
            this.setState({
                touch_intensity: new_intensity
            });

            updateThing(id, {intensity: new_intensity}, true);
        }
    }

    _onPanResponderRelease(evt: Object, gestureState: Object) {
        const { unblockThing, id, updateThing } = this.props;
        const { touch_intensity } = this.state;

        this.setState({
            touch: false
        });

        updateThing(id, {intensity: touch_intensity});

        unblockThing(id);
    }

    calculateDimmerHeightAndRatio() {
        const { viewType } = this.props;

        this._dimmer_height = viewType === 'detail' ?
            this._dimmer_detail_height : this._dimmer_present_height;
        this._ratio = this._dimmer_height / (this._max_value - this._min_value);
    }

    render() {
        const { viewType, name } = this.props;
        var { intensity } = this.props.dimmerState;
        const { touch, touch_intensity, touch_start_intensity } = this.state;

        this.calculateDimmerHeightAndRatio();

        const dimmer_attributes = viewType === 'detail' ?
            this._panResponder.panHandlers : {};

        var dimmer_name = <Text></Text>;
        if (viewType == 'detail')
            dimmer_name = <Text style={styles.name}>{I18n.t(name.en)}</Text>

        if (touch) {
            intensity = touch_intensity;
        }

        return (
            <View style={styles.container}>
                <View {...dimmer_attributes}
                    style={[{height: this._dimmer_height}, styles.dimmer]}>

                    <LinearGradient colors={this._slider_gradient}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        style={[{height: this._ratio * intensity}, styles.slider]}>
                    </LinearGradient>
                    <Text style={styles.dimmer_value}>
                        {intensity}
                    </Text>
                </View>
                {dimmer_name}
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    name: {
        fontSize: 17,
        fontFamily: 'HKNova-MediumR',
        color: '#FFFFFF'
    },
    dimmer: {
        width: 70,
        borderRadius: 5,
        backgroundColor: '#444444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    slider: {
        position: 'absolute',
        width: '100%',
        bottom: 0,
        borderRadius: 5,
        backgroundColor: '#0000FF'
    },
    dimmer_value: {
        fontFamily: 'HKNova-MediumR',
        fontSize: 30,
        color: '#FFFFFF',
        textShadowColor:'#000000',
        textShadowOffset: {
            width: 0.1,
            height: 0.1
        },
        textShadowRadius: 5,
    }
});

module.exports = Dimmer;
