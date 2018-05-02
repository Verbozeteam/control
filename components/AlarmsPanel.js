/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// import AnalogClock from './AnalogClock';

type PropsType = {};
type StateType = {};

export default class AlarmsPanel extends React.Component<PropsType> {

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.analog_clock_container}>
          <Text>
            ANALOG CLOCK
          </Text>
          {/* <AnalogClock /> */}
        </View>
        <View style={styles.alarms_container}>
          <Text>
            ALARMS
          </Text>
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
  analog_clock_container: {
    flex: 2,
    backgroundColor: 'red'
  },
  alarms_container: {
    flex: 1,
    backgroundColor: 'green'
  }
});
