/* @flow */

import * as React from 'react';
import { View, TouchableWithoutFeedback, StyleSheet } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

const PanelHeader = require('./PanelHeader');

const Dimmer = require('./Dimmer');
const LightSwitch = require('./LightSwitch');
const Empty = require('./Empty');

import type { PanelLayoutType, PanelType, ViewType } from '../config/flowtypes';

type PropsType = {
    ...PanelType,
    layout: PanelLayoutType,
    viewType: ViewType,
    thingsState: Object,
    toggleDetail: () => null,
    updateThing?: (id: string, update: Object) => null
}

class Panel extends React.Component<PropsType> {

    static defaultProps = {
        gradient: ['#FFFFFF', '#DDDDDD'],
        things: [],
        thingsState: {},
    };

    render() {
        const { things, layout, viewType, gradient, name, thingsState,
            toggleDetail, updateThing } = this.props;


        var panel_things = [];
        if (viewType !== 'collapsed') {
            for (var i = 0;i < things.length; i++) {
                switch(things[i].category) {
                    case 'dimmers':
                        panel_things.push(<Dimmer key={things[i].id}
                            {...things[i]}
                            viewType={viewType}
                            thingState={thingsState[things[i].id]}
                            updateThing={updateThing}/>);
                        break;
                    case 'light_switches':
                        panel_things.push(<LightSwitch key={things[i].id}
                            {...things[i]}
                            viewType={viewType}
                            thingState={thingsState[things[i].id]}
                            updateThing={updateThing}/>);
                }
            }
        }
        // if (viewType !== 'collapsed') {
        //     for (var i = 0; i < things.length; i++) {
        //         switch(things[i].category) {
        //             case 'dimmers':
        //                 panel_things.push(<Dimmer key={things[i].id}
        //                     {...things[i]}
        //                     viewType={viewType}/>);
        //                 break;
        //             case 'light_switches':
        //                 panel_things.push(<LightSwitch key={things[i].id}
        //                     {...things[i]}
        //                     viewType={viewType}/>);
        //                 break;
        //             case 'empty':
        //                 panel_things.push(<Empty key={things[i].id}/>);
        //                 break;
        //         }
        //     }
        // }

        return (
            <TouchableWithoutFeedback onPressIn={() =>
                viewType !== 'detail' ? toggleDetail() : undefined}>
                <LinearGradient colors={gradient}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={[layout, styles.container]}>
                    <PanelHeader name={name.en}
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
        // backgroundColor: '#FF0000'
    }
});

module.exports = Panel;
