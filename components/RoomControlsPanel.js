/* @flow */

import * as React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
const connectionActions = require ('../redux-objects/actions/connection');

import PropTypes from 'prop-types';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../js-api-utils/ConfigManager';

import { TypeFaces } from '../constants/styles';

import RoomControlsHeader   from './RoomControlsHeader';
import LightSwitch          from './ControlButtons/LightSwitch';
import LightDimmer          from './ControlButtons/LightDimmer';
import Curtain              from './ControlButtons/Curtain';
import RoomStatus           from './ControlButtons/RoomStatus';
import ClimateStatus        from './ControlButtons/ClimateStatus';
import ClimateControl       from './ControlButtons/ClimateControl';

const I18n = require('../js-api-utils/i18n/i18n');

type StateType = {
};

type PropsType = {
    ids: Array<string>,
    width: number,
    height: number,
    displayConfig: Object,
    reduxRoomStatus: Object,
    setReduxCardIn: boolean => null,
};

type RenderedThing = {
    meta: ThingMetadataType,
    render: RenderedThing => Array<any>,
    blockSize: Array<number> | RenderedThing => Array<number>,
}

type GroupType = {
    name: string,
    things: Array<RenderedThing>,
};

function mapStateToProps(state) {
    return {
        displayConfig: state.screen.displayConfig,
        reduxRoomStatus: state.connection.roomStatus,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setReduxCardIn: (is_in: boolean) => {dispatch(connectionActions.set_room_card_in(is_in));},
    };
}

class RoomControlsPanelClass extends React.Component<PropsType, StateType>  {
    _unsubscribe: () => any = () => null;

