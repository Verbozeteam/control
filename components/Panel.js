/* @flow */

import * as React from 'react';
import { StyleSheet, TouchableWithoutFeedback, View, Text} from 'react-native';

type PanelLayoutType = {
    top: number,
    left: number,
    height: number,
    width: number
};

type ViewType = 'present' | 'detail' | 'collapsed';

type PropsType = {};

class Panel extends React.Component<PropsType> {
    render() {
        return (
            <TouchableWithoutFeedback onPressIn={
                () => this.props.toggleDetail()}>

                <View style={[this.props.layout, styles.container]}>
                    <Text style={styles.title}>
                        {this.props.title.en}
                    </Text>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 5,
        position: 'absolute'
    },
    title: {
        fontSize: 20,
        color: '#FFFFFF'
    }
});

module.exports = Panel;
