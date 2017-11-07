/* @flow */

import * as React from 'react';
import { View, Text, AppRegistry, StyleSheet, Platform, DeviceEventEmitter,
    Dimensions } from 'react-native';

const I18n = require('./i18n/i18n');

const Grid = require('./components/Grid');
const PagesList = require('./components/PagesList');
const Settings = require('./components/Settings');
const Clock = require('./components/Clock');
const Loading = require('./components/Loading');

const { DaysOfWeek, MonthsOfYear } = require('./config/misc');
const Socket = require('./lib/Socket');
import SystemSetting from 'react-native-system-setting';
const StoredDevices = require('./config/stored_devices');
const UserPreferences = require('./config/user_preferences');

import type { ConfigType, PageType, RoomType, DiscoveredDeviceType, LayoutType }
    from './config/flowtypes';

type PropsType = {};

type StateType = {
    loading: boolean,
    is_screen_dimmed: boolean,
    config: ConfigType,
    things_state: Object,
    page_index: number,
    discovered_devices: Array<DiscoveredDeviceType>
};

class VerbozeControl extends React.Component<PropsType, StateType> {

    state = {
        loading: true,
        is_screen_dimmed: false,
        config: {},
        things_state: {},
        page_index: 0,
        dev_debug: false,
        discovered_devices: []
    };

    _screen_dim_timeout: number;
    _screen_dim_timeout_duration = 30000;
    _last_touch_time: number = 0;

    _user_preferences_loaded: boolean = false;
    _config_loaded: boolean = false;

    _blocked_things: Array<string> = [];

    componentWillMount() {
        // load user preferences
        UserPreferences.load(() => {
            this._user_preferences_loaded = true;
            I18n.setLanguage(UserPreferences.get('language'));
            this._recheckLoading();
        });

        // call discoverDevices every 10 seconds
        setInterval(() => {
            this.discoverDevices()
        }, 20000);

        SystemSetting.getVolume().then((volume) => {
            if (volume < 1) {
                SystemSetting.setVolume(1);
            }
        });
        SystemSetting.setBrightnessForce(1);
    }

    componentDidMount() {
        // install socket event handlers
        DeviceEventEmitter.addListener(Socket.socket_connected, () => {
            console.log('Socket connected!');
            this.fetchConfig();
        });

        DeviceEventEmitter.addListener(Socket.socket_data, (data) => {
            // console.log(data);
            this.handleSocketData(JSON.parse(data.data));
        });

        DeviceEventEmitter.addListener(Socket.socket_disconnected, () => {
            console.log('Socket disconnected!');
        });

        DeviceEventEmitter.addListener(Socket.manager_log, (data) => {
            console.log(data.data);
        });

        DeviceEventEmitter.addListener(Socket.device_discovered,
            (data: DiscoveredDeviceType) => {

            console.log('Found name', data.name, data.ip, data.port);
            StoredDevices.add_discovered_device(data);
            if (data.name == StoredDevices.get_current_device_name()) {
                Socket.connect(data.ip, data.port);
            }

            var { discovered_devices } = this.state;
            discovered_devices.push(data);
            this.setState({
                discovered_devices: discovered_devices
            });

            this._resetScreenDim()
        });

        // load a saved device (if any)
        StoredDevices.get_saved_device((device: DiscoveredDeviceType) => {
            // device has been found
            Socket.connect(device.ip, device.port);
        }, (error) => {
            // no device found
            this.discoverDevices();
        });

        // const some_device = {ip: '10.11.28.155', name: 'Fituri', port: 4567};
        // const { discovered_devices } = this.state;
        // discovered_devices.push(some_device);
        // this.setState({
        //     discovered_devices: discovered_devices
        // });

        this._resetScreenDim();
    }

    componentWillUnmount() {
        clearTimeout(this._screen_dim_timeout);

        Socket.killThread();
    }

    _resetScreenDim() {
        const { is_screen_dimmed } = this.state;
        if (is_screen_dimmed) {
            this.setState({
                is_screen_dimmed: false
            });
            SystemSetting.setBrightnessForce(1);
        }

        clearTimeout(this._screen_dim_timeout);
        this._screen_dim_timeout = setTimeout(() => {
            const datetime = new Date();
            this.setState({
                is_screen_dimmed: true
            });
            SystemSetting.setBrightnessForce(0);
        }, this._screen_dim_timeout_duration);
    }

    /* recheckLoading
     * Returns sets loading in state to false if everything is loaded */
    _recheckLoading() {
        if (this._user_preferences_loaded &&
            this._config_loaded) {
            this.setState({
                loading: false
            });
        }
    }

    refresh() {
        console.log('refresh called');
        console.log(this);
        this.forceUpdate();
    }

    discoverDevices() {
        console.log('discoverDevices');
        StoredDevices.clear_discovered_devices();
        Socket.discoverDevices();
    }

    fetchConfig() {
        console.log('Fetching config...');
        this.setState({
            loading: true
        });

        Socket.write(JSON.stringify({
            code: 0
        }));
    }

