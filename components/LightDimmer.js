/* @flow */

import * as React from 'react';
import PropTypes from 'prop-types';

const GenericSliderSimple = require('../react-components/GenericSliderSimple');

const connectionActions = require('../redux-objects/actions/connection');
const SocketCommunication = require('../lib/SocketCommunication');

import type { LayoutType } from '../config/flowtypes';

type StateType = {
    intensity: number,
    is_light_ui: boolean,
};

type PropsType = {
    id: string,
    name: string,
    layout: LayoutType,
};

class LightDimmer extends React.Component<PropsType, StateType> {
    _unsubscribe: () => null = () => {return null;};

    state = {
        intensity: 0,
        is_light_ui: false,
    };

    _dimmer_icon = require('../assets/images/dimmer.png');
    _dimmer_light_icon = require('../assets/images/light_ui/dimmer.png');

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
        const { intensity, is_light_ui } = this.state;
        const { id } = this.props;

        if (reduxState && reduxState.connection && reduxState.connection.thingStates && reduxState.screen) {
            const my_redux_state = reduxState.connection.thingStates[id];
            if (my_redux_state && my_redux_state.intensity != undefined && my_redux_state.intensity != intensity ||
                reduxState.screen.isLight !== is_light_ui) {
                this.setState({
                    intensity: my_redux_state.intensity,
                    is_light_ui: reduxState.screen.isLight,
                });
            }
        }
    }

    changeIntensity(intensity: number) {
        SocketCommunication.sendMessage({
            thing: this.props.id,
            intensity
        });
        this.context.store.dispatch(connectionActions.set_thing_partial_state(this.props.id, {intensity}));
    }

    render() {
        const { layout, name } = this.props;
        const { intensity, is_light_ui } = this.state;

        return (
            <GenericSliderSimple
                layout={layout}
                icon={is_light_ui ? this._dimmer_light_icon : this._dimmer_icon}
                value={intensity}
                orientation={'horizontal'}
                maximum={100}
                minimum={0}
                round={(value: number) => Math.round(value)}
                onMove={this.changeIntensity.bind(this)}
                onRelease={this.changeIntensity.bind(this)}
                knobColor={is_light_ui ? '#ffffff' : '#000000'} />
        );
    }
}

LightDimmer.contextTypes = {
    store: PropTypes.object
};

module.exports = LightDimmer;
