/* @flow */

export type ViewType = 'present' | 'detail' | 'collapsed' | 'static';

export type LayoutType = {
    height: number,
    width: number,
    top: number,
    left: number
};

export type NameType = {
    en: string,
    ar?: string
};

export type PageType = {
    name: NameType, // page type
    settings?: Object,
    layout: {
        ...LayoutType,
        margin: number // margin between panels
    }
};

export type LanguageType = 'en' | 'ar';

export const LanguageName = {
    'en': 'English',
    'ar': 'Arabic',
};

export type LanguageDirectionType = 'left_to_right' | 'right_to_left';
