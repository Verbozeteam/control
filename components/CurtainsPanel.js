/* @flow */

import * as React from 'react';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet }
    from 'react-native';
import PropTypes from 'prop-types';
const connectionActions = require('../redux-objects/actions/connection');
const SocketCommunication = require('../lib/SocketCommunication');

import type { ViewType } from '../config/flowtypes';
import type { GenericThingType } from '../config/ConnectionTypes';

const I18n = require('../i18n/i18n');

type PropsType = {
    things: Array<GenericThingType>,
    viewType: ViewType,
};

type StateType = {
    is_light_ui: boolean,
};

class CurtainsPanel extends React.Component<PropsType, StateType> {
    _unsubscribe: () => null = () => null;

    state = {
        is_light_ui: false,
    };

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
        const { is_light_ui } = this.state;
        const { things } = this.props;

        if (reduxState && reduxState.connection && reduxState.connection.thingStates && reduxState.screen) {
            var total_change = {};
            const my_redux_state = reduxState.connection.thingStates[id];

            if (reduxState.screen.isLight !== is_light_ui)
                total_change.is_light_ui = reduxState.screen.isLight;

            if (Object.keys(total_change).length > 0)
                this.setState(total_change);
        }
    }

    renderCurtain(curtain: GenericThingType) {
        return (
            <View style={styles.curtainContainer}>
            </View>
        );
    }

    render() {
        const { viewType, things } = this.props;

        return (
            <View style={styles.container}>
                {things.map(t => this.renderCurtain(t))}
            </View>
        );
    }
}
CurtainsPanel.contextTypes = {
    store: PropTypes.object
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    curtainContainer: {
        flexDirection: 'column',
        height: '100%',
        width: 150,
    }
});

module.exports = CurtainsPanel;
