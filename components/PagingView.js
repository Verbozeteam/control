/* @flow */

import * as React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const settingsActions = require ('../redux-objects/actions/settings');

import type { LayoutType, NameType } from '../config/flowtypes';
import type { RoomType, PanelType, GenericThingType } from '../config/ConnectionTypes';

const I18n = require('../i18n/i18n');
const PageIcon = require('./PageIcon');
const Settings = require('./Settings');

const Panel = require('./Panel');
const LightsPanelContents = require('./LightsPanelContents');
const HotelControlsPanelContents = require('./HotelControlsPanelContents');
const CentralAC = require('./CentralAC');
const WaterFountainsPanel = require('./WaterFountainsPanel');
const CurtainsPanel = require('./CurtainsPanel');

type StateType = {
    panels: Array<PanelType>,
    currentPage: number,
    is_light_ui: boolean,
};

type PageType = {
    name: string,
    iconName?: number,
    selectedIconName?: number,
    iconNameLight?: number,
    longPress?: () => any,
    renderer: (number) => any,
    height: number
};

class PagingView extends React.Component<any, StateType> {
    _unsubscribe: () => null = () => null;

    state = {
        panels: [],
        currentPage: 0,
        is_light_ui: false,
    };

    _pages : {[string]: PageType} = {
        panel: {
            name: "Panel",
            height: 60,
            renderer: (index: number) => this.renderRoomView(index-1),
            is_pressable: true,
        },
        settings: {
            name: "Admin Settings",
            iconName: require('../assets/images/iconhome.png'),
            selectedIconName: require('../assets/images/iconhome.png'),
            iconNameLight: require('../assets/images/light_ui/iconhome.png'),
            height: 200,
            longPress: (() => {
                this.changePage(0);
                this.context.store.dispatch(settingsActions.toggle_dev_mode());
            }).bind(this),
            renderer: this.renderSettingsView.bind(this),
            is_pressable: false,
        },
        user_settings: {
            name: "Settings",
            height: 60,
            renderer: ((i: number) => {
                this.context.store.dispatch(settingsActions.set_dev_mode(false));
                return this.renderSettingsView(i);
            }).bind(this),
            is_pressable: true,
        }
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
        const { panels, is_light_ui } = this.state;

        if (reduxState && reduxState.connection && reduxState.connection.config && reduxState.connection.config.rooms) {
            var reduxConfig = reduxState.connection.config;
            var reduxPanels = [];
            for (var r = 0; r < reduxConfig.rooms.length; r++) {
                var room = reduxConfig.rooms[r];
                for (var g = 0; g < room.grid.length; g++) {
                    var grid = room.grid[g];
                    for (var p = 0; p < grid.panels.length; p++) {
                        var panel = grid.panels[p];
                        reduxPanels.push(panel);
                    }
                }
            }

            if (JSON.stringify(reduxPanels) != JSON.stringify(panels)) {
                this.setState({panels: reduxPanels, currentPage: 0});
            }
            if (is_light_ui !== reduxState.screen.isLight)
                this.setState({is_light_ui: reduxState.screen.isLight});
        }
    }

    renderPanelContents(panel: PanelType, layout: Object) {
        var things: Array<GenericThingType> = panel.things.filter(t => t.category !== 'empty');
        if (things.length > 0) {
            switch (things[0].category) {
                case 'dimmers':
                case 'light_switches':
                    return  <LightsPanelContents
                        viewType={'detail'}
                        things={things}
                        layout={layout}
                        presets={panel.presets}/>;
                case 'hotel_controls':
                    return <HotelControlsPanelContents
                        id={things[0].id}
                        viewType={'detail'}/>;
                case 'central_acs':
                    return <CentralAC
                        id={things[0].id}
                        layout={layout}
                        viewType={'detail'}/>;
                case 'water_fountains':
                    return <WaterFountainsPanel
                        things={things}
                        layout={layout}
                        viewType={'detail'}/>;
                case 'curtains':
                    return <CurtainsPanel
                        things={things}
                        layout={layout}
                        viewType={'detail'}/>;
            }
        }
        return null;
    }

    renderRoomView(index: number) {
        const { panels } = this.state;
        const panel = panels[index];
        var layout = {
            left: 0,
            top: 0,
            width: Dimensions.get('screen').width - 200,
            height: Dimensions.get('screen').height,
        };

        return (
            <Panel key={'panel-' + index}
                name={I18n.t(panel.name.en)}
                layout={layout}
                viewType={'detail'}>
                {this.renderPanelContents(panel, layout)}
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
        const { panels, is_light_ui } = this.state;

        var pages = [this._pages.settings];
        if (panels && panels.length > 0) {
            pages = pages.concat(panels.map(panel => {return {...this._pages.panel, ...{name: I18n.t(panel.name.en)}}}));
        }
        pages.push(this._pages.user_settings);

        var page_icons = pages.map((page, i) =>
            <PageIcon key={"page-icon-"+page.name}
                name={page.name}
                iconName={(page.selectedIconName && this.state.currentPage == i) ? page.selectedIconName : (is_light_ui && page.iconNameLight ? page.iconNameLight : page.iconName)}
                selected={i == this.state.currentPage}
                changePage={page.is_pressable ? this.changePage(i).bind(this) : null}
                longPress={page.longPress}
                height={page.height}
            />
        );

        page_icons.splice(page_icons.length - 1, 0, <View key={"separator"} style={{marginTop: 4, marginBottom: 4, marginLeft: 20, width: 160, height: 1, backgroundColor: 'white'}}></View>);

        return (
            <View style={styles.container}>
                <View style={styles.sidebar_container}>
                    {page_icons}
                </View>
                <View style={styles.content_container}>
                    {pages[this.state.currentPage].renderer(this.state.currentPage)}
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
        flexDirection: 'row',
    },
    sidebar_container: {
        width: 200,
        backgroundColor: '#3B9FFF',
    },
    content_container: {
        flex: 1,
        backgroundColor: '#666666'
    },
});

module.exports = PagingView;
