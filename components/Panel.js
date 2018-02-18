/* @flow */

import * as React from 'react';
import { View, TouchableWithoutFeedback, PanResponder, StyleSheet }
    from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const PanelHeader = require('./PanelHeader');

import type { LayoutType, NameType, ViewType } from '../config/flowtypes';

type PropsType = {
    name?: NameType,
    viewType?: ViewType,
    layout?: LayoutType,
    toggleDetail?: () => any,
};

class Panel extends React.Component<PropTypes> {

    static defaultProps = {
        name: {en: ""},
        viewType: 'present',
        layout: {},
        toggleDetail: null,
    };

    _panResponder: Object;

    componentWillMount() {
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => this._panelDoesCapture(),
            onStartShouldSetPanResponderCapture: () => this._panelDoesCapture(),
            onMoveShouldSetPanResponder: () => this._panelDoesCapture(),
            onMoveShouldSetPanResponderCapture: () => this._panelDoesCapture(),
            onPanResponderGrant: this._onPanResponderGrant.bind(this),
        });
    }

    _panelDoesCapture() {
        const { viewType } = this.props;
        if (viewType === 'detail' || viewType === 'static') {
            return false;
        }
        return true;
    }

    _onPanResponderGrant(evt: Object, gestureState: Object) {
        const { toggleDetail } = this.props;
        if (toggleDetail)
            toggleDetail();
    }

    render() {
        const { viewType, name, layout, toggleDetail } = this.props;
        var panel_style = styles.container;
        if (viewType === 'collapsed')
            panel_style = styles.container_collapsed;
        return (
            <LinearGradient colors={['#666666', '#666666']}
                  start={{x: 1, y: 0}} end={{x: 0, y: 1}}
                  {...this._panResponder.panHandlers}
                  style={[layout, panel_style]}>
                <PanelHeader name={name.en}
                    close={viewType === 'detail' && toggleDetail ?
                    () => toggleDetail() : undefined}/>
                {this.props.children}
            </LinearGradient>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        borderRadius: 2,
        backgroundColor: '#000000'
    },
    container_collapsed: {
        flex: 1,
        padding: 10,
        borderRadius: 2,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
    }
});

module.exports = Panel;
