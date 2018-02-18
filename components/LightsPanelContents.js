/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import PropTypes from 'prop-types';

import { ConfigManager } from './ConfigManager';
import type { ThingStateType, ThingMetadataType, PresetType } from './ConfigManager';

const Panel = require('./Panel');

const LightDimmer = require('./LightDimmer');
const LightSwitch = require('./LightSwitch');
const PresetsSwitch = require('./PresetsSwitch');

const I18n = require('../i18n/i18n');

type StateType = {
    all_state: number,
};

type PropsType = {
    things: Array<ThingMetadataType>,
    layout: Object,
    presets?: Array<PresetType>,
};

class LightsPanel extends React.Component<PropsType, StateType>  {
    _unsubscribe1: () => null = () => null;
    _unsubscribe2: () => null = () => null;

    state: StateType = {
        all_state: 1,
    };

    componentWillMount() {
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(newProps: PropsType) {
        this._unsubscribe1();
        this._unsubscribe2();
        this._unsubscribe1 = ConfigManager.registerCategoryChangeCallback('light_switches', this.onLightsChanged.bind(this));
        this._unsubscribe2 = ConfigManager.registerCategoryChangeCallback('dimmers', this.onLightsChanged.bind(this));

        for (var i = 0; i < this.props.things.length; i++) {
            var tid = this.props.things[i].id;
            if (tid in ConfigManager.things)
                this.onLightsChanged(ConfigManager.thingMetas[tid], ConfigManager.things[tid]);
        }
    }

    componentWillUnmount() {
        this._unsubscribe1();
        this._unsubscribe2();
    }

    onLightsChanged(meta: ThingMetadataType, lightState: ThingStateType) {
        const { all_state } = this.state;
        const { things } = this.props;
        var my_ids = things.map(t => t.id);
        var is_on = 0;
        for (var i = 0; i < my_ids.length; i++) {
            if (my_ids[i] in ConfigManager.things && ConfigManager.things[my_ids[i]].intensity > 0) {
                is_on = 1;
            }
        }
        if (is_on !== all_state)
            this.setState({all_state: is_on});
    }

    renderDimmer(dimmer: ThingMetadataType) {
        const { layout } = this.props;

        var dimmer_name = I18n.t(dimmer.name);
        var slider_width = layout.width - 40;
        var slider_height = 90;

        return <View
            key={dimmer.id+'-container'}
            style={dimmer_styles.container}>
            <LightDimmer
                key={dimmer.id}
                id={dimmer.id}
                name={dimmer_name}
                layout={{width: slider_width - 130, height: slider_height, top: 0, left: 0}}/>
            <View style={{width: 130, marginLeft: 10,}}>
                <Text style={dimmer_styles.name}>{I18n.t(dimmer.name)}</Text>
            </View>
        </View>;
    }

    renderLightSwitch(light_switch: ThingMetadataType) {
        const { layout } = this.props;

        var switch_name = I18n.t(light_switch.name);

        return <View key={light_switch.id+'-container'}
            style={switch_styles.container}>
            <View key={light_switch.id+'-container-container'}
                style={switch_styles.container_container}>
                <LightSwitch
                    key={light_switch.id}
                    id={light_switch.id}
                    layout={{}} />
                <Text key={light_switch.id+'-name'}
                    style={switch_styles.name}>
                    {switch_name}
                </Text>
            </View>
        </View>;
    }

    renderAllSwitch() {
        const { layout } = this.props;
        var switch_name = I18n.t('All');

        var on_switch = ((new_val) => {
            var total_change = {};
            for (var t = 0; t < this.props.things.length; t++) {
                var thing = this.props.things[t];
                var intensity = new_val === 0 ? 0 : thing.category === 'light_switches' ? 1 : 100;
                total_change[thing.id] = {intensity};
            }
            ConfigManager.setThingsStates(total_change, true);
        }).bind(this);

        return <View key={'all-switch-container'}
            style={switch_styles.container}>
            <View style={switch_styles.container_container}>
                <LightSwitch
                    id={null}
                    intensity={this.state.all_state}
                    onSwitch={on_switch} />
                <Text
                    style={switch_styles.name}>
                    {switch_name}
                </Text>
            </View>
        </View>;
    }

    render() {
        const { things, layout, presets } = this.props;

        var dimmers = [];
        var switches = [];
        var dimmer_switches = [];
        for (var i = 0; i < things.length; i++) {
            if (things[i].category === 'dimmers') {
                dimmers.push(this.renderDimmer(things[i]));
                if (ConfigManager.thingMetas[things[i].id].has_switch)
                    dimmer_switches.push(this.renderLightSwitch(things[i]));
            } else
               switches.push(this.renderLightSwitch(things[i]));
        }

        switches = dimmer_switches.concat(switches);

        for (var i = switches.length; i < 4; i++)
            switches.push(<View style={switch_styles.container} key={"dummy-switch-"+i}></View>);

        switches.push(this.renderAllSwitch());

        return (
            <View style={styles.container}>
                <View style={styles.switches_container}>
                    {switches}
                </View>
                <View style={styles.dimmers_container}>
                    {dimmers}
                </View>
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
    dimmers_container: {
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
        marginLeft: 0,
        justifyContent: 'center',
        flex: 1,
    },
    name: {
        marginLeft: 20,
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

module.exports = LightsPanel;
