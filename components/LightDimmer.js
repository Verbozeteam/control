/* @flow */

import * as React from 'react';
import PropTypes from 'prop-types';

const GenericSlider = require('../react-components/GenericSlider');

const connectionActions = require('../redux-objects/actions/connection');
const SocketCommunication = require('../lib/SocketCommunication');

import type { LayoutType } from '../config/flowtypes';

type StateType = {
    intensity: number,
};

type PropsType = {
    id: string,
    layout: LayoutType,
};

class LightDimmer extends React.Component<PropsType, StateType> {
    _unsubscribe: () => null = () => {return null;};

    state = {
        intensity: 0,
    };

    _dimmer_icon = require('../assets/images/dimmer.png');

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
        const { intensity } = this.state;
        const { id } = this.props;

        if (reduxState && reduxState.connection && reduxState.connection.thingStates) {
            const my_redux_state = reduxState.connection.thingStates[id];
            if (my_redux_state && my_redux_state.intensity != undefined && my_redux_state.intensity != intensity) {
                this.setState({intensity: my_redux_state.intensity});
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
        const { layout } = this.props;
        const { intensity } = this.state;

        return (
            <GenericSlider
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

LightDimmer.contextTypes = {
    store: PropTypes.object
};

module.exports = LightDimmer;
