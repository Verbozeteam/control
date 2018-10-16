/* @flow */

import * as React from 'react';
import QRCode from 'react-native-qrcode';
import { View, Text, StyleSheet, TextInput, TouchableHighlight } from 'react-native';
import PropTypes from 'prop-types';

type PropsType = {
    onDone: ?string => null;
};

type StateType = {
    password: string,
}

export default class AuthPasswordPage extends React.Component<PropsType, StateType> {
    state = {
        password: "",
    };

    render() {
        const { onDone } = this.props;

        return (
            <View style={styles.container}>
                <View style={styles.innerContainer}>
                    <TextInput autoCapitalize={"none"} secureTextEntry={true} style={styles.textField} onChangeText={t => this.setState({password: t})} value={this.state.password}/>
                    <View style={styles.buttonsContainer}>
                        <TouchableHighlight style={styles.button} onPress={() => onDone(null)}>
                            <Text style={styles.buttonText}>{"Cancel"}</Text>
                        </TouchableHighlight>
                        <TouchableHighlight style={styles.button} onPress={() => onDone(this.state.password)}>
                            <Text style={styles.buttonText}>{"Authenticate"}</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'black',
        flex: 1,
        alignItems: 'center',
    },
    innerContainer: {
        width: '60%',
        height: 180,
        flexDirection: 'column',
    },
    textField: {
        color: 'white',
        backgroundColor: '#111111',
        height: 80
    },
    buttonsContainer: {
        flexDirection: 'row',
        height: 100
    },
    button: {
        flex: 1,
        margin: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111111',
    },
    buttonText: {
        color: 'white',
        fontSize: 17,
    }
});