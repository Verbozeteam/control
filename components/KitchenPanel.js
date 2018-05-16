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
};

type StateType = {
    is_initialized: boolean,
    menu: Array<MenuItemType>,
    orders: Array<OrderType>,
    cart: {[string]: number},
    show_orders: boolean
};

function mapStateToProps(state) {
    return {
        displayConfig: state.screen.displayConfig,
        currentDevice: state.connection.currentDevice
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

class KitchenPanel extends React.Component<PropsType, StateType> {
    _unsubscribe: () => null = () => {return null;};

    state = {
        is_initialized: false,
        menu: [],
        orders: [],
        cart: {},
        show_orders: false
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

        this._unsubscribe = this.KitchenConfigManager.registerCategoryChangeCallback("kitchen_controls", this.onKitchenChanged.bind(this));
    }

    destroyConnection() {
        if (this.KitchenSocketCommunication && this.KitchenConfigManager) {
            this._unsubscribe();
            this.setState({is_initialized: false});
            this.KitchenSocketCommunication.cleanup();
            delete this.KitchenSocketCommunication;
            delete this.KitchenConfigManager;
        }
    }

    handleSocketConnected() {
        if (this.KitchenSocketCommunication) {
            this.KitchenSocketCommunication.sendMessage({
                code: 0
            });
        }
    }

    handleSocketDisconnected() {
        this.createConnection();
    }

    onKitchenChanged(meta: ThingMetadataType, kitchenState: ThingStateType) {
        var { menu, orders, is_initialized } = this.state;
        const { currentDevice } = this.props;

        var ordersInKitchen = kitchenState.orders.filter(o => o.placed_by_name === currentDevice.name);

        if (is_initialized !== true ||
            JSON.stringify(menu) !== JSON.stringify(kitchenState.menu) ||
            JSON.stringify(orders) !== JSON.stringify(ordersInKitchen)) {
            this.setState({
                is_initialized: true,
                menu: kitchenState.menu,
                orders: kitchenState.orders
            });
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
        const { currentDevice } = this.props;
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

        this.KitchenConfigManager.setThingState('kitchen',
            {order, 'placed_by_name': currentDevice.name}, true, false);

        /* empty cart */
        this.setState({
            cart: {},
            show_orders: true
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
                        <View style={[styles.button, {marginRight: 20}]}>
                            <Text style={styles.button_text}>Add +</Text>
                        </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback
                        onPressIn={() => this.decrementMenuItemQuantity(item.name)}>
                        <View style={styles.button}>
                            <Text style={styles.button_text}>Remove -</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </View>
        );
    }

    renderCartItem(item: string, index: number) {
        const { cart } = this.state;

        /* give name title case */
        const name = item.split(' ').map(
            x => x[0].toUpperCase() + x.slice(1)).join(' ');

        return (
            <View key={'cart-item-' + index} style={styles.menu_item}>
                <Text style={styles.menu_item_text}>{name}</Text>
                <Text style={styles.menu_item_text}>{cart[item]}x</Text>
            </View>
        );
    }

    renderOrderItem(item: OrderItemType, index: number) {
        var status = '';
        switch (item.status) {
            case -1:
                status = '?'
                break;
            case 1:
                status = '✓'
                break;
            case 0:
                status = '╳'
                break;
        }

        /* give name title case */
        const name = item.name.split(' ').map(
            x => x[0].toUpperCase() + x.slice(1)).join(' ');

        return (
            <View style={styles.order_item}>
                <Text style={[styles.button_text,
                    {flex: 2, textAlign: 'left', paddingVertical: 10}]}>{name}</Text>
                <Text style={[styles.button_text,
                    {flex: 1, paddingVertical: 10}]}>{item.quantity}x</Text>
                <Text style={[styles.button_text,
                    {flex: 1, textAlign: 'right', paddingVertical: 10}]}>{status}</Text>
            </View>
        );
    }

    renderOrder(order: OrderType, index: number) {
        return (
            <View key={'order-' + order.id} style={styles.order_container}>
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
                    <TouchableWithoutFeedback
                        onPressIn={() => this.setState({show_orders: false})}>
                        <View style={styles.button}>
                            <Text style={styles.button_text}>Dismiss</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                <ScrollView style={styles.scroll_view_container}>
                    {orders.map(this.renderOrder.bind(this))}
                </ScrollView>
            </View>
        );
    }

    renderMenuView() {
        const { menu, cart, orders } = this.state;

        return (
            <View style={styles.container}>
                <View style={styles.navbar}>
                    <Text style={styles.header}>Menu</Text>
                    {(orders.length > 0) ?
                        <TouchableWithoutFeedback
                            onPressIn={() => this.setState({show_orders: true})}>
                            <View style={styles.button}>
                                <Text style={styles.button_text}>Show Pending Orders</Text>
                            </View>
                        </TouchableWithoutFeedback> : null}
                </View>
                <View style={styles.menu_view_container}>
                    <ScrollView style={styles.menu_container}>
                        {menu.map(this.renderMenuItem.bind(this))}
                    </ScrollView>
                    <View style={styles.new_order_container}>
                        <ScrollView style={styles.scroll_view_container}>
                            {Object.keys(cart).map(this.renderCartItem.bind(this))}
                        </ScrollView>
                        <TouchableWithoutFeedback
                            onPressIn={this.submitNewOrder.bind(this)}>
                            <View style={styles.button}>
                                <Text style={styles.button_text}>Submit Order</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
            </View>
        );
    }

    render() {
        const { displayConfig } = this.props;
        const { orders, show_orders } = this.state;

        if (displayConfig.UIStyle !== 'simple') {
            return null;
        }

        if (show_orders && orders.length > 0) {
            return this.renderOrdersView();
        } else {
            return this.renderMenuView();
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    menu_view_container: {
        flex: 1,
        flexDirection: 'row'
    },
    menu_container: {
        borderRightColor: Colors.white,
        borderRightWidth: 1,
        paddingRight: 20,
    },
    new_order_container: {
        paddingLeft: 20,
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
    button: {
        borderWidth: 1,
        borderColor: Colors.white,
        padding: 10
    },
    button_text: {
        color: Colors.white,
        textAlign: 'center',
        fontSize: 17,
        ...TypeFaces.regular
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
    order_container: {
        borderWidth: 1,
        borderColor: Colors.white,
        padding: 20,
        marginVertical: 20
    },
    order_item: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
});

module.exports = connect(mapStateToProps, mapDispatchToProps) (KitchenPanel);
