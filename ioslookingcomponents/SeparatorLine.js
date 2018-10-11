/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Colors } from '../constants/styles'


const SeparatorLine = () => (
    <View style={styles.separator_container}>
        <View style={styles.separator}></View>
    </View>
)

const styles = StyleSheet.create({
    separator_container: {
        width: '100%',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    separator: {
        width: '80%',
        height: 1,
        backgroundColor: Colors.gray,
    },
});

export default SeparatorLine;