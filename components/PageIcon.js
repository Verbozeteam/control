/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';

import { TypeFaces } from '../constants/styles';

const I18n = require('../js-api-utils/i18n/i18n');

type PropsType = {
    name: string,
    iconName?: string,
    selected: boolean,
    changePage?: ?(() => any),
    longPress?: ?(() => any),
    height: number,
    displayConfig: Object,
};

function mapStateToProps(state) {
    return {
        displayConfig: state.screen.displayConfig,
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

class PageIcon extends React.Component<PropsType> {
    static defaultProps = {
        longPress: () => null,
        selected: false
    };

    render() {
        const { name, changePage, longPress, selected, iconName, height, displayConfig } = this.props;

        const selected_style = (selected) ? [styles.selected, {backgroundColor: displayConfig.sidebar.selectedColor}] : null;

        if (name && I18n.t(name).length >= 15) {
            var largeName = I18n.t(name).replace(/ /g, "\n");
        }

        var title = iconName ?
                <Image style={styles.icon}
                    resizeMode='contain'
                    source={iconName}>
                </Image>
            :
                <Text style={[
                        (displayConfig.sidebar.pull == 'right' || I18n.r2l()) ? styles.headerRight : styles.headerLeft, // select left-to-right or right-to-left based on config and language
                        {color: displayConfig.sidebar.textColor},
                    ]}>
                    {I18n.t(name).length >= 15 ? largeName : I18n.t(name)}
                </Text>;

        var sizeStyle = height ? {height} : {flex: 1};

        return (
            <TouchableOpacity onPressIn={changePage}
                activeOpacity={1}
                delayLongPress={5000}
                onLongPress={longPress}
                style={[styles.container, selected_style, {height}]}>
                {
                    iconName ? title
                    : <View style={(displayConfig.sidebar.pull == 'right' || I18n.r2l()) ? styles.contentRightWrapper : styles.contentLeftWrapper}>
                        {title}
                        {displayConfig.sidebar.underlineColor ? <View style={[styles.underline, {backgroundColor: displayConfig.sidebar.underlineColor}]}></View> : null}
                    </View>
                }
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        alignSelf: 'baseline',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingRight: 10,
        paddingLeft: 10,
    },
    contentRightWrapper: {
        alignSelf: 'flex-end',
        position: 'relative',
        backgroundColor: '#00000000', // if you don't do this, underline extends to end... (???)
    },
    contentLeftWrapper: {
        alignSelf: 'flex-start',
        position: 'relative',
        backgroundColor: '#00000000', // if you don't do this, underline extends to end... (???)
    },
    selected: {
        backgroundColor: '#FFFFFF22'
    },
    headerRight: {
        fontSize: 21,
        textAlign: 'right',
        color: '#FFFFFF',
        ...TypeFaces.regular,
    },
    headerLeft: {
        fontSize: 21,
        textAlign: 'left',
        color: '#FFFFFF',
        ...TypeFaces.regular,
    },
    icon: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    underline: {
        width: '100%',
        height: 2,
        backgroundColor: '#BA3737',
        position: 'absolute',
        bottom: 0,
        alignSelf: 'flex-end',
        justifyContent: 'flex-end'
    }
});

module.exports = connect(mapStateToProps, mapDispatchToProps) (PageIcon);
