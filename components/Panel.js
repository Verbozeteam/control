/* @flow */

import * as React from 'react';
import { View, TouchableWithoutFeedback, StyleSheet }
    from 'react-native';

type PropsType = {
    name?: string,
    layout?: Object,
    children: any
};

export default class Panel extends React.Component<PropsType> {

    static defaultProps = {
        name: "",
        layout: {},
    };

    render() {
        const { name, layout } = this.props;
        var panel_style = styles.container;
        return (
            <View style={[layout, panel_style]}>
                {this.props.children}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        borderRadius: 2,
    },
});
