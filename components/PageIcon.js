/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const I18n = require('../i18n/i18n');

import type { LayoutType, NameType } from '../config/flowtypes';

type PropsType = {
    name: string,
    iconName?: string,
    selected: boolean,
    changePage: () => null,
    longPress: () => null
};

class PageIcon extends React.Component<PropsType> {
    static defaultProps = {
        longPress: () => null,
        selected: false
    };

    _icon = null;

    _onLongPress() {
        if (this.props.longPress)
            this.props.longPress();
    }

    componentWillMount() {
        if (this.props.iconName)
            this._icon = this.props.iconName;
    }

    render() {
        const { name, changePage, longPress, selected } = this.props;

        const selected_style = (selected) ? styles.selected : null;
        var title = this._icon ?
                <Image style={styles.icon}
                    resizeMode='contain'
                    source={this._icon}>
                </Image>
            :
                <Text style={styles.header}>
                    {I18n.t(name)}
                </Text>

        return (
            <TouchableOpacity onPressIn={changePage}
                delayLongPress={5000}
                onLongPress={this._onLongPress.bind(this)}
                style={[styles.container, selected_style]}>
                {title}
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#101010',
        flex: 1,
    },
    selected: {
        backgroundColor: '#1a1a1a'
    },
    header: {
        fontFamily: 'HKNova-MediumR',
        fontSize: 17,
        color: '#FFFFFF'
    },
    icon: {
        flex: 1,
        width: '100%',
    }
});

module.exports = PageIcon;
