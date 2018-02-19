/* @flow */

import * as React from 'react';
import PropTypes from 'prop-types';

import { DimmerSlider } from './DimmerSlider';

import { ConfigManager } from './ConfigManager';
import type { ThingStateType, ThingMetadataType } from './ConfigManager';

type StateType = {
    intensity: number,
};

type PropsType = {
    id: string,
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
        const { layout } = this.props;
        const { intensity } = this.state;

        return (
            <DimmerSlider
                width={layout.width}
                height={layout.height}
                value={intensity}
                maxValue={100}
                round={(value: number) => Math.round(value)}
                onChange={this.changeIntensity.bind(this)}
                glowColor={'#BA3737'} />
        );
    }
}

module.exports = LightDimmer;
