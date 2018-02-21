/* @flow */

import * as React from 'react';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../js-api-utils/ConfigManager';

import MagicButton from '../react-components/MagicButton';

const I18n = require('../js-api-utils/i18n/i18n');
const { TimeoutHandler } = require('../js-api-utils/TimeoutHandler');

type PropsType = {
    things: Array<ThingMetadataType>,
    layout: Object,
};

type StateType = {
    curtains: {[string]: Object},
};

export default class CurtainsPanelContents extends React.Component<PropsType, StateType> {
    _unsubscribe: () => any = () => null;

    state: StateType = {
        curtains: {},
    };

    _openIcon: number = require('../assets/images/open_arrow.png');
    _closeIcon: number = require('../assets/images/close_arrow.png');
    _pauseIcon: number = require('../assets/images/stop_button.png');

    _accentColor: string = "#BA3737";

    // curtain-id -> time it was clicked
    _curtainClickTimes : {[string]: number} = {};

    componentWillMount() {
        this._unsubscribe = ConfigManager.registerCategoryChangeCallback('curtains', this.onCurtainChanged.bind(this));
        for (var i = 0; i < this.props.things.length; i++) {
            var tid = this.props.things[i].id;
            this.state.curtains[tid] = {curtain: 0};
            if (tid in ConfigManager.things)
                this.onCurtainChanged(ConfigManager.thingMetas[tid], ConfigManager.things[tid]);
        }
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    onCurtainChanged(meta: ThingMetadataType, curtainState: ThingStateType) {
        const { curtains } = this.state;
        if (meta.id in curtains) {
            if (curtainState.curtain !== curtains[meta.id]) {
                TimeoutHandler.clearTimeout(meta.id);
                this.setState({curtains: {...curtains, ...{[meta.id]: {curtain: curtainState.curtain}}}});
            }
        }
    }

    setCurtainValue(curtains: Array<ThingMetadataType>) {
        return ((value: number) => {
            var totalUpdate = {};
            var curTime = (new Date()).getTime();
            for (var i = 0; i < curtains.length; i++) {
                if (value !== 0) { // first click, record the time
                    this._curtainClickTimes[curtains[i].id] = curTime;
                } else { // ending the click, if too short, then let the curtain auto move
                    if (curTime - this._curtainClickTimes[curtains[i].id] < 500) {
                        const c = curtains[i];
                        const v = value;
                        TimeoutHandler.createTimeout(
                            curtains[i].id,
                            curtains[i].max_move_time || 2000,
                            (() => this.setCurtainValue([c])(0)).bind(this));
                        continue; // don't perform the update on this curtain, auto update will do it
                    }
                }
                totalUpdate[curtains[i].id] = {curtain: value};
                this.state.curtains[curtains[i].id].curtain = value;
            }

            if (Object.keys(totalUpdate).length > 0) {
                this.forceUpdate();
                ConfigManager.setThingsStates(totalUpdate, true);
            }
        }).bind(this);
    }

    renderCurtainView(curtain: ?ThingMetadataType) {
        var { things } = this.props;
        var text = (!curtain ? "All" : curtain.name).toUpperCase();
        var isOpening = curtain ? curtain.curtain === 1 : things.map(t => t.curtain === 1).reduce((a, b) => a && b);
        var isClosing = curtain ? curtain.curtain === 2 : things.map(t => t.curtain === 2).reduce((a, b) => a && b);
        var targetCurtains = curtain ? [curtain] : things;

        return (
            <View key={"curtain-"+(curtain ? curtain.id : "all")} style={styles.curtainContainer}>
                <Text style={styles.texts}>{text}</Text>
                <View style={styles.controlsContainer}>
                    <MagicButton
                                 width={70}
                                 height={70}
                                 extraStyle={{marginLeft: 0}}
                                 isOn={isOpening}
                                 glowColor={this._accentColor}
                                 onPressIn={() => this.setCurtainValue(targetCurtains)(1)}
                                 onPressOut={() => this.setCurtainValue(targetCurtains)(0)}
                                 icon={this._openIcon} />
                    <MagicButton
                                 width={70}
                                 height={70}
                                 extraStyle={{marginLeft: 20}}
                                 glowColor={this._accentColor}
                                 onPressIn={() => this.setCurtainValue(targetCurtains)(0)}
                                 icon={this._pauseIcon} />
                    <MagicButton
                                 width={70}
                                 height={70}
                                 extraStyle={{marginLeft: 20}}
                                 isOn={isClosing}
                                 glowColor={this._accentColor}
                                 onPressIn={() => this.setCurtainValue(targetCurtains)(2)}
                                 onPressOut={() => this.setCurtainValue(targetCurtains)(0)}
                                 icon={this._closeIcon} />
                </View>
            </View>
        );
    }

    renderSeparator(index: number) {
        return (
            <View key={"curtains-separator-"+index} style={styles.separatorContainer}>
                <View style={styles.separator} />
            </View>
        );
    }

    render() {
        var { layout, things } = this.props;
        var curtains = things.sort((a, b) => a.id < b.id ? -1 : (a.id === b.id ? 0 : 1));
        var numCurtains = curtains.length

        var allView = null;
        if (numCurtains > 0) {
            allView = (
                <View style={styles.allContainer}>
                    {this.renderCurtainView(null)}
                </View>
            );
        }

        var thingsView = [];
        if (numCurtains > 0) {
            for (var i = 0; i < numCurtains; i++) {
                thingsView.push(this.renderCurtainView(curtains[i]));
                if (i !== numCurtains - 1)
                    thingsView.push(this.renderSeparator(i));
            }
        }

        return (
            <View style={[styles.container, {width: layout.width, height: layout.height}]}>
                <View style={styles.tab}>{allView}</View>
                <View style={{flex: 1}} />
                <View style={[styles.tab]}>{thingsView}</View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        flexDirection: 'row',
    },
    tab: {
        flex: 2,
        position: 'relative',
        flexDirection: 'column',
        alignItems: 'center',
    },
    allContainer: {
        flex: 1,
        position: 'absolute',
        bottom: 0,
    },
    curtainContainer: {
    },
    separatorContainer: {
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    separator: {
        height: 1,
        width: '80%',
        backgroundColor: '#444444',
    },
    texts: {
        fontWeight: '100',
        color: '#ffffff',
        fontSize: 22,
        marginLeft: 5,
    },
    controlsContainer: {
        flexDirection: 'row',
    },
});
