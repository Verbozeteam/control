/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { Colors } from '../constants/styles';

import AnalogClock from './AnalogClock';
import DigitalClock from './DigitalClock';
import Alarm from './Alarm';

import SeparatorLine from './SeparatorLine';

type AlarmType = {
  id: number,
  time: Object
};

type PropsType = {
  alarms: Array<AlarmType>,
  removeAlarm: () => {},
  addAlarm: () => {}
};

type StateType = {};

export default class AlarmsPanel extends React.Component<PropsType> {

  static defaultProps = {
    alarms: []
  };

  renderAlarms() {
    const { alarms, removeAlarm } = this.props;

    return (
      alarms.map((alarm) =>
        <View key={"alarm-" + alarm.id}>
          <Alarm alarmId={alarm.id}
            setTime={alarm.time}
            removeAlarm={removeAlarm}/>
          <SeparatorLine />
        </View>
      )
    );
  }

  render() {
    const { addAlarm } = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.clocks_container}>
            <AnalogClock />
            <DigitalClock clockFontSize={64}
              dateFontSize={36} />
        </View>
        <View style={styles.alarms_container}>
          <ScrollView style={styles.scroll_view_container}>
            {this.renderAlarms()}
            <Alarm addAlarm={addAlarm} />
          </ScrollView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  clocks_container: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10
  },
  scroll_view_container: {
    flex: 1,
  },
  alarms_container: {
    flex: 1,
    // backgroundColor: 'green'
  }
});
