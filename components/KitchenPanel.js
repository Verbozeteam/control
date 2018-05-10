/* @flow */

import * as React from 'react';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { ConfigManagerClass } from '../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../js-api-utils/ConfigManager';
import { SocketCommunicationClass } from '../js-api-utils/SocketCommunication';

import type { DiscoveredDeviceType } from '../js-api-utils/ConnectionTypes';

import MagicButton from '../react-components/MagicButton';

import { TypeFaces } from '../constants/styles';

const I18n = require('../js-api-utils/i18n/i18n');

type PropsType = {
    displayConfig: Object,
    device: DiscoveredDeviceType,
};

type OrderItemType = {
    id: number,
    name: string,
    status: number,
};

type StateType = {
    menu: Array<string>,
    orders: Array<OrderItemType>,
};

function mapStateToProps(state) {
    return {
        displayConfig: state.screen.displayConfig,
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

class KitchenPanel extends React.Component<PropsType, StateType> {
    state = {
    };

    KitchenSocketCommunication = null;
    KitchenConfigManager = null;

    componentWillMount() {
        this.createConnection();
    }

    componentWillUnmount() {
        this.destroyConnection();
    }

    createConnection() {
        const { device } = this.props;

        this.destroyConnection();
        this.KitchenSocketCommunication = new SocketCommunicationClass();
        this.KitchenConfigManager = new ConfigManagerClass();
        this.KitchenSocketCommunication.initialize(true);
        this.KitchenSocketCommunication.setOnConnected(this.handleSocketConnected.bind(this));
        this.KitchenSocketCommunication.setOnDisconnected(this.handleSocketDisconnected.bind(this));
        this.KitchenConfigManager.initialize(this.KitchenSocketCommunication); // this registers SocketCommunication.setOnMessage
        this.KitchenSocketCommunication.connect(device.ip, device.port);
    }

    destroyConnection() {
        if (this.KitchenSocketCommunication && this.KitchenConfigManager) {
            console.log("running cleanup...")
            this.KitchenSocketCommunication.cleanup();
            delete this.KitchenSocketCommunication;
            delete this.KitchenConfigManager;
        }
    }

    handleSocketConnected() {
        console.log("kitchen connected");
        if (this.KitchenSocketCommunication) {
            this.KitchenSocketCommunication.sendMessage({
                code: 0
            });
        }
    }

    handleSocketDisconnected() {
        console.log("kitchen disconnected");
        this.createConnection();
    }

    render() {
        const { displayConfig } = this.props;

        return (
            <View style={styles.container}>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
});

module.exports = connect(mapStateToProps, mapDispatchToProps) (KitchenPanel);
