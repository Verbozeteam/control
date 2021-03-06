/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../js-api-utils/ConfigManager';

import { addAlarm, removeAlarm } from '../js-api-utils/AlarmUtils';

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

  componentWillMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(newProps: PropsType) {
    this._unsubscribe();
    this._unsubscribe = ConfigManager.registerThingStateChangeCallback(
      newProps.id, this.onAlarmsChange.bind(this)
    );
    if (newProps.id in ConfigManager.things) {
      this.onAlarmsChange(ConfigManager.thingMetas[newProps.id],
        ConfigManager.things[newProps.id]);
    }
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  onAlarmsChange(meta: ThingMetadataType, alarmsState: ThingStateType) {
    const { alarms } = this.state;

    if (JSON.stringify(alarms) !== JSON.stringify(alarmsState.alarms)) {
      this.setState({
        alarms: alarmsState.alarms
      });
    }
  }

  renderAlarms() {
    const { id } = this.props;
    const { alarms } = this.state;

    return (
      alarms.map((alarm) =>
        <View key={'alarm-' + alarm.id}>
          <AlarmItem alarmDef={alarm}
            setTime={new Date(alarm.time)}
            removeAlarm={(alarm) => removeAlarm(id, ConfigManager, alarm)} />
            <SeparatorLine />
        </View>
      )
    );
  }

  render() {
    const { id } = this.props;
    const { alarms } = this.state;

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
            <AlarmItem addAlarm={(alarm) =>
              addAlarm(id, ConfigManager, alarm, alarms)} />
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
    }
});
