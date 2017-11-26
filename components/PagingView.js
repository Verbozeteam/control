/* @flow */

import * as React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const settingsActions = require ('../redux-objects/actions/settings');

import type { LayoutType, NameType } from '../config/flowtypes';

const PageIcon = require('./PageIcon');
const RoomGrid = require('./RoomGrid');
const Settings = require('./Settings');

type StateType = {
    currentPage: number,
};

type PageType = {
    name: string,
    iconName: string,
    longPress?: () => any,
    renderer: () => any,
};

class PagingView extends React.Component<any, StateType> {

    state = {
        currentPage: 0,
    };

    _pages : Array<PageType> = [{
        name: "Room",
        iconName: require('../assets/images/room.png'),
        renderer: this.renderRoomView.bind(this)
    }, {
        name: "Settings",
        iconName: require('../assets/images/cog.png'),
        longPress: (() => this.context.store.dispatch(settingsActions.toggle_dev_mode())).bind(this),
        renderer: this.renderSettingsView.bind(this)
    }];

    renderRoomView() {
        return <RoomGrid layout={{
            left: 0,
            top: 0,
            width: Dimensions.get('screen').width - 80,
            height: Dimensions.get('screen').height,
        }}/>;
    }

    renderSettingsView() {
        return <Settings />;
    }

    render() {
        var page_icons = this._pages.map((page, i) =>
            <PageIcon key={"page-icon-"+page.name}
                name={page.name}
                iconName={page.iconName}
                selected={i == this.state.currentPage}
                changePage={() => {if (this.state.currentPage != i) this.setState({currentPage: i})}}
                longPress={page.longPress}
            />
        );

        return (
            <View style={styles.container}>
                <View style={styles.sidebar_container}>
                    {page_icons}
                </View>
                <View style={styles.content_container}>
                    {this._pages[this.state.currentPage].renderer()}
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
