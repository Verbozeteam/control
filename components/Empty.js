/* @flow */

import * as React from 'react';
import { View, StyleSheet } from 'react-native';

class Empty extends React.Component {

    render() {
        return (
            <View style={styles.container}></View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

module.exports = Empty;
