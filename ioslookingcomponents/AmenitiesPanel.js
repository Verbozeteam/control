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
    layout: Object,
    displayConfig: Object,
};

type MenuItem = {
    name: string,
    icon: string,
    children: Array<MenuItem>,
    customPreorderPrompt?: string,
    customOrderPrompt?: string,
}

type NavigationType = Array<number>

type StateType = {
    menu: MenuItem,
    currentNavigation: NavigationType,
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
        menu: {name: "", icon: "", children: []},
        currentNavigation: [],
        confirmationMessage: null,
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

    getItemAtNavigation(nav: NavigationType): MenuItem {
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
    }

    render() {
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
                        <TouchableOpacity style={styles.confirmationButton} onPress={() => this.setState({currentNavigation: [], confirmationMessage: null})}>
                            <View style={{borderBottomColor: displayConfig.accentColor, borderBottomWidth: 2}}>
                                <Text style={[styles.textStyle, {color: displayConfig.textColor}]}>{I18n.t("Ok")}</Text>
                            </View>
                        </TouchableOpacity>
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
                            <View style={styles.iconContainer}>
                            </View>
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
                            <TouchableOpacity style={styles.confirmationButton} onPress={() => this.submitOrder(curMenu)}>
                                <View style={{borderBottomColor: displayConfig.accentColor, borderBottomWidth: 2}}>
                                    <Text style={[styles.textStyle, {color: displayConfig.textColor}]}>{I18n.t("Yes")}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmationButton} onPress={() => this.onBack()}>
                                <View style={{borderBottomColor: displayConfig.accentColor, borderBottomWidth: 2}}>
                                    <Text style={[styles.textStyle, {color: displayConfig.textColor}]}>{I18n.t("No")}</Text>
                                </View>
                            </TouchableOpacity>
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
    itemContainer: {
        width: '100%',
        height: 110,
        flexDirection: 'row',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 21001203,
        borderColor: '#BA3737',
        borderWidth: 2,
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

const AmenitiesPanel = connect(mapStateToProps, mapDispatchToProps) (AmenitiesPanelClass);
export default AmenitiesPanel;
