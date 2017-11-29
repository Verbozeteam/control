/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const I18n = require('../i18n/i18n');
const UserPreferences = require('../lib/UserPreferences');
const { DaysOfWeek, MonthsOfYear } = require('../config/misc');

type PropsType = {
    displayWarning: string,
};

class Clock extends React.Component<PropsType> {

    _update_time_timeout: number;

    componentWillMount() {
        this._update();
    }

    componentWillUnmount() {
        clearTimeout(this._update_time_timeout);
    }

    _update() {
        const datetime = new Date();

        this._update_time_timeout = setTimeout(function() {
            this._update();
        }.bind(this), 60000 - datetime.getSeconds() * 1000);

        this.forceUpdate();
    }

    _formateDateTime(datetime: Object) {
        // const l = UserPreferences.get('language');

        //format minutes to have 2 digits
        var minutes = String(datetime.getMinutes());
        if (minutes.length < 2) {
            minutes = '0' + minutes
        }

        // make time 12 hour based from 24 hour
        var am_pm = 'AM';
        var hours = datetime.getHours();
        if (hours >= 12) {
            am_pm = 'PM';
            if (hours > 12) {
                hours -= 12;
            }
        } else if (hours === 0) {
            hours = 12
        }

        // create date string
        // const date = DaysOfWeek[datetime.getDay()][l] + ', ' +
        //     datetime.getDate() + ' ' + MonthsOfYear[datetime.getMonth()]
        //     + ' ' + datetime.getFullYear();
        const date = I18n.t(DaysOfWeek[datetime.getDay()]) + I18n.t(', ') +
            datetime.getDate() + ' ' + I18n.t(MonthsOfYear[datetime.getMonth()])
            + ' ' + datetime.getFullYear();

        // create time string
        const time = hours + ':' + minutes + ' ' + am_pm;

        return { date, time };
    }

    render() {
        const { displayWarning } = this.props;
        const { date, time } = this._formateDateTime(new Date());

        return (
            <View style={styles.container}>
                <Text style={styles.time}>
                    {time}
                </Text>
                <Text style={styles.date}>
                    {date}
                </Text>
                <Text style={styles.warning}>
                    {displayWarning}
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    time: {
        fontFamily: 'HKNova-MediumR',
        fontSize: 120,
        color: '#AAAAAA'
    },
    date: {
        fontFamily: 'HKNova-MediumR',
        fontSize: 40,
        color: '#AAAAAA'
    },
    warning: {
        marginTop: 30,
        fontFamily: 'HKNova-MediumR',
        fontSize: 40,
        color: '#FF0000'
    },
});

module.exports = Clock;
