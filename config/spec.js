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
                            id: 'dimmer-d4',
                            category: 'dimmers',
                            intensity: 34
                        }
                    ]
                }, {
                    ratio: 3,
                    title: {
                        en: 'Bathroom Ligths',
                        ar: 'إضائة الحمام'
                    },
                    things: []
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
