/* @flow */

import * as React from 'react';
import { View, Text, Dimensions, StyleSheet, Image } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

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
import WaterFountainsPanel from './WaterFountainsPanel';
import PenthouseDiscoPanel from './PenthouseDisco';
import AlarmsPanel from './AlarmsPanel';

import KitchenPanel from './KitchenPanel';

import FadeInView from './FadeInView';

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

function mapStateToProps(state) {
    return {
        discoveredDevices: state.connection.discoveredDevices,
        displayConfig: state.screen.displayConfig,
        language: state.settings.language
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

class PagingView extends React.Component<any, StateType> {
    _unsubscribe: () => any = () => null;

    state = {
        groups: [],
        currentPage: 0,
    };

    _pages : {[string]: PageType} = {
        group: {
            name: "Group",
            renderer: (index: number) => this.renderRoomView(index),
            getBackground: this.getGroupBackground.bind(this),
            is_pressable: true,
        },
        settings: {
            name: "Settings",
            height: 60,
            renderer: this.renderSettingsView.bind(this),
            getBackground: (index: number) => this._backgrounds.settings,
            is_pressable: true,
            longPress: () => this.context.store.dispatch(settingsActions.toggle_dev_mode()),
        },

        /** Custom device pages */
        external_device: {
            name: "External Device",
            renderer: this.renderExternalDevice.bind(this),
            is_pressable: true,
            getBackground: (index: number) => this._backgrounds.settings,
        },
    };

    _backgrounds = {
        'dimmers': require('../assets/images/room-lights.png'),
        'light_switches': require('../assets/images/bathroom-lights2.png'),
        'curtains': require('../assets/images/curtain_back.jpg'),
        'hotel_controls': require('../assets/images/services_stack.jpg'),
        'central_acs': require('../assets/images/thermostat_stack.jpg'),
        'honeywell_thermostat_t7560': require('../assets/images/thermostat_stack.jpg'),
        'alarm_system': require('../assets/images/alarms_background.jpg'),
        'settings': require('../assets/images/verboze_poster.jpg'),
    };

    _supportedExternalDeviceTypes: Array<number> = [6]; // 6 is kitchen

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
        const group = groups[index];

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
                    return  <LightsPanelContents things={things.filter(t => t.category === 'dimmers' || t.category === 'light_switches')} layout={layout} presets={group.presets} />;
                case 'hotel_controls':
                    return <HotelControlsPanelContents id={things.filter(t => t.category === 'hotel_controls')[0].id} layout={layout} />;
                case 'central_acs':
                case 'honeywell_thermostat_t7560':
                    return <CentralAC id={things.filter(t => t.category === 'central_acs' || t.category === 'honeywell_thermostat_t7560')[0].id} layout={layout} />;
                case 'curtains':
                    return <CurtainsPanelContents things={things.filter(t => t.category === 'curtains')} layout={layout} />;
                case 'water_fountains':
                    return <WaterFountainsPanel things={things} layout={layout} />;
                case 'penthouse_disco':
                    return <PenthouseDiscoPanel id={things.filter(t => t.category === 'penthouse_disco')[0].id} layout={layout} />
                case 'alarm_system':
                    return <AlarmsPanel id={things.filter(t => t.category === 'alarm_system')[0].id} layout={layout} />;
            }
        }
        return null;
    }

    renderRoomView(index: number, pageDesc: Object) {
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

    renderExternalDevice(index: number, pageDesc: Object) {
        const { discoveredDevices } = this.props;
        try {
            var device = discoveredDevices.filter(d => d.name === pageDesc.name)[0];
        } catch(e) { return null; }

        switch (device.type) {
            case 6: // kicthen
                return <KitchenPanel device={device} />
        }

        return null;
    }

    renderSettingsView(index: number, pageDesc: Object) {
        return <Settings />;
    }

    changePage(index: number) {
        return (() => {
            // to remove the discovery option incase it was open, when changing pages
            this.context.store.dispatch(settingsActions.set_dev_mode(false));
            var reduxState = this.context.store.getState();
            // dont change the page if the index didn't change or if we are in pagingLock
            if (this.state.currentPage != index && (!reduxState || !reduxState.screen || !reduxState.screen.pagingLock))
                this.setState({currentPage: index})
        }).bind(this);
    }

    render() {
        const { groups, currentPage } = this.state;
        const { displayConfig, discoveredDevices } = this.props;

        const screenDimensions = {
            width: Dimensions.get('screen').width,
            height: Dimensions.get('screen').height
        };

        var externalDevices = discoveredDevices.filter(d => this._supportedExternalDeviceTypes.indexOf(d.type) >= 0);

        // concat pages to result of group map to put settings tab at the bottom
        // [room tabs]
        // [   ...   ]
        // [external devices tabs]
        // [settings]
        var pages =
            ((groups||[]).map(group => {
                return {
                    ...this._pages.group,
                    ...{name: I18n.t(group.name)}
                };
            }))
            .concat(externalDevices.map(dev => {
                return {
                    ...this._pages.external_device,
                    ...{name: dev.name},
                };
            }))
            .concat([this._pages.settings]);

        var numFlexedIcons = pages.map(p => p.height ? 0 : 1).reduce((a, b) => a+b);
        var totalPresetHeight = pages.map(p => p.height || 0).reduce((a, b) => a+b);

        var page_icons = pages.map((page, i) =>
            <PageIcon key={"page-icon-"+page.name}
                name={page.name}
                iconName={(page.selectedIconName && currentPage == i) ? page.selectedIconName : page.iconName}
                selected={i == currentPage}
                changePage={page.is_pressable ? this.changePage(i).bind(this) : null}
                longPress={page.longPress}
                height={page.height || // if this page has a specified height, use it
                        (displayConfig.sidebar.iconHeight || // otherwise, use the height in the display config
                        ((screenDimensions.height-totalPresetHeight) / numFlexedIcons))} // if it doesn't exist, use page proportions (manual 'flex'ing)
            />
        );
        var bkg = pages[currentPage].getBackground(currentPage);

        if (displayConfig.sidebar.topIcon && displayConfig.sidebar.topIconHeight) { // add top icon if requested
            page_icons.splice(0, 0,
                <PageIcon key={"page-icon-top"}
                    iconName={displayConfig.sidebar.topIcon}
                    selected={false}
                    height={displayConfig.sidebar.topIconHeight}
                />
            );
        }

        if (displayConfig.sidebar.separator) { // add separator if requested
            page_icons.splice(page_icons.length-1, 0,
                <View key={"separator"} style={{marginTop: 4, marginBottom: 4, marginLeft: 20, width: 160, height: 1, backgroundColor: displayConfig.sidebar.textColor}}></View>);
        }

        return (
            <View style={[styles.container, displayConfig.backgroundColor ? {backgroundColor: displayConfig.backgroundColor} : null]}>
                {
                    displayConfig.backgroundColor ? null : // dont display image background if background color is specified
                    <FadeInView currentPage={currentPage}>
                        <Image
                            source={bkg}
                            style={[styles.content_container, screenDimensions]}
                        />
                    </FadeInView>
                }

                <View style={styles.content_container}>
                    {pages[currentPage].renderer(currentPage, pages[currentPage])}
                </View>


                <View style={[styles.sidebar_container,
                        displayConfig.sidebar.borderColor ? {borderRightColor: displayConfig.sidebar.borderColor, borderRightWidth: 1} : null]}>
                    <View style={[styles.content_container, {paddingLeft: 0}]}>
                        { displayConfig.sidebar.color ? /* flat sidebar color */
                            <View style={[screenDimensions, {backgroundColor: displayConfig.sidebar.color}]}>
                            </View>
                          :
                            <FadeInView currentPage={currentPage}>
                                <Image
                                    source={bkg}
                                    style={[screenDimensions, {opacity: 0.8}]}
                                    blurRadius={3}
                                    />
                            </FadeInView>
                        }
                    </View>
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

module.exports = connect(mapStateToProps, mapDispatchToProps) (PagingView);
