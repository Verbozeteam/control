/* @flow */

import * as React from 'react';
import { View, Animated } from 'react-native';

type PropsType = {
    currentPage: number,
    children: ?any,
}

type StateType = {
    opacityLevel: any
};

export default class FadeInView extends React.Component<PropsType, StateType> {

    state = {
        opacityLevel: new Animated.Value(0), // initialize opacity to 0
    };

    componentDidMount() {
        Animated.timing(
            this.state.opacityLevel,
            {
                toValue: 1,     // final value to reach it 1 opacity (fully shown)
                duration: 1000, // how long to take to reach to that value
            }
        ).start();
    }

    componentWillReceiveProps(nextProps: PropsType) {
        // only fade in when the "currentPage" actually changes
        if (nextProps.currentPage !== this.props.currentPage) {
            this.state.opacityLevel = new Animated.Value(0);

            Animated.timing(
                this.state.opacityLevel,
                {
                    toValue: 1,     // final value to reach it 1 opacity (fully shown)
                    duration: 1000, // how long to take to reach to that value
                }
            ).start();
        }
    }


    render(){
        let { opacityLevel } = this.state;

        return (
            <Animated.View style={{opacity: opacityLevel, width: '100%', height: '100%'}}>
                {this.props.children}
            </Animated.View>
        );
    };
}
