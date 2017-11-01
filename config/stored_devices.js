/* @flow */

import Storage from 'react-native-storage';
import { AsyncStorage } from 'react-native';

import type { DiscoveredDeviceType } from './flowtypes';

type DiscoveredDeviceMapType = {
    [string]: DiscoveredDeviceType
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
    _current_device: DiscoveredDeviceType = {};

    get_saved_device(on_found: Function, on_failure: Function) {
        this._local_storage.load({
            key: 'savedDevice',
            autoSync: false,
        }).then(function (ret: DiscoveredDeviceType) {
            if (on_found) {
                this._current_device_name = ret.name;
                this._current_device = ret;
                on_found(ret);
            }
        }.bind(this)).catch(err => {
            console.log('error' + err);
            if (on_failure)
                on_failure(err);
        });
    }

    set_saved_device(device: DiscoveredDeviceType) {
        this._local_storage.save({
            key: 'savedDevice',
            data: device,
        });
    }

    get_discovered_devices(): DiscoveredDeviceMapType {
        return this._discovered_devices;
    }

    add_discovered_device(device: DiscoveredDeviceType) {
        this._discovered_devices[device.name] = device;
    }

    clear_discovered_devices() {
        this._discovered_devices = {};
    }

    get_current_device_name(): string {
        return this._current_device_name;
    }

    get_current_device(): DiscoveredDeviceType {
        return this._current_device;
    }
};

module.exports = new LocalStorage();
