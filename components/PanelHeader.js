/* @flow */

import * as React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

type PropsType = {
    name: string,
    close?: Function
};

class PanelHeader extends React.Component<PropsType> {

    render() {
        const { name, close } = this.props;

        var close_button = null;
        if (close) {
            close_button = <View style={styles.button_container}>
                <Button onPress={() => close()}
                    color={'#333333'}
                    title={'Close'}></Button>
            </View>;
        }

        return (
            <View style={styles.container}>
                <Text style={styles.name}>{name}</Text>
                {close_button}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        height: 40,
        flexDirection: 'row',
        // backgroundColor: '#00FFFF'
    },
    name: {
        flex: 1,
        fontFamily: 'HKNova-MediumR',
        fontSize: 20,
        color: '#FFFFFF'
    },
    button_container: {
        width: 70
    }
});

module.exports = PanelHeader;
