/* @flow */

import * as React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

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
                style={styles.button_container}>
                <Button onPress={close}
                    color={'#333333'}
                    title={I18n.t('Close')}></Button>
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
        height: 40,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        // backgroundColor: '#00FFFF'
    },
    name: {
        flex: 1,
        fontFamily: 'HKNova-MediumR',
        fontSize: 20,
        color: '#FFFFFF',
    },
    name_large: {
        flex: 1,
        fontFamily: 'HKNova-MediumR',
        fontSize: 32,
        color: '#FFFFFF'
    },
    button_container: {
        width: 70
    }
});

module.exports = PanelHeader;
