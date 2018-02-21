/* @flow */

import * as React from 'react';
import { View, Text, Dimensions, StyleSheet, Image } from 'react-native';
import PropTypes from 'prop-types';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { GroupType, ThingMetadataType, ConfigType } from '../js-api-utils/ConfigManager';
const settingsActions = require ('../redux-objects/actions/settings');

const I18n = require('../js-api-utils/i18n/i18n');
const PageIcon = require('./PageIcon');
const Settings = require('./Settings');

import Panel from './Panel';
import LightsPanelContents from './LightsPanelContents';
import HotelControlsPanelContents from './HotelControlsPanelContents';
import CentralAC from './CentralAC';
import CurtainsPanelContents from './CurtainsPanelContents';

type StateType = {
    groups: Array<GroupType>,
    currentPage: number,
};

type PageType = {
    name: string,
    iconName?: string,
    selectedIconName?: string,
    longPress?: () => any,
    renderer: (number) => any,
    height?: number,
    is_pressable?: boolean,
    getBackground: number => any,
};

class PagingView extends React.Component<any, StateType> {
    _unsubscribe: () => any = () => null;

    state = {
        groups: [],
        currentPage: 0,
    };

    _pages : {[string]: PageType} = {
        group: {
            name: "Group",
            renderer: (index: number) => this.renderRoomView(index-1),
            getBackground: this.getGroupBackground.bind(this),
            is_pressable: true,
            longPress: () => settingsActions.toggleDevMode(),
        },
        settings: {
            name: "Settings",
            height: 60,
            renderer: this.renderSettingsView.bind(this),
            getBackground: (index: number) => this._backgrounds.settings,
            is_pressable: true,
        },
    };

    _backgrounds = {
        'dimmers': require('../assets/images/lights_stack.jpg'),
        'light_switches': require('../assets/images/lights_stack.jpg'),
        'curtains': require('../assets/images/curtain_back.jpg'),
        'hotel_controls': require('../assets/images/services_stack.jpg'),
        'central_acs': require('../assets/images/thermostat_stack.jpg'),
        'settings': require('../assets/images/fituri.jpg'),
    };

    componentWillMount() {
        this._unsubscribe = ConfigManager.registerConfigChangeCallback(this.onConfigChanged.bind(this));
        if (ConfigManager.config)
            this.onConfigChanged(ConfigManager.config);
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    onConfigChanged(config: ConfigType) {
        const { groups } = this.state;

        if (config && config.rooms) {
            var newGroups = [];
            for (var r = 0; r < config.rooms.length; r++) {
                var room = config.rooms[r];
                newGroups = newGroups.concat(room.groups);
            }

            if (JSON.stringify(newGroups) != JSON.stringify(groups)) {
                this.setState({groups: newGroups, currentPage: 0});
            }
        }
    }

    getGroupBackground(index: number) {
        const { groups } = this.state;
        const group = groups[index-1];
        var things: Array<ThingMetadataType> = group.things.filter(t => t.category !== 'empty');
        if (things.length > 0)
            return this._backgrounds[things[0].category];
        return null;
    }

    renderGroupContents(group: GroupType, layout: Object) {
        var things: Array<ThingMetadataType> = group.things.filter(t => t.category !== 'empty');
        if (things.length > 0) {
            switch (things[0].category) {
                case 'dimmers':
                case 'light_switches':
                    return  <LightsPanelContents things={things} layout={layout} presets={group.presets} />;
                case 'hotel_controls':
                    return <HotelControlsPanelContents id={things[0].id} layout={layout} />;
                case 'central_acs':
                    return <CentralAC id={things[0].id} layout={layout} />;
                case 'curtains':
                    return <CurtainsPanelContents things={things} layout={layout} />;
            }
        }
        return null;
    }

    renderRoomView(index: number) {
        const { groups } = this.state;
        const group = groups[index];
        var layout = {
            left: 0,
            top: 0,
            width: Dimensions.get('screen').width - 200,
            height: Dimensions.get('screen').height,
        };
        var contentLayout = {
            left: 0,
            top: 0,
            width: Dimensions.get('screen').width - 200 - 40, // panel padding
            height: Dimensions.get('screen').height - 40, // panel padding
        };

        return (
            <Panel key={'group-' + index}
                name={I18n.t(group.name)}
                layout={layout}>
                {this.renderGroupContents(group, contentLayout)}
            </Panel>
        );
    }

    renderSettingsView(index: number) {
        return <Settings />;
    }

    changePage(index: number) {
        return (() => {
            var reduxState = this.context.store.getState();
            // dont change the page if the index didn't change or if we are in pagingLock
            if (this.state.currentPage != index && (!reduxState || !reduxState.screen || !reduxState.screen.pagingLock))
                this.setState({currentPage: index})
        }).bind(this);
    }

    render() {
        const { groups, currentPage } = this.state;

        const screenDimensions = {
            width: Dimensions.get('screen').width,
            height: Dimensions.get('screen').height
        };

        var pages = [this._pages.settings];
        if (groups && groups.length > 0) {
            pages = pages.concat(groups.map(group => {return {...this._pages.group, ...{name: I18n.t(group.name)}}}));
        }

        var numFlexedIcons = pages.map(p => p.height ? 0 : 1).reduce((a, b) => a+b);
        var totalPresetHeight = pages.map(p => p.height || 0).reduce((a, b) => a+b);

        var page_icons = pages.map((page, i) =>
            <PageIcon key={"page-icon-"+page.name}
                name={page.name}
                iconName={(page.selectedIconName && currentPage == i) ? page.selectedIconName : page.iconName}
                selected={i == currentPage}
                changePage={page.is_pressable ? this.changePage(i).bind(this) : null}
                longPress={page.longPress}
                height={page.height || (screenDimensions.height-totalPresetHeight) / numFlexedIcons}
            />
        );

        var bkg = pages[currentPage].getBackground(currentPage);

        return (
            <View style={styles.container}>
                <Image
                    source={bkg}
                    style={[styles.content_container, screenDimensions]}
                    />
                <View style={styles.content_container}>
                    {pages[currentPage].renderer(currentPage)}
                </View>
                <View style={styles.sidebar_container}>
                    <Image
                        source={bkg}
                        style={[styles.content_container, screenDimensions, {opacity: 0.8}]}
                        blurRadius={3}
                        />
                    {page_icons}
                </View>
            </View>
        );
    }
}
PagingView.contextTypes = {
    store: PropTypes.object
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    sidebar_container: {
        left: 0,
        top: 0,
        position: 'absolute',
        width: 200,
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#000000',
        borderRightWidth: 1,
        borderRightColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
    },
    content_container: {
        left: 0,
        top: 0,
        position: 'absolute',
        width: '100%',
        height: '100%',
        paddingLeft: 200,
    },
});

module.exports = PagingView;
