/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const Sound = require('react-native-sound');

import { minutesDifference, addAlarm, removeAlarm, snoozeAlarm }
  from '../js-api-utils/AlarmUtils';

import AnalogClock from './AnalogClock';
import DigitalClock from './DigitalClock';
import Seperatorine from './SeparatorLine';

import MagicButton from '../react-components/MagicButton';

import { Colors, TypeFaces } from '../constants/styles';

type AlarmType = {
    id: number,
    time: Object
};

type PropsType = {};
type StateType = {
  alarms: Array<AlarmType>,
  alarm_ring: AlarmType
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

  state = {
    alarms: [],
    alarm_ring: null
  };

  _snooze_duration = 5 * 60000; /* minutes * 60000 milliseconds */
  _check_alarms_timeout: Object = null;
  _alarm_audio = null;

  componentWillMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(newProps: PropsType) {
    this._unsubscribe();
    this._unsubscribe = ConfigManager.registerThingStateChangeCallback(
      newProps.id, this.onAlarmsChange.bind(this));
    if (newProps.id in ConfigManager.things) {
      this.onAlarmsChange(ConfigManager.thingMetas[newProps.id],
        ConfigManager.things[newProps.id]);
    }
  }

  componentDidMount() {
    Sound.setCategory('Playback');

    /* load sound file */
    this._alarm_audio = new Sound('alarm.ogg',
      Sound.MAIN_BUNDLE);
    this._alarm_audio.setVolume(1);
    this._alarm_audio.setNumberOfLoops(-1);

    /* set check alarm timeout */
  }

  componentWillUnmount() {
    this._unsubscribe();
    clearTimeout(this._check_alarms_timeout);
  }

  onAlarmsChange(meta: ThingMetadataType, alarmsState: ThingStateType) {
    const { alarms } = this.state;

    if (JSON.stringify(alarms) !== JSON.stringify(alarmsState.alarms)) {
      this.setState({
        alarms: alarmsState.alarms
      });
    }
  }

  checkAlarms() {
    const { alarms } = this.state;

    const datetime = new Date();
    for (var i = 0; i < alarms.length; i++) {
      if (minutesDifference(alarms[i].time, datetime) <= 0) {
        this.setState({
          alarm_ring: alarms[i]
        });

        this.startAlarm();
      }
    }

    /* update check alarm timeout */
    this._check_alarms_timeout = setTimeout(
      () => this.checkAlarms(),
      60000 - (datetime.getSeconds() * 1000) - datetime.getMilliseconds()
    );
  }

  startAlarm() {
    if (this._alarm_audio) {
      this._alarm_audio.play();
    }
  }

  stopAlarm() {
    if (this._alarm_audio) {
      this._alarm_audio.stop();
    }
  }

  snoozeAlarm() {

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
