/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet }
    from 'react-native';

const Panel = require('./Panel');

const LightDimmer = require('./LightDimmer.js');
const LightSwitch = require('./LightSwitch');

const I18n = require('../i18n/i18n');

import type { ViewType } from '../config/flowtypes';
import type { GenericThingType } from '../config/ConnectionTypes';

type PropsType = {
    things: Array<GenericThingType>,
    layout: Object,
    viewType: ViewType,
};

class LightsPanel extends React.Component<PropsType>  {
    renderDimmer(dimmer: GenericThingType) {
        const { viewType, layout } = this.props;

        var dimmer_name = <View></View>;
        var slider_width = layout.width - 20;
        var slider_height = 60;
        if (viewType == 'detail') {
            dimmer_name = <View style={dimmer_styles.name_container}><Text style={dimmer_styles.name}>{I18n.t(dimmer.name.en)}</Text></View>;
            slider_height = 90;
            slider_width *= (3/4);
        } else if (layout.height <= 300) {
            slider_width *= 0.5;
        }

        return <View
            key={dimmer.id+'-container'}
            style={dimmer_styles.container}>
            <LightDimmer
                key={dimmer.id}
                id={dimmer.id}
                layout={{width: slider_width, height: slider_height, top: 0, left: 0}}/>
            {dimmer_name}
        </View>;
    }

    renderLightSwitch(light_switch: GenericThingType) {
        const { viewType, layout } = this.props;

        var switch_name = null;

        if (viewType == 'detail') {
            switch_name = <Text style={switch_styles.name}>{I18n.t(light_switch.name.en)}</Text>;
        }

        return <View key={light_switch.id+'-container'}
            style={switch_styles.container}>
            {switch_name}
            <LightSwitch
                key={light_switch.id}
                id={light_switch.id}
                layout={viewType == 'detail' ? switch_styles.control : switch_styles.control_sm}
                viewType={viewType} />
        </View>;
    }

    render() {
        const { things, layout } = this.props;

        var dimmers = [];
        var switches = [];
        for (var i = 0; i < things.length; i++) {
            if (things[i].category === 'dimmers')
                dimmers.push(this.renderDimmer(things[i]));
            else
               switches.push(this.renderLightSwitch(things[i]));
        }

        if (layout.height > 300) {
            return (
                <View style={styles.container}>
                    {dimmers}
                    <View style={styles.switches_container}>
                        {switches}
                    </View>
                </View>
            );
        } else {
            return (
                <View style={styles.container_sm}>
                    {dimmers}
                    <View style={styles.switches_container_sm}>
                        {switches}
                    </View>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    container_sm: {
        flex: 1,
        flexDirection: 'row',
    },
    switches_container: {
        flexDirection: 'row',
        flex: 2,
    },
    switches_container_sm: {
        flexDirection: 'row',
        flex: 1,
    },
});

const dimmer_styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        flex: 1,
    },
    name_container: {
        marginLeft: 20,
        justifyContent: 'center',
        flex: 1,
    },
    name: {
        fontSize: 20,
        fontFamily: 'HKNova-MediumR',
        color: '#FFFFFF',
    },
});

const switch_styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flex: 1,
    },
    control: {
        margin: 50,
    },
    control_sm: {
        margin: 20,
    },
    name: {
        fontSize: 20,
        fontFamily: 'HKNova-MediumR',
        color: '#FFFFFF',
        textAlign: 'center',
    }
});

module.exports = LightsPanel;
