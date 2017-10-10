/* @flow */

import * as React from 'react';
import { View, Text, PanResponder, StyleSheet } from 'react-native';

// import Slider from 'react-native-slider';

type ViewType = 'present' | 'detail';

type PropsType = {
    viewType: ViewType,
    thing: {
        id: string,
        category: 'dimmers',
        title: {
            en: string,
            ar: string
        },
        intensity: number
    }
};

type StateType = {
    value: number,
    gesture_start_value: number
};

class Dimmer extends React.Component<PropsType, StateType> {

    static defaultProps = {
        viewType: 'present'
    };

    state = {
        value: 34,
        gesture_start_value: 34
    };

    _slider_height: number;
    _min_value: number;
    _max_value: number;
    _ratio: number;
    _panResponder: Object;

    constructor(props: PropsType) {
        super(props);

        this._slider_height = 200;
        this._min_value = 0;
        this._max_value = 100;
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

    _onPanResponderGrant(evt: Object, gestureState: Object) {
        const { value } = this.state;

        this.setState({
            gesture_start_value: value
        });
    }

    _onPanResponderMove(evt: Object, gestureState: {dy: number}) {
        const { gesture_start_value } = this.state;

        var new_value: number = Math.round(gesture_start_value -
            (gestureState.dy / this._ratio));

        if (new_value < this._min_value) {
            new_value = this._min_value;
        }

        else if (new_value > this._max_value) {
            new_value = this._max_value;
        }

        this.setState({
            value: new_value
        });
    }

    render() {
        const { thing } = this.props;
        const { value } = this.state;

        console.log('DIMMER: ', thing);

        const slider = (
            <View {...this._panResponder.panHandlers}
                style={[{height: this._slider_height}, styles.slider_container]}>
                <View style={[{height: this._ratio * value}, styles.slider]}></View>
                <Text style={styles.slider_text}>{value}</Text>
            </View>
        );

        return (
            <View style={styles.container}>
                {slider}
                <Text style={styles.title}>{thing.title.en}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0000FF',
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontSize: 17,
        fontFamily: 'HKNova-MediumR'
    },
    slider_container: {
        width: 70,
        borderRadius: 5,
        backgroundColor: '#00FFFF',
        alignItems: 'center',
        justifyContent: 'center'
    },
    slider: {
        position: 'absolute',
        bottom: 0,
        borderRadius: 5,
        width: 70,
        backgroundColor: '#FF0000'
    },
    slider_text: {
        fontFamily: 'HKNova-MediumR',
        fontSize: 17,
        color: '#000000'
    }
});

module.exports = Dimmer;
