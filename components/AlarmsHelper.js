/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Sound = require('react-native-sound');

import { Colors } from '../constants/styles';

type PropsType = {
  alarms?: Array<Object>,
  removeAlarm: () => {},
  addAlarm: () => {}
};

type StateType = {
  alarm_ring: boolean
};

export default class AlarmsHelper extends React.Component<PropsType, StateType> {

  static defaultProps = {
    alarms: []
  };

  state = {
    alarm_ring: false
  };

  _check_alarms_timeout: Object = null;

  _alarm_audio = null;

  componentDidMount() {
    Sound.setCategory('Playback');

    /* load sound file */
    this._alarm_audio = new Sound('submarine.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Could not load sound file');
      }
    });

    this._alarm_audio.setVolume(1);
    this._alarm_audio.setNumberOfLoops(-1);

    this.checkAlarms();
  }

  componentWillUnmount() {
    clearTimeout(this._check_alarms_timeout);
  }

  checkAlarms() {
    console.log('checking alarms');
    const { alarms, removeAlarm } = this.props;
    const datetime = new Date();

    for (var i = 0; i < alarms.length; i++) {
      console.log(alarms[i].time);
      if (alarms[i].time.getTime() < datetime.getTime()) {
        this.setState({
          alarm_ring: true
        });

        removeAlarm(alarms[i].id)
      }
    }

    this._check_alarms_timeout = setTimeout(() => this.checkAlarms(),
      60000 - (datetime.getSeconds() * 1000) - datetime.getMilliseconds());
  }

  render() {
    const { alarm_ring } = this.state;

    if (!alarm_ring) {
      return null;
    }

    if (this._alarm_audio) {
      this._alarm_audio.play();
    }

    return (
      <View style={styles.container}>
        <Text style={{color: Colors.white}}>
          ALARM SHOULD GO OFF
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
