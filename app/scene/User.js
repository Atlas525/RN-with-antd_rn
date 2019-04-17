import React, {Component} from 'react';
import { DeviceEventEmitter,StyleSheet,ToastAndroid ,Text, View, } from 'react-native';

export default class User extends Component {
    static navigationOptions = {
        title: '用户页',
        headerStyle: {
          backgroundColor: '#2567EF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
    };
    render(){
        return (
            <Text>
                user
            </Text>
        )
    }
}