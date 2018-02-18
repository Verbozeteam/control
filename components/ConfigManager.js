/* @flow */

export type ThingStateType = Object;

export type ThingMetadataType = {
    id: string,
    category: string,
    name: string,
    [string]: any, // other properties
};

export type PresetType = {
    [string]: Object,
};

export type GroupType = {
    id: string,
    name: string,
    things: Array<ThingMetadataType>,
    presets: ?Array<PresetType>,
};

export type RoomType = {
    id: string,
    name: string,
    groups: Array<GroupType>,
};

export type TranslationsType = {
    [string]: {
        en: string,
        ar: ?string,
        [string]: string, // other languages...
    };
};

export type ConfigType = {
    id: string,
    rooms: Array<RoomType>,
    translations: ?TranslationsType,
};

export type MiddlewareUpdateType = {
    [string]: ThingStateType,
    config: ConfigType,
};

export type ConfigChangeCallbackType = (ConfigType) => null;

export type ThingStateChangeCallbackType = (ThingMetadataType, ThingStateType) => null;

export type LegacyConfigType = {
    id: string,
    rooms: Array<RoomType>,
};

class ConfigManagerImpl {
    _configChangeCallbacks: Array<ConfigChangeCallbackType> = [];
    _thingStateChangeCallbacks: {[string]: Array<ThingStateChangeCallbackType>} = {};
    _categoryStateChangeCallbacks: {[string]: Array<ThingStateChangeCallbackType>} = {};
    _SocketLibrary: Object;

    config: ?ConfigType = null;
    things: {[string] : ThingStateType} = {};
    thingMetas: {[string] : ThingMetadataType} = {};

    initialize(socketLibrary: Object) {
        this._SocketLibrary = socketLibrary;
        this._SocketLibrary.setOnMessage(this.onMiddlewareUpdate.bind(this));
    }

    loadConfig1(cfg: LegacyConfigType) {
        throw "Unimplemented";
    }

    loadConfig2(cfg: ConfigType) {
        this.config = JSON.parse(JSON.stringify(cfg));
        this.things = {};
        this.thingMetas = {};
        for (var r = 0; r < this.config.rooms.length; r++) {
            var room = this.config.rooms[r];
            for (var g = 0; g < room.groups.length; g++) {
                var group = room.groups[g];
                for (var t = 0; t < group.things.length; t++)
                    this.thingMetas[group.things[t].id] = group.things[t];
            }
        }
    }

    setConfig(cfg: ConfigType) {
        try {
            this.loadConfig2(cfg);
        } catch (e1) {
            console.log("Middleware config not latest");
            try {
                this.loadConfig1(cfg);
            } catch (e2) {
                console.log("Middleware config not supported ", e1, e2);
                console.log(cfg);
            }
        }
    }

    setThingState(id: string, partialState: Object, send_socket: boolean) {
        if (send_socket === undefined)
            send_socket = true;
        return this.setThingsStates({[id]: partialState}, send_socket);
    }

    setThingsStates(idToState: Object, send_socket: boolean) {
        if (send_socket === undefined)
            send_socket = true;

        if (send_socket) {
            for (var id in idToState)
                this._SocketLibrary.sendMessage({...{thing: id}, ...idToState[id]});
        }

        for (id in idToState) {
            var oldThingState = JSON.stringify(this.things[id]);
            this.things[id] = {...(this.things[id] || {}), ...idToState[id]};

            if (JSON.stringify(this.things[id]) !== oldThingState) {
                var category = this.things[id].category;

                if (id in this._thingStateChangeCallbacks) {
                    for (var i = 0; i < this._thingStateChangeCallbacks[id].length; i++)
                        this._thingStateChangeCallbacks[id][i](this.thingMetas[id], this.things[id]);
                }
                if (category in this._categoryStateChangeCallbacks) {
                    for (var i = 0; i < this._categoryStateChangeCallbacks[category].length; i++)
                        this._categoryStateChangeCallbacks[category][i](this.thingMetas[id], this.things[id]);
                }
            }
        }
    }

    onMiddlewareUpdate(update: MiddlewareUpdateType) {
        update = JSON.parse(JSON.stringify(update));
        if ('config' in update) {
            this.setConfig(update.config);
            if (this.config) {
                for (var c = 0; c < this._configChangeCallbacks.length; c++)
                    this._configChangeCallbacks[c](this.config);
            }
            delete update.config;
        }

        this.setThingsStates(update, false);
    }

    registerConfigChangeCallback(cb: ConfigChangeCallbackType) {
        this._configChangeCallbacks.push(cb);
        return () => this.deregisterConfigChangeCallback(cb);
    }

    deregisterConfigChangeCallback(cb: ConfigChangeCallbackType) {
        for (var c = 0; c < this._configChangeCallbacks.length; c++) {
            if (this._configChangeCallbacks[c] == cb) {
                this._configChangeCallbacks.splice(c, 1);
                return;
            }
        }
    }

    registerThingStateChangeCallback(id: string, cb: ThingStateChangeCallbackType) {
        if (id in this._thingStateChangeCallbacks)
            this._thingStateChangeCallbacks[id].push(cb);
        else
            this._thingStateChangeCallbacks[id] = [cb];
        return () => this.deregisterThingStateChangeCallback(cb);
    }

    deregisterThingStateChangeCallback(cb: ThingStateChangeCallbackType) {
        for (var tid in this._thingStateChangeCallbacks) {
            for (var i = 0; i < this._thingStateChangeCallbacks[tid].length; i++) {
                if (this._thingStateChangeCallbacks[tid][i] == cb) {
                    this._thingStateChangeCallbacks[tid].splice(i, 1);
                    return;
                }
            }
        }
    }

    registerCategoryChangeCallback(category: string, cb: ThingStateChangeCallbackType) {
        if (category in this._categoryStateChangeCallbacks)
            this._categoryStateChangeCallbacks[category].push(cb);
        else
            this._categoryStateChangeCallbacks[category] = [cb];
        return () => this.deregisterCategoryChangeCallback(cb);
    }

    deregisterCategoryChangeCallback(cb: ThingStateChangeCallbackType) {
        for (var cid in this._categoryStateChangeCallbacks) {
            for (var i = 0; i < this._categoryStateChangeCallbacks[cid].length; i++) {
                if (this._categoryStateChangeCallbacks[cid][i] == cb) {
                    this._categoryStateChangeCallbacks[cid].splice(i, 1);
                    return;
                }
            }
        }
    }
};

export const ConfigManager = new ConfigManagerImpl();
