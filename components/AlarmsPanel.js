/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import AnalogClock from './AnalogClock';

type PropsType = {};
type StateType = {};

export default class AlarmsPanel extends React.Component<PropsType> {

  render() {
    return (
      <View style={styles.container}>
        <AnalogClock />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  }
});
