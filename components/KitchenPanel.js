/* @flow */

import * as React from 'react';
import { View, Text, Image, ScrollView, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { ConfigManagerClass } from '../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../js-api-utils/ConfigManager';
import { SocketCommunicationClass } from '../js-api-utils/SocketCommunication';

import type { DiscoveredDeviceType } from '../js-api-utils/ConnectionTypes';
const connectionActions = require('../redux-objects/actions/connection');

import MagicButton from '../react-components/MagicButton';

import { Colors, TypeFaces } from '../constants/styles';

const I18n = require('../js-api-utils/i18n/i18n');

type MenuItemType = string;

type OrderType = {
    id: string,
    timeout: number,
    placed_by_name: string,
    items: Array<{
        name: string,
        quantity: string,
        status: -1 | 0 | 1
    }>
};

type PropsType = {
    id: string,
    displayConfig: Object,
    device: DiscoveredDeviceType,
    currentDevice: DiscoveredDeviceType,
};

type StateType = {
    menu: Array<MenuItemType>,
    orders: Array<OrderType>,
    cart: {[string]: number},
    should_show_new_order: boolean
};

function mapStateToProps(state) {
    return {
        displayConfig: state.screen.displayConfig,
        currentDevice: state.connection.currentDevice
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setCurrentDevice: (d: DiscoveredDeviceType) => {
            dispatch(connectionActions.set_current_device(d));
        }
    };
}

class KitchenPanel extends React.Component<PropsType, StateType> {
    _unsubscribe: () => null = () => {return null;};

    state = {
        menu: [],
        orders: [],
        cart: {},
        should_show_new_order: false
    };

    KitchenSocketCommunication = null;
    KitchenConfigManager = null;

    componentWillMount() {
        this.createConnection();
    }

    componentWillUnmount() {
        this.destroyConnection();
    }

    createConnection() {
        const { device } = this.props;

        this.destroyConnection();
        this.KitchenSocketCommunication = new SocketCommunicationClass();
        this.KitchenConfigManager = new ConfigManagerClass();
        this.KitchenSocketCommunication.initialize(true);
        this.KitchenSocketCommunication.setOnConnected(this.handleSocketConnected.bind(this));
        this.KitchenSocketCommunication.setOnDisconnected(this.handleSocketDisconnected.bind(this));
        this.KitchenConfigManager.initialize(this.KitchenSocketCommunication); // this registers SocketCommunication.setOnMessage
        this.KitchenSocketCommunication.connect(device.ip, device.port);
    }

    destroyConnection() {
        if (this.KitchenSocketCommunication && this.KitchenConfigManager) {
            console.log("running cleanup...")
            this.KitchenSocketCommunication.cleanup();
            delete this.KitchenSocketCommunication;
            delete this.KitchenConfigManager;
        }
    }

    handleSocketConnected() {
        console.log("kitchen connected");
        if (this.KitchenSocketCommunication) {
            this.KitchenSocketCommunication.sendMessage({
                code: 0
            });
        }
    }

    handleSocketDisconnected() {
        console.log("kitchen disconnected");
        this.createConnection();
    }

    onKitchenChanged(meta: ThingMetadataType, kitchenState: ThingStateType) {
        var { menu, orders } = this.state;

        console.log('onKitchenChanged', kitchenState);

        if (JSON.stringify(menu) !== JSON.stringify(kitchenState.menu) ||
            JSON.stringify(orders) !== JSON.stringify(kitchenState.orders)) {
            this.setState({
                menu: kitchenState.menu,
                orders: kitchenState.orders
            });
        }
    }

    connectKitchen() {
        const { device, setCurrentDevice, currentDevice } = this.props;

        this._previous_connected_device = currentDevice;
        setCurrentDevice(device);
    }

    disconnectKitchen() {
        const { setCurrentDevice } = this.props;

        if (this._previous_connected_device) {
            setCurrentDevice(this._previous_connected_device);
        }
    }

    incrementMenuItemQuantity(name: string) {
        var { cart } = this.state;

        if (name in cart) {
            cart[name] += 1;
        } else {
            cart[name] = 1;
        }

        this.setState({cart});
    }

    decrementMenuItemQuantity(name: string) {
        var { cart } = this.state;

        if (name in cart) {
            cart[name] = cart[name] - 1;
            if (cart[name] === 0) {
                delete cart[name];
            }
        }

        this.setState({cart});
    }

    submitNewOrder() {
        const { id } = this.props;
        const { cart } = this.state;

        if (Object.keys(cart).length <= 0) {
            return;
        }

        /* create orders from cart */
        const order = [];
        for (item in cart) {
            order.push({
                name: item,
                quantity: cart[item]
            });
        }

        ConfigManager.setThingState(id, {order, 'placed_by_name': 'Mohammed'}, true, false);

        /* empty cart */
        this.setState({
            cart: {},
            should_show_new_order: true
        });
    }

    renderMenuItem(item: MenuItemType, index: number) {
        /* give name title case */
        const name = item.name.split(' ').map(
            x => x[0].toUpperCase() + x.slice(1)).join(' ');

        return (
            <View key={'menu-item-' + index} style={styles.menu_item}>
                <Text style={styles.menu_item_text}>{name}</Text>
                <View style={styles.menu_item_actions}>
                    <TouchableWithoutFeedback
                        onPressIn={() => this.incrementMenuItemQuantity(item.name)}>
                        <View><Text style={styles.menu_item_action}>Add +</Text></View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback
                        onPressIn={() => this.decrementMenuItemQuantity(item.name)}>
                        <View><Text style={styles.menu_item_action}>Remove -</Text></View>
                    </TouchableWithoutFeedback>
                </View>
            </View>
        );
    }

    renderCartItem(item: string, index: number) {
        const { cart } = this.state;

        return (
            <View key={'cart-item-' + index} style={styles.menu_item}>
                <Text style={styles.menu_item_text}>{item}</Text>
                <Text style={styles.menu_item_text}>{cart[item]}x</Text>
            </View>
        );
    }

    renderOrderItem(item: OrderItemType, index: number) {

        var status = '';
        switch (item.status) {
            case -1:
                status = 'Placed'
                break;
            case 1:
                status = 'Accepted'
                break;
            case 0:
                status = 'Rejected'
                break;
        }

        return (
            <View style={styles.order_item}>
                <Text>{item.name} {item.quantity}x {status}</Text>
            </View>
        );
    }

    renderOrder(order: OrderType, index: number) {
        console.log('order', order);

        return (
            <View key={'order-' + order.id} style={styles.order_container}>
                <Text>Order {order.id}</Text>
                {order.items.map(this.renderOrderItem.bind(this))}
            </View>
        )
    }

    renderOrdersView() {
        const { orders } = this.state;

        return (
            <View style={styles.container}>
                <View style={styles.navbar}>
                    <Text style={styles.header}>Orders</Text>
                    <TouchableWithoutFeedback style={styles.dismiss}
                        onPressIn={() => this.setState({should_show_new_order: false})}>
                        <View>
                            <Text>Dismiss</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                <ScrollView style={styles.scroll_view_container}>

                </ScrollView>
            </View>
        );
    }

    renderMenuView() {
        const { menu, cart } = this.state;

        const menu_items = menu.map(this.renderMenuItem.bind(this));
        const cart_items = Object.keys(cart).map(this.renderCartItem.bind(this));

        return (
            <View style={styles.container}>
                <View style={styles.navbar}>
                    <Text style={styles.header}>Menu</Text>
                </View>
                <View style={styles.menu_container}>
                    <ScrollView style={styles.scroll_view_container}>
                        {menu_items}
                    </ScrollView>
                </View>
                <View style={styles.new_order_container}>
                    <ScrollView style={styles.scroll_view_container}>
                        {cart_items}
                    </ScrollView>
                    <TouchableWithoutFeedback
                        onPressIn={this.submitNewOrder.bind(this)}>
                        <View>
                            <Text>Submit Order</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </View>
        );
    }

    render() {
        const { orders, should_show_new_order } = this.state;

        if (should_show_new_order && orders.length > 0) {
            return this.renderOrdersView();
        } else {
            return this.renderMenuView();
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    menu_container: {
        flex: 3,
        borderRightColor: Colors.white,
        borderRightWidth: 1,
    },
    new_order_container: {
        flex: 2
    },
    orders_container: {
        flex: 1,
    },
    header: {
        color: Colors.white,
        fontSize: 32,
        ...TypeFaces.medium
    },
    submit_new_order: {
        width: '100%',
        borderWidth: 1,
        borderColor: Colors.white,
        padding: 10,
    },
    submit_new_order_text: {
        fontSize: 20,
        color: Colors.white,
        ...TypeFaces.medium,
        textAlign: 'center'
    },
    menu_item: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
    },
    menu_item_text: {
        color: Colors.white,
        fontSize: 20,
        ...TypeFaces.light
    },
    menu_item_actions: {
        flexDirection: 'row'
    },
    menu_item_action: {
        color: Colors.white,
        fontSize: 20,
        ...TypeFaces.medium,
        padding: 10,
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: Colors.white
    },
    order_container: {
        borderWidth: 1,
        borderColor: Colors.white,
        paddingVertical: 20,
    }
});

module.exports = connect(mapStateToProps, mapDispatchToProps) (KitchenPanel);
