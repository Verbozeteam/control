/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType, PresetType } from '../js-api-utils/ConfigManager';

import { TypeFaces } from '../constants/styles';

const Panel = require('./Panel');

import LightSwitch from './LightSwitch';
import LightDimmer from './LightDimmer';

import SeparatorLine from './SeparatorLine';

const I18n = require('../js-api-utils/i18n/i18n');

type StateType = {
    all_state: number,
};

type PropsType = {
    things: Array<ThingMetadataType>,
    layout: Object,
    presets?: ?Array<PresetType>,
};

function mapStateToProps(state) {
    return {
        displayConfig: state.screen.displayConfig,
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

class LightsPanel extends React.Component<PropsType, StateType>  {
    _unsubscribe1: () => any = () => null;
    _unsubscribe2: () => any = () => null;

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
        const { layout, displayConfig } = this.props;

        var dimmer_name = I18n.t(dimmer.name);
        var slider_width = layout.width / 2 - 40;
        var slider_height = 90;

        switch (displayConfig.UIStyle) {
            case 'modern':
                return (
                    <View key={dimmer.id+'-dimmer-container'} style={styles.dimmer_container}>
                        <Text style={[styles.dimmer_name, {color: displayConfig.textColor}]}>{dimmer_name}</Text>
                        <LightDimmer
                            id={dimmer.id}
                            width={slider_width}
                            height={slider_height} />
                    </View>
                );
            case 'simple':
                slider_width = layout.width;
                return (
                    <View key={dimmer.id+'-dimmer-container'} style={simpleStyles.dimmer_container}>
                        <LightDimmer
                            id={dimmer.id}
                            width={slider_width - 130}
                            height={slider_height} />
                        <View style={{width: 130, marginLeft: 10, justifyContent: 'center', alignItems: 'center',}}>
                            <Text style={[styles.dimmer_name, {color: displayConfig.textColor, ...TypeFaces.regular}]}>{dimmer_name}</Text>
                        </View>
                    </View>
                );
        }
    }

    renderLightSwitch(light_switch: ThingMetadataType) {
        return <View style={styles.switch_container} key={light_switch.id}>
            <LightSwitch id={light_switch.id}/>
        </View>;
    }

    renderAllSwitch() {
        var on_switch = ((new_val) => {
            var total_change = {};
            for (var t = 0; t < this.props.things.length; t++) {
                var thing = this.props.things[t];
                var intensity = new_val === 0 ? 0 : thing.category === 'light_switches' ? 1 : 100;
                total_change[thing.id] = {intensity};
            }
            ConfigManager.setThingsStates(total_change, true);
        }).bind(this);

        return (
            <View style={styles.all_switch_container} key={"all-switch"}>
                <LightSwitch
                    id={null}
                    intensity={this.state.all_state}
                    onSwitch={on_switch} />
            </View>
        );
    }

    render() {
        const { things, layout, presets, displayConfig } = this.props;

        var dimmers = [];
        var switches = [];
        var dimmer_switches = [];
        for (var i = 0; i < things.length; i++) {
            if (things[i].category === 'dimmers') {
                dimmers.push(this.renderDimmer(things[i]));
                if (ConfigManager.thingMetas[things[i].id].has_switch)
                    dimmer_switches.push(this.renderLightSwitch(things[i]));
            } else if (things[i].category === 'light_switches')
                switches.push(this.renderLightSwitch(things[i]));
        }

        switch (displayConfig.UIStyle) {
            case 'modern':
                var total_left_flex = 4 * (switches.length + dimmer_switches.length) + 6 * (dimmers.length);
                var filler = dimmers.length > 0 ? <View style={{flex: total_left_flex-3}}></View> : <View style={{flex: total_left_flex-4}}></View>;

                return (
                    <View style={styles.container}>
                        <View style={styles.controls_container}>
                            {dimmers}
                            {dimmer_switches}
                            {dimmers.length > 0 ? <SeparatorLine /> : null}
                            {switches}
                        </View>
                        <View style={styles.controls_container}>
                            {filler}
                            {this.renderAllSwitch()}
                        </View>
                    </View>
                );
            case 'simple':
                switches = dimmer_switches.concat(switches)
                switches = [
                    switches.length > 0 ? switches[0] : <View style={styles.switch_container} key={'light-filler-0'} />,
                    switches.length > 1 ? switches[1] : <View style={styles.switch_container} key={'light-filler-1'} />,
                    switches.length > 2 ? switches[2] : <View style={styles.switch_container} key={'light-filler-2'} />,
                    switches.length > 3 ? switches[3] : <View style={styles.switch_container} key={'light-filler-3'} />,
                    this.renderAllSwitch(),
                ];

                return (
                    <View style={simpleStyles.container}>
                        <View style={simpleStyles.switches_container}>
                            {switches}
                        </View>
                        <View style={simpleStyles.dimmers_container}>
                            {dimmers}
                        </View>
                    </View>
                );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    controls_container: {
        flexDirection: 'column',
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    switch_container: {
        flex: 4,
        justifyContent: 'center',
    },
    dimmer_container: {
        flex: 6,
        justifyContent: 'center',
        flexDirection: 'column',
    },
    dimmer_name: {
        color: '#FFFFFF',
        fontSize: 20,
        ...TypeFaces.light
    },
    all_switch_container: {
        flex: 4,
        justifyContent: 'center',
        flexDirection: 'column',
    },
});

const simpleStyles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    switches_container: {
        flexDirection: 'row',
        flex: 1,
    },
    dimmers_container: {
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dimmer_container: {
        flexDirection: 'row',
    },
});

module.exports = connect(mapStateToProps, mapDispatchToProps) (LightsPanel);
