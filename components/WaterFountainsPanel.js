/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet }
    from 'react-native';

import PropTypes from 'prop-types';

import WaterFountain from './WaterFountain';

const I18n = require('../js-api-utils/i18n/i18n');

import type { ThingStateType, ThingMetadataType } from '../js-api-utils/ConfigManager';

type StateType = {
};

type PropsType = {
    things: Array<ThingMetadataType>,
    layout: Object,
};

class WaterFountainsPanel extends React.Component<PropsType, StateType>  {
    renderWaterFountain(water_fountain: ThingMetadataType) {
        const { layout } = this.props;

        var name = name = I18n.t(water_fountain.name);

        return <View key={water_fountain.id+'-container'}
            style={switch_styles.container}>
            <View key={water_fountain.id+'-container-container'}
                style={switch_styles.container_container}>
                <WaterFountain
                    key={water_fountain.id}
                    id={water_fountain.id} />
                <Text key={water_fountain.id+'-name'}
                    style={switch_styles.name}>
                    {name}
                </Text>
            </View>
        </View>;
    }

    render() {
        const { things, layout } = this.props;

        var fountainViews = things.map(t => this.renderWaterFountain(t));

        for (var i = things.length; i < 5; i++)
            fountainViews.push(<View key={"fountain-empty-"+i} style={switch_styles.container} />);

        return (
            <View style={styles.container}>
                <View style={styles.switches_container} />
                <View style={styles.switches_container_lg}>
                    {fountainViews}
                </View>
                <View style={styles.switches_container} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    switches_container: {
        flexDirection: 'row',
        flex: 1,
    },
    switches_container_lg: {
        flexDirection: 'row',
        flex: 2,
    },
});

const switch_styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flex: 1,
    },
    container_container: {
        flexDirection: 'column',
        flex: 1,
    },
    name: {
        fontSize: 20,
        marginTop: -50,
        fontFamily: 'HKNova-MediumR',
        color: '#FFFFFF',
        textAlign: 'center',
    }
});

module.exports = WaterFountainsPanel;