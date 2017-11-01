/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';

const I18n = require('../i18n/i18n');

import type { LayoutType, NameType } from '../config/flowtypes';

type PropsType = {
    layout: LayoutType,
    name: string,
    changePage: () => null,
    longPress: () => null
};

class PageIcon extends React.Component<PropsType> {

    static defaultProps = {
        longPress: () => null
    };

    _onLongPress() {
        console.log('_onLongPress');
        console.log(this);
        this.props.longPress();
    }

    render() {
        const { layout, name, changePage, longPress } = this.props;

        return (
            <TouchableWithoutFeedback onPressIn={changePage}
                delayLongPress={5000}
                onLongPress={this._onLongPress.bind(this)}>
                <View style={[layout, styles.container]}>
                    <Text style={styles.header}>
                        {I18n.t(name)}
                    </Text>
                </View>
            </TouchableWithoutFeedback>
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
    header: {
        fontFamily: 'HKNova-MediumR',
        fontSize: 17,
        color: '#FFFFFF'
    }
});

module.exports = PageIcon;
