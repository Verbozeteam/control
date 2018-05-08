/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Sound = require('react-native-sound');

import AnalogClock from './AnalogClock';
import DigitalClock from './DigitalClock';

import MagicButton from '../react-components/MagicButton';

import { Colors, TypeFaces } from '../constants/styles';

const I18n = require('../js-api-utils/i18n/i18n');

type AlarmType = {
    id: number,
    time: Object
};

type PropsType = {
    alarms?: Array<AlarmType>,
};

type StateType = {
    alarm_ring: Object | null
};

export default class AlarmsHelper extends React.Component<PropsType, StateType> {

    static defaultProps = {
        alarms: []
    };

    state = {
        alarm_ring: null,
    };

    _snooze_duration = 5 * 60000; /* minutes * 60000 */

    _check_alarms_timeout: Object = null;

    _alarm_audio = null;

    componentDidMount() {
        Sound.setCategory('Playback');

        /* load sound file */
        this._alarm_audio = new Sound('alarm.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('Could not load sound file');
            }
        });

        this._alarm_audio.setVolume(1);
        this._alarm_audio.setNumberOfLoops(-1);

        this.checkAlarms();
    }

    componentWillUnmount() {
        clearTimeout(this._check_alarms_timeout);
    }

    minutesDifference(t1: Object, t2: Object) {
        return Math.floor(t1.getTime() / 60000) - Math.floor(t2.getTime() / 60000);
    }

    checkAlarms() {
        const { alarms, removeAlarm } = this.props;
        const datetime = new Date();

        console.log('checking alarms');
        for (var i = 0; i < alarms.length; i++) {
            if (this.minutesDifference(alarms[i].time, datetime) <= 0) {
                this.setState({
                    alarm_ring: alarms[i]
                });

                this.startAlarm();
            }
        }

        this._check_alarms_timeout = setTimeout(() => this.checkAlarms(),
            60000 - (datetime.getSeconds() * 1000) - datetime.getMilliseconds());
    }

    startAlarm() {
        if (this._alarm_audio) {
            this._alarm_audio.play();
        }
    }

    stopAlarm() {
        const { removeAlarm } = this.props;
        const { alarm_ring } = this.state;

        if (this._alarm_audio) {
            this._alarm_audio.stop();
        }

        removeAlarm(alarm_ring.id);

        this.setState({
            alarm_ring: null
        });
    }

    snoozeAlarm() {
        const { alarm_ring } = this.state;

        if (this._alarm_audio) {
            this._alarm_audio.stop();
        }

        const snoozeAlarmTime = new Date();
        snoozeAlarmTime.setTime(snoozeAlarmTime.getTime() + this._snooze_duration);

        this.addAlarm(snoozeAlarmTime);
        this.removeAlarm(alarm_ring.id);

        this.setState({
            alarm_ring: null
        });
    }

    render() {
        const { alarm_ring } = this.state;

        if (!alarm_ring) {
            return null;
        }

        return (
            <View style={styles.container}>
                <View style={styles.analog_clock_container}>
                    <AnalogClock />
                </View>
                <View style={styles.alarm_info_container}>
                    <Text style={styles.alarm_info}>{I18n.t('Alarm')}</Text>
                    <DigitalClock showDate={false}
                        providedDateTime={alarm_ring.time}
                        extraTimeStyle={styles.alarm_info} />
                    <View style={styles.alarm_actions}>
                        <MagicButton height={70}
                            width={200}
                            text={I18n.t('Stop Alarm')}
                            textStyle={{...TypeFaces.light}}
                            textColor={Colors.white}
                            onPressIn={this.stopAlarm.bind(this)} />
                        <MagicButton height={70}
                            width={200}
                            text={I18n.t('Snooze Alarm')}
                            textStyle={{...TypeFaces.light}}
                            textColor={Colors.white}
                            onPressIn={this.snoozeAlarm.bind(this)} />
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
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    analog_clock_container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    alarm_info_container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    alarm_info: {
        width: '100%',
        color: Colors.white,
        fontSize: 48,
        textAlign: 'center',
        ...TypeFaces.medium
    },
    alarm_actions: {
        flex: 1
    }
});
