/** @flow */

class DeviceEngineClass {
    _devices: Object = {
        lenovo_tablet: {
            orientation: 'horizontal',
            blockSize: {
                width: 150,
                height: 150,
            },
        },
        phone: {
            orientation: 'vertical',
            blockSize: {
                width: 150,
                height: 150,
            },
        },
    };
    properties: Object = {};

    initialize() {
    }
};

const DeviceEngine = new DeviceEngineClass();
export default DeviceEngine;
