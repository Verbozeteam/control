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

    BACKGROUND_GRADIENT: Array<string>;

    constructor(props: PropsType) {
        super(props);

        this.BACKGROUND_GRADIENT = ['#333333', '#000000'];
    }

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
            <LinearGradient colors={spec.layout.gradient || this.BACKGROUND_GRADIENT}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
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
