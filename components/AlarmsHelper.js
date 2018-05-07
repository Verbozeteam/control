/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const Sound = require('react-native-sound');

import AnalogClock from './AnalogClock';
import DigitalClock from './DigitalClock';
import Seperatorine from './SeparatorLine';

import MagicButton from '../react-components/MagicButton';

import { Colors, TypeFaces } from '../constants/styles';

type AlarmType = {
  id: number,
  time: Object
};

type PropsType = {
  alarms?: Array<AlarmType>,
  removeAlarm: () => {},
  addAlarm: () => {}
};

type StateType = {
  alarm_ring: Object | null
};

function mapStateToProps(state) {
  return {
    displayConfig: state.screen.displayConfig
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}

class AlarmsHelper extends React.Component<PropsType, StateType> {
  _unsubscribe: () => any = () => null;

  static defaultProps = {
    alarms: []
  };

  state = {
    alarm_ring: {
      id: 0,
      time: new Date()
    }
  };

  _snooze_duration = 5 * 60000; /* minutes * 60000 */

  _check_alarms_timeout: Object = null;

  _alarm_audio = null;

  componentDidMount() {
    Sound.setCategory('Playback');

    /* load sound file */
    this._alarm_audio = new Sound('alarm.ogg', Sound.MAIN_BUNDLE, (error) => {
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
    this._unsubscribe();
  }

  minutesDifference(t1: Object, t2: Object) {
    return Math.floor(t1.getTime() / 60000) - Math.floor(t2.getTime() / 60000);
  }

  checkAlarms() {
    const { alarms, removeAlarm } = this.props;
    const datetime = new Date();

    console.log('checking alarms');
    for (var i = 0; i < alarms.length; i++) {
      if (this.minutesDifference(alarms[i].time, datetime) <= 0) {
        this.setState({
          alarm_ring: alarms[i]
        });

        this.startAlarm();
      }
    }

    this._check_alarms_timeout = setTimeout(() => this.checkAlarms(),
      60000 - (datetime.getSeconds() * 1000) - datetime.getMilliseconds());
  }

  startAlarm() {
    if (this._alarm_audio) {
      this._alarm_audio.play();
    }
  }

  stopAlarm() {
    const { removeAlarm } = this.props;
    const { alarm_ring } = this.state;

    if (this._alarm_audio) {
      this._alarm_audio.stop();
    }

    removeAlarm(alarm_ring.id);

    this.setState({
      alarm_ring: null
    });
  }

  snoozeAlarm() {
    const { removeAlarm, addAlarm } = this.props;
    const { alarm_ring } = this.state;

    if (this._alarm_audio) {
      this._alarm_audio.stop();
    }

    const snoozeAlarmTime = new Date();
    snoozeAlarmTime.setTime(snoozeAlarmTime.getTime() + this._snooze_duration);

    addAlarm(snoozeAlarmTime);
    removeAlarm(alarm_ring.id);

    this.setState({
      alarm_ring: null
    });
  }

  render() {
    const { displayConfig } = this.props;
    const { alarm_ring } = this.state;

    if (!alarm_ring) {
      return null;
    }

    return (
      <View style={styles.container}>
        <View style={styles.analog_clock_container}>
          <AnalogClock />
        </View>
        <View style={styles.alarm_container}>
          <View style={styles.alarm_info_container}>
            <Text style={styles.alarm_info}>
              Alarm
            </Text>
            <DigitalClock showDate={false}
              providedDateTime={alarm_ring.time}
              extraTimeStyle={styles.alarm_info} />
          </View>
          <Seperatorine />
          <View style={styles.alarm_actions_container}>
            <MagicButton height={70}
              width={250}
              text={'Snooze 5 Minutes'}
              textStyle={{...TypeFaces.light}}
              textColor={Colors.white}
              extraStyle={{marginRight: 20}}
              onPressIn={this.snoozeAlarm.bind(this)}
              glowColor={displayConfig.accentColor} />
            <MagicButton height={70}
              width={200}
              text={'Stop Alarm'}
              textStyle={{...TypeFaces.light}}
              textColor={displayConfig.textColor}
              onPressIn={this.stopAlarm.bind(this)}
              offColor={displayConfig.accentColor}
              glowColor={displayConfig.accentColor}/>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: Colors.black,
    flexDirection: 'row'
  },
  analog_clock_container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarm_container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarm_info_container: {
    flex: 2,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  alarm_info: {
    width: '100%',
    color: Colors.white,
    fontSize: 64,
    textAlign: 'left',
    ...TypeFaces.medium
  },
  alarm_actions_container: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

});

module.exports = connect(mapStateToProps, mapDispatchToProps) (AlarmsHelper);
