/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';

import { Colors } from '../constants/styles';

type PropsType = {
  radius?: number,
  hourTicksLength?: number,
  hourTicksThickness?: number,
  minuteTicksLength?: number,
  minuteTicksThickness?: number,

  hoursHandThickness?: number,
  minutesHandThickness?: number,
  secondsHandThickness?: number
};

type StateType = {};

export default class AnalogClock extends React.Component<PropsType> {

  static defaultProps = {
    radius: 160,
    hourTicksLength: 10,
    hourTicksThickness: 2,
    minuteTicksLength: 5,
    minuteTicksThickness: 1,

    hoursHandThickness: 8,
    minutesHandThickness: 5,
    secondsHandThickness: 2
  };

  _update_time_interval;

  _fps: number = 24;

  componentWillMount() {
    this._update_time_interval = setInterval(
      () => this.forceUpdate(), 1000 / this._fps);
  }

  componentWillUnmount() {
    clearInterval(this._update_time_interval);
  }

  renderClockPerimeter(num_ticks: number, ticks_length: number, ticks_thickness: number) {
    const { radius, hourTicks, minuteTicks } = this.props;
    const circumference = 2 * Math.PI * (radius - (ticks_length / 2));

    return (
      <Circle cx={radius}
        cy={radius}
        r={radius - (ticks_length / 2)}
        stroke={Colors.white} strokeWidth={ticks_length}
        strokeDashoffset={ticks_thickness / 2}
        strokeDasharray={[ticks_thickness,
          (circumference - num_ticks * ticks_thickness) / num_ticks]}
        fill={'none'} />
    );
  }

  renderHoursHand(datetime: Object) {
    const { radius, hoursHandThickness } = this.props;
    const angle = (datetime.getHours() / 12
      + datetime.getMinutes() / 720 ) * Math.PI * 2 - (Math.PI / 2);

    const x1 = radius + 15 * Math.cos(angle + Math.PI);
    const y1 = radius + 15 * Math.sin(angle + Math.PI);

    const x2 = radius + (radius * 0.6) * Math.cos(angle);
    const y2 = radius + (radius * 0.6) * Math.sin(angle);

    return (
      <Line x1={x1} y1={y1}
        x2={x2} y2={y2}
        stroke={Colors.gray} strokeWidth={hoursHandThickness} />
    );
  }

  renderMinutesHand(datetime: Object) {
    const { radius, minutesHandThickness } = this.props;
    const angle = (datetime.getMinutes() / 60
      + datetime.getSeconds() / 3600) * Math.PI * 2 - (Math.PI / 2);

    const x1 = radius + 15 * Math.cos(angle + Math.PI);
    const y1 = radius + 15 * Math.sin(angle + Math.PI);

    const x2 = radius + (radius * 0.9) * Math.cos(angle);
    const y2 = radius + (radius * 0.9) * Math.sin(angle);

    return (
      <Line x1={x1} y1={y1}
        x2={x2} y2={y2}
        stroke={Colors.white} strokeWidth={minutesHandThickness} />
    );
  }

  renderSecondsHand(datetime: Object) {
    const { radius, secondsHandThickness } = this.props;
    const angle = (datetime.getSeconds() / 60
      + datetime.getMilliseconds() / 60000) * Math.PI * 2 - (Math.PI / 2);

    const x1 = radius + 15 * Math.cos(angle + Math.PI);
    const y1 = radius + 15 * Math.sin(angle + Math.PI);

    const x2 = radius + radius * Math.cos(angle);
    const y2 = radius + radius * Math.sin(angle);

    return (
      <Line x1={x1} y1={y1}
        x2={x2} y2={y2}
        stroke={Colors.red} strokeWidth={secondsHandThickness} />
    );
  }

  render() {
    const { radius, hourTicksLength, hourTicksThickness,
      minuteTicksLength, minuteTicksThickness } = this.props;

    const datetime = new Date();

    return (
      <View style={{height: radius * 2, width: radius * 2}}>
        <Svg width={radius * 2}
          height={radius * 2}>
          {this.renderClockPerimeter(12, hourTicksLength, hourTicksThickness)}
          {this.renderClockPerimeter (60, minuteTicksLength, minuteTicksThickness)}

          {this.renderHoursHand(datetime)}
          {this.renderMinutesHand(datetime)}
          <Circle cx={radius} cy={radius} r={radius * 0.06} fill={Colors.white} />
          {this.renderSecondsHand(datetime)}
          <Circle cx={radius} cy={radius} r={radius * 0.04} fill={Colors.red} />
        </Svg>
      </View>
    );
  }
}
