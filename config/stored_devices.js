
import Storage from 'react-native-storage';
import { AsyncStorage } from 'react-native';

class LocalStorage {
    _local_storage = new Storage({
        size: 1000,
        storageBackend: AsyncStorage,
        defaultExpires: null,
        enableCache: true,
    });

    _discovered_devices = {};
    _current_device_name = "";

    get_saved_device(on_found, on_failure) {
        this._local_storage.load({
            key: 'savedDevice',
            autoSync: false,
        }).then(ret => {
            if (on_found) {
                _current_device_name = ret.name;
                on_found(ret);
            }
        }).catch(err => {
            if (on_failure)
                on_failure();
        });
    }

    set_saved_device(device) {
        this._local_storage.save({
            key: 'savedDevice',
            data: device,
            expires: null,
        });
    }

    get_discovered_devices() {
        return this._discovered_devices;
    }

    add_discovered_device(device) {
        this._discovered_devices[device.name] = device;
    }

    clear_discovered_devices() {
        this._discovered_devices = {};
    }

    get_current_device_name() {
        return this._current_device_name;
    }
};

module.exports = new LocalStorage();

