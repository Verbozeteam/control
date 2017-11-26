/* @flow */

import * as React from 'react';
import { View, Text, LayoutAnimation, Platform, UIManager, StyleSheet }
    from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
const connectionActions = require ('../redux-objects/actions/connection');

const I18n = require('../i18n/i18n');
const Panel = require('./Panel');
const LightsPanelContents = require('./LightsPanelContents');
const HotelControlsPanelContents = require('./HotelControlsPanelContents');
const CentralAC = require('./CentralAC');

import type { LayoutType, ViewType } from '../config/flowtypes';
import type { RoomType, GenericThingType, ConfigType } from '../config/ConnectionTypes';

type PropsType = {
    layout: LayoutType,
    roomIndex?: number,
    ...any
};

type StateType = {
    config: ConfigType,
    currentPanel: number,
};

class RoomGrid extends React.Component<PropsType, StateType> {
    _unsubscribe: () => null = () => {return null;};

    _presentation_layout = [];
    _detail_layout = {};
    _collapsed_layout = {};
    _num_panels: number = 0;

    static defaultProps = {
        roomIndex: 0,
    };

    state = {
        config: {},
        currentPanel: -1,
    };

    onReduxStateChanged() {
        const { store } = this.context;
        const reduxState = store.getState();
        const { config } = this.state;
        const { id } = this.props;

        if (reduxState && reduxState.connection && reduxState.connection.config) {
            if (JSON.stringify(config) != JSON.stringify(reduxState.connection.config)) {
                this.setState({config: reduxState.connection.config});
            }
        }

        if (reduxState && reduxState.screen && reduxState.screen.isDimmed && this.state.currentPanel != -1) {
            this.setState({currentPanel: -1});
        }
    }

    constructor(props: PropsType) {
        super(props);

        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }

    componentWillMount() {
        const { store } = this.context;
        this._unsubscribe = store.subscribe(this.onReduxStateChanged.bind(this));
        this.onReduxStateChanged();
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    calculatePresentationLayout(roomConfig: RoomType) {
        const grid = roomConfig.grid;
        const layout = {...this.props.layout, ...roomConfig.layout};

        this._presentation_layout = [];
        this._num_panels = 0;

        // stop if grid has no columns
        if (grid.length === 0 ) {
            return;
        }

        // calculate sum of column ratios to calculate single column width
        var { ratio } = grid.reduce((a, b) => ({ratio: a.ratio + b.ratio}));
        const ratio_width = (layout.width - layout.margin * 2) / ratio;

        // calculate panel layouts (height, width, top and left offsets)
        var top = layout.top + layout.margin;
        var left = layout.left + layout.margin;
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
            var { ratio } = grid[i].panels.reduce((a, b) => ({ratio: a.ratio + b.ratio}));
            const ratio_height = (layout.height - layout.margin * 2) / ratio;

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
            top = layout.top + layout.margin;
            left += column_width + layout.margin * 2;
        }
    }

    calculateDetailAndCollapsedLayout(roomConfig: RoomType) {
        const grid = roomConfig.grid;
        const layout = {...this.props.layout, ...roomConfig.layout};
        const detail = roomConfig.detail;

        // calculate single column width and single row width for
        // collapsed panels
        const ratio_width = (layout.width - layout.margin * 2) /
            (detail.ratio + 1);
        const ratio_height = (layout.height - layout.margin * 2) /
            (this._num_panels - 1);

        // calculate detail layout for use when panel enters detail view
        this._detail_layout = {
            height: layout.height - layout.margin * 4,
            width: ratio_width * detail.ratio - layout.margin * 2,
            top: layout.top + layout.margin,
            left: layout.left + ratio_width + layout.margin
        };

        // calculate collapsed layout for use when panels become collapsed
        this._collapsed_layout = {
            height: ratio_height - layout.margin * 2,
            width: ratio_width - layout.margin * 2,
            left: layout.left + layout.margin
        };
    }

