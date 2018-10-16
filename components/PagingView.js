/* @flow */

import * as React from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, Image } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Immersive from 'react-native-immersive';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { GroupType, ThingMetadataType, ConfigType } from '../js-api-utils/ConfigManager';
const settingsActions = require ('../redux-objects/actions/settings');
import { TypeFaces } from '../constants/styles';

const I18n = require('../js-api-utils/i18n/i18n');

import RoomControlsPanel    from './RoomControlsPanel';
import AlarmsPanel          from './Alarms/AlarmsPanel';
import TelephonePanel       from './TelephonePanel';
import AmenitiesPanel       from './AmenitiesPanel';
import SettingsPanel        from './Settings/SettingsPanel';

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
    render: (number, number, ?boolean) => any,
    background: number,
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
    return {
        set_dev_mode: (b: boolean) => {dispatch(settingsActions.set_dev_mode(b));},
    };
}

class PagingViewClass extends React.Component<any, StateType> {
    _unsubscribe: () => any = () => null;

    state = {
        groups: [],
        currentPage: 0,
    };

    _backgrounds = {
        'dimmers': require('../assets/images/room-lights.png'),
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
            passive: require('../assets/images/icons/bed.png'),
            active: require('../assets/images/icons/bed_on.png'),
        },
        amenities: {
            passive: require('../assets/images/icons/bell.png'),
            active: require('../assets/images/icons/bell_on.png'),
        },
        alarms: {
            passive: require('../assets/images/icons/alarm.png'),
            active: require('../assets/images/icons/alarm_on.png'),
        },
        telephone: {
            passive: require('../assets/images/icons/telephone.png'),
            active: require('../assets/images/icons/telephone_on.png'),
        },
        settings: {
            passive: require('../assets/images/icons/cog.png'),
            active: require('../assets/images/icons/cog_on.png'),
        },
    };

    _last_settings_click = new Date();
    _num_settings_clicks = 0;

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
                            background: this._backgrounds.alarm_system,
                            things: [thing],
                            render: (w, h) => <AlarmsPanel id={thing.id} width={w} height={h} />
                        });
                        break;
                    case 'telephone':
                        pages.push({
                            name: 'Telephone',
                            icon: this._icons.telephone,
                            background: this._backgrounds.settings,
                            things: [thing],
                            render: (w, h) => <TelephonePanel id={thing.id} width={w} height={h} />,
                        });
                        break;
                    case 'hotel_orders':
                        pages.push({
                            name: 'Amenities',
                            icon: this._icons.amenities,
                            background: this._backgrounds.hotel_controls,
                            things: [thing],
                            render: (w, h) => <AmenitiesPanel id={thing.id} width={w} height={h} />,
                        });
                        break;
                }
            }
        }

        if (roomThings.length > 0)
            pages = [{
                name: 'Room',
                icon: this._icons.room,
                background: this._backgrounds.dimmers,
                things: roomThings,
                render: (w, h) => <RoomControlsPanel ids={roomThings.map(t => t.id)} width={w} height={h} />
            }].concat(pages);
        pages.push({
            name: 'Settings',
            icon: this._icons.settings,
            background: this._backgrounds.settings,
            things: [],
            render: (w, h) => <SettingsPanel width={w} height={h} language={I18n._language} />,
        });

        return pages;
    }

    onPageClick(numPages: number, i: number) {
        if (this.state.currentPage !== i)
            this.setState({currentPage: i});

        if (i == numPages - 1) {
            var now = new Date();
            this._num_settings_clicks += 1;
            if (now - this._last_settings_click < 500) {
                if (this._num_settings_clicks >= 8)
                    this.props.set_dev_mode(true);
            } else
                this._num_settings_clicks = 1;
            this._last_settings_click = now;
        } else
            this.props.set_dev_mode(false);
    }

    renderMenuPages(pages: Array<PageType>) {
        const { currentPage } = this.state;
        const { displayConfig } = this.props;

        return (
            <View style={menuStyles.buttonsGroup}>
                {pages.map((page, i) =>
                    <TouchableOpacity key={'group-'+i} activeOpacity={0.5} onPress={() => this.onPageClick(pages.length, i)}>
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

        Immersive.setImmersive(true);

        const screenDimensions = {
            width: Dimensions.get('screen').width,
            height: Dimensions.get('screen').height
        };

        var pages = this.getPages();
        var bkg = pages[currentPage].background;

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
