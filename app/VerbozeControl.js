/* @flow */

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    View,
    Text
} from 'react-native';

class VerbozeControl extends Component {
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
        textAlign: 'center',
    }
});


module.exports = VerbozeControl;
