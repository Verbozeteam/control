/* @flow */

import * as React from 'react';
import { View, StyleSheet } from 'react-native';

import type { LayoutType, NameType } from '../config/flowtypes';

const PageIcon = require('./PageIcon');

type PropsType = {
    selected: number,
    layout: LayoutType,
    pages: Array<NameType>,
    changePage: (index: number) => null
};

class PagesList extends React.Component<PropsType> {
    render() {
        const { layout, pages, changePage, selected } = this.props;

        var page_icons = [];
        for (var i = 0; i < pages.length; i++) {
            const index = i;

            page_icons.push(<PageIcon key={'page-icon-' + index}
                name={pages[i].name.en}
                selected ={i === selected}
                changePage={() => changePage(index)}
                longPress={pages[i].longPress} />);
        }

        return (
            <View style={[layout, styles.container]}>
                {page_icons}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        position: 'absolute',
    },
});

module.exports = PagesList;
