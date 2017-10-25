/* @flow */

import * as React from 'react';
import { View, TouchableWithoutFeedback, PanResponder, StyleSheet }
    from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

const PanelHeader = require('./PanelHeader');

const Dimmer = require('./Dimmer');
const LightSwitch = require('./LightSwitch');
const CentralAC = require('./CentralAC')
const HotelControls = require('./HotelControls');
const Empty = require('./Empty');

import type { PanelLayoutType, PanelType, ViewType } from '../config/flowtypes';

type PropsType = {
    ...PanelType,
    layout: PanelLayoutType,
    viewType: ViewType,
    thingsState: Object,
    toggleDetail: () => null,
    updateThing?: (id: string, update: Object, remote_only?: boolean) => null,
    blockThing?: (id: string) => null,
    unblockThing?: (id: string) => null
}

class Panel extends React.Component<PropsType> {

    static defaultProps = {
        gradient: ['#666666', '#333333'],
        things: [],
        thingsState: {},
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
        if (viewType === 'detail') {
            return false;
        }
        return true;
    }

    _onPanResponderGrant(evt: Object, gestureState: Object) {
        const { toggleDetail } = this.props;
        toggleDetail();
    }

    render() {
        const { things, layout, viewType, gradient, name, thingsState,
            toggleDetail, updateThing, blockThing, unblockThing } = this.props;

        //console.log('Panel => ', thingsState);

        var panel_things = [];
        if (viewType !== 'collapsed') {
            for (var i = 0;i < things.length; i++) {
                switch(things[i].category) {
                    case 'dimmers':
                        panel_things.push(<Dimmer key={things[i].id}
                            {...things[i]}
                            viewType={viewType}
                            dimmerState={thingsState[things[i].id]}
                            updateThing={updateThing}
                            blockThing={blockThing}
                            unblockThing={unblockThing}/>);
                        break;
                    case 'light_switches':
                        panel_things.push(<LightSwitch key={things[i].id}
                            {...things[i]}
                            viewType={viewType}
                            lightSwitchState={thingsState[things[i].id]}
                            updateThing={updateThing}/>);
                        break;
                    case 'central_acs':
                        panel_things.push(<CentralAC key={things[i].id}
                            {...things[i]}
                            viewType={viewType}
                            aCState={thingsState[things[i].id]}
                            updateThing={updateThing}
                            blockThing={blockThing}
                            unblockThing={unblockThing}/>);
                        break;
                    case 'hotel_controls':
                        panel_things.push(<HotelControls key={things[i].id}
                            {...things[i]}
                            viewType={viewType}
                            hotelControlsState={thingsState[things[i].id]}
                            updateThing={updateThing}/>);
                        break;
                }
            }
        }

        return (
            <View {...this._panResponder.panHandlers}
                style={[layout, {backgroundColor: gradient[0]}, styles.container]}>
                <PanelHeader name={name.en}
                    close={viewType === 'detail' ?
                    () => toggleDetail() : undefined}/>
                <View style={styles.things_container}>
                    {panel_things}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        position: 'absolute',
        // backgroundColor: '#111111'
    },
    things_container: {
        flex: 1,
        flexDirection: 'row',
        // backgroundColor: '#FF0000'
    }
});

module.exports = Panel;
