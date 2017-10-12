/* @flow */

import * as React from 'react';
import { View, Text, Image, Animated, TouchableWithoutFeedback, StyleSheet }
    from 'react-native';

import type { GenericThingType, ViewType } from '../config/flowtypes';

import LinearGradient from 'react-native-linear-gradient';

type PropsType = {
    ...GenericThingType,
    viewType?: ViewType,
    lightSwitchState?: {
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
        lightSwitchState: {
            intensity: 0
        }
    };

    _switch_gradient: [string, string] = ['#DDDDDD', '#AAAAAA'];
    _knob_gradient: [string, string] = ['#2463E2', '#163F93'];

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
        const { id, updateThing } = this.props;
        const { intensity } = this.props.lightSwitchState;



        updateThing(id, {intensity: ~~!intensity});
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
        const { viewType, name } = this.props;
        const { intensity } = this.props.lightSwitchState;

        // console.log('LIGHTBULB', intensity);

        const light_bulb_img_on = require('../assets/images/light_bulb_on.png');
        const light_bulb_img_off = require('../assets/images/light_bulb_off.png');

        const light_bulb_img = intensity ?
            light_bulb_img_on : light_bulb_img_off

        var switch_button = null;
        if (viewType === 'detail') {
            switch_button = (
                <TouchableWithoutFeedback onPressIn={() => this.toggle()}>
                    <LinearGradient colors={this._switch_gradient}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        style={styles.switch}>
                        <Animated.View style={styles.knob}>
                            <LinearGradient colors={this._knob_gradient}
                                start={{x: 0, y: 0}}
                                end={{x: 1, y: 1}}>
                            </LinearGradient>
                        </Animated.View>
                    </LinearGradient>
                </TouchableWithoutFeedback>
            );
        }

        return (
            <View style={styles.container}>
                <View style={styles.light_switch}>
                    <Image style={styles.light_bulb}
                        source={light_bulb_img}></Image>
                    {switch_button}
                </View>
                <Text style={styles.name}>{name.en}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    name: {
        fontSize: 17,
        fontFamily: 'HKNova-MediumR',
        color: '#FFFFFF'
    },
    light_switch: {
        width: 120,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center'
    },
    light_bulb: {
        width: 70,
        height: 120
    },
    switch: {
        borderRadius: 5,
        height: 100,
        width: 100,
        marginTop: 20,
    },
    knob: {
        borderRadius: 5,
        left: 5,
        height: 50,
        width: 90
    }

    // light_switch: {
    //     width: 120,
    //     height: 200,
    //     alignItems: 'center',
    //     justifyContent: 'center'
    // },
    // light_bulb: {
    //     width: 70,
    //     height: 120
    // },
    // name: {
    //     fontSize: 17,
    //     fontFamily: 'HKNova-MediumR'
    // },
    // switch: {
    //     borderRadius: 5,
    //     height: 100,
    //     width: 100,
    //     backgroundColor: '#0FFFF0'
    // },
    // knob: {
    //     borderRadius: 5,
    //     left: 5,
    //     height: 50,
    //     width: 90,
    // }
});

module.exports = LightSwitch;
