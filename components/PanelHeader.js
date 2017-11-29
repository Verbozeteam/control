/* @flow */

import * as React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const I18n = require('../i18n/i18n');

import type { ViewType } from '../config/flowtypes';

type PropsType = {
    name: string,
    viewType?: ViewType,
    close?: Function
};

class PanelHeader extends React.Component<PropsType> {

    static defaultProps = {
        viewType: 'present'
    }

    render() {
        const { name, close, viewType } = this.props;

        var header_text = <Text key={'panel-header-text'}
            style={viewType === 'collapsed' ?
            styles.name_large : styles.name}>
                {I18n.t(name)}
            </Text>;

        var close_button = null;
        if (close) {
            close_button = <View key={'panel-header-close-button'}
                hitSlop={{top: 50, bottom: 50, left: 50, right: 50}}
                onTouchStart={() => close()}>
                <Image style={styles.close_button}
                  source={require('../assets/images/close.png')} />
            </View>;
        }

        var header_items = [];
        header_items.push(header_text);
        header_items.push(close_button);

        if (I18n.r2l()) {
            header_items.reverse();
        }

        return (
            <View style={styles.container}>
                {header_items}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        marginBottom: 20,
    },
    name: {
        flex: 1,
        fontFamily: 'HKNova-MediumR',
        fontSize: 20,
        color: '#FFFFFF'
    },
    name_large: {
        flex: 1,
        fontFamily: 'HKNova-MediumR',
        fontSize: 32,
        color: '#FFFFFF'
    },
    close_button: {
      height: 35,
      width: 35,
    }
});

module.exports = PanelHeader;
