/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Colors, TypeFaces } from '../constants/styles';

import DigitalClock from './DigitalClock';

type PropsType = {
  displayWarning?: string
};

type StateType = {};

export default class SleepView extends React.Component<PropsType, StateType> {

  static defaultProps = {
    displayWarning: ''
  };

  render() {
    const { displayWarning } = this.props;
    console.log(displayWarning);

    return (
      <View style={styles.container}>
        <View style={styles.clock_container}>
          <DigitalClock fontColor={Colors.light_gray}
            clockFontSize={120} dateFontSize={40} />
        </View>
        {(displayWarning) ?
          <View style={styles.warning_container}>
            <Text style={styles.warning}>
              {displayWarning}
            </Text>
          </View> : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: Colors.black
  },
  clock_container: {
    flex: 3,
  },
  warning_container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  warning: {
    marginTop: 30,
    fontSize: 40,
    color: Colors.red,
    ...TypeFaces.regular,
    textAlign: 'center'
  }
});
