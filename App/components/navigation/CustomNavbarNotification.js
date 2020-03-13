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
  ScrollView,
  Animated
} from 'react-native';

//Localization
import { strings } from '../localization/strings'

import Moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';
import { Color, Font } from '../../styles/default';
import { Global } from '../common/global';
import { ApiUrl } from '../../services/BaseService.js';
import AuthService from '../../services/AuthService.js';
import Helper from '../common/Helper'

import { Navigation } from 'react-native-navigation';

import DialogConfirmation from '../DialogConfirmation';
import AnalyticsService from '../../services/AnalyticsService.js';

import { CachedImage } from 'react-native-cached-image';
import * as Animatable from 'react-native-animatable';

export default class CustomNavbarNotification extends Component {
    constructor(props) {
        super(props);

        this.state = {
            height: new Animated.Value(0),
            text: '',
            options: {},
            isComponentReleased: false,
            animation: "rubberBand",
            animationDuration: 500,
            onPress: null,
            backgroundColor: null
        }
    }

    onNavigatorEvent(event) {
        switch(event.id) {
            case 'willAppear':
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

    showMessage(message, options = {}) {
        this.setState({ text : message, options: options, backgroundColor: options.backgroundColor, isComponentReleased: false, animation: (options.animation || "fadeIn"), animationDuration: (options.animationDuration || 500), onPress: (options.onPress || null) })

        Animated.spring(this.state.height, {
            toValue: 70,
            duration: (options.duration || 3000)
        }).start();
    }

    hide() {
        Animated.timing(this.state.height, {
            toValue: 0,
            duration: 250
        }).start(() => {
            this.setState({ backgroundColor: null, options: null, height: new Animated.Value(0), text : null, isComponentReleased : true, animation: "fadeIn", animationDuration: 500, onPress: null });
        });
    }

    render() {
        if(this.state.isComponentReleased)
            return null;

        const { containerTextStyle } = this.state.options;

        return (
            <Animated.View style={[styles.container, { height: this.state.height, backgroundColor: (this.state.backgroundColor || '#eb2e28') }]}>
                <TouchableOpacity
                    activeOpacity={.9}
                    onPress={() => {
                        if(this.state.onPress)
                            this.state.onPress();
                    }}
                    style={[styles.inner]}>
                    <Animatable.Text animation={this.state.animation} delay={0} duration={this.state.animationDuration} iterationCount={1} style={[styles.text, containerTextStyle]}>{this.state.text}</Animatable.Text>
                </TouchableOpacity>
            </Animated.View>
        );
    }
}

var {height, width} = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        width: '100%',
        overflow: 'hidden'
    },
    inner: {
        padding: 0,
        margin: 0,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        marginHorizontal: 10,
        fontFamily: Font.PTSansRegular,
        fontSize: Global.normalizeFontSize(12),
        color: 'white',
        textAlign: 'center',
    }
});
