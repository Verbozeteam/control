/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Colors } from '../constants/styles';

import AnalogClock from './AnalogClock';
import DigitalClock from './DigitalClock';

type PropsType = {};
type StateType = {};

export default class AlarmsPanel extends React.Component<PropsType> {

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.clocks_container}>
            <AnalogClock />
            
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
  clocks_container: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10
  },
  alarms_container: {
    flex: 1,
  }
});
