/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../js-api-utils/ConfigManager';

import AnalogClock from './AnalogClock';
import DigitalClock from './DigitalClock';
import AlarmItem from './AlarmItem';

import SeparatorLine from './SeparatorLine';

type AlarmType = {
  id: number,
  time: Object
};

type PropsType = {
  id: string,
  layout: Object
};

type StateType = {
  alarms: Array<AlarmType>
};

export default class AlarmsPanel extends React.Component<PropsType, StateType> {
  _unsubscribe: () => any = () => null;

  state: StateType = {
    alarms: []
  };

  render() {
    return (
      <View style={styles.container}>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
