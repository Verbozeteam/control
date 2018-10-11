/* @flow */

import * as React from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, Image } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { GroupType, ThingMetadataType, ConfigType } from '../js-api-utils/ConfigManager';
const settingsActions = require ('../redux-objects/actions/settings');
import { TypeFaces } from '../constants/styles';

const I18n = require('../js-api-utils/i18n/i18n');

import AlarmsPanel          from './AlarmsPanel';
import RoomControlsPanel    from './RoomControlsPanel';

import FadeInView from './FadeInView';

type StateType = {
    groups: Array<GroupType>,
    currentPage: number,
};

type IconType = {
    passive: number,
    active: number,
}

type PageType = {
    name: string,
    icon: IconType,
    render: (number, number) => any,
    things: Array<ThingMetadataType>,
};

function mapStateToProps(state) {
    return {
        discoveredDevices: state.connection.discoveredDevices,
        displayConfig: state.screen.displayConfig,
        language: state.settings.language
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

class PagingViewClass extends React.Component<any, StateType> {
    _unsubscribe: () => any = () => null;

    state = {
        groups: [],
        currentPage: 0,
    };

    _backgrounds = {
        'dimmers': require('../assets/images/rip/rip7.jpg'),
        'light_switches': require('../assets/images/bathroom-lights2.png'),
        'curtains': require('../assets/images/curtain_back.jpg'),
        'hotel_controls': require('../assets/images/services_stack.jpg'),
        'central_acs': require('../assets/images/thermostat_stack.jpg'),
        'honeywell_thermostat_t7560': require('../assets/images/thermostat_stack.jpg'),
        'alarm_system': require('../assets/images/alarms_background.jpg'),
        'settings': require('../assets/images/verboze_poster.jpg'),
    };

    _icons = {
        room: {
            passive: require('../assets/images/fan.png'),
            active: require('../assets/images/fan.png'),
        },
        amenities: {
            passive: require('../assets/images/fan.png'),
            active: require('../assets/images/fan.png'),
        },
        alarms: {
            passive: require('../assets/images/fan.png'),
            active: require('../assets/images/fan.png'),
        },
        telephone: {
            passive: require('../assets/images/fan.png'),
            active: require('../assets/images/fan.png'),
        },
        settings: {
            passive: require('../assets/images/fan.png'),
            active: require('../assets/images/fan.png'),
        },
    }

    componentWillMount() {
        this._unsubscribe = ConfigManager.registerConfigChangeCallback(this.onConfigChanged.bind(this));
        if (ConfigManager.config)
            this.onConfigChanged(ConfigManager.config);
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    onConfigChanged(config: ConfigType) {
        const { groups } = this.state;

        if (config && config.rooms) {
            var newGroups = [];
            for (var r = 0; r < config.rooms.length; r++) {
                var room = config.rooms[r];
                newGroups = newGroups.concat(room.groups);
            }

            if (JSON.stringify(newGroups) != JSON.stringify(groups)) {
                this.setState({groups: newGroups, currentPage: 0});
            }
        }
    }

    getPages(): Array<PageType> {
        const { groups } = this.state;
        var pages = [];
        var roomThings = [];
        for (var i = 0; i < groups.length; i++) {
            for (var j = 0; j < groups[i].things.length; j++) {
                const thing = groups[i].things[j];
                switch (thing.category) {
                    case 'light_switches':
                    case 'dimmers':
                    case 'central_acs':
                    case 'split_acs':
                    case 'curtains':
                    case 'hotel_controls':
                    case 'water_fountains':
                    case 'honeywell_thermostat_t7560':
                        roomThings.push(thing);
                        break;
                    case 'alarm_system':
                        pages.push({
                            name: 'Alarms',
                            icon: this._icons.alarms,
                            things: [thing],
                            render: (w, h) => <AlarmsPanel id={thing.id} width={w} height={h} />
                        });
                        break;
                    case 'telephone':
                        pages.push({
                            name: 'Telephone',
                            icon: this._icons.telephone,
                            things: [thing],
                            render: () => null,
                        });
                        break;
                    case 'hotel_orders':
                        pages.push({
                            name: 'Amenities',
                            icon: this._icons.amenities,
                            things: [thing],
                            render: () => null,
                        });
                        break;
                }
            }
        }

        if (roomThings.length > 0)
            pages = [{
                name: 'Room',
                icon: this._icons.room,
                things: roomThings,
                render: (w, h) => <RoomControlsPanel ids={roomThings.map(t => t.id)} width={w} height={h} />
            }].concat(pages);
        pages.push({
            name: 'Settings',
            icon: this._icons.settings,
            things: [],
            render: () => null,
        });

        return pages;
    }

    renderMenuPages(pages: Array<PageType>) {
        const { currentPage } = this.state;
        const { displayConfig } = this.props;

        return (
            <View style={menuStyles.buttonsGroup}>
                {pages.map((page, i) =>
                    <TouchableOpacity key={'group-'+i} activeOpacity={0.5} onPress={() => this.setState({currentPage: i})}>
                        <View style={menuStyles.buttonContainer}>
                            <Image style={menuStyles.icon} source={i == currentPage ? page.icon.active : page.icon.passive} />
                            <Text style={[menuStyles.text, {color: i == currentPage ? displayConfig.accentColor : '#BBBBBB'}]}>{I18n.t(page.name)}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    render() {
        const { groups, currentPage } = this.state;
        const { displayConfig, discoveredDevices } = this.props;

        const screenDimensions = {
            width: Dimensions.get('screen').width,
            height: Dimensions.get('screen').height
        };

        var pages = this.getPages();
        var bkg = this._backgrounds['dimmers'];

        return (
            <View style={[styles.container, displayConfig.backgroundColor ? {backgroundColor: displayConfig.backgroundColor} : null]}>
                {
                    displayConfig.backgroundColor ? null : // dont display image background if background color is specified
                    <FadeInView currentPage={currentPage}>
                        <Image
                            source={bkg}
                            style={[styles.content_container, screenDimensions]}
                        />
                    </FadeInView>
                }

                <View style={[styles.content_container, {height: screenDimensions.height - 75}]}>
                    {pages[currentPage].render(screenDimensions.width, screenDimensions.height - 75)}
                </View>


                <View style={[styles.menu_container, {top: screenDimensions.height-75}]}>
                    <View style={[styles.content_container, {paddingLeft: 0}]}>
                        { displayConfig.sidebar.color ? /* flat sidebar color */
                            <View style={[screenDimensions, {backgroundColor: displayConfig.sidebar.color}]}>
                            </View>
                          :
                            <FadeInView currentPage={currentPage}>
                                <Image
                                    source={bkg}
                                    style={[screenDimensions, {top: -(screenDimensions.height-75), opacity: 0.8}]}
                                    blurRadius={3}
                                    />
                            </FadeInView>
                        }
                    </View>
                    <View style={menuStyles.innerContainer}>
                        {this.renderMenuPages(pages)}
                    </View>
                </View>
            </View>
        );
    }
}
PagingViewClass.contextTypes = {
    store: PropTypes.object
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    menu_container: {
        left: 0,
        position: 'absolute',
        width: '100%',
        height: 75,
        overflow: 'hidden',
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
    },
    content_container: {
        left: 0,
        top: 0,
        position: 'absolute',
        width: '100%',
        height: '100%',
        paddingLeft: 0,
    },
});

const menuStyles = StyleSheet.create({
    innerContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonsGroup: {
        flexDirection: 'row',
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        width: 150,
    },
    icon: {
        width: 44,
        height: 44,
    },
    text: {
        fontSize: 16,
        color: 'white',
        ...TypeFaces.regular,
    }
});

const PagingView = connect(mapStateToProps, mapDispatchToProps) (PagingViewClass);
export default PagingView;