    applyConfig(config: ConfigType) {
        this.setState({
            config: config
        });

        console.log(config);

        // TODO: this needs to change
        if (config.rooms) {
            for (var i = 0; i < config.rooms.length; i++) {
                const room = config.rooms[i];
                I18n.addTranslations(room.name);
                if ('grid' in room) {
                    for (var j = 0; j < room.grid.length; j++) {
                        const grid = room.grid[j];
                        for (var k = 0; k < grid.panels.length; k++) {
                            const panel = grid.panels[k];
                            I18n.addTranslations(panel.name);
                            for (var l = 0; l < panel.things.length; l++) {
                                const thing = panel.things[l];
                                I18n.addTranslations(thing.name);
                            }
                        }
                    }
                }
            }
        }

        this._config_loaded = true;
        this._recheckLoading();
    }

    handleSocketData(data: Object) {
        if (Object.keys(data).length === 0) {
            return;
        }

        console.log('handleSocketData =>', data);

        const { things_state } = this.state;

        // if config provided, apply it
        if ('config' in data) {
            this.applyConfig(data.config);
            delete data['config'];
        }

        // go through thing ids and update if thing is not blocked
        for (var key in data) {
            if (this._blocked_things.indexOf(key) === -1) {
                things_state[key] = data[key];
            }
        }

        this.setState({
            things_state
        });
    }

    updateThing(id: string, update: Object, remote_only?: boolean) {
        remote_only = remote_only || false;

        Socket.write(JSON.stringify({
            thing: id,
            ...update
        }));
        console.log('Socket write: ', id, update, remote_only);

        if (!remote_only) {
            const { things_state } = this.state;
            things_state[id] = Object.assign(things_state[id], update);
            this.setState({
                things_state
            });
        }
    }

    blockThing(id: string) {
        this._blocked_things.push(id);
    }

    unblockThing(id: string) {
        var index = this._blocked_things.indexOf(id);

        while (index !== -1) {
            this._blocked_things.splice(index, 1);
            index = this._blocked_things.indexOf(id);
        }
    }

    changePage(index: number) {
        console.log('Change page to ', index);

        this.setState({
            page_index: index,
            dev_debug: false
        })
    }

    showDiscoverDevices() {
        console.log('showDiscoverDevices');
        var index = 0;
        if (this.state.config) {
            index = this.state.config.rooms.length;
        }
        this.setState({
            page_index: index,
            dev_debug: true
        });
    }

    render() {
        console.log('VerbozeControl render!');

        const { config, loading, is_screen_dimmed, things_state, dev_debug,
            discovered_devices} = this.state;
        var { page_index } = this.state;

        const { height, width}:
            {height: number, width: number} = Dimensions.get('screen');

        var pages: Array<RoomType| PageType> = [];
        // if (config && config.rooms) {
        //     pages = config.rooms;
        // }

        // stupid flow
        if (config && config.rooms) {
            for (var i = 0; i < config.rooms.length; i++) {
                pages.push(config.rooms[i]);
            }
        }
        pages.push({
            name: {
                en: 'Settings',
                ar: 'الإعدادات'
            },
            settings: [
                {
                    name: 'Language',
                    action: 'changeLanguage',
                    options: [['English', 'en'], ['عربي', 'ar']]
                }
            ],
            layout: {
                height: height - 20,
                width: width - 120,
                top: 5,
                left: 105,
                margin: 5
            },
            longPress: this.showDiscoverDevices.bind(this)
        });

        // create dimmed overlay if applicable (loading, or clock)
        var dimmed_overlay = null;
        if (loading) {
            dimmed_overlay = <Loading discoveredDevices={discovered_devices}/>
        }

        else if (is_screen_dimmed) {
            dimmed_overlay = <Clock />;
        }

        // create Grid UI
        var ui = null;
        var pages_list = null;
        if (pages && !dimmed_overlay) {

            console.log(pages);
            const grid_layout = {
                height,
                width: width - 100,
                top: 0,
                left: 100
            };

            if (page_index >= pages.length) {
                page_index = pages.length - 1;
                this.changePage(pages.length - 1);
            }

            pages[page_index].layout = Object.assign(grid_layout,
                pages[page_index].layout);

            if (page_index == pages.length - 1) {
                ui = <Settings {...pages[page_index]}
                    refresh={this.refresh.bind(this)}
                    showDiscoverDevices={dev_debug}
                    discoveredDevices={this.state.discovered_devices} />
            } else {
                var ui = <Grid {...pages[page_index]}
                    layout={grid_layout}
                    thingsState={things_state}
                    updateThing={this.updateThing.bind(this)}
                    blockThing={this.blockThing.bind(this)}
                    unblockThing={this.unblockThing.bind(this)}
                    changePage={this.changePage.bind(this)} />;
            }

            pages_list = <PagesList selected={page_index}
                layout={{height, width: 100, top: 0, left: 0}}
                pages={pages}
                changePage={this.changePage.bind(this)} />;
        }

        return (
            <View style={styles.container}
                onTouchStart={this._resetScreenDim.bind(this)}
                onTouchMove={this._resetScreenDim.bind(this)}>
                {ui}
                {pages_list}
                {dimmed_overlay}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000'
    },
    rooms_column: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: 100,
        backgroundColor: 'red',
        padding: 5
    },
    room_box: {
        height: 80,
        width: 80,
        backgroundColor: 'green',
        margin: 5
    }
});

module.exports = VerbozeControl;
