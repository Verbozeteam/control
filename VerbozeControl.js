/* @flow */

/*import * as React from 'react';
import { View, Text, AppRegistry, StyleSheet, Platform, DeviceEventEmitter,
    Dimensions } from 'react-native';

const UUID = require("uuid");

const I18n = require('./i18n/i18n');

const Grid = require('./components/Grid');
const PagesList = require('./components/PagesList');
const Settings = require('./components/Settings');
const Clock = require('./components/Clock');

const { DaysOfWeek, MonthsOfYear } = require('./config/misc');
const Socket = require('./lib/Socket');
import SystemSetting from 'react-native-system-setting';
const UserPreferences = require('./config/user_preferences');

import type { ConfigType, PageType, RoomType, DiscoveredDeviceType }
    from './config/flowtypes';

type PropsType = {};

type StateType = {
    is_screen_dimmed: boolean,

    config: ConfigType,
    things_state: Object,
    current_room_index: number,

    current_page: number,

    discovered_devices: Array<DiscoveredDeviceType>,
    current_device: DiscoveredDeviceType,
};

class VerbozeControl extends React.Component<PropsType, StateType> {
    state = {
        is_screen_dimmed: false,

        config: {},
        things_state: {},
        current_room_index: 0,

        current_page: 0,

        discovered_devices: [],
        current_device: {},
    };

    _pages: Array<Object> = [{
        name: {
            en: "Room",
            ar: "",
        },
        renderer: this.renderRoomPage.bind(this),
    }, {
        name: {
            en: "Settings",
            ar: "",
        },
        renderer: this.renderSettingsPage.bind(this),
        longPress: (() => {this._settings_mode = true; this.forceUpdate();}).bind(this)
    }];
    _settings_mode = false;

    _screen_dim_timeout: number;
    _screen_dim_timeout_duration = 30000;
    _last_touch_time: number = 0;

    _communication_token: string = "";

    componentWillMount() {
        // load user preferences
        UserPreferences.load((() => {
            this.initialize();
        }).bind(this));

        SystemSetting.getVolume().then((volume) => {
            if (volume < 1) {
                SystemSetting.setVolume(1);
            }
        });
        SystemSetting.setBrightnessForce(1);
    }

    initialize() {
        console.log("Initializing the app...");

        I18n.setLanguage(UserPreferences.get('language'));

        this._communication_token = UUID.v4();

        // install socket event handlers
        DeviceEventEmitter.addListener(Socket.socket_connected, () => {
            console.log('Socket connected!');
            this.fetchConfig();
        });

        DeviceEventEmitter.addListener(Socket.socket_data, (data) => {
            this.handleSocketData(JSON.parse(data.data));
        });

        DeviceEventEmitter.addListener(Socket.socket_disconnected, () => {
            console.log('Socket disconnected!');
            this.setState({
                config: {}
            })
        });

        DeviceEventEmitter.addListener(Socket.manager_log, (data) => {
            console.log(data.data);
        });

        DeviceEventEmitter.addListener(Socket.device_discovered, this.onDeviceDiscovered.bind(this));

        // call discoverDevices every 10 seconds
        setInterval(() => {
            this.discoverDevices()
        }, 10000);

        // load a saved device (if any)
        var cur_device = UserPreferences.get('device');
        if (cur_device)
            this.setCurrentDevice(cur_device);

        this._resetScreenDim();
    }

    componentWillUnmount() {
        clearTimeout(this._screen_dim_timeout);

        Socket.killThread();
    }

    onDeviceDiscovered(device: DiscoveredDeviceType) {
        var { current_device, discovered_devices } = this.state;
        // TODO: This is all patch work.
        device.port = 7990;

        console.log('Found device: ', device.name, device.ip, ":", device.port);

        if (current_device && device.name == current_device.name && device.ip != current_device.ip) {
            Socket.connect(device.ip, device.port);
        }

        // new device or different device => update state
        var device_in_discovered_list_index = -1;
        for (var i = 0; i < discovered_devices.length; i++)
            if (device.name == discovered_devices[i].name)
                device_in_discovered_list_index = i;

        if (device_in_discovered_list_index == -1 || JSON.stringify(discovered_devices[device_in_discovered_list_index]) != JSON.stringify(device)) {
            if (device_in_discovered_list_index == -1)
                discovered_devices.push(device);
            else
                discovered_devices[device_in_discovered_list_index] = device;
            this.setState({
                discovered_devices: discovered_devices
            });
        }
    }

    refresh() {
        console.log('refresh called');
        this.forceUpdate();
    }

    discoverDevices() {
        console.log('Device discovery initiated...');
        Socket.discoverDevices();
    }

    setCurrentDevice(device: DiscoveredDeviceType) {
        const { current_device } = this.state;

        if (JSON.stringify(current_device) != JSON.stringify(device)) {
            this.setState({
                current_device: device
            });
            Socket.connect(device.ip, device.port);
            UserPreferences.save({
                device: device
            });
        }
    }

    fetchConfig() {
        console.log('Fetching config...');
        Socket.write(JSON.stringify({
            code: 0
        }));
    }

    applyConfig(config: ConfigType) {
        this.setState({
            config: config
        });

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
    }

    handleSocketData(data: Object) {
        if (Object.keys(data).length === 0) {
            return;
        }

        // if config provided, apply it
        if ('config' in data) {
            this.applyConfig(data.config);
            delete data['config'];
        }

        var { things_state } = this.state;

        // go through thing ids and update if update not initiated by us
        var state_changed = false;
        for (var key in data) {
            if (!data[key].token || data[key].token != this._communication_token) {
                things_state[key] = data[key];
                state_changed = true;
            }
        }

        if (state_changed) {
            this.setState({
                things_state
            });
        }
    }

    updateThing(id: string, update: Object, remote_only?: boolean) {
        remote_only = remote_only || false;

        update.token = this._communication_token;

        Socket.write(JSON.stringify({
            thing: id,
            ...update
        }));

        if (!remote_only) {
            const { things_state } = this.state;
            things_state[id] = Object.assign(things_state[id], update);
            this.setState({
                things_state
            });
        }
    }

    changePage(index: number) {
        if (index != this.state.current_page) {
            this.setState({
                current_page: index,
            });
        }
        this._settings_mode = false; // rest/disable settings mode
    }

    renderSettingsPage(width, height) {
        var discovered_devices = Object.values(this.state.discovered_devices);
        return <Settings
            settings= {[
                {
                    name: 'Language',
                    action: 'changeLanguage',
                    options: [['English', 'en'], ['عربي', 'ar']]
                }
            ]}
            layout={{
                height: height - 20,
                width: width - 110,
                top: 5,
                left: 95,
                margin: 5
            }}

            refresh={this.refresh.bind(this)}
            showDiscoverDevices={this._settings_mode}
            discoveredDevices={discovered_devices}
            discoverDevices={this.discoverDevices.bind(this)}
            setDevice={this.setCurrentDevice.bind(this)}
            currentDevice={this.state.current_device} />
    }

    renderRoomPage(width, height) {
        const { config, things_state, current_room_index } = this.state;

        var grid_layout = {
            top: 0,
            left: 90,
            width: width - 90,
            height: height,
        };

        Object.assign(grid_layout, config.rooms[current_room_index].layout);

        return <Grid {...config.rooms[current_room_index]}
            layout={grid_layout}
            thingsState={things_state}
            updateThing={this.updateThing.bind(this)}
            changePage={this.changePage.bind(this)} />;
    }

    render() {
        const { config, is_screen_dimmed, things_state, current_room_index } = this.state;
        var { current_page } = this.state;

        const { height, width }: {height: number, width: number} = Dimensions.get('screen');

        console.log("toplevel render!!!!!!!!!!!!!!!!!!!")

        // create dimmed overlay if applicable (loading, or clock)
        var displayed_ui = null;
        var pages_list = null;
        if (is_screen_dimmed) {
            displayed_ui = <Clock />;
        } else {
            if (current_page == 0 && (!config || !config.rooms || current_room_index >= config.rooms.length))
                current_page = this._pages.length - 1;

            pages_list = <PagesList selected={current_page}
                layout={{height: height, width: 90, top: 0, left: 0}}
                pages={this._pages}
                changePage={this.changePage.bind(this)} />;
            displayed_ui = this._pages[current_page].renderer(width, height);
        }

        return (
            <View style={styles.container}
                onTouchStart={this._resetScreenDim.bind(this)}
                onTouchMove={this._resetScreenDim.bind(this)}>
                {pages_list}
                {displayed_ui}
            </View>
        );
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
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a'
    },
});

module.exports = VerbozeControl;*/
















