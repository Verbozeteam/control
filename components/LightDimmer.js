/* @flow */

import * as React from 'react';
import PropTypes from 'prop-types';

const GenericSliderSimple = require('../react-components/GenericSliderSimple');

import { ConfigManager } from './ConfigManager';
import type { ThingStateType, ThingMetadataType } from './ConfigManager';

type StateType = {
    intensity: number,
};

type PropsType = {
    id: string,
    name: string,
    layout: Object,
};

class LightDimmer extends React.Component<PropsType, StateType> {
    _unsubscribe: () => null = () => null;

    state = {
        intensity: 0,
    };

    _dimmer_icon = require('../assets/images/dimmer.png');

    componentWillMount() {
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(newProps: PropsType) {
        this._unsubscribe();
        if (newProps.id) {
            this._unsubscribe = ConfigManager.registerThingStateChangeCallback(newProps.id, this.onLightChanged.bind(this));
            if (newProps.id && newProps.id in ConfigManager.things)
                this.onLightChanged(ConfigManager.thingMetas[newProps.id], ConfigManager.things[newProps.id]);
        }
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    onLightChanged(meta: ThingMetadataType, lightState: ThingStateType) {
        const { intensity } = this.state;

        if (lightState.intensity !== intensity)
            this.setState({intensity: lightState.intensity});
    }

    changeIntensity(intensity: number) {
        ConfigManager.setThingState(this.props.id, {intensity}, true);
    }

    render() {
        const { layout, name } = this.props;
        const { intensity } = this.state;

        return (
            <GenericSliderSimple
                layout={layout}
                icon={this._dimmer_icon}
                value={intensity}
                orientation={'horizontal'}
                maximum={100}
                minimum={0}
                round={(value: number) => Math.round(value)}
                onMove={this.changeIntensity.bind(this)}
                onRelease={this.changeIntensity.bind(this)} />
        );
    }
}

module.exports = LightDimmer;
