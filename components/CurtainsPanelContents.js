/* @flow */

import * as React from 'react';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Svg, { Rect, Polyline } from 'react-native-svg'
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../js-api-utils/ConfigManager';

import { TypeFaces } from '../constants/styles';

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

function mapStateToProps(state) {
    return {
        displayConfig: state.screen.displayConfig,
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

class CurtainsPanelContents extends React.Component<PropsType, StateType> {
    _unsubscribe: () => any = () => null;

    state: StateType = {
        curtains: {},
    };

    _icon: number = require('../assets/images/basic_ui/curtain.png');
    _icon_light: number = require('../assets/images/basic_ui/light_ui/curtain.png');

    _openIcon: number = require('../assets/images/open_arrow.png');
    _closeIcon: number = require('../assets/images/close_arrow.png');
    _pauseIcon: number = require('../assets/images/stop_button.png');

    // curtain-id -> time it was clicked
    _curtainClickTimes : {[string]: number} = {};
    _canCancelCurtain: {[string]: boolean} = {};

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
                    if (ConfigManager.things[curtains[i].id].curtain === value && this._canCancelCurtain[curtains[i].id]) // if the curtain was already moving, stop it
                        value = 0;
                    else // otherwise record time and do logic for holding/tapping
                        this._curtainClickTimes[curtains[i].id] = curTime;
                    this._canCancelCurtain[curtains[i].id] = false;
                } else { // ending the click, if too short, then let the curtain auto move
                    this._canCancelCurtain[curtains[i].id] = true;
                    if (curTime - this._curtainClickTimes[curtains[i].id] < 500) {
                        const c = curtains[i];
                        const v = value;
                        TimeoutHandler.createTimeout(
                            curtains[i].id,
                            curtains[i].max_move_time || 6000,
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
        var { things, displayConfig } = this.props;

        if (things.length === 0 || !things[0] || !ConfigManager.things || ConfigManager.things.length === 0)
            return <View><Text>{ things.length + ' - ' + JSON.stringify(ConfigManager.things) }</Text></View>;
        for (var i = 0; i < things.length; i++)
            if (!things[i] || !things[i].id || !(things[i].id in ConfigManager.things))
                return <View><Text>{ JSON.stringify(things[i]) + ' - ' + ConfigManager.things.length + ' - ' + JSON.stringify(ConfigManager.things)  }</Text></View>;

        var text = (!curtain ? "All" : curtain.name);
        var isOpening = curtain ? ConfigManager.things[curtain.id].curtain === 1 : things.map(t => ConfigManager.things[t.id].curtain === 1).reduce((a, b) => a && b);
        var isClosing = curtain ? ConfigManager.things[curtain.id].curtain === 2 : things.map(t => ConfigManager.things[t.id].curtain === 2).reduce((a, b) => a && b);
        var targetCurtains = curtain ? [curtain] : things;

        switch (displayConfig.UIStyle) {
            case 'modern':
                return (
                    <View key={"curtain-"+(curtain ? curtain.id : "all")} style={styles.curtainContainer}>
                        <View style={styles.controlsContainer}>
                            <MagicButton text={'Open'}
                                onPressIn={() => this.setCurtainValue(targetCurtains)(1)}
                                onPressOut={() => this.setCurtainValue(targetCurtains)(0)}
                                width={120}
                                height={70}
                                isOn={isOpening}
                                extraStyle={{marginRight: 10}}
                                textStyle={{fontSize: 16, ...TypeFaces.light, color: '#ffffff'}}
                                glowColor={displayConfig.accentColor} />

                            <MagicButton text={'Close'}
                                onPressIn={() => this.setCurtainValue(targetCurtains)(2)}
                                onPressOut={() => this.setCurtainValue(targetCurtains)(0)}
                                width={120}
                                height={70}
                                isOn={isClosing}
                                extraStyle={{marginRight: 10}}
                                textStyle={{fontSize: 16, ...TypeFaces.light, color: '#ffffff'}}
                                glowColor={displayConfig.accentColor} />

                            <MagicButton
                                width={70}
                                height={70}
                                sideText={I18n.t(text)}
                                sideTextStyle={[ styles.texts, {...TypeFaces.light}]}
                                textStyle={{fontSize: 16, ...TypeFaces.light, color: '#ffffff'}}
                                glowColor={displayConfig.accentColor}
                                onPressIn={() => this.setCurtainValue(targetCurtains)(0)}
                                iconStyle={{width: 20, height: 20}}
                                icon={this._pauseIcon} />
                        </View>
                    </View>
                );
            case 'simple':
                var up_color = isOpening ? displayConfig.accentColor : (displayConfig.lightUI ? 'white' : 'black');
                var down_color = isClosing ? displayConfig.accentColor : (displayConfig.lightUI ? 'white' : 'black');

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
                    <View key={'curtain-'+(curtain ? curtain.id : "all")} style={simpleStyles.curtainContainer}>
                        <View style={simpleStyles.curtainStack}>
                            <Image style={simpleStyles.icon}
                                fadeDuration={0}
                                resizeMode={'contain'}
                                source={displayConfig.lightUI ? this._icon_light : this._icon} />
                        </View>
                        <View style={simpleStyles.curtainStack}>
                            <TouchableWithoutFeedback
                                onPressIn={() => this.setCurtainValue(targetCurtains)(1)}
                                onPressOut={() => this.setCurtainValue(targetCurtains)(0)}>
                                    {up_arrow}
                            </TouchableWithoutFeedback>
                        </View>
                        <View style={simpleStyles.curtainStack}>
                            <TouchableWithoutFeedback
                                onPressIn={() => this.setCurtainValue(targetCurtains)(2)}
                                onPressOut={() => this.setCurtainValue(targetCurtains)(0)}>
                                    {down_arrow}
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                );
        }
    }

    renderSeparator(index: number) {
        return (
            <View key={"curtains-separator-"+index} style={styles.separatorContainer}>
                <View style={styles.separator} />
            </View>
        );
    }

    render() {
        var { layout, things, displayConfig } = this.props;
        var curtains = things.sort((a, b) => a.id < b.id ? -1 : (a.id === b.id ? 0 : 1));
        var numCurtains = curtains.length

        var allView = null;
        if (displayConfig.curtainsDisplayAllSwitch && numCurtains > 0) {
            allView = (
                <View style={styles.allContainer}>
                    {this.renderSeparator(0)}
                    {this.renderCurtainView(null)}
                </View>
            );
        }

        var thingsView = [];
        if (numCurtains > 0) {
            for (var i = 0; i < numCurtains; i++) {
                thingsView.push(this.renderCurtainView(curtains[i]));
            }
        }

        switch (displayConfig.UIStyle) {
            case 'modern':
                return (
                    <View style={styles.container}>
                        <View style={styles.tab}>
                            {thingsView}
                            {allView}
                        </View>
                        <View style={{flex:1}} />
                    </View>
                );
            case 'simple':
                return (
                    <View style={[styles.container, {width: layout.width, height: layout.height}]}>
                        {thingsView}
                    </View>
                );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        flexDirection: 'row',
    },
    tab: {
        flex: 2,
        flexDirection: 'column',
    },
    allContainer: {
        flex: 1,
    },
    curtainContainer: {
        flex: 1
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
        color: '#ffffff',
        fontSize: 22,
    },
    controlsContainer: {
        flexDirection: 'row',
    },
});

const simpleStyles = StyleSheet.create({
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

module.exports = connect(mapStateToProps, mapDispatchToProps) (CurtainsPanelContents);
