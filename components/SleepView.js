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

    return (
      <View style={styles.container}>
        <DigitalClock fontColor={Colors.gray}
            clockFontSize={120}
            dateFontSize={40} />
        {(displayWarning) ?
          <Text style={styles.warning}>
            {displayWarning}
          </Text> : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  warning: {
    fontSize: 40,
    color: Colors.red,
    ...TypeFaces.regular,
    textAlign: 'center'
  }
});