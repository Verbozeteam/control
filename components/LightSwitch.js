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

class LightSwitch extends React.Component<PropsType> {

    static defaultProps = {
        viewType: 'present',
        lightSwitchState: {
            intensity: 0
        }
    };

    _switch_gradient: [string, string] = ['#DDDDDD', '#AAAAAA'];
    _knob_gradient: [string, string] = ['#2463E2', '#163F93'];

    _offset: Object;

    _light_bulb_img_on = require('../assets/images/light_bulb_on.png');
    _light_bulb_img_off = require('../assets/images/light_bulb_off.png');


    constructor(props: PropsType) {
        super(props);

        const { intensity } = props.lightSwitchState;

        this._offset = new Animated.Value(5 + intensity * 40);
    }

    toggle() {
        const { id, updateThing } = this.props;
        const { intensity } = this.props.lightSwitchState;

        updateThing(id, {intensity: ~~!intensity});
    }

    evaluateKnobOffset() {
        const { intensity } = this.props.lightSwitchState;

        Animated.timing(this._offset, {
            toValue: 5 + intensity * 40,
            duration: 150
        }).start();
    }

    render() {
        const { viewType, name } = this.props;
        const { intensity } = this.props.lightSwitchState;

        const light_bulb_img = intensity ?
            this._light_bulb_img_on : this._light_bulb_img_off

        this.evaluateKnobOffset();

        var switch_button = null;
        var name_text = <Text></Text>;
        if (viewType === 'detail') {
            name_text = <Text style={styles.name}>{name.en}</Text>;

            switch_button = (
                <TouchableWithoutFeedback onPressIn={() => this.toggle()}>
                    <LinearGradient colors={this._switch_gradient}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        style={styles.switch}>
                        <Animated.View style={[styles.knob, {top: this._offset}]}>
                            <LinearGradient colors={this._knob_gradient}
                                start={{x: 0, y: 0}}
                                end={{x: 1, y: 1}}
                                style={styles.knob_gradient}>
                            </LinearGradient>
                        </Animated.View>
                    </LinearGradient>
                </TouchableWithoutFeedback>
            );
        }

        return (
            <View style={styles.container}>
                <View style={styles.light_bulb_container}>
                    <Image style={styles.light_bulb}
                        source={light_bulb_img}>
                    </Image>
                </View>
                {switch_button}
                {name_text}
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
        color: '#FFFFFF',
    },
    light_bulb_container: {
        height: 120,
        width: 70
    },
    light_bulb: {
        flex: 1,
        width: undefined,
        height: undefined
    },
    switch: {
        borderRadius: 5,
        height: 100,
        width: 100,
        marginTop: 20
    },
    knob: {
        height: 50,
        width: 90,
        left: 5,
    },
    knob_gradient: {
        flex: 1,
        borderRadius: 5
    }
});

module.exports = LightSwitch;
