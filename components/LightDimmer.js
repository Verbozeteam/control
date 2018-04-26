/* @flow */

import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import MagicSlider from '../react-components/MagicSlider';
const GenericSliderSimple = require('../react-components/GenericSliderSimple');

import { TypeFaces } from '../constants/styles';

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

function mapStateToProps(state) {
    return {
        displayConfig: state.screen.displayConfig,
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

class LightDimmer extends React.Component<PropsType, StateType> {
    _unsubscribe: () => any = () => null;

    _dimmer_icon = require('../assets/images/basic_ui/dimmer.png');
    _dimmer_light_icon = require('../assets/images/basic_ui/light_ui/dimmer.png');

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
        const { width, height, displayConfig } = this.props;
        const { intensity } = this.state;

        switch (displayConfig.UIStyle) {
            case 'modern':
                return (
                    <MagicSlider
                        width={width}
                        height={height}
                        value={intensity}
                        extraStyle={{...TypeFaces.light}}
                        maxValue={100}
                        round={(value: number) => Math.round(value)}
                        onChange={this.changeIntensity.bind(this)}
                        glowColor={displayConfig.accentColor} />
                );
            case 'simple':
                var layout = {width, height};
                return (
                    <GenericSliderSimple
                        layout={layout}
                        icon={displayConfig.lightUI ? this._dimmer_light_icon : this._dimmer_icon}
                        value={intensity}
                        orientation={'horizontal'}
                        maximum={100}
                        minimum={0}
                        round={(value: number) => Math.round(value)}
                        onMove={this.changeIntensity.bind(this)}
                        onRelease={this.changeIntensity.bind(this)}
                        knobColor={displayConfig.lightUI ? 'white' : 'black'} />
                );
        }
    }
};

module.exports = connect(mapStateToProps, mapDispatchToProps) (LightDimmer);
