/* @flow */

import * as React from 'react';
import { View, TouchableWithoutFeedback, PanResponder, StyleSheet }
    from 'react-native';

const PanelHeader = require('./PanelHeader');
const LightsPanelContents = require('./LightsPanelContents');

const HotelControls = require('./HotelControls');

import type { PanelLayoutType, PanelType, ViewType } from '../config/flowtypes';

type PropsType = {
    ...PanelType,
    layout: PanelLayoutType,
    content_key: string, // key to use for the content object
    viewType: ViewType,
    thingsState: Object,
    toggleDetail: () => null,
    updateThing?: (id: string, update: Object, remote_only?: boolean) => null,
};

class Panel extends React.Component<PropsType> {

    static defaultProps = {
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
        const { content_key, things, layout, viewType, name, thingsState,
            toggleDetail, updateThing } = this.props;

        //console.log('Panel => ', thingsState);
        var panel_style = styles.container;

        var panel_contents = null;
        if (things.length > 0 && viewType !== 'collapsed') {
            var content_props = {
                key: content_key,
                viewType: viewType,
                things: things,
                thingsState: thingsState,
                updateThing: updateThing,
                layout: layout,
            }

            switch (things[0].category) {
                case 'dimmers':
                case 'light_switches':
                    panel_contents = <LightsPanelContents {...content_props}/>
                    break;
                case 'hotel_controls':
                    panel_contents = <HotelControls key={things[0].id}
                                        {...things[0]}
                                        viewType={viewType}
                                        hotelControlsState={thingsState[things[0].id]}
                                        updateThing={updateThing}/>
                    break;
            }
        } else {
            panel_style = styles.container_collapsed;
        }

        // if (viewType !== 'collapsed') {
        //     for (var i = 0;i < things.length; i++) {
        //         switch(things[i].category) {
        //             case 'dimmers':
        //                 panel_things.push(<Dimmer key={things[i].id}
        //                     {...things[i]}
        //                     viewType={viewType}
        //                     dimmerState={thingsState[things[i].id]}
        //                     updateThing={updateThing}
        //                     blockThing={blockThing}
        //                     unblockThing={unblockThing}/>);
        //                 break;
        //             case 'light_switches':
        //                 panel_things.push(<LightSwitch key={things[i].id}
        //                     {...things[i]}
        //                     viewType={viewType}
        //                     lightSwitchState={thingsState[things[i].id]}
        //                     updateThing={updateThing}/>);
        //                 break;
        //             case 'central_acs':
        //                 panel_things.push(<CentralAC key={things[i].id}
        //                     {...things[i]}
        //                     viewType={viewType}
        //                     aCState={thingsState[things[i].id]}
        //                     updateThing={updateThing}
        //                     blockThing={blockThing}
        //                     unblockThing={unblockThing}/>);
        //                 break;
        //             case 'hotel_controls':
        //                 panel_things.push(<HotelControls key={things[i].id}
        //                     {...things[i]}
        //                     viewType={viewType}
        //                     hotelControlsState={thingsState[things[i].id]}
        //                     updateThing={updateThing}/>);
        //                 break;
        //         }
        //     }
        // }

        return (
            <View {...this._panResponder.panHandlers}
                style={[layout, panel_style]}>
                <PanelHeader name={name.en}
                    close={viewType === 'detail' ?
                    () => toggleDetail() : undefined}/>
                {panel_contents}
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
        backgroundColor: '#000000'
    },
    container_collapsed: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        position: 'absolute',
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
    }
});

module.exports = Panel;
