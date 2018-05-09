/* @flow */

import * as React from 'react';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../js-api-utils/ConfigManager';

import type { DiscoveredDeviceType } from '../js-api-utils/ConnectionTypes';

import MagicButton from '../react-components/MagicButton';

import { TypeFaces } from '../constants/styles';

const I18n = require('../js-api-utils/i18n/i18n');
const SocketCommunication = require('../js-api-utils/SocketCommunication');

type PropsType = {
    displayConfig: Object,
    device: DiscoveredDeviceType,
};

type StateType = {
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

    componentWillMount() {
    }

    componentWillUnmount() {
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
