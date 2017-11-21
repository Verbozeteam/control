/* @flow */

export type ViewType = 'present' | 'detail' | 'collapsed';

const languages = [
    'en', // must always be provided
    'ar'
];

export type LayoutType = {
    height: number,
    width: number,
    top: number,
    left: number
};

export type PanelLayoutType = {
    ...LayoutType
};

export type CollapsedLayoutType = {
    height: number,
    width: number,
    left: number
};

export type NameType = {
    en: string,
    ar?: string
};

export type EmptyThingType = {
    en: string,
    ar: string
};

export type GenericThingType = {
    id: string,
    category: 'split_acs'
        | 'central_acs'
        | 'curtains'
        | 'hotel_controls'
        | 'dimmers'
        | 'light_switches',
    name: NameType,
};

export type PanelType = {
    ratio: number, // row height ratio within column
    name: NameType, // panel name
    things: Array<GenericThingType | EmptyThingType>
};

export type GridColumnType = {
    ratio: number,
    panels: Array<PanelType>
};

export type RoomType = {
    name: NameType, // room name
    grid: Array<GridColumnType>,
    detail: {
        ratio: number, // column width of detail view as ratio -
                       // collapsed view has ratio 1
        side: 'right' | 'left' // side of the collapsed column
    },
    layout: {
        ...LayoutType,
        margin: number // margin between panels
    }
};

export type PageType = {
    name: NameType, // page type
    settings?: Object,
    layout: {
        ...LayoutType,
        maring: number // margin between panels
    }
};

export type ConfigType = {
    rooms?: Array<RoomType>
};

export type DiscoveredDeviceType = {
    name: string,
    ip: string,
    port: number,
};

export type LanguageType = 'en' | 'ar';

export type LanguageDirectionType = 'left_to_right' | 'right_to_left';
