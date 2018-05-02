/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type PropsType = {
  radius?: number,
  hourTicks?: number,
  minuteTicks?: number
};

type StateType = {};

export default class AnalogClock extends React.Component<PropsType> {

  static defaultProps = {
    radius: 160,
    hourTicks: 10,
    minuteTicks: 5
  };

  _update_time_timeout;

  componentWillMount() {
    this.update();
  }

  componentWillUnmount() {
    clearTimeout(this._update_time_timeout);
  }

  update() {
    const datetime = new Date();

    this._update_time_timeout = setTimeout(function() {
      this.update();
    }.bind(this), 1000 - datetime.getMilliseconds());

    this.forceUpdate();
  }

  renderClockPerimeter(num_ticks: number, ticks_length: number, thickness: number) {
    const { radius, hourTicks, minuteTicks } = this.props;
    const circumference = 2 * Math.PI * (radius - ticks_length);

    return (
      <Circle cx={radius}
        cy={radius}
        r={radius - ticks_length}
        stroke={'#FFFFFF'} strokeWidth={ticks_length}
        strokeDashoffset={thickness / 2}
        strokeDasharray={[thickness, (circumference - num_ticks * thickness) / num_ticks]}
        fill={'none'} />
    );
  }

  renderHoursHand(datetime: Object) {
    const angle = 360 * datetime.getHours() / 12 + datetime.getMinutes() / 2;

    return null;
  }

  render() {
    const { radius, hourTicks, minuteTicks } = this.props;

    const datetime = new Date();

    return (
      <View style={styles.container}>
        <Svg width={radius * 2}
          height={radius * 2}>

          {this.renderClockPerimeter(12, hourTicks, 2)}
          {this.renderClockPerimeter(60, minuteTicks, 1)}

          {this.renderHoursHand(datetime)}

        </Svg>
        <Text style={{color: 'white'}}>{datetime.toString()}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