    setCurrentPanel(i: number) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        if (i == this.state.currentPanel)
            i = -1;

        this.setState({
            currentPanel: i
        });
    }

    renderPanelContents(viewType: ViewType, layout: LayoutType, things: Array<GenericThingType>) {
        if (things.length > 0 && viewType !== 'collapsed') {
            var content_props = {
                viewType: viewType,
                things: things,
                layout: layout,
            }

            switch (things[0].category) {
                case 'dimmers':
                case 'light_switches':
                    return  <LightsPanelContents
                        viewType={viewType}
                        things={things}
                        layout={layout}/>
                case 'hotel_controls':
                    return <HotelControlsPanelContents
                        id={things[0].id}/>;
                case 'central_acs':
                    return <CentralAC
                        id={things[0].id}
                        layout={layout}
                        viewType={viewType}/>;
            }
        }
        return null;
    }


    renderPresentationView(roomConfig: RoomType) {
        const grid = roomConfig.grid;

        this.calculatePresentationLayout(roomConfig);

        var panels = [];
        for (var i = 0; i < grid.length; i++) {
            for (var j = 0; j < grid[i].panels.length; j++) {
                const index = panels.length;

                // create panel base don presentation view layout and
                // add to array
                const panel = <Panel key={'panel-' + index}
                    name={I18n.t(grid[i].panels[j].name)}
                    layout={[this._presentation_layout[index], styles.panel]}
                    viewType={'present'}
                    toggleDetail={() => this.setCurrentPanel(index)}>
                    {this.renderPanelContents('present', this._presentation_layout[index], grid[i].panels[j].things)}
                </Panel>

                panels.push(panel);
            }
        }

        return panels;
    }

    renderDetailWithCollapsedView(roomConfig: RoomType) {
        const grid = roomConfig.grid;
        const layout = {...this.props.layout, ...roomConfig.layout};
        const { currentPanel } = this.state;

        this.calculateDetailAndCollapsedLayout(roomConfig);

        var panels = [];
        var counter = 0;
        for (var i = 0; i < grid.length; i++) {
            for (var j = 0; j < grid[i].panels.length; j++) {
                const index = panels.length;

                // decide panel layout based on whether detail or collapsed
                var panel_layout = null;
                var view_type = 'collapsed';
                var contents = null;
                if (index === currentPanel) {
                    panel_layout = this._detail_layout;
                    view_type = 'detail';
                    contents = this.renderPanelContents('detail', panel_layout, grid[i].panels[j].things);
                } else {
                    panel_layout = {
                        ...this._collapsed_layout,
                        top: (this._collapsed_layout.height + layout.margin * 2)
                            * counter++ + layout.margin + layout.top
                    };
                }

                // create panel and add to array
                const panel = <Panel key={'panel-' + index}
                    layout={[panel_layout, styles.panel]}
                    viewType={view_type}
                    name={I18n.t(grid[i].panels[j].name)}
                    toggleDetail={() => this.setCurrentPanel(index)}>
                    {contents}
                </Panel>;

                panels.push(panel);
            }
        }

        return panels;
    }

    render() {
        const { roomIndex } = this.props;
        const { config, currentPanel } = this.state;

        if (!config || Object.keys(config).length == 0 || !config.rooms || config.rooms.length <= roomIndex)
            return <View />

        const roomConfig = config.rooms[roomIndex];
        var content = null;

        if (currentPanel == -1)
            content = this.renderPresentationView(roomConfig);
        else
            content = this.renderDetailWithCollapsedView(roomConfig);

        return (
            <View style={[styles.container, roomConfig.layout || {}]}>
                {content}
            </View>
        );
    }
}

RoomGrid.contextTypes = {
    store: PropTypes.object
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    panel: {
        position: 'absolute',
        flex: 1,
    }
});

module.exports = RoomGrid;
