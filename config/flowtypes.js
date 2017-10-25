export type ViewType = 'present' | 'detail' | 'collapsed';

export type PanelLayoutType = {
    height: number,
    width: number,
    top: number,
    left: number
};

export type CollapsedLayoutType = {
    height: number,
    width: number,
    left: number
};

export type NameType = {
    en: string,
    ar: string
};

export type EmptyThingType = {
    en: string,
    ar: string
};

export type GenericThingType = {
    id: number,
    category: 'split_acs'
        | 'central_acs'
        | 'curtains'
        | 'hotel_controls'
        | 'dimmers'
        | 'light_switches',
    name: NameType,
};

export type PanelType = {
    ratio: number, /* row height ratio within column */
    name: NameType, /* panel name */
    things: Array<GenericThingType | EmptyThingType>
};

export type GridColumnType = {
    ratio: number,
    panels: Array<PanelType>
};

export type RoomType = {
    name: NameType, /* room name */
    grid: Array<GridColumnType>,
    detail: {
        ratio: number, /* column width of detail view as ratio -
            collapsed view has ratio 1*/
        side: 'right' | 'left' /* side of the collapsed column */
    },
    layout: {
        margin: number /* margin between panels */
    }
};

export type ConfigType = {
    rooms?: Array<RoomType>
};

export type DiscoveredDevice = {
    name: string,
    ip: string,
    port: number,
};
