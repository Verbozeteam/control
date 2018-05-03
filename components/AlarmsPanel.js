/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { Colors } from '../constants/styles';

import AnalogClock from './AnalogClock';
import DigitalClock from './DigitalClock';
import Alarm from './Alarm';

import SeparatorLine from './SeparatorLine';

type PropsType = {};
type StateType = {};

export default class AlarmsPanel extends React.Component<PropsType> {

  _temp_alarm_date_time = new Date(2018, 4, 4, 8, 0);
  _temp_alarm_date_time2 = new Date(2018, 4, 3, 15, 0);

  _set_alarms = [this._temp_alarm_date_time, this._temp_alarm_date_time2];

  renderAlarms(set_alarms) {
    set_alarms = set_alarms.filter(alarm => alarm > new Date());

    return (
      set_alarms.map((alarm_time, i) =>
        <View key={"alarm-" + i}>
          <Alarm setTime={alarm_time} />
          <SeparatorLine />
        </View>
      )
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.clocks_container}>
            <AnalogClock />
            <DigitalClock fontColor={Colors.white}
              clockFontSize={64}
              dateFontSize={36}/>
        </View>
        <View style={styles.alarms_container}>
          <ScrollView style={styles.scroll_view_container}>
            { this.renderAlarms(this._set_alarms) }
            <Alarm addAlarm={true} />
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
