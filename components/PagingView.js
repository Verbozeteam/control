/* @flow */

import * as React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const settingsActions = require ('../redux-objects/actions/settings');

import type { LayoutType, NameType } from '../config/flowtypes';
import type { RoomType, ConfigType } from '../config/ConnectionTypes';

const I18n = require('../i18n/i18n');
const PageIcon = require('./PageIcon');
const RoomGrid = require('./RoomGrid');
const Settings = require('./Settings');

type StateType = {
    config: ConfigType,
    currentPage: number,
};

type PageType = {
    name: string,
    iconName: string,
    selectedIconName?: string,
    longPress?: () => any,
    renderer: (number) => any,
};

class PagingView extends React.Component<any, StateType> {
    _unsubscribe: () => null = () => {return null;};

    state = {
        config: null,
        currentPage: 0,
    };

    _pages : Array<PageType> = [{
        name: "Room",
        iconName: require('../assets/images/room.png'),
        selectedIconName: require('../assets/images/room_selected.png'),
        renderer: (index: number) => this.renderRoomView(index || 0)
    }, {
        name: "Settings",
        iconName: require('../assets/images/cog.png'),
        selectedIconName: require('../assets/images/cog_selected.png'),
        longPress: (() => this.context.store.dispatch(settingsActions.toggle_dev_mode())).bind(this),
        renderer: this.renderSettingsView.bind(this)
    }];

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
        const { config } = this.state;

        if (reduxState && reduxState.connection && reduxState.connection.config) {
            if (JSON.stringify(config) != JSON.stringify(reduxState.connection.config)) {
                this.setState({config: reduxState.connection.config, currentPage: 0});
            }
        }
    }

    renderRoomView(index: number) {
        var roomConfig: RoomType = null;
        if (this.state.config && this.state.config.rooms)
            roomConfig = this.state.config.rooms[index];

        return <RoomGrid
            key={'room-grid-' + index}
            layout={{
                left: 0,
                top: 0,
                width: Dimensions.get('screen').width - 80,
                height: Dimensions.get('screen').height,
            }}
            roomConfig={roomConfig}/>;
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
        const { config } = this.state;

        var pages = [];
        if (config && config.rooms && config.rooms.length > 0)
            pages = config.rooms.map((room) => {
                return {...this._pages[0], ...{name: I18n.t(room.name.en)}};
            });

        pages.push(this._pages[this._pages.length-1]);

        var page_icons = pages.map((page, i) =>
            <PageIcon key={"page-icon-"+page.name}
                name={page.name}
                iconName={(page.selectedIconName && this.state.currentPage == i) ? page.selectedIconName : page.iconName}
                selected={i == this.state.currentPage}
                changePage={this.changePage(i).bind(this)}
                longPress={page.longPress}
            />
        );

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
        width: 80,
        backgroundColor: '#222222',
    },
    content_container: {
        flex: 1,
        backgroundColor: '#1a1a1a'
    },
});

module.exports = PagingView;
