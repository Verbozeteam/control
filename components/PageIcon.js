/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const I18n = require('../i18n/i18n');

import type { LayoutType, NameType } from '../config/flowtypes';

type PropsType = {
    layout: LayoutType,
    name: string,
    selected: boolean,
    changePage: () => null,
    longPress: () => null
};

class PageIcon extends React.Component<PropsType> {

    static defaultProps = {
        longPress: () => null,
        selected: false
    };

    _onLongPress() {
        console.log('_onLongPress');
        console.log(this);
        this.props.longPress();
    }

    render() {
        const { layout, name, changePage, longPress, selected } = this.props;

        const selected_style = (selected) ? styles.selected : null;

        return (
            <TouchableOpacity onPressIn={changePage}
                delayLongPress={5000}
                onLongPress={this._onLongPress.bind(this)}
                style={[layout, styles.container, selected_style]}>

                <Text style={styles.header}>
                    {I18n.t(name)}
                </Text>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#777777',
        borderRadius: 5,
    },
    selected: {
        backgroundColor: '#AAAAAA'
    },
    header: {
        fontFamily: 'HKNova-MediumR',
        fontSize: 17,
        color: '#FFFFFF'
    }
});

module.exports = PageIcon;
