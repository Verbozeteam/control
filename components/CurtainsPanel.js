/* @flow */

import * as React from 'react';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Svg, { Rect, Polyline } from 'react-native-svg';
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
    curtainStates: {[string]: number},
};

class CurtainsPanel extends React.Component<PropsType, StateType> {
    _unsubscribe: () => null = () => null;

    _highlight: string = '#3B9FFF';
    _icon: number = require('../assets/images/curtain.png');
    _icon_light: number = require('../assets/images/light_ui/curtain.png');

    state = {
        is_light_ui: false,
        curtainStates: {},
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

            if (reduxState.screen.isLight !== is_light_ui)
                total_change.is_light_ui = reduxState.screen.isLight;

            if (Object.keys(total_change).length > 0)
                this.setState(total_change);
        }
    }

    setCurtainState(curtain: GenericThingType, state: number) {
        SocketCommunication.sendMessage({
            thing: curtain.id,
            curtain: state
        });
        this.context.store.dispatch(connectionActions.set_thing_partial_state(curtain.id, {curtain: state}));
        this.setState({curtainStates: {...this.state.curtainStates, ...{[curtain.id]: state}}});
    }

    renderCurtain(curtain: GenericThingType) {
        const { is_light_ui, curtainStates } = this.state;

        var myState = curtainStates[curtain.id] || 0;

        var up_color = myState == 1 ? this._highlight : (is_light_ui ? '#ffffff' : '#000000');
        var down_color = myState == 2 ? this._highlight : (is_light_ui ? '#ffffff' : '#000000');

        var up_arrow = (
            <Svg width={120} height={120}>
                <Rect x="0" y="0" width="120" height="120" fill={'rgba(0,0,0,0)'} strokeWidth="3" stroke={up_color} />
                <Polyline points="15,80 60,40 105,80" fill={'rgba(0,0,0,0)'} strokeWidth="2" stroke={up_color} />
            </Svg>
        );

        var down_arrow = (
            <Svg width={120} height={120}>
                <Rect x="0" y="0" width="120" height="120" fill={'rgba(0,0,0,0)'} strokeWidth="3" stroke={down_color} />
                <Polyline points="15,40 60,80 105,40" fill={'rgba(0,0,0,0)'} strokeWidth="2" stroke={down_color} />
            </Svg>
        );

        return (
            <View key={'curtain-'+curtain.id} style={styles.curtainContainer}>
                <View style={styles.curtainStack}>
                    <Image style={styles.icon}
                        fadeDuration={0}
                        resizeMode={'contain'}
                        source={is_light_ui ? this._icon_light : this._icon} />
                </View>
                <View style={styles.curtainStack}>
                    <TouchableWithoutFeedback
                        onPressIn={() => this.setCurtainState(curtain, 1)}
                        onPressOut={() => this.setCurtainState(curtain, 0)}>
                        {up_arrow}
                    </TouchableWithoutFeedback>
                </View>
                <View style={styles.curtainStack}>
                    <TouchableWithoutFeedback
                        onPressIn={() => this.setCurtainState(curtain, 2)}
                        onPressOut={() => this.setCurtainState(curtain, 0)}>
                        {down_arrow}
                    </TouchableWithoutFeedback>
                </View>
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
    },
    curtainStack: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 150,
        height: 150,
    },
});

module.exports = CurtainsPanel;
