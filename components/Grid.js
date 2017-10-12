/* @flow */

import * as React from 'react';
import { View, Dimensions, LayoutAnimation, Platform, UIManager, StyleSheet }
    from 'react-native';

const Panel = require('./Panel');

import type { PanelLayoutType, CollapsedLayoutType, RoomType, GridColumnType }
    from '../config/flowtypes';

type PropsType = {
    ...RoomType,
    thingsState: Object,
    updateThing: (id: string, update: Object, remote_only?: boolean) => null,
    blockThing: (id: string) => null,
    unblockThing: (id: string) => null,
};

type StateType = {
    detail_panel_index: number
};

class Grid extends React.Component<PropsType, StateType> {

    state = {
        detail_panel_index: -1
    };

    static defaultProps = {
        name: 'No room name',
        grid: [],
        detail: {
            ratio: 4,
            side: 'left'
        },
        layout: {
            margin: 5
        },
        thingsState: {},
        updateThing: () => null,
        blockThing: () => null,
        unblockThing: () => null
    };

    _presentation_layout: Array<PanelLayoutType> = [];
    _detail_layout: PanelLayoutType;
    _collapsed_layout: CollapsedLayoutType;
    _num_panels: number = 0;
    _detail_timer: number = -1;

    constructor(props: PropsType) {
        super(props);

        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }

    componentWillMount() {
        this.calculatePresentationLayout();
        this.calculateDetailAndCollapsedLayout();
    }

    calculatePresentationLayout() {
        const { layout, grid } = this.props;

        // get screen height and width
        const { height, width }:
            {height: number, width: number} = Dimensions.get('screen');

        // stop if grid has no columns
        if (grid.length === 0 ) {
            return;
        }

        // calculate sum of column ratios to calculate single column width
        var { ratio } = grid.reduce((a, b) => ({ratio: a.ratio + b.ratio}));
        const ratio_width = (width - layout.margin * 2) / ratio;

        // calculate panel layouts (height, width, top and left offsets)
        var top = layout.margin;
        var left = layout.margin;
        for (var i = 0; i < grid.length; i++) {
            // calculate column width based on ratio width
            const column_width = grid[i].ratio * ratio_width
                - layout.margin * 2;

            // skip column if has no rows
            if (grid[i].panels.length === 0) {
                // reset top offset and increment left offset
                top = layout.margin;
                left += column_width + layout.margin * 2;
                continue;
            }

            // calculate sum of row ratios to calculate single row width
            var { ratio } = grid[i].panels.reduce(
                (a, b) => ({ratio: a.ratio + b.ratio}));
            const ratio_height = (height - layout.margin * 2) / ratio;

            for (var j = 0; j < grid[i].panels.length; j++) {
                // calculate row height based on ratio height
                const row_height = grid[i].panels[j].ratio * ratio_height
                    - layout.margin * 2;

                // add panel's layout to array
                this._presentation_layout.push({
                    height: row_height,
                    width: column_width,
                    top,
                    left
                });

                // increment top offset
                top += row_height + layout.margin * 2;
                this._num_panels++;
            }

            // reset top offset and increment left offset
            top = layout.margin;
            left += column_width + layout.margin * 2;
        }
    }

    calculateDetailAndCollapsedLayout() {
        const { layout, detail } = this.props;

        // get screen height and width
        const { height, width }:
            {height: number, width: number} = Dimensions.get('screen');

        // calculate single column width and single row width for
        // collapsed panels
        const ratio_width = (width - layout.margin * 2) / (detail.ratio + 1);
        const ratio_height = (height - layout.margin * 2) /
            (this._num_panels - 1);

        // calculate detail layout for use when panel enters detail view
        this._detail_layout = {
            height: height - layout.margin * 4,
            width: ratio_width * detail.ratio - layout.margin * 2,
            top: layout.margin,
            left: ratio_width + layout.margin
        };

        // calculate collapsed layout for use when panels become collapsed
        this._collapsed_layout = {
            height: ratio_height - layout.margin * 2,
            width: ratio_width - layout.margin * 2,
            left: layout.margin
        };
    }

    toggleDetail(index: number) {
        const { detail_panel_index } = this.state;

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        if (detail_panel_index === index) {
            this.setState({
                detail_panel_index: -1
            });
        } else {
            this.setState({
                detail_panel_index: index
            });
        }
    }

    renderPresentationView() {
        const { grid, thingsState } = this.props;

        var panels = [];
        for (var i = 0; i < grid.length; i++) {
            for (var j = 0; j < grid[i].panels.length; j++) {
                const index = panels.length;

                // create panel base don presentation view layout and
                // add to array
                const panel = <Panel key={'panel-' + index}
                    {...grid[i].panels[j]}
                    layout={this._presentation_layout[index]}
                    viewType={'present'}
                    thingsState={thingsState}
                    toggleDetail={() => this.toggleDetail(index)} />;

                panels.push(panel);
            }
        }

        return panels;
    }

    renderDetailWithCollapsedView() {
        const { layout, grid, updateThing, blockThing, unblockThing,
            thingsState } = this.props;
        const { detail_panel_index } = this.state;

        var panels = [];
        var counter = 0;
        for (var i = 0; i < grid.length; i++) {
            for (var j = 0; j < grid[i].panels.length; j++) {
                const index = panels.length;

                // decide panel layout based on whether detail or collapsed
                var panel_layout = null;
                var view_type = 'collapsed';
                if (index === detail_panel_index) {
                    panel_layout = this._detail_layout;
                    view_type = 'detail';
                } else {
                    panel_layout = {
                        ...this._collapsed_layout,
                        top: (this._collapsed_layout.height + layout.margin * 2)
                            * counter++ + layout.margin
                    };
                }

                // create panel and add to array
                const panel = <Panel key={'panel-' + index}
                    {...grid[i].panels[j]}
                    layout={panel_layout}
                    viewType={view_type}
                    thingsState={thingsState}
                    toggleDetail={() => this.toggleDetail(index)}
                    updateThing={updateThing}
                    blockThing={blockThing}
                    unblockThing={unblockThing}/>;

                panels.push(panel);
            }
        }

        return panels;
    }

    render() {
        const { layout } = this.props;
        const { detail_panel_index } = this.state;

        var panels = null;
        if (detail_panel_index === -1) {
            panels = this.renderPresentationView();
        } else {
            panels = this.renderDetailWithCollapsedView();
        }

        return (
            <View style={[styles.container, {margin: layout.margin}]}>
                {panels}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

module.exports = Grid;
