/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet }
    from 'react-native';

import PropTypes from 'prop-types';

const Panel = require('./Panel');

const LightDimmer = require('./LightDimmer');
const LightSwitch = require('./LightSwitch');
const PresetsSwitch = require('./PresetsSwitch');

const I18n = require('../i18n/i18n');

import type { ViewType } from '../config/flowtypes';
import type { GenericThingType } from '../config/ConnectionTypes';

const connectionActions = require('../redux-objects/actions/connection');
const SocketCommunication = require('../lib/SocketCommunication');

type StateType = {
    all_state: number,
};

type PropsType = {
    things: Array<GenericThingType>,
    layout: Object,
    viewType: ViewType,
    presets?: Array<Object>,
};

class LightsPanel extends React.Component<PropsType, StateType>  {
    state: StateType = {
        all_state: 1,
    };

    _unsubscribe: () => null = () => {return null;};

    componentWillMount() {
        const { store } = this.context;
        this._unsubscribe = store.subscribe(this.onReduxStateChanged.bind(this));
        this.onReduxStateChanged();
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    onReduxStateChanged() {
        const { store } = this.context;
        const reduxState = store.getState();

        if (reduxState && reduxState.connection && reduxState.connection.thingStates) {
            var is_on = 0;
            for (var t in reduxState.connection.thingStates) {
                var thing = reduxState.connection.thingStates[t];
                for (var i = 0; i < this.props.things.length; i++) {
                    if (this.props.things[i].id == t) {
                        if (thing.category === 'light_switches' || thing.category === 'dimmers') {
                            if (thing.intensity > 0)
                                is_on = 1;
                        }
                    }
                }
            }
            var total_update = {};
            if (is_on !== this.state.all_state)
                total_update.all_state = is_on;
            if (Object.keys(total_update).length > 0)
                this.setState(total_update);
        }
    }

    renderDimmer(dimmer: GenericThingType) {
        const { viewType, layout } = this.props;

        var dimmer_name = '';
        var slider_width = layout.width - 40;
        var slider_height = 60;
        if (viewType == 'detail') {
            dimmer_name = I18n.t(dimmer.name.en);
            slider_height = 90;
        } else if (layout.height <= 300) {
            slider_width *= 0.5;
        }

        return <View
            key={dimmer.id+'-container'}
            style={dimmer_styles.container}>
            <LightDimmer
                key={dimmer.id}
                id={dimmer.id}
                name={dimmer_name}
                layout={{width: slider_width - 130, height: slider_height, top: 0, left: 0}}/>
            <View style={{width: 130, marginLeft: 10,}}>
                <Text style={dimmer_styles.name}>{I18n.t(dimmer.name.en)}</Text>
            </View>
        </View>;
    }

    renderLightSwitch(light_switch: GenericThingType) {
        const { viewType, layout } = this.props;

        var switch_name = '';

        if (viewType == 'detail') {
            switch_name = I18n.t(light_switch.name.en);
        }

        return <View key={light_switch.id+'-container'}
            style={switch_styles.container}>
            <View key={light_switch.id+'-container-container'}
                style={switch_styles.container_container}>
                <LightSwitch
                    key={light_switch.id}
                    id={light_switch.id}
                    layout={{}}
                    viewType={viewType} />
                <Text key={light_switch.id+'-name'}
                    style={switch_styles.name}>
                    {switch_name}
                </Text>
            </View>
        </View>;
    }

    renderAllSwitch() {
        const { viewType, layout } = this.props;
        var switch_name = I18n.t('All');

        var on_switch = ((new_val) => {
            var total_change = {};
            for (var t = 0; t < this.props.things.length; t++) {
                var thing = this.props.things[t];
                var intensity = new_val === 0 ? 0 : thing.category === 'light_switches' ? 1 : 100;
                total_change[thing.id] = {intensity};
                SocketCommunication.sendMessage({thing: thing.id, intensity: intensity});
            }

            this.context.store.dispatch(connectionActions.set_things_partial_states(total_change));
        }).bind(this);

        return <View key={'all-switch-container'}
            style={switch_styles.container}>
            <View style={switch_styles.container_container}>
                <LightSwitch
                    id={null}
                    intensity={this.state.all_state}
                    onSwitch={on_switch}
                    layout={{}}
                    viewType={viewType} />
                <Text
                    style={switch_styles.name}>
                    {switch_name}
                </Text>
            </View>
        </View>;
    }

    dimmerHasSwitch(id: string): boolean {
        const { store } = this.context;
        const reduxState = store.getState();

        if (reduxState && reduxState.connection && reduxState.connection.thingStates && id in reduxState.connection.thingStates)
            return reduxState.connection.thingStates[id].has_switch;
        return false;
    }

    render() {
        const { things, layout, presets, viewType } = this.props;

        var dimmers = [];
        var switches = [];
        var dimmer_switches = [];
        for (var i = 0; i < things.length; i++) {
            if (things[i].category === 'dimmers') {
                dimmers.push(this.renderDimmer(things[i]));
                if (this.dimmerHasSwitch(things[i].id))
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
LightsPanel.contextTypes = {
    store: PropTypes.object
};

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
