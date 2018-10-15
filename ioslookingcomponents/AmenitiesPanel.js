/* @flow */

import * as React from 'react';
import { View, Text, Image, TouchableWithoutFeedback, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../js-api-utils/ConfigManager';

import MagicButton from '../react-components/MagicButton';
import Panel from './ControlButtons/Panel';

import { TypeFaces } from '../constants/styles';

const I18n = require('../js-api-utils/i18n/i18n');

type PropsType = {
    id: string,
    width: number,
    height: number,
    displayConfig: Object,
};

type MenuType = {
    heading: string,
    subheading: string,
    groups: Array<MenuGroupType>,
};

type MenuGroupType = {
    name: string,
    items: Array<MenuItemType>,
};

type MenuItemType = {
    name: string,
    icon: string,
    customPreorderPrompt?: string,
    customOrderPrompt?: string,
};

type StateType = {
    menu: MenuType,
    selectedItem: ?MenuItemType,
    confirmationMessage: ?string,
};

function mapStateToProps(state) {
    return {
        displayConfig: state.screen.displayConfig,
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

class AmenitiesPanelClass extends React.Component<PropsType, StateType> {
    _unsubscribe: () => any = () => null;

    state = {
        menu: {heading: "", subheading: "", groups: []},
        selectedItem: null,
        confirmationMessage: null,
    };

    _icons = {
        toiletries: require('../assets/images/amenities/toiletries.png'),
        pillow: require('../assets/images/amenities/pillow.png'),
        bed: require('../assets/images/amenities/bed.png'),
        iron: require('../assets/images/amenities/iron.png'),
        beverages: require('../assets/images/amenities/beverages.png'),
        chargers: require('../assets/images/amenities/chargers.png'),
        laundry: require('../assets/images/amenities/laundry.png'),
        concierge: require('../assets/images/amenities/concierge.png'),
        shampoo: require('../assets/images/amenities/shampoo.png'),
        toilet_paper: require('../assets/images/amenities/toilet_paper.png'),
        toothpaste: require('../assets/images/amenities/toothpaste.png'),
        toothbrush: require('../assets/images/amenities/toothbrush.png'),
        bar_soap: require('../assets/images/amenities/bar_soap.png'),
        other: require('../assets/images/amenities/other.png'),
    };

    componentWillMount() {
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(newProps: PropsType) {
        this._unsubscribe();
        this._unsubscribe = ConfigManager.registerThingStateChangeCallback(newProps.id, this.onHotelOrdersChanged.bind(this));
        if (newProps.id in ConfigManager.things)
            this.onHotelOrdersChanged(ConfigManager.thingMetas[newProps.id], ConfigManager.things[newProps.id]);
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    onHotelOrdersChanged(meta: ThingMetadataType, hoState: ThingStateType) {
        this.setState({menu: meta.menu});
    }

    /*getItemAtNavigation(nav: NavigationType): MenuItem {
        const { menu } = this.state;
        var cur = menu;
        for (var i = 0; i < nav.length; i++)
            cur = cur.children[nav[i]];
        return cur;
    }

    onItemClicked(index: number, item: MenuItem) {
        const { currentNavigation } = this.state;
        this.setState({currentNavigation: currentNavigation.concat([index])});
    }

    onBack() {
        const { currentNavigation } = this.state;
        this.setState({currentNavigation: currentNavigation.slice(0, currentNavigation.length - 1), confirmationMessage: null});
    }

    submitOrder(item: MenuItem) {
        ConfigManager.setThingState(this.props.id, {place_order: item.name}, true, false);
        this.setState({confirmationMessage: item.customOrderPrompt || I18n.t("We got your order and it will be on the way :)")});
    }*/

    /*render() {
        const { menu, currentNavigation, confirmationMessage } = this.state;
        const { displayConfig } = this.props;

        var curMenu = this.getItemAtNavigation(currentNavigation);
        var body = null;
        if (confirmationMessage) {
            body =
            <View style={styles.confirmationContainer}>
                <View style={styles.confirmationBox}>
                    <Text style={[styles.textStyle, {color: displayConfig.textColor, textAlign: 'center', marginBottom: 10}]}>
                        {I18n.t(confirmationMessage)}
                    </Text>
                    <View style={styles.confirmationButtonsContainer}>
                        <View style={styles.confirmationButton}>
                            <Panel style={styles.confirmationButtonPanel} onPress={() => this.setState({currentNavigation: [], confirmationMessage: null})}>
                                <Text style={[styles.textStyle, {color: '#000000'}]}>{I18n.t("Ok")}</Text>
                            </Panel>
                        </View>
                    </View>
                </View>
            </View>;
        } else if (curMenu.children.length > 0) {
            // render subitems
            var rows = [];
            var cols = [];
            var blocksPerRow = 6;
            for (var i = 0; i < curMenu.children.length; i += cols.length) {
                cols = [];
                var blockSize = 1;
                var numPerRow = blocksPerRow / blockSize;
                for (var j = i; j < Math.min(curMenu.children.length, i + numPerRow); j++) {
                    const index = j;
                    const c = curMenu.children[j];
                    cols.push(
                        <Panel key={'amenities-child-'+index} active blocks={blockSize} onPress={() => this.onItemClicked(index, c)}>
                            <Image style={styles.icon} source={c.icon in this._icons ? this._icons[c.icon] : this._icons.other} />
                            <View style={styles.textContainer}>
                                <Text style={[styles.textStyle, {color: '#000000'}]}>{I18n.t(c.name)}</Text>
                            </View>
                        </Panel>
                    );
                }
                rows.push(<View key={'amenities-row-'+i} style={styles.row}>{cols}</View>);
            }
            body = <ScrollView>{rows}</ScrollView>;
        } else if (currentNavigation.length > 0) {
            // no subitems means this is an order, make confirmation
            body =
                <View style={styles.confirmationContainer}>
                    <View style={styles.confirmationBox}>
                        <Text style={[styles.textStyle, {color: displayConfig.textColor, textAlign: 'center', marginBottom: 10}]}>
                            {curMenu.customPreorderPrompt ? I18n.t(curMenu.customPreorderPrompt) : (I18n.t("You are placing an order for ") + I18n.t(curMenu.name))}
                        </Text>
                        <Text style={[styles.textStyle, {color: displayConfig.textColor, textAlign: 'center'}]}>
                            {I18n.t("Do you want to proceed with the order?")}
                        </Text>
                        <View style={styles.confirmationButtonsContainer}>
                            <View style={styles.confirmationButton}>
                                <Panel style={styles.confirmationButtonPanel} onPress={() => this.submitOrder(curMenu)}>
                                    <Text style={[styles.textStyle, {color: '#000000'}]}>{I18n.t("Yes")}</Text>
                                </Panel>
                            </View>
                            <View style={styles.confirmationButton}>
                                <Panel style={styles.confirmationButtonPanel} onPress={() => this.onBack()}>
                                    <Text style={[styles.textStyle, {color: '#000000'}]}>{I18n.t("No")}</Text>
                                </Panel>
                            </View>
                        </View>
                    </View>
                </View>;
        }

        return (
            <View style={styles.container}>
                <View style={styles.navbar}>
                    {currentNavigation.length > 0 ?
                    <TouchableOpacity style={[styles.navbarColumn, {alignItems: 'flex-start'}]} onPress={() => this.onBack()}>
                        <View style={styles.backButton}>
                            <Text style={[styles.textStyle, {color: displayConfig.textColor}]}>{I18n.t("< Back")}</Text>
                        </View>
                    </TouchableOpacity>
                    : <View style={styles.navbarColumn} /> }
                    <View style={[styles.navbarColumn, {flex: 2}]}>
                        <Text style={[styles.textStyle, {color: displayConfig.textColor}]}>{I18n.t(curMenu.name)}</Text>
                    </View>
                    <View style={styles.navbarColumn}>
                    </View>
                </View>

                {body}
            </View>
        );
    }*/

    onItemClicked(item: MenuItemType) {
        this.setState({
            selectedItem: item
        });
    }

    submitOrder(item: MenuItemType) {
        ConfigManager.setThingState(this.props.id, {place_order: item.name}, true, false);
        this.setState({
            confirmationMessage: item.customOrderPrompt || I18n.t("We got your order and it will be on the way :)"),
            selectedItem: null,
        });
    }

    renderItem(item: MenuItemType) {
        return (
            <Panel key={'amenities-child-'+item.name} active blocks={1} onPress={() => this.onItemClicked(item)}>
                <Image style={styles.icon} source={item.icon in this._icons ? this._icons[item.icon] : this._icons.other} />
                <View style={styles.textContainer}>
                    <Text style={[styles.textStyle, {color: '#000000'}]}>{I18n.t(item.name)}</Text>
                </View>
            </Panel>
        );
    }

    renderGroup(group: MenuGroupType) {
        const { width, height, displayConfig } = this.props;

        var blocksPerRow = 6;
        var rows: Array<Array<MenuItemType>> = [[]];
        for (var i = 0; i < group.items.length; i++) {
            const item = group.items[i];
            var curRowBlocks = rows[rows.length-1].length * 1;
            if (curRowBlocks + 1 > blocksPerRow)
                rows.push([]);
            rows[rows.length-1].push(item);
        }
        var renderedRows: Array<Array<any>> = [];
        for (var i = 0; i < rows.length; i++)
            renderedRows.push(rows[i].map(item => this.renderItem(item)));

        return (
            <View key={'group-' + group.name} style={groupStyles.container}>
                <Text style={groupStyles.headerText}>{I18n.t(group.name)}</Text>
                <View style={groupStyles.thingsContainer}>
                    {renderedRows.map((rowPanels, index) =>
                        <View key={'group-'+group.name+'-'+index} style={[groupStyles.thingsContainerRow, I18n.r2l() ? {justifyContent: 'flex-end'} : {}]}>
                            {rowPanels}
                        </View>
                    )}
                </View>
            </View>
        );
    }

    render() {
        const { width, height, displayConfig } = this.props;
        const { menu, selectedItem, confirmationMessage } = this.state;

        if (confirmationMessage) {
            return (
                <View style={styles.confirmationContainer}>
                    <View style={styles.confirmationBox}>
                        <Text style={[styles.textStyle, {color: displayConfig.textColor, textAlign: 'center', marginBottom: 10}]}>
                            {I18n.t(confirmationMessage)}
                        </Text>
                        <View style={styles.confirmationButtonsContainer}>
                            <View style={styles.confirmationButton}>
                                <Panel active style={styles.confirmationButtonPanel} onPress={() => this.setState({confirmationMessage: null})}>
                                    <Text style={[styles.textStyle, {color: '#000000'}]}>{I18n.t("Ok")}</Text>
                                </Panel>
                            </View>
                        </View>
                    </View>
                </View>
            );
        } else if (selectedItem) {
            return (
                <View style={styles.confirmationContainer}>
                    <View style={styles.confirmationBox}>
                        <Text style={[styles.textStyle, {color: displayConfig.textColor, textAlign: 'center', marginBottom: 10}]}>
                            {selectedItem.customPreorderPrompt ? I18n.t(selectedItem.customPreorderPrompt) : (I18n.t("You are placing an order for ") + I18n.t(selectedItem.name))}
                        </Text>
                        <Text style={[styles.textStyle, {color: displayConfig.textColor, textAlign: 'center'}]}>
                            {I18n.t("Do you want to proceed with the order?")}
                        </Text>
                        <View style={styles.confirmationButtonsContainer}>
                            <View style={styles.confirmationButton}>
                                <Panel active style={styles.confirmationButtonPanel} onPress={() => this.submitOrder(selectedItem)}>
                                    <Text style={[styles.textStyle, {color: '#000000'}]}>{I18n.t("Yes")}</Text>
                                </Panel>
                            </View>
                            <View style={styles.confirmationButton}>
                                <Panel active style={styles.confirmationButtonPanel} onPress={() => this.setState({selectedItem: null})}>
                                    <Text style={[styles.textStyle, {color: '#000000'}]}>{I18n.t("No")}</Text>
                                </Panel>
                            </View>
                        </View>
                    </View>
                </View>
            );
        } else {
            return (
                <ScrollView style={[styles.container, {width, height}]}>
                    <View style={headingStyles.container}>
                        <Text style={headingStyles.heading}>{I18n.t(menu.heading)}</Text>
                        <Text style={headingStyles.comment}>{I18n.t(menu.subheading)}</Text>
                    </View>
                    {menu.groups.map(g => this.renderGroup(g))}
                </ScrollView>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        padding: 15,
    },
    navbar: {
        width: '100%',
        flexDirection: 'row',
        height: 60,
        marginBottom: 20,
    },
    row: {
        width: '100%',
        flexDirection: 'row',
    },
    column: {
        flex: 1,
        flexDirection: 'column',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navbarColumn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButton: {
        width: 200,
        height: 70,
        justifyContent: 'center',
    },
    confirmationContainer: {
        flex: 1,
        padding: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmationBox: {
        flexDirection: 'column',
    },
    confirmationButtonsContainer: {
        height: 80,
        flexDirection: 'row',
    },
    confirmationButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmationButtonPanel: {
        width: 100,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemContainer: {
        width: '100%',
        height: 110,
        flexDirection: 'row',
    },
    icon: {
        width: 44,
        height: 44,
    },
    textContainer: {
        flex: 1,
        position: 'absolute',
        bottom: 10,
        left: 10,
    },
    textStyle: {
        fontSize: 18,
        ...TypeFaces.light,
    }
});

const groupStyles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'column',
        marginBottom: 20,
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 18,
        paddingLeft: 20,
        ...TypeFaces.regular,
    },
    thingsContainer: {
        paddingLeft: 15,
        flexDirection: 'column',
    },
    thingsContainerRow: {
        flexDirection: 'row',
    }
});

const headingStyles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 20,
        flexDirection: 'column',
        marginBottom: 80,
    },
    heading: {
        fontSize: 38,
        color: '#FFFFFF',
        marginBottom: 10,
        ...TypeFaces.regular,
    },
    comment: {
        fontSize: 24,
        color: '#FFFFFF',
        ...TypeFaces.regular,
    },
});

const AmenitiesPanel = connect(mapStateToProps, mapDispatchToProps) (AmenitiesPanelClass);
export default AmenitiesPanel;
