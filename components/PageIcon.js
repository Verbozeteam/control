/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

import { TypeFaces } from '../constants/styles';

const I18n = require('../js-api-utils/i18n/i18n');

type PropsType = {
    name: string,
    iconName?: string,
    selected: boolean,
    changePage?: ?(() => any),
    longPress?: ?(() => any),
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

        if (I18n.t(name).length >= 15) {
            var largeName = I18n.t(name).replace(/ /g, "\n");
        }

        var title = iconName ?
                <Image style={styles.icon}
                    resizeMode='contain'
                    source={iconName}>
                </Image>
            :
                <Text style={styles.header}>
                    {I18n.t(name).length >= 15 ? largeName : I18n.t(name)}
                </Text>;

        var sizeStyle = height ? {height} : {flex: 1};

        return (
            <TouchableOpacity onPressIn={changePage}
                activeOpacity={1}
                delayLongPress={5000}
                onLongPress={longPress}
                style={[styles.container, selected_style, {height}]}>
                <View style={styles.contentWrapper}>
                    {title}
                    <View style={styles.underline}></View>
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        alignSelf: 'baseline',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingRight: 10,
    },
    contentWrapper: {
        alignSelf: 'flex-end',
        position: 'relative',
        backgroundColor: '#00000000', // if you don't do this, underline extends to end... (???)
    },
    selected: {
        backgroundColor: '#FFFFFF22'
    },
    header: {
        fontSize: 21,
        textAlign: 'right',
        color: '#FFFFFF',
        ...TypeFaces.regular,
    },
    icon: {
        flex: 1,
        width: '100%',
    },
    underline: {
        width: '100%',
        height: 2,
        backgroundColor: '#BA3737',
        position: 'absolute',
        bottom: 0,
        alignSelf: 'flex-end',
        justifyContent: 'flex-end'
    }
});

module.exports = PageIcon;
