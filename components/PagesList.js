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

    static defaultProps = {
        pages: []
    }

    _margin: number = 10;

    render() {
        const { layout, pages, changePage } = this.props;

        const page_icon_layout = {
            height: layout.width - this._margin,
            width: layout.width - this._margin,
            left: this._margin
        }

        var page_icons = [];
        for (var i = 0; i < pages.length; i++) {
            const index = i;

            const layout = {
                ...page_icon_layout,
                top: i * page_icon_layout.height + i * this._margin +
                    this._margin
            }

            console.log('PagesList =>', pages[i]);

            page_icons.push(<PageIcon key={'page-icon-' + i}
                name={pages[i].name.en}
                changePage={() => changePage(index)}
                longPress={pages[i].longPress}
                layout={layout} />);
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
        position: 'absolute',
    }
});

module.exports = PagesList;
