/* @flow */

import * as React from 'react';
import { StyleSheet, TouchableWithoutFeedback, View, Text} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

type PanelLayoutType = {
    top: number,
    left: number,
    height: number,
    width: number
};

type ViewType = 'present' | 'detail' | 'collapsed';

type PropsType = {
    gradient: Array<string>
};

class Panel extends React.Component<PropsType> {

    DEFAULT_GRADIENT: Array<string>;

    static defaultProps = {
        gradient: ['#FFFFFF', '#DDDDDD']
    };

    constructor(props: PropsType) {
        super(props);
    }

    render() {
        return (
            <TouchableWithoutFeedback onPressIn={() => this.props.toggleDetail()}>
                <LinearGradient colors={this.props.gradient}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={[this.props.layout, styles.container]}>
                    <Text style={styles.title}>
                        {this.props.title.en}
                    </Text>
                </LinearGradient>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        borderRadius: 5,
        position: 'absolute'
    },
    title: {
        fontSize: 20,
        color: '#000000'
    }
});

module.exports = Panel;
