/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type PropsType = {};
type StateType = {};

class Loading extends React.Component<PropsType, StateType> {
    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.header}>
                    Loading...
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000'
    },
    header: {
        fontFamily: 'HKNova-MediumR',
        fontSize: 20,
        color: '#FFFFFF'
    }
});

module.exports = Loading;
