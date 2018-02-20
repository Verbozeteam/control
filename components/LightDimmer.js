/* @flow */

import * as React from 'react';
import PropTypes from 'prop-types';

import MagicSlider from '../react-components/MagicSlider';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../js-api-utils/ConfigManager';

type StateType = {
    intensity: number,
};

type PropsType = {
    id: string,
    width: number,
    height: number,
};

export default class LightDimmer extends React.Component<PropsType, StateType> {
    _unsubscribe: () => any = () => null;

    _glowColor = '#BA3737';

    state = {
        intensity: 0,
    };

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
        const { width, height } = this.props;
        const { intensity } = this.state;

        return (
            <MagicSlider
                width={width}
                height={height}
                value={intensity}
                maxValue={100}
                round={(value: number) => Math.round(value)}
                onChange={this.changeIntensity.bind(this)}
                glowColor={this._glowColor} />
        );
    }
};

