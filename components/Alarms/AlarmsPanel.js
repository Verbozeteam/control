/** @flow */

import * as React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { ConfigManager } from '../../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../../js-api-utils/ConfigManager';

import { addAlarm, removeAlarm } from '../../js-api-utils/AlarmUtils';
import type { AlarmType } from '../../js-api-utils/AlarmUtils';

import AnalogClock from '../AnalogClock';
import DigitalClock from '../DigitalClock';
import AlarmItem from './AlarmItem';

type PropsType = {
    id: string,
    width: number,
    height: number,
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
            this.onAlarmsChange(ConfigManager.thingMetas[newProps.id], ConfigManager.things[newProps.id]);
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
        var { alarms } = this.state;

        return (
            alarms.sort((a, b) => new Date(a.time) - new Date(b.time)).map((alarm) =>
                    <AlarmItem
                        key={'alarm-' + (alarm.id || '/')}
                        alarmDef={alarm}
                        setTime={new Date(alarm.time)}
                        removeAlarm={(alarm) => removeAlarm(id, ConfigManager, alarm)} />
            )
        );
    }

    render() {
        const { id, width, height } = this.props;
        const { alarms } = this.state;

        return (
            <View style={styles.container}>
                <View style={styles.clocks_container}>
                    <AnalogClock radius={height/3} />
                    <DigitalClock clockFontSize={54}
                        dateFontSize={32} />
                </View>
                <View style={styles.alarms_container}>
                    <ScrollView style={styles.scroll_view_container}>
                        {this.renderAlarms()}
                        <AlarmItem addAlarm={(alarm) => addAlarm(id, ConfigManager, alarm, alarms)} />
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
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: 10,
    },
    scroll_view_container: {
        flex: 1,
    },
    alarms_container: {
        width: 340,
        padding: 10,
    }
});
