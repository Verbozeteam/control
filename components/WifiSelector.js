/* @flow */

import React from 'react';
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import wifi from 'react-native-android-wifi';
import Dialog from 'react-native-dialog';

const connectionActions = require('../redux-objects/actions/connection');
const UserPreferences = require('../js-api-utils/UserPreferences');
const { SocketCommunication } = require('../js-api-utils/SocketCommunication');

import type { WifiItemType } from '../js-api-utils/ConnectionTypes';

function mapStateToProps(state) {
  return {
    targetSSID: state.connection.targetSSID,
    targetPassphrase: state.connection.targetPassphrase,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setTargetSSID: (ssid: string, passphrase: string) => {
      dispatch(connectionActions.set_target_ssid(ssid, passphrase));
    },
  };
}

type PropsType = {
  targetSSID: string,
  targetPassphrase: string,
  setTargetSSID: (ssid: string, passphrase: string) => null,
};

type StateType = {
  wifi_list: Array<WifiItemType>,
  current_ssid: string,
  selected_ssid: string,
  passphrase: string
};

class WifiSelector extends React.Component<PropsType, StateType> {
  _unsubscribe: () => null = () => {return null;};

  state: StateType = {
    wifi_list: [],
    current_ssid: '',
    selected_ssid: '',
    passphrase: ''
  };

  _refresh_interval = null;

  componentWillMount() {
    const { store } = this.context;
    this._unsubscribe = store.subscribe(() => {});
  }

  componentDidMount() {
    this.checkCurrentSSID();
    this.checkAvailableWifi();

    this._refresh_interval = setInterval(() => {
      this.checkCurrentSSID();
      this.checkAvailableWifi();
    }, 5000);
  }

  componentWillMount() {
    this._unsubscribe();
  }

  checkAvailableWifi() {
    wifi.loadWifiList((wifi_string_list) => {
      this.setState({
        wifi_list: JSON.parse(wifi_string_list)
      });
    }, (error) => {
      console.error(error);
    });
  }

  checkCurrentSSID() {
    wifi.getSSID((ssid) => {
      this.setState({
        current_ssid: ssid
      });
    });
  }

  setTargetSSID() {
    const { selected_ssid, passphrase } = this.state;
    const { setTargetSSID } = this.props;

    setTargetSSID(selected_ssid, passphrase);
    UserPreferences.save({
      wifi_ssid: selected_ssid,
      wifi_passphrase: passphrase
    });

    wifi.findAndConnect(selected_ssid, passphrase, () => null);

    this.setState({
      show_passphrase_dialog: false,
      selected_ssid: '',
      passphrase: ''
    });
  }

  renderWifiItem(item: {item: WifiItemType}) {
    const { targetSSID, setTargetSSID } = this.props;
    const { current_ssid } = this.state;

    return (
      <WifiListItem ssid={item.item.SSID}
        setWifi={(selected_ssid) => {
          this.setState({
            selected_ssid,
            show_passphrase_dialog: true
          });
        }}
        target={item.item.SSID == targetSSID}
        connected={item.item.SSID == current_ssid} />
    );
  }

  keyExtractor(wifi_item: WifiItemType, index: number): string {
    return wifi_item.SSID + '|' + wifi_item.BSSID
  }

  renderPassphraseDialog() {
    const { show_passphrase_dialog, selected_ssid } = this.state;

    return (
      <View>
        <Dialog.Container visible={show_passphrase_dialog}>
          <Dialog.Title>Enter passphrase</Dialog.Title>
          <Dialog.Description>
            {selected_ssid}
          </Dialog.Description>
          <Dialog.Input autoCapitalize={'none'}
            onChangeText={(passphrase) => {
              this.setState({
                passphrase
              });
          }}/>
          <Dialog.Button label={'Cancel'} onPress={() => {
            this.setState({
              show_passphrase_dialog: false,
              selected_ssid: '',
              passphrase: ''
            });
          }}/>
          <Dialog.Button label={'Connect'} onPress={() => {
            this.setTargetSSID()
          }}/>
        </Dialog.Container>
      </View>
    );
  }

  render() {
    const { wifi_list } = this.state;

    var wifi_flat_list = null;
    if (wifi_list.length > 0) {
      wifi_flat_list = <FlatList
        data={wifi_list}
        keyExtractor={this.keyExtractor}
        renderItem={this.renderWifiItem.bind(this)} />
    }

    return (
      <View style={styles.container}>
        <Text style={styles.header}>Wifi Selector</Text>
        {wifi_flat_list}
        {this.renderPassphraseDialog()}
      </View>
    );
  }
}


type WifiListItemPropsType = {
  ssid: string,
  setWifi: (ssid: string) => any,
  target: boolean,
  connected: boolean
};

class WifiListItem extends React.Component<WifiListItemPropsType> {

  render() {
    const { ssid, setWifi, target, connected } = this.props;

    return (
      <TouchableOpacity style={styles.list_item}
        onPress={() => setWifi(ssid)}>
        <Text style={[styles.list_item_text,
          (target) ? styles.target : null,
          (connected) ? styles.connected : null]}>
          {ssid + ((target) ? '    <<<' : '')}
        </Text>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 2
  },
  header: {
    fontFamily: 'HKNova-MediumR',
    color: 'white'
  },
  list_item: {
    height: 40,
    justifyContent: 'center'
  },
  list_item_text: {
    fontFamily: 'HKNova-MediumR',
    fontSize: 13,
    color: 'white'
  },
  connected: {
    color: 'green'
  },
  target: {
    fontWeight: 'bold'
  }
});

WifiSelector.contextTypes = {
  store: PropTypes.object
};

module.exports = connect(mapStateToProps, mapDispatchToProps) (WifiSelector);
