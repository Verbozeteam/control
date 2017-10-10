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
                            id: 'lightswitch-d31',
                            category: 'light_switches',
                            intensity: 0,
                            title: {
                                en: 'Main lights',
                                ar: 'الديمر رقم ١'
                            }
                        },
                        {
                            id: 'lightswitch-d30',
                            category: 'light_switches',
                            intensity: 0,
                            title: {
                                en: 'Main lights',
                                ar: 'الديمر رقم ١'
                            }
                        },
                        {
                            id: 'lightswitch-d32',
                            category: 'light_switches',
                            intensity: 0,
                            title: {
                                en: 'Main lights',
                                ar: 'الديمر رقم ١'
                            }
                        },
                        {
                            id: 'dimmer-d7',
                            category: 'dimmers',
                            intensity: 78,
                            title: {
                                en: 'Dimmer 2',
                                ar: 'الديمر رقم ١'
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
                            id: 'dimmer-d10',
                            category: 'dimmers',
                            intensity: 78,
                            title: {
                                en: 'Dimmer 2',
                                ar: 'الديمر رقم ١'
                            }
                        },
                        {
                            id: 'dimmer-d11',
                            category: 'dimmers',
                            intensity: 78,
                            title: {
                                en: 'Dimmer 2',
                                ar: 'الديمر رقم ١'
                            }
                        },
                        {
                            id: 'dimmer-d12',
                            category: 'dimmers',
                            intensity: 78,
                            title: {
                                en: 'Dimmer 2',
                                ar: 'الديمر رقم ١'
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
                    things: [
                        {
                            id: 'lightswitch-d37',
                            category: 'light_switches',
                            intensity: 0,
                            title: {
                                en: 'Main lights',
                                ar: 'الديمر رقم ١'
                            }
                        },
                        {
                            id: 'lightswitch-d50',
                            category: 'light_switches',
                            intensity: 1,
                            title: {
                                en: 'Main lights',
                                ar: 'الديمر رقم ١'
                            }
                        }
                    ]
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
