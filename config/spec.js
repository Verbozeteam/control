/* @flow */

const spec = {
    room: {
        en: 'Hasan\'s Room',
        ar: 'غرفة حسن'
    },
    grid: [
        {
            ratio: 2,
            panels: [
                {
                    ratio: 5,
                    title: {
                        en: 'Room Lights',
                        ar: 'إضائة الغرفة'
                    },
                    things: [
                        {
                            id: 'lightswitch-d00',
                            category: 'light_switches',
                            intensity: 0,
                            title: {
                                en: 'Main lights',
                                ar: 'Main lights'
                            }
                        },
                        {
                            id: 'lightswitch-d01',
                            category: 'light_switches',
                            intensity: 0,
                            title: {
                                en: 'Night stand',
                                ar: 'Night stand'
                            }
                        },
                        {
                            id: 'lightswitch-d02',
                            category: 'light_switches',
                            intensity: 0,
                            title: {
                                en: 'Hallway',
                                ar: 'Hallway'
                            }
                        },
                        {
                            id: 'dimmer-d00',
                            category: 'dimmers',
                            intensity: 67,
                            title: {
                                en: 'Bed dimmers',
                                ar: 'Bed dimmers'
                            }
                        }
                    ]
                }, {
                    ratio: 3,
                    title: {
                        en: 'Bathroom Lights',
                        ar: 'إضائة الحمام'
                    },
                    things: [
                        {
                            id: 'lightswitch-d03',
                            category: 'light_switches',
                            intensity: 1,
                            title: {
                                en: 'Main lights',
                                ar: 'Main lights'
                            }
                        },
                        {
                            id: 'lightswitch-d04',
                            category: 'light_switches',
                            intensity: 0,
                            title: {
                                en: 'Mirror lights',
                                ar: 'Mirror lights'
                            }
                        },
                        {
                            id: 'empty-00',
                            category: 'empty'
                        },
                        {
                            id: 'dimmer-d01',
                            category: 'dimmers',
                            intensity: 13,
                            title: {
                                en: 'Bathroom dimmer',
                                ar: 'Bathroom dimmer'
                            }
                        }
                    ]
                }
            ]
        }, {
            ratio: 1,
            panels: [
                {
                    ratio: 1,
                    title: {
                        en: 'Air Conditioning',
                        ar: 'التكييف'
                    },
                    things: []
                }, {
                    ratio: 1,
                    title: {
                        en: 'Room Service',
                        ar: 'خدمات الغرفة'
                    },
                    things: []
                }
            ]
        }
    ],
    detail: {
        ratio: 4,
        side: 'right'
    },
    layout: {
        margin: 5
    }
};


module.exports = spec;
