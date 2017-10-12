/* @flow */

import * as React from 'react';
import { View, Text, Image, Animated, TouchableWithoutFeedback, StyleSheet }
    from 'react-native';

import type { GenericThingType, ViewType } from '../config/flowtypes';

type PropsType = {
    ...GenericThingType,
    viewType?: ViewType,
    thingState?: {
        intensity: 0 | 1
    },
    updateThing: (id: string, update: Object) => null,
};

// type StateType = {
//     offset: number
// };

class LightSwitch extends React.Component<PropsType> {

    static defaultProps = {
        viewType: 'present',
        thingState: {
            intensity: 0
        }
    };

    _offset: number;

    constructor(props: PropsType) {
        super(props);

        this._offset = new Animated.Value(5 + props.intensity * 30);
    }

    // state = {
    //     intensity: 0,
    //     offset: new Animated.Value(5)
    // };

    toggle() {
        // const { intensity, offset } = this.state;
        //
        // this.setState({
        //     intensity: !intensity
        // });
        //
        // Animated.timing(offset, {
        //     toValue: 5 + !intensity * 30,
        //     duration: 150
        // }).start();
    }

    render() {
        const { viewType, name, thingState } = this.props;
        const { intensity } = thingState;
        // const { intensity } = thingState;
        // const { intensity, offset } = this.state;

        // console.log('LIGHT SWITCH: ', viewType, thing);

        const switch_button = (
            <TouchableWithoutFeedback onPress={() => this.toggle()}>
                <View style={styles.switch}>
                    <Text style={styles.text_off}>Off</Text>
                    <Animated.View style={[{top: this._offset}, styles.knob]}>
                    </Animated.View>
                    <Text style={styles.text_on}>On</Text>
                </View>
            </TouchableWithoutFeedback>
        );

        var light_bulb_img = '';
        if (intensity) {
            light_bulb_img = require('../assets/images/light_bulb_on.png');
        } else {
            light_bulb_img = require('../assets/images/light_bulb_off.png');
        }

        return (
            <View style={styles.container}>
                <View style={styles.light_switch}>
                    <Image style={styles.light_bulb}
                        source={light_bulb_img}></Image>
                    {viewType === 'detail' ? switch_button : null}
                </View>
                <Text style={styles.title}>{name.en}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    light_switch: {
        width: 120,
        height: 200,
        // backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center'
    },
    light_bulb: {
        width: 70,
        height: 120
    },
    title: {
        fontSize: 17,
        fontFamily: 'HKNova-MediumR'
    },
    switch: {
        borderRadius: 5,
        height: 100,
        width: 100,
        backgroundColor: '#0FFFF0'
    },
    knob: {
        borderRadius: 5,
        left: 5,
        height: 50,
        width: 90,
        backgroundColor: '#FF0000'
    },
    text_on: {
        position: 'absolute',
        fontFamily: 'HKNova-MediumR',
        fontSize: 17,
        color: '#FF0000'
    },
    text_off: {
        position: 'absolute',
        fontFamily: 'HKNova-MediumR',
        fontSize: 17,
        color: '#FF0000'
    }
});

module.exports = LightSwitch;
