/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet, TimePickerAndroid } from 'react-native';

import { TypeFaces, Colors } from '../constants/styles';
import MagicButton from '../react-components/MagicButton';

import DigitalClock from './DigitalClock';

const I18n = require('../js-api-utils/i18n/i18n');

type PropsType = {
  addAlarm: boolean,
  setTime?: Object
};
type StateType = {};

export default class Alarm extends React.Component<PropsType> {

  _add_icon = require('../assets/images/plus.png');

  static defaultProps = {
    addAlarm: false,
  }

  async showTimePicker() {
    try {
      const {action, hour, minute} = await TimePickerAndroid.open({
        is24Hour: false,
        mode: ('spinner'),
      });
      if (action !== TimePickerAndroid.dismissedAction) {
        console.log(action);
        console.log(hour); // (0-23)
        console.log(minute); // (0-59)

        /* handle add new alarm with middleware
        /* ...
         */
      }
    } catch ({code, message}) {
      console.warn('Cannot open time picker', message);
    }
  }

  renderAddAlarmButton() {

    return (
      <MagicButton
        width={70}
        height={70}
        textStyle={{...TypeFaces.light}}
        onPressIn={this.showTimePicker}
        sideText={I18n.t("Add Alarm")}
        sideTextStyle={{...TypeFaces.light}}
        textColor={Colors.white}
        icon={this._add_icon}
        glowColor={Colors.red}
        />
    );
  }

  removeAlarm() {
    // needs to be implemented
  }

  /* ASSUMPTION: Since we only allow user to select a time
   * The time will be at most 24hrs ahead, since the date is
   * determined through code after time was selected by user
   */
  determineTodayOrTomorrow(setTime) {
    var dateTimeNow = new Date();
    return dateTimeNow.getDate() === setTime.getDate() ? "Today" : "Tomorrow";
  }

  renderAlarm(setTime) {

    var todayOrTomorrow = this.determineTodayOrTomorrow(setTime);
    var alarmTime = <DigitalClock showDate={false} providedDateTime={setTime} extraTimeStyle={{textAlign: 'left'}} />;

    return (
      <View style={styles.alarm_container}>
        <View style={styles.alarm_text_container}>
          <Text style={styles.today_or_tomorrow_text_container}>
              {todayOrTomorrow}
          </Text>
          {alarmTime}
        </View>
        <View style={styles.delete_alarm_container}>
          <MagicButton
            width={70}
            height={70}
            textStyle={{...TypeFaces.light}}
            onPressIn={this.removeAlarm()}
            textColor={Colors.white}
            icon={this._add_icon}
            iconStyle={{transform: [{ rotate: '45deg'}], width: 30, height: 30}}
            glowColor={Colors.black}
            showBorder={false}
            />
        </View>
      </View>
    );
  }

  render(){
    const { addAlarm, setTime } = this.props;
    return (
      <View style={styles.container}>
        { addAlarm ? this.renderAddAlarmButton() : this.renderAlarm(setTime) }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 110,
    justifyContent: 'center'
  },
  alarm_container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alarm_text_container: {
    flex: 3
  },
  delete_alarm_container: {
    flex: 1
  },
  today_or_tomorrow_text_container: {
    color: Colors.white,
    fontSize: 20,
    ...TypeFaces.light,
  }
});
