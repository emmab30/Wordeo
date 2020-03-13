/**
* Sample React Native App
* https://github.com/facebook/react-native
* @flow
*/

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Dimensions,
  AsyncStorage,
  Keyboard,
  Platform,
  BackHandler,
  ScrollView
} from 'react-native';

//Localization
import { strings } from '../localization/strings'

import Moment from 'moment';
import { Color, Font } from '../../styles/default';
import { Global } from '../common/global';
import { ApiUrl } from '../../services/BaseService.js';
import AuthService from '../../services/AuthService.js';
import Helper from '../common/Helper'

/* import TextField from 'react-native-md-textinput'; */
import { Navigation } from 'react-native-navigation';

import DialogConfirmation from '../DialogConfirmation';
import ChatService from '../../services/ChatService.js';
import AnalyticsService from '../../services/AnalyticsService.js';

import LinearGradient from 'react-native-linear-gradient';

export default class AbbyMenuButton extends Component {
    constructor(props) {
        super(props);
    }

    onNavigatorEvent(event) {
        switch(event.id) {
            case 'willAppear':
                Keyboard.dismiss();
                break;
            case 'didAppear':
                break;
            case 'willDisappear':
                break;
            case 'didDisappear':
                break;
        }
    }

    componentDidMount() {

    }

    onBack = () => {
        this.props.navigator.pop();
    }

    render() {
        const {
            title,
            onPress,
            colorInner,
            imageInner,
            imageStyle
        } = this.props;

        return (
            <View style={[styles.container, styles.size]}>
                <TouchableOpacity
                    style={[styles.size, {paddingBottom: 5}]}
                    onPress={onPress}>
                        <View style={[styles.innerCircle, {backgroundColor: colorInner}]}>
                            <Image 
                            style={imageStyle}
                            source={imageInner} />
                        </View>
                </TouchableOpacity>
                <Text style={styles.text}>{title}</Text>
            </View>
        );
    }
}

var {height, width} = Dimensions.get('window');
const styles = StyleSheet.create({
    size: {
        backgroundColor: 'transparent',
        width: 120,
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    innerCircle: {
        width: 60,
        height: 60,
        marginTop: 15,
        borderRadius: 30,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#f3f3f3',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 20,
        elevation: 4,
    },
    text: {
        marginVertical: 5,
        color: '#a0a0a3',
        fontFamily: Font.NunitoBold,
        fontSize: 14,
        textAlign: 'center'
    }
});