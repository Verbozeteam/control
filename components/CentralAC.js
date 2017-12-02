/* @flow */

import * as React from 'react';
import PropTypes from 'prop-types';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import type { LayoutType, ViewType } from '../config/flowtypes';

const GenericCircularSlider = require('../react-components/GenericCircularSlider');
const GenericToggle = require('../react-components/GenericToggle');
const GenericButton = require('../react-components/GenericButton');

const connectionActions = require('../redux-objects/actions/connection');
const SocketCommunication = require('../lib/SocketCommunication');

const I18n = require('../i18n/i18n');

type StateType = {
    set_pt: number,
    temp: number,
    fan: number,
};

type PropsType = {
    id: string,
    layout: LayoutType,
    viewType: ViewType,
};

class CentralAC extends React.Component<PropsType, StateType> {
  _unsubscribe: () => null = () => {return null;};

  state = {
      set_pt: 0,
      temp: 0,
      fan: 0,
  };

  _fan_speeds = [
      I18n.t('Off'),
      I18n.t('Low'),
      I18n.t('High')
  ];

  _fan_icon = require('../assets/images/fan.png');

  _fan_actions = [
      () => this.changeFan(0),
      () => this.changeFan(1),
      () => this.changeFan(2)
  ];

  _max_temp: number = 30;
  _min_temp: number = 16;

  componentWillMount() {
    const { store }= this.context;
    this._unsubscribe = store.subscribe(this.onReduxStateChanged.bind(this));
    this.onReduxStateChanged();
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  onReduxStateChanged() {
      const { store } = this.context;
      const reduxState = store.getState();
      const { set_pt, temp, fan } = this.state;
      const { id } = this.props;

      if (reduxState && reduxState.connection && reduxState.connection.thingStates) {
          const my_redux_state = reduxState.connection.thingStates[id];
          if (my_redux_state &&
              ((my_redux_state.set_pt != undefined && my_redux_state.set_pt != set_pt) ||
               (my_redux_state.temp != undefined && my_redux_state.temp != temp) ||
               (my_redux_state.fan != undefined && my_redux_state.fan != fan))) {
              this.setState({
                  set_pt: my_redux_state.set_pt,
                  temp: my_redux_state.temp,
                  fan: my_redux_state.fan,
              });
          }
      }
  }

  round(value: number) {
    return (Math.round(value * 2) / 2);
  }

  changeTemperature(send_socket: boolean) {
      return ((new_set_pt: number) => {
          if (send_socket) {
              SocketCommunication.sendMessage({
                  thing: this.props.id,
                  set_pt: new_set_pt,
              });
          }
          this.context.store.dispatch(connectionActions.set_thing_partial_state(this.props.id, {set_pt: new_set_pt}));
      }).bind(this);
  }

  changeFan(speed: number) {
      SocketCommunication.sendMessage({
          thing: this.props.id,
          fan: speed,
      });
      this.context.store.dispatch(connectionActions.set_thing_partial_state(this.props.id, {fan: speed}));
  }

  render() {
    const { id, layout, viewType } = this.props;
    const { set_pt, temp, fan } = this.state;

    var slider = null;
    var toggles = null;
    var center_text_main = '';
    var center_text_sub = '';
    var room_temp_text = ' ';
    var hiding_style = {};
    var presentation_style = {};

    if (viewType === 'detail') {

      if (fan) {
        center_text_main = set_pt.toFixed(1) + '°C';
        center_text_sub = I18n.t('Set Temperature');
      } else {
        center_text_main = I18n.t('Off');
      }

      room_temp_text = I18n.t('Room Temperature') + ' ' + temp.toFixed(1) + '°C';

      slider = (
        <GenericCircularSlider value={set_pt}
          minimum={this._min_temp} maximum={this._max_temp}
          round={this.round.bind(this)}
          onMove={this.changeTemperature(false).bind(this)}
          onRelease={this.changeTemperature(true).bind(this)}
          diameter={layout.height / 1.5}
          disabled={fan === 0} />
      );

      toggles = (
        <GenericToggle values={this._fan_speeds}
          icon={this._fan_icon}
          layout={{height: 80, width: 350}}
          actions={this._fan_actions}
          selected={fan} />
      );
    }

    else {
      hiding_style = {
        display: 'none'
      };

      center_text_main = temp.toFixed(1) + '°C';
      center_text_sub = I18n.t('Room Temperature');

      presentation_style = {
        paddingTop: 80
      };
    }

    return (
      <View style={styles.container}>
        <View>
          {slider}
        </View>

        <View>
          {toggles}
        </View>

        <Text style={styles.room_temperature}>
          {room_temp_text}
        </Text>

        <View style={styles.minus_container}>
          <GenericButton
            disabled={fan === 0 || set_pt == this._min_temp}
            icon={require('../assets/images/minus.png')}
            style={hiding_style}
            action={() => {
              this.changeTemperature(true)(Math.max(this._min_temp, this.state.set_pt - 0.5))
            }} />
        </View>

        <View style={styles.plus_container}>
          <GenericButton
            disabled={fan === 0 || set_pt == this._max_temp}
            icon={require('../assets/images/plus.png')}
            style={hiding_style}
            action={() => {
              this.changeTemperature(true)(Math.min(this._max_temp, this.state.set_pt + 0.5))
            }} />
        </View>

        <View style={[styles.center_text_container, presentation_style]}>
          <Text style={styles.center_text_sub}>{center_text_sub}</Text>
          <Text style={styles.center_text_main}>{center_text_main}</Text>
        </View>
      </View>
    );
  }
}

CentralAC.contextTypes = {
  store: PropTypes.object
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  room_temperature: {
    marginTop: 20,
    fontSize: 22,
    color: '#DDDDDD',
    fontFamily: 'HKNova-MediumR'
  },
  center_text_container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column'
  },
  center_text_main: {
    fontSize: 70,
    color: '#FFFFFF',
    fontFamily: 'HKNova-MediumR',
    marginTop: -10
  },
  center_text_sub: {
    fontSize: 22,
    color: '#DDDDDD',
    fontFamily: 'HKNova-MediumR',
    marginTop: -110
  },
  minus_container: {
      position: 'absolute',
      top: 180,
      left: 15,
  },
  plus_container: {
      position: 'absolute',
      top: 180,
      right: 15,
  },
});

module.exports = CentralAC;
