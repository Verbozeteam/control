/** @flow */
import * as React from 'react';
import { View, Text, StyleSheet, Image, TimePickerAndroid } from 'react-native';

import { minutesDifference } from '../../js-api-utils/AlarmUtils';
import type { AlarmType } from '../../js-api-utils/AlarmUtils';

import { TypeFaces, Colors } from '../../constants/styles';
import MagicButton from '../../react-components/MagicButton';
import Panel from '../ControlButtons/Panel';

import DigitalClock from '../DigitalClock';

const I18n = require('../../js-api-utils/i18n/i18n');

type PropsType = {
    alarmDef?: AlarmType,
    setTime?: Date,
    addAlarm?: AlarmType => any,
    removeAlarm?: AlarmType => any,
};

type StateType = {};

export default class AlarmItem extends React.Component<PropsType> {

    static defaultProps = {
        addAlarm: undefined,
    }

    async showTimePicker(addAlarm?: AlarmType => any) {
        try {
            const { action, hour, minute } = await TimePickerAndroid.open({
                is24Hour: false,
                mode: ('spinner'),
            });

            if (action !== TimePickerAndroid.dismissedAction) {
                /* set alarm time */
                const alarmTime = new Date();
                alarmTime.setHours(hour, minute, 0, 0);

                if (minutesDifference(alarmTime, new Date()) <= 0) {
                    /* alarm time already passed today - set alarm to tomorrow */
                    alarmTime.setDate(alarmTime.getDate() + 1);
                }

                if (addAlarm)
                    addAlarm({time: alarmTime});
            }
        } catch (message) {
            console.warn('Cannot open time picker', message);
        }
    }

    renderAddAlarmButton() {
        const { addAlarm } = this.props;

        return (
            <Panel active={true} style={styles.alarm_container} onPress={() => this.showTimePicker(addAlarm)}>
                <Text style={[styles.plus_image]}>{"+"}</Text>
                <Text style={styles.alarm_text}>{I18n.t("Add Alarm")}</Text>
            </Panel>
        );
    }

    /* ASSUMPTION: Since we only allow user to select a time
     * The time will be at most 24hrs ahead, since the date is
     * determined through code after time was selected by user
     */
    determineTodayOrTomorrow(setTime?: Date) {
        if (!setTime)
            return null;
        var dateTimeNow = new Date();
        return dateTimeNow.getDate() === setTime.getDate() ? I18n.t("Today") : I18n.t("Tomorrow");
    }

    renderAlarm() {
        const { alarmDef, setTime, removeAlarm } = this.props;

        var todayOrTomorrow = this.determineTodayOrTomorrow(setTime);
        var alarmTime = <DigitalClock showDate={false} providedDateTime={setTime}
            extraTimeStyle={{textAlign: 'left', color: Colors.black, fontSize: 28,}} />;

        return (
            <Panel active={true} style={styles.alarm_container} onPress={(removeAlarm && alarmDef) ? (() => removeAlarm(alarmDef)) : () => {}}>
                <View style={styles.alarm_text_container}>
                    <Text style={styles.today_or_tomorrow_text_container}>
                        {todayOrTomorrow}
                    </Text>
                    {alarmTime}
                </View>
                <View style={styles.delete_alarm_container}>
                    <Text style={styles.cross_image}>{"+"}</Text>
                </View>
            </Panel>
        );
    }

    render(){
        const { addAlarm } = this.props;

        return (
            <View style={styles.container}>
                { addAlarm ? this.renderAddAlarmButton() : this.renderAlarm() }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    alarm_container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 300,
        height: 110,
    },
    alarm_text_container: {
        flex: 3
    },
    alarm_text: {
        lineHeight: 25,
        flexShrink: 1,
        color: Colors.black,
        fontSize: 22,
        ...TypeFaces.light,
    },
    plus_image: {
        fontSize: 60,
        marginRight: 10,
        lineHeight: 60,
        flexShrink: 1,
        color: Colors.black,
        ...TypeFaces.light,
    },
    cross_image: {
        fontSize: 60,
        marginRight: 10,
        lineHeight: 60,
        flexShrink: 1,
        color: Colors.black,
        ...TypeFaces.light,
        transform: [{ rotate: '45deg'}],
    },
    delete_alarm_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    today_or_tomorrow_text_container: {
        color: Colors.black,
        fontSize: 20,
        textAlign: 'left',
        ...TypeFaces.light,
    }
});
