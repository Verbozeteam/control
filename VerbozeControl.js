/* @flow */

import * as React from 'react';
import { AppRegistry, StyleSheet, Platform } from 'react-native';

const config = require('./config/config');
const spec = require('./config/spec');

import LinearGradient from 'react-native-linear-gradient';
import Immersive from 'react-native-immersive';

const Grid = require('./components/Grid');

type PropsType = {};

class VerbozeControl extends React.Component<PropsType> {
    componentWillMount() {
        if (Platform.OS === 'android') {
            Immersive.on();
            Immersive.setImmersive(true);

            Immersive.addImmersiveListener(this.restoreImmersive);
        }
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            Immersive.removeImmersiveListener(this.restoreImmersive);
        }
    }

    restoreImmersive() {
        Immersive.on();
    }

    render() {
        return (
            <LinearGradient colors={['#56768F', '#0B2140']}
                style={styles.container}>
                <Grid grid={spec.grid}
                    detail={spec.detail}
                    layout={spec.layout} />
            </LinearGradient>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

module.exports = VerbozeControl;
