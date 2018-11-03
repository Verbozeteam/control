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
    progress?: ?number,
    containerProps?: ?Object,
};

export default class Panel extends React.Component<PropsType, StateType> {
    static defaultProps = {
        blocks: 1,
    };

    render() {
        const { children, active, onPress, onPressIn, onPressOut, style, progress, containerProps } = this.props;
        var { blocks } = this.props;

        if (!blocks) blocks = 1;

        var width = 150 * blocks + (10*(blocks-1));
        var panelStyle = [[styles.panel, (active && progress === undefined) ? styles.active : (active ? styles.halfActive : {}), {width}, I18n.r2l() ? {alignItems: 'flex-end'} : {}, style]];
        var progressBar = <View style={[styles.progressPanel, {width: width * (progress || 0), height: 150}, styles.active]} />

        if (onPress || onPressIn || onPressOut) {
            return (
                <TouchableOpacity activeOpacity={0.5} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={panelStyle} {...containerProps}>
                    {progress !== undefined ? progressBar : null}
                    {children}
                </TouchableOpacity>
            );
        } else {
            return (
                <View style={panelStyle} {...containerProps}>
                    {progress !== undefined ? progressBar : null}
                    {children}
                </View>
            );
        }
    }
};

const styles = StyleSheet.create({
    panel: {
        height: 150,
        borderRadius: 20,
        margin: 5,
        flexDirection: 'column',
        padding: 10,
        backgroundColor: '#999999',
        opacity: 0.85,
        overflow: 'hidden',
    },
    progressPanel: {
        backgroundColor: '#CCCCCC',
        opacity: 1,
        position: 'absolute',
        left: 0,
    },
    active: {
        opacity: 1,
        backgroundColor: '#FFFFFF',
    },
    halfActive: {
        opacity: 0.9,
        backgroundColor: '#AAAAAA',
    },
    threeFourthsActive: {
        opacity: 1,
        backgroundColor: '#CCCCCC',
    }
});
