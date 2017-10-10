/* @flow */

import * as React from 'react';
import { StyleSheet, View, Text , Image } from 'react-native';

type Props = {
    hotel?: string
};

class TopBar extends React.Component<Props> {

    static defaultProps = {
        hotel: 'Demo Hotel'
    };

    render() {
        return (
            <View style={styles.container}>
                {/* left side hotel logo and name */}
                <Image style={styles.image}
                    source={require('../assets/images/topbar_millennium.png')} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        height: 50,
        padding: 10,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF'
    },
    hotel_name: {
        fontSize: 14,
        color: '#FFFFFF'
    },
    image: {
        position: 'absolute',
        top: 0,
        left: 0
    }
});

module.exports = TopBar;
