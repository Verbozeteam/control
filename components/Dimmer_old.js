/* @flow */

import * as React from 'react';
import { View, Text, PanResponder, StyleSheet } from 'react-native';

import type { GenericThingType, ViewType } from '../config/flowtypes';

type PropsType = {
    ...GenericThingType,
    viewType?: ViewType,
    dimmerStawte?: {
        intensity: number
    }
};

type StateType = {};

// type StateType = {
//     value: number,
//     gesture_start_value: number
// };

class Dimmer extends React.Component<PropsType, StateType> {

    static defaultProps = {
        viewType: 'present',
        thingState: {
            intensity: 50
        }
    };

    // state = {
    //     value: this.props.thing.intensity,
    //     gesture_start_value: 0
    // };

    _min_value: number = 0;
    _max_value: number = 100;
    _slider_height: number;
    _ratio: number;
    _panResponder: Object;

    calculateSliderHeightAndRatio() {
        const { viewType } = this.props;

        this._slider_height = viewType === 'detail' ? 200 : 100;
        this._ratio = this._slider_height / (this._max_value - this._min_value);
    }

    componentWillMount() {
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

            onPanResponderGrant: this._onPanResponderGrant.bind(this),
            onPanResponderMove: this._onPanResponderMove.bind(this)
        });
    }

    shouldComponentUpdate(nextProps: PropsType, nextState: StateType) {
        const { next_thingState, next_viewType } = nextProps;
        const { thingState, viewType } = this.props;


        return true;
        // const { next_thingsState , next_viewType } = nextProps;
        // const { thingsState, viewType } = this.props;
        //
        // if (viewType !== next_viewType) {
        //     return true;
        // }
        //
        // if (thingsState.intensity !== next_thingsState.intensity) {
        //     return true;
        // }
        //
        // return false;
    }

    _onPanResponderGrant(evt: Object, gestureState: Object) {
        // const { value } = this.state;
        //
        // this.setState({
        //     gesture_start_value: value
        // });
    }

    _onPanResponderMove(evt: Object, gestureState: {dy: number}) {
        // const { gesture_start_value } = this.state;
        //
        // var new_value: number = Math.round(gesture_start_value -
        //     (gestureState.dy / this._ratio));
        //
        // if (new_value < this._min_value) {
        //     new_value = this._min_value;
        // }
        //
        // else if (new_value > this._max_value) {
        //     new_value = this._max_value;
        // }
        //
        // this.setState({
        //     value: new_value
        // });
    }

    render() {
        const { viewType, name, thingState } = this.props;
        const { intensity } = thingState;

        this.calculateSliderHeightAndRatio();

        console.log(this.props);

        var slider = null;
        if (viewType == 'detail') {
            slider = <View {...this._panResponder.panHandlers}
                style={[{height: this._slider_height}, styles.slider_container]}>
                <View style={[{height: this._ratio * intensity},
                    styles.slider]}>
                </View>
                <Text style={styles.slider_text}>
                    {intensity}
                </Text>
            </View>
        } else {
            slider = <View style={[{height: this._slider_height},
                styles.slider_container]}>
                <View style={[{height: this._ratio * intensity},
                     styles.slider]}></View>
                <Text style={styles.slider_text}>
                    {intensity}
                </Text>
            </View>
        }

        return (
            <View style={styles.container}>
                {slider}
                <Text style={styles.name}>{name.en}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#0000FF',
        alignItems: 'center',
        justifyContent: 'center'
    },
    name: {
        fontSize: 17,
        fontFamily: 'HKNova-MediumR'
    },
    slider_container: {
        width: 70,
        borderRadius: 5,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center'
    },
    slider: {
        position: 'absolute',
        bottom: 0,
        borderRadius: 5,
        width: 70,
        backgroundColor: '#0000FF'
    },
    slider_text: {
        fontFamily: 'HKNova-MediumR',
        fontSize: 17,
        color: '#FFFFFF'
    }
});

module.exports = Dimmer;
