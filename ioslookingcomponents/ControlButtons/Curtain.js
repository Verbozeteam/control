/* @flow */

import * as React from 'react';

import PropTypes from 'prop-types';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import { ConfigManager } from '../../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../../js-api-utils/ConfigManager';

import Panel from './Panel';

import { TypeFaces } from '../../constants/styles';

const I18n = require('../../js-api-utils/i18n/i18n');
const { TimeoutHandler } = require('../../js-api-utils/TimeoutHandler');

type StateType = {
    curtain: number,
};

type PropsType = {
    id: ?string,
    name: string,
    open: boolean,
    displayConfig: Object,
};

function mapStateToProps(state) {
    return {
        displayConfig: state.screen.displayConfig,
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

class CurtainClass extends React.Component<PropsType, StateType> {
    _unsubscribe: () => any = () => null;

    state = {
        curtain: 0,
    };

    _icon: number = require('../../assets/images/basic_ui/curtain.png');

    _clickTime : number = 0;
    _canCancel: boolean = false;

    componentWillMount() {
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(newProps: PropsType) {
        this._unsubscribe();
        if (newProps.id) {
            this._unsubscribe = ConfigManager.registerThingStateChangeCallback(newProps.id, this.onCurtainChanged.bind(this));
            if (newProps.id && newProps.id in ConfigManager.things)
                this.onCurtainChanged(ConfigManager.thingMetas[newProps.id], ConfigManager.things[newProps.id]);
        }
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    onCurtainChanged(meta: ThingMetadataType, curtainState: ThingStateType) {
        const { curtain } = this.state;

        var total_change = {};
        if (curtainState.curtain !== curtain) {
            TimeoutHandler.clearTimeout(meta.id);
            total_change.curtain = curtainState.curtain;
        }

        if (Object.keys(total_change).length > 0)
            this.setState(total_change);
    }

    onPress(setValue: number) {
        const { id } = this.props;
        var   { curtain } = this.state;

        if (!id)
            return;

        const meta = ConfigManager.thingMetas[id];
        var curTime = (new Date()).getTime();
        var newCurtain = setValue;

        if (setValue !== 0) { // first click, record the time
            if (curtain === setValue && this._canCancel) // if the curtain was already moving, stop it
                newCurtain = 0;
            else // otherwise record time and do logic for holding/tapping
                this._clickTime = curTime;
            this._canCancel = false;
        } else { // ending the click, if too short, then let the curtain auto move
            this._canCancel = true;
            if (curTime - this._clickTime < 500) {
                TimeoutHandler.createTimeout(
                    id,
                    meta.max_move_time || 2000,
                    () => this.onPress(0)
                );
                return;
            }
        }

        if (newCurtain !== curtain)
            ConfigManager.setThingState(id, {curtain: newCurtain}, true);
    }

    render() {
        const { id, name, open, displayConfig } = this.props;
        const { curtain } = this.state;

        var isActive = (curtain === 1 && open || curtain === 2 && !open);
        var panelStyle = isActive ? {backgroundColor: '#FFFFFF'} : {backgroundColor: '#999999', opacity: 0.7};

        return (
            <Panel active={true} onPressIn={() => this.onPress(open ? 1 : 2)} onPressOut={() => this.onPress(0)}>
                <Image style={styles.icon} source={this._icon} />
                <View style={styles.texts}>
                    <Text style={[styles.name, {fontWeight: isActive ? 'bold' : 'normal'}]}>{I18n.t(name)}</Text>
                    <Text style={[styles.info, isActive ? {color: displayConfig.accentColor} : {}]}>{I18n.t(isActive ? (open ? "Opening" : "Closing") : (open ? "Open" : "Close"))}</Text>
                </View>
            </Panel>
        );
    }
};


const styles = StyleSheet.create({
    icon: {
        width: 40,
        height: 40,
    },
    texts: {
        position: 'absolute',
        left: 10,
        bottom: 10,
    },
    name: {
        color: '#000000',
        fontSize: 18,
        height: 46,
        ...TypeFaces.light,
    },
    info: {
        color: '#000000',
        fontSize: 18,
        ...TypeFaces.light,
    },
});

const Curtain = connect(mapStateToProps, mapDispatchToProps) (CurtainClass);
export default Curtain;
