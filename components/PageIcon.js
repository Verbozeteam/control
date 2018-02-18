/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const I18n = require('../i18n/i18n');

import type { LayoutType, NameType } from '../config/flowtypes';

type PropsType = {
    name: string,
    iconName?: string,
    selected: boolean,
    changePage?: () => null,
    longPress: () => null,
    height: number,
};

class PageIcon extends React.Component<PropsType> {
    static defaultProps = {
        longPress: () => null,
        selected: false
    };

    render() {
        const { name, changePage, longPress, selected, iconName, height } = this.props;

        const selected_style = (selected) ? styles.selected : null;
        var title = iconName ?
                <Image style={styles.icon}
                    resizeMode='contain'
                    source={iconName}>
                </Image>
            :
                <Text style={styles.header}>
                    {I18n.t(name).toUpperCase()}
                </Text>;

        var sizeStyle = height ? {height} : {flex: 1};

        return (
            <TouchableOpacity onPressIn={changePage}
                activeOpacity={1}
                delayLongPress={5000}
                onLongPress={longPress}
                style={[styles.container, selected_style, {height}]}>
                {title}
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    selected: {
        backgroundColor: '#FFFFFF22'
    },
    header: {
        width: '100%',
        paddingLeft: 10,
        paddingRight: 10,
        fontSize: 21,
        textAlign: 'right',
        fontWeight: '100',

        color: '#FFFFFF'
    },
    icon: {
        flex: 1,
        width: '100%',
    }
});

module.exports = PageIcon;
