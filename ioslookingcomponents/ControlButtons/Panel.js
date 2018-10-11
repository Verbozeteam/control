/* @flow */

import * as React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';


type StateType = {
};

type PropsType = {
    active?: boolean | number,
    onPress?: ?(() => any),
    onPressIn?: ?(() => any),
    onPressOut?: ?(() => any),
    children?: ?any,
    blocks?: ?number,
};

export default class Panel extends React.Component<PropsType, StateType> {
    static defaultProps = {
        blocks: 1,
    };

    render() {
        const { children, active, onPress, onPressIn, onPressOut } = this.props;
        var { blocks } = this.props;

        if (!blocks) blocks = 1;

        if (onPress || onPressIn || onPressOut) {
            return (
                <TouchableOpacity activeOpacity={0.5} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
                    <View style={[styles.panel, active ? styles.active : {}, {width: 140 * blocks + (10*(blocks-1))}]}>
                        {children}
                    </View>
                </TouchableOpacity>
            );
        } else {
            return (
                <View style={[styles.panel, active ? styles.active : {}]}>
                    {children}
                </View>
            );
        }
    }
};

const styles = StyleSheet.create({
    panel: {
        height: 140,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        margin: 5,
        flexDirection: 'column',
        padding: 10,
        backgroundColor: '#999999',
        opacity: 0.85,
    },
    active: {
        opacity: 1,
        backgroundColor: '#FFFFFF',
    }
});
