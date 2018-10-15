/* @flow */

import * as React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import I18n from '../../js-api-utils/i18n/i18n';

type StateType = {
};

type PropsType = {
    active?: boolean | number,
    onPress?: ?(() => any),
    onPressIn?: ?(() => any),
    onPressOut?: ?(() => any),
    children?: ?any,
    blocks?: ?number,
    style?: ?any,
};

export default class Panel extends React.Component<PropsType, StateType> {
    static defaultProps = {
        blocks: 1,
    };

    render() {
        const { children, active, onPress, onPressIn, onPressOut, style } = this.props;
        var { blocks } = this.props;

        if (!blocks) blocks = 1;

        var panelStyle = [[styles.panel, active ? styles.active : {}, {width: 140 * blocks + (10*(blocks-1))}, I18n.r2l() ? {alignItems: 'flex-end'} : {}, style]];

        if (onPress || onPressIn || onPressOut) {
            return (
                <TouchableOpacity activeOpacity={0.5} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={panelStyle}>
                    {children}
                </TouchableOpacity>
            );
        } else {
            return (
                <View style={panelStyle}>
                    {children}
                </View>
            );
        }
    }
};

const styles = StyleSheet.create({
    panel: {
        height: 150,
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
