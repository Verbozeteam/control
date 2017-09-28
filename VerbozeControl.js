/* @flow */

import React, { Component } from 'react';
import {
    AppRegistry,
    DeviceEventEmitter,
    StyleSheet,
    Button,
    View,
    Text
} from 'react-native';

const config = require('./config/settings');

class VerbozeControl extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.header}>
                    Verboze Control
                </Text>
            </View>
        );
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF'
    },
    header: {
        fontSize: 40,
        textAlign: 'center'
    },
    text: {
        fontSize: 16,
        textAlign: 'center'
    }
});


module.exports = VerbozeControl;
