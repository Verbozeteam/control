/* @flow */

import * as React from 'react';
import { View, TouchableWithoutFeedback, StyleSheet } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

const PanelHeader = require('./PanelHeader');

const Dimmer = require('./Dimmer');
const LightSwitch = require('./LightSwitch');

type PanelLayoutType = {
    top: number,
    left: number,
    height: number,
    width: number
};

type ViewType = 'present' | 'detail' | 'collapsed';

type Thing = {
    id: string,
    category: string,
    title: {
        en: string,
        ar: string
    },
    intensity?: number
};

type PropsType = {
    layout: PanelLayoutType,
    viewType: ViewType,
    things: Array<Thing>,
    gradient: [string, string],
    toggleDetail: () => null,
    title: {
        en: string,
        ar: string
    }
};

class Panel extends React.Component<PropsType> {

    static defaultProps = {
        gradient: ['#FFFFFF', '#DDDDDD'],
        thing: []
    };

    render() {
        const { things, layout, viewType, gradient, title,
            toggleDetail } = this.props;

        var panel_things = [];
        if (viewType !== 'collapsed') {
            for (var i = 0; i < things.length; i++) {
                switch(things[i].category) {
                    case 'dimmers':
                        panel_things.push(<Dimmer key={things[i].id}
                            viewType={viewType}
                            thing={things[i]}/>);
                        break;
                    case 'light_switches':
                        panel_things.push(<LightSwitch key={things[i].id}
                            viewType={viewType}
                            thing={things[i]}/>);
                        break;
                }
            }
        }

        return (
            <TouchableWithoutFeedback onPressIn={() =>
                viewType !== 'detail' ? toggleDetail() : undefined}>
                <LinearGradient colors={gradient}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={[layout, styles.container]}>
                    <PanelHeader title={title.en}
                        close={viewType === 'detail' ?
                        () => toggleDetail() : undefined}/>
                    <View style={styles.things_container}>
                        {panel_things}
                    </View>
                </LinearGradient>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        position: 'absolute'
    },
    things_container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#FF0000'
    }
});

module.exports = Panel;
