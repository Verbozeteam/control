/* @flow */

import * as React from 'react';
import PropTypes from 'prop-types';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import type { LayoutType, ViewType } from '../config/flowtypes';

const GenericCircularSliderSimple = require('../react-components/GenericCircularSliderSimple');
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

    var fanToggleEvent = ((speed) => () => {if (fan > 0) this.changeFan(speed)}).bind(this);

    if (viewType === 'detail') {

      if (fan) {
        center_text_main = set_pt.toFixed(1) + '°C';
      } else {
        center_text_main = I18n.t('Off');
      }
      center_text_sub = I18n.t('Room Temp') + ' ' + temp.toFixed(1) + '°C';

      slider = (
        <GenericCircularSliderSimple value={set_pt}
          minimum={this._min_temp} maximum={this._max_temp}
          round={this.round.bind(this)}
          onMove={this.changeTemperature(false).bind(this)}
          onRelease={this.changeTemperature(true).bind(this)}
          diameter={layout.height / 1.5}
          disabled={fan === 0} />
      );

      var toggle_dot = [
        <View style={styles.toggle_dot_container}>
          <View style={{width: 25, height: 25, borderRadius: 1000, backgroundColor: '#3B9FFF'}}>
          </View>
        </View>,
        <View style={styles.toggle_dot_container}>
          <View style={{width: 25, height: 25, borderRadius: 1000, borderColor: '#3B9FFF', borderWidth: 1, opacity: fan > 0 ? 1 : 0.5}}>
          </View>
        </View>,
      ];

      toggles = (
        <View style={styles.fan_controls_container}>
          <Text style={[styles.fan_speed_text, {flex: 1}]}>{I18n.t('Fan')}</Text>
          <TouchableWithoutFeedback onPressIn={fanToggleEvent(1)}>
            <View style={styles.fan_speed_container}>
              {toggle_dot[fan == 1 ? 0: 1]}
              <Text style={styles.fan_speed_text}>{I18n.t('Low')}</Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPressIn={fanToggleEvent(2)}>
            <View style={styles.fan_speed_container}>
              {toggle_dot[fan == 2 ? 0: 1]}
              <Text style={styles.fan_speed_text}>{I18n.t('Medium')}</Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPressIn={fanToggleEvent(3)}>
            <View style={styles.fan_speed_container}>
              {toggle_dot[fan == 3 ? 0: 1]}
              <Text style={styles.fan_speed_text}>{I18n.t('High')}</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      );
    } else {
      hiding_style = {
        display: 'none'
      };

      center_text_main = temp.toFixed(1) + '°C';

      presentation_style = {
        paddingTop: 80
      };
    }

    var onoffButton = (
      <TouchableWithoutFeedback onPressIn={() => this.changeFan(fan === 0 ? 1 : 0)}>
        <View style={styles.button_container}>
          <Text style={[styles.fan_speed_text, {height: 68}]}>{I18n.t(fan === 0 ? 'OFF' : 'ON')}</Text>
          <View style={{height: fan === 0 ? 0 : 2, width: '100%', backgroundColor: '#3B9FFF', bottom: 0}}></View>
        </View>
      </TouchableWithoutFeedback>
    );

    return (
      <View style={styles.container}>
        <View style={styles.temperature_container}>
          <View>
            {slider}
          </View>

          {onoffButton}

          <View style={[styles.center_text_container, presentation_style]}>
            <Text style={[styles.center_text_main, fan === 0 ? {opacity: 0.5} : {}]}>{center_text_main}</Text>
            <Text style={styles.center_text_sub}>{center_text_sub}</Text>
          </View>
        </View>
        <View style={styles.fans_container}>
          {toggles}
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
    flexDirection: 'row',
  },
  temperature_container: {
    flex: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  fans_container: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center'
  },
  fan_controls_container: {
    flexDirection: 'column',
    height: 220,
  },
  fan_speed_container: {
    flex: 1,
    flexDirection: 'row',
  },
  fan_speed_text: {
    fontSize: 30,
    color: '#000000',
    fontFamily: 'HKNova-MediumR',
  },
  toggle_dot_container: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  button_container: {
    position: 'absolute',
    width: 120,
    height: 70,
    flexDirection: 'column',
    backgroundColor: '#bbbbbb',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 135,
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
    color: '#3B9FFF',
    fontFamily: 'HKNova-MediumR',
    marginTop: -70
  },
  center_text_sub: {
    fontSize: 22,
    color: '#000000',
    fontFamily: 'HKNova-MediumR',
  },
});

module.exports = CentralAC;
