/* @flow */

import Storage from 'react-native-storage';
import { AsyncStorage } from 'react-native';

import type { DiscoveredDevice } from './config/flowtypes';

type DiscoveredDeviceMap = {
    [string]: DiscoveredDevice
}

class LocalStorage {
    _local_storage = new Storage({
        size: 1000,
        storageBackend: AsyncStorage,
        defaultExpires: null,
        enableCache: true,
    });

    _discovered_devices: Object = {};
    _current_device_name: string = "";

    get_saved_device(on_found: Function, on_failure: Function): DiscoveredDevice {
        this._local_storage.load({
            key: 'savedDevice',
            autoSync: false,
        }).then(function (ret: DiscoveredDevice) {
            if (on_found) {
                this._current_device_name = ret.name;
                on_found(ret);
            }
        }.bind(this)).catch(err => {
            if (on_failure)
                on_failure(err);
        });
    }

    set_saved_device(device: DiscoveredDevice) {
        this._local_storage.save({
            key: 'savedDevice',
            data: device,
        });
    }

    get_discovered_devices(): DiscoveredDeviceMap {
        return this._discovered_devices;
    }

    add_discovered_device(device: DiscoveredDevice) {
        this._discovered_devices[device.name] = device;
    }

    clear_discovered_devices() {
        this._discovered_devices = {};
    }

    get_current_device_name(): string {
        return this._current_device_name;
    }
};

module.exports = new LocalStorage();