import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import SystemSetting from 'react-native-system-setting';
const UserPreferences = require('./lib/UserPreferences');
const Clock = require('./components/Clock');

const screenActions = require ('./redux-objects/actions/screen');

function mapStateToProps(state) {
    return {
        screen: state.screen,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onDimScreen: b => {dispatch(screenActions.dim_screen(b));}
    };
}

class VerbozeControl extends React.Component {
    _unsubscribe: () => null = () => {return null;};

    _screen_dim_timeout: number;
    _screen_dim_timeout_duration = 30000;
    _last_touch_time: number = 0;

    componentWillMount() {
        // load user preferences
        UserPreferences.load((() => {
            this.initialize();
        }).bind(this));

        SystemSetting.getVolume().then((volume) => {
            if (volume < 1) {
                SystemSetting.setVolume(1);
            }
        });

        SystemSetting.setBrightnessForce(1);
    }

    initialize() {
        const { store } = this.context;
        this._unsubscribe = store.subscribe(() => {});
    }

    _resetScreenDim() {
        SystemSetting.setBrightnessForce(1);
        clearTimeout(this._screen_dim_timeout);
        this._screen_dim_timeout = setTimeout(() => {
            this.props.onDimScreen(true);
            SystemSetting.setBrightnessForce(0);
        }, this._screen_dim_timeout_duration);
    }

    _wakeupScreen() {
        if (this.props.screen.isDimmed)
            this.props.onDimScreen(false);
    }

    render() {
        var inner_ui = null;
        if (this.props.screen.isDimmed) {
            inner_ui = <Clock />;
        } else {
            this._resetScreenDim();
            inner_ui = <View />;
        }

        return <View style={styles.container}
            onTouchStart={this._wakeupScreen.bind(this)}
            onTouchMove={this._wakeupScreen.bind(this)}>
            {inner_ui}
        </View>
    }
}
VerbozeControl.contextTypes = {
    store: React.PropTypes.object
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a'
    },
});

VerbozeControl = connect(mapStateToProps, mapDispatchToProps) (VerbozeControl);

/**
 * Create the Redux store and wrap the application in a redux context
 */

import { createStore, combineReducers, bindActionCreators } from 'redux';
import { Provider, connect } from 'react-redux';

const screenReducers = require('./redux-objects/reducers/screen');
let STORE = createStore(combineReducers({
    screen: screenReducers,
}));

class VerbozeControlWrap extends React.Component {
    render() {
        return <Provider store={STORE}><VerbozeControl /></Provider>
    }
}

module.exports = VerbozeControlWrap;