    state: StateType = {
    };
    componentWillMount() {
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(newProps: PropsType) {
        this._unsubscribe();
        if (newProps.ids) {
            for (var i = 0; i < newProps.ids.length; i++) {
                var id = newProps.ids[i];
                if (id in ConfigManager.thingMetas && ConfigManager.thingMetas[id].category === 'hotel_controls') {
                    this._unsubscribe = ConfigManager.registerThingStateChangeCallback(id, this.onRoomStatusChanged.bind(this));
                    if (id in ConfigManager.things)
                        this.onRoomStatusChanged(ConfigManager.thingMetas[id], ConfigManager.things[id]);
                }
            }
        }
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    onRoomStatusChanged(meta: ThingMetadataType, roomStatusState: ThingStateType) {
        const { reduxRoomStatus, setReduxCardIn } = this.props;

        if ('card' in roomStatusState && roomStatusState.card !== reduxRoomStatus.cardIn)
            setReduxCardIn(roomStatusState.card);
    }


    getGroups(): Array<GroupType> {
        const { ids } = this.props;
        var filters = {
            dimmers: 'Lights',
            light_switches: 'Lights',
            curtains: 'Curtains',
            central_acs: 'Climate',
            split_acs: 'Climate',
            honeywell_thermostat_t7560: 'Climate',
            hotel_controls: 'Room Status',
        }

        var definitions = {
            'Lights': {
                blockSize: thing => [thing.meta.category === 'light_switches' ? 1 : 2],
                render: thing => [thing.meta.category === 'light_switches' ?
                    <LightSwitch key={'thing-' + thing.meta.id} id={thing.meta.id} name={thing.meta.name} /> :
                    <LightDimmer key={'thing-' + thing.meta.id} id={thing.meta.id} name={thing.meta.name} />
                ]
            },
            'Curtains': {
                blockSize: [1, 1],
                render: thing => [
                    <Curtain key={'thing-'+thing.meta.id+'-open'} id={thing.meta.id} name={thing.meta.name} open={true} />,
                    <Curtain key={'thing-'+thing.meta.id+'-close'} id={thing.meta.id} name={thing.meta.name} open={false} />,
                ],
            },
            'Climate': {
                blockSize: [2, 1, 1],
                render:  thing => [
                    <ClimateStatus key={'thing-'+thing.meta.id+'-status'} id={thing.meta.id} name={thing.meta.name} />,
                    <ClimateControl key={'thing-'+thing.meta.id+'-cooler'} id={thing.meta.id} name={thing.meta.name} warmer={false} />,
                    <ClimateControl key={'thing-'+thing.meta.id+'-warmer'} id={thing.meta.id} name={thing.meta.name} warmer={true} />,
                ],
            },
            'Room Status': {
                blockSize: [2, 2],
                render:  thing => [
                    <RoomStatus key={'thing-'+thing.meta.id+'-hk'} id={thing.meta.id} name={thing.meta.name} propertyName={'room_service'} />,
                    <RoomStatus key={'thing-'+thing.meta.id+'-dnd'} id={thing.meta.id} name={thing.meta.name} propertyName={'do_not_disturb'} />,
                ],
            },
        };

        var groups = [];

        for (var i = 0; i < ids.length; i++) {
            if (ids[i] in ConfigManager.thingMetas) {
                var thingMeta = ConfigManager.thingMetas[ids[i]];
                if (thingMeta.category in filters) {
                    var groupName = filters[thingMeta.category];
                    var groupIndex = 0;
                    for (groupIndex = 0; groupIndex < groups.length; groupIndex++) {
                        if (groups[groupIndex].name == groupName)
                            break;
                    }
                    if (groupIndex == groups.length)
                        groups.push({
                            name: groupName,
                            things: []
                        });
                    groups[groupIndex].things.push({
                        meta: thingMeta,
                        ...definitions[groupName],
                    });
                }
            }
        }

        return groups;
    }

    flatten(a: Array<Array<any>>): Array<any> {
        var ret = [];
        for (var i = 0; i < a.length; i++)
            ret = ret.concat(a[i]);
        return ret;
    }

    renderGroup(group: GroupType) {
        var blocksPerRow = 6;
        var rows: Array<Array<RenderedThing>> = [[]];
        var curRowBlocks = 0;
        for (var i = 0; i < group.things.length; i++) {
            const thing = group.things[i];
            const panels = thing.render(thing);
            for (var p = 0; p < panels.length; p++) {
                const curPanelBlockSize = typeof(thing.blockSize) === 'function' ? thing.blockSize(thing)[p] : thing.blockSize[p];
                if (curRowBlocks + curPanelBlockSize > blocksPerRow) {
                    rows.push([]);
                    curRowBlocks = 0;
                }
                rows[rows.length-1].push(panels[p]);
                curRowBlocks += curPanelBlockSize;
            }
        }

        return (
            <View key={'group-' + group.name} style={groupStyles.container}>
                <Text style={groupStyles.headerText}>{I18n.t(group.name)}</Text>
                <View style={groupStyles.thingsContainer}>
                    {rows.map((rowPanels, index) =>
                        <View key={'group-'+group.name+'-'+index} style={[groupStyles.thingsContainerRow, I18n.r2l() ? {justifyContent: 'flex-end'} : {}]}>
                            {rowPanels}
                        </View>
                    )}
                </View>
            </View>
        );
    }

    render() {
        const { ids, width, height, displayConfig, reduxRoomStatus } = this.props;

        var groups = this.getGroups();

        return (
            <ScrollView style={[styles.container, {width, height}]}>
                {<RoomControlsHeader />}
                {reduxRoomStatus.cardIn !== 0 ? groups.map(g => this.renderGroup(g)) : null}
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flex: 1,
    }
});

const groupStyles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'column',
        marginBottom: 20,
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 18,
        paddingLeft: 20,
        ...TypeFaces.regular,
    },
    thingsContainer: {
        paddingLeft: 15,
        flexDirection: 'column',
    },
    thingsContainerRow: {
        flexDirection: 'row',
    }
});

const headerStyles = StyleSheet.create({
    container: {
        height: 190,
        width: '100%',
        padding: 20,
        flexDirection: 'column',
        marginBottom: 80,
    },
    welcomeText: {
        fontSize: 38,
        color: '#FFFFFF',
        marginBottom: 10,
        ...TypeFaces.regular,
    },
    comment: {
        fontSize: 24,
        color: '#FFFFFF',
        ...TypeFaces.regular,
    },
    warning: {
        fontSize: 24,
        color: '#FF0000',
        ...TypeFaces.regular,
    }
});

const RoomControlsPanel = connect(mapStateToProps, mapDispatchToProps) (RoomControlsPanelClass);
export default RoomControlsPanel;
