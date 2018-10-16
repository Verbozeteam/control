/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet, DeviceEventEmitter } from 'react-native';
import PropTypes from 'prop-types';

const UserPreferences = require('../js-api-utils/UserPreferences');

import { connect } from 'react-redux';

function mapStateToProps(state) {
    return {
        connectionStatus: state.connection.isConnected,
    };
}

class ConnectionStatus extends React.Component<any> {
    _unsubscribe: () => null = () => {return null;};

    componentWillMount() {
        const { store } = this.context;
        this._unsubscribe = store.subscribe(() => {});
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    render() {
        if (this.props.connectionStatus == true) // connected, don't render anything
            return <View></View>

        var color = {backgroundColor: '#ff0000'};
        return (
            <View style={[color, styles.container]}>
            </View>
        );
    }
}

ConnectionStatus.contextTypes = {
    store: PropTypes.object
};

const styles = StyleSheet.create({
    container: {
        margin: 0,
        padding: 0,
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        right: 3,
        bottom: 3,
    },
});

module.exports = connect(mapStateToProps) (ConnectionStatus);