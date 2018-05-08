/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Colors, TypeFaces } from '../constants/styles';

const { MinuteTicker } = require('../js-api-utils/MinuteTicker');
const I18n = require('../js-api-utils/i18n/i18n');
const UserPreferences = require('../js-api-utils/UserPreferences');

const DaysOfWeek: Array<string> = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];

const MonthsOfYear: Array<string> = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

type PropsType = {
  fontColor?: string,
  clockFontSize?: number,
  dateFontSize?: number,
  showDate?: boolean,
  providedDateTime?: Object,
  extraTimeStyle?: Object | number,
  extraDateStyle?: Object | number,
};

type StateType = {};

export default class DigitalClock extends React.Component<PropsType, StateType> {

  static defaultProps = {
    fontColor: Colors.light_gray,
    clockFontSize: 36,
    dateFontSize: 22,
    showDate: true,
  };

  componentWillMount() {
    const { providedDateTime } = this.props;

    if (!providedDateTime) {
      MinuteTicker.start(this.updateClock.bind(this));
    }
  }

  componentWillUnmount() {
    MinuteTicker.stop();
  }

  componentWillReceiveProps(nextProps: PropsType) {
    const { providedDateTime } = this.props;

    if (!providedDateTime && nextProps.providedDateTime) {
      MinuteTicker.stop();
    }

    else if (providedDateTime && !nextProps.providedDateTime) {
      MinuteTicker.start(this.updateClock.bind(this));
    }
  }

  updateClock() {
    this.forceUpdate();
  }

  formatDateTime(datetime: object) {
    /* format minutes to have 2 digits */
    var minutes = String(datetime.getMinutes());
    if (minutes.length < 2) {
      minutes = '0' + minutes;
    }

    /* make time 12 hour based from 24 hours */
    var am_pm = 'AM';
    var hours = datetime.getHours();
    if (hours >= 12) {
      am_pm = 'PM';
      if (hours > 12) {
        hours -= 12;
      }
    } else if (hours === 0) {
      hours = 12;
    }

    /* create date string */
    const date = I18n.t(DaysOfWeek[datetime.getDay()]) + I18n.t(', ') +
      datetime.getDate() + ' ' + I18n.t(MonthsOfYear[datetime.getMonth()])
      + ' ' + datetime.getFullYear();

    /* create time string */
    const time = hours + ':' + minutes + ' ' + am_pm;

    return { date, time };
  }

  render() {
    const { fontColor, clockFontSize, dateFontSize, showDate,
      providedDateTime, extraTimeStyle, extraDateStyle } = this.props;

    const { date, time } = this.formatDateTime(providedDateTime || new Date());

    return (
      <View>
        <Text style={[styles.time, {color: fontColor, fontSize: clockFontSize}, extraTimeStyle]}>
          {time}
        </Text>
        {(showDate) ?
          <Text style={[styles.date, {color: fontColor, fontSize: dateFontSize}, extraDateStyle]}>
            {date}
          </Text> : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  time: {
    textAlign: 'center',
    ...TypeFaces.regular
  },
  date: {
    textAlign: 'center',
    ...TypeFaces.regular
  }
});
