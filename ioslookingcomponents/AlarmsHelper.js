import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../js-api-utils/ConfigManager';

const Sound = require('react-native-sound');

import { minutesDifference, removeAlarm, snoozeAlarm, ringAlarm }
    from '../js-api-utils/AlarmUtils';
import MinuteTicker from '../js-api-utils/MinuteTicker';

import AnalogClock from './AnalogClock';
import DigitalClock from './DigitalClock';
import Seperatorine from './SeparatorLine';

import MagicButton from '../react-components/MagicButton';

import { Colors, TypeFaces } from '../constants/styles';

const I18n = require('../js-api-utils/i18n/i18n');

type AlarmType = {
    id: number,
    time: Object
};

type PropsType = {
    id: string,
    displayConfig: Object,
    wakeupScreen?: () => {}
};

type StateType = {
    alarms: Array<AlarmType>,
    alarm_ring: AlarmType
};

function mapStateToProps(state) {
    return {
        displayConfig: state.screen.displayConfig
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

class AlarmsHelper extends React.Component<PropsType, StateType> {
    _unsubscribe: () => any = () => null;

    static defaultProps = {
        displayConfig: {},
        wakeupScreen: () => {}
    };

    state = {
        alarms: [],
        alarm_ring: null
    };

    _snooze_duration = 5 * 60000; /* minutes * 60000 milliseconds */
    _alarm_audio = null;

    /* MinuteTicker class used to check when to ring alarms */
    _minuteTicker: Object = null;

    componentWillMount() {
        this._minuteTicker = new MinuteTicker();

        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(newProps: PropsType) {
        this._unsubscribe();
        this._unsubscribe = ConfigManager.registerThingStateChangeCallback(
            newProps.id, this.onAlarmsChange.bind(this));
        if (newProps.id in ConfigManager.things) {
            this.onAlarmsChange(ConfigManager.thingMetas[newProps.id],
                ConfigManager.things[newProps.id]);
        }
    }

    componentDidMount() {
        Sound.setCategory('Playback');

        /* load sound file */
        this._alarm_audio = new Sound('alarm.ogg',
            Sound.MAIN_BUNDLE);
        this._alarm_audio.setVolume(1);
        this._alarm_audio.setNumberOfLoops(-1);
    }

    componentWillUnmount() {
        this._unsubscribe();
        this._minuteTicker.stop();
    }

    onAlarmsChange(meta: ThingMetadataType, alarmsState: ThingStateType) {
        const { alarms, alarm_ring } = this.state;

        if (JSON.stringify(alarms) !== JSON.stringify(alarmsState.alarms)) {
            /* check if should start MinuteTicker or should stop */
            if (alarms.length === 0 && alarmsState.alarms.length > 0) {
                this._minuteTicker.start(this.checkAlarms.bind(this));
            }

            else if (alarms.length > 0 && alarmsState.alarms.length === 0) {
                this._minuteTicker.stop();
            }

            const new_alarm_ring = alarmsState.alarms.find((alarm) => alarm.is_ringing);

            if (alarm_ring && !new_alarm_ring) {
                this.stopAlarmAudio();
            }

            else if (!alarm_ring && new_alarm_ring) {
                this.startAlarmAudio();
            }

            this.setState({
                alarms: alarmsState.alarms,
                alarm_ring: new_alarm_ring
            });
        }
    }

    checkAlarms(datetime: Object) {
        const { id } = this.props;
        const { alarms } = this.state;

        for (var i = 0; i < alarms.length; i++) {
            if (minutesDifference(new Date(alarms[i].time), datetime) <= 0) {
                ringAlarm(id, ConfigManager, alarms[i]);
            }
        }
    }

    startAlarmAudio() {
        const { wakeupScreen } = this.props;

        if (this._alarm_audio) {
            this._alarm_audio.play(this.startAlarmAudio.bind(this));
            wakeupScreen();
        }
    }

    stopAlarmAudio() {
        if (this._alarm_audio) {
            this._alarm_audio.stop();
        }
    }

    stopAlarm() {
        const { id } = this.props;
        const { alarm_ring } = this.state;

        this.stopAlarmAudio();
        removeAlarm(id, ConfigManager, alarm_ring);

        this.setState({
            alarm_ring: null
        });
    }

    snoozeAlarm() {
        const { id } = this.props;
        const { alarm_ring } = this.state;

        this.stopAlarmAudio();
        snoozeAlarm(id, ConfigManager, alarm_ring, this._snooze_duration);

        this.setState({
            alarm_ring: null
        });
    }

    render() {
        const { id, displayConfig } = this.props;
        const { alarm_ring } = this.state;

        if (!alarm_ring) {
            return null;
        }

        return (
            <View style={styles.container}>
                <View style={styles.analog_clock_container}>
                    <AnalogClock />
                </View>
                <View style={styles.alarm_container}>
                    <View style={styles.alarm_info_container}>
                        <Text style={styles.alarm_info}>
                            {I18n.t("Alarm")}
                        </Text>
                        <DigitalClock showDate={false}
                            providedDateTime={new Date(alarm_ring.time)}
                            extraTimeStyle={styles.alarm_info} />
                    </View>
                    <Seperatorine />
                    <View style={styles.alarm_actions_container}>
                        <MagicButton height={70}
                            width={250}
                            text={I18n.t("Snooze 5 Minutes")}
                            textStyle={{...TypeFaces.light}}
                            textColor={Colors.white}
                            extraStyle={{marginRight: 20}}
                            onPressIn={this.snoozeAlarm.bind(this)}
                            glowColor={displayConfig.accentColor} />
                        <MagicButton height={70}
                            width={200}
                            text={I18n.t("Stop Alarm")}
                            textStyle={{...TypeFaces.medium}}
                            textColor={displayConfig.textColor}
                            onPressIn={this.stopAlarm.bind(this)}
                            offColor={displayConfig.accentColor}
                            glowColor={displayConfig.accentColor}/>
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
        flexDirection: 'row'
    },
    analog_clock_container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    alarm_container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    alarm_info_container: {
        flex: 2,
        flexDirection: 'column',
        justifyContent: 'flex-end',
    },
    alarm_info: {
        width: '100%',
        color: Colors.white,
        fontSize: 64,
        textAlign: 'left',
        ...TypeFaces.medium
    },
    alarm_actions_container: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },

});

module.exports = connect(mapStateToProps, mapDispatchToProps) (AlarmsHelper);
