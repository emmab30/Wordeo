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
  ActivityIndicator
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
import CustomNavbarNotification from './CustomNavbarNotification'

import { Navigation } from 'react-native-navigation';

import DialogConfirmation from '../DialogConfirmation';
import { AnalyticsService, SocketService } from '../../services/Services.js';

import { CachedImage } from 'react-native-cached-image';

export default class CustomNavbar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            customNavbarNotification: {
                isVisible: true,
                notification: {
                    text: '¡Texto de prueba!'
                }
            },
            isSocketConnected: true
        }

        this.navbarNotification = null;
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) {
        if(this.props.onNavigatorEvent)
            this.props.onNavigatorEvent(event);

        switch(event.id) {
            case 'willAppear':

                Keyboard.dismiss();
                SocketService.socket.on('connect', this.onSocketConnect.bind(this));
                SocketService.socket.on('disconnect', this.onSocketDisconnect.bind(this));

                break;
            case 'didAppear':
                break;
            case 'willDisappear':
                if(this.onSocketConnect)
                    SocketService.removeListener('connect', this.onSocketConnect);
                if(this.onSocketDisconnect)
                    SocketService.removeListener('disconnect', this.onSocketDisconnect);

                break;
            case 'didDisappear':
                break;
        }
    }

    onSocketConnect() {
        this.setState({ isSocketConnected : true })
    }

    onSocketDisconnect() {
        this.setState({ isSocketConnected : false })
    }

    componentDidMount() {

    }

    onBack = () => {
        if(this.props.backButtonFn){
            this.props.backButtonFn();
        } else {
            this.props.navigator.pop();
        }
    }

    showMessage = (message, options = {}) => {
        this.navbarNotification.showMessage(message, options);
        if(options.duration) {
            setTimeout(() => {
                if(this.navbarNotification)
                    this.navbarNotification.hide();
                if(options.onHide)
                    options.onHide()
            }, (options.duration || 3000));
        }
    }

    hide = () => {
        if(this.navbarNotification)
            this.navbarNotification.hide();
    }

    render() {
        const {
            title,
            backButton,
            customLeftView,
            customCenterView,
            customRightView,
            customLeftViewContainerStyle,
            customCenterViewContainerStyle,
            customRightViewContainerStyle,
            flexCenterContent,
            gradientColors
        } = this.props;

        let containerStyle = [styles.navbar];
        if(this.props.containerStyle) {
            containerStyle.push(this.props.containerStyle);
        }

        return (
            <LinearGradient style={{ shadowColor: 'white', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 5 }} colors={gradientColors}>
                <CustomNavbarNotification
                    ref={(e) => { this.navbarNotification = e }} />

                <View style={containerStyle}>
                    <View style={styles.item}>
                        { backButton &&
                            <TouchableOpacity onPress={this.onBack} style={{flex: 1, paddingLeft: 20, justifyContent: 'center', width: '100%', height: '100%'}}>
                                <Image
                                    style={{ alignSelf: 'flex-start', tintColor: 'white', width: 15, maxHeight: 20 }}
                                    source={require('../../images/wordeo/navbar/back.png')} />
                            </TouchableOpacity>
                        }

                        { customLeftView != null &&
                            <View style={[styles.customLeftViewContainer, customLeftViewContainerStyle]}>
                                { customLeftView() }
                            </View>
                        }
                    </View>
                    <View style={[styles.item, styles.itemCenter, {flex: (flexCenterContent != null ? flexCenterContent : 1), backgroundColor: 'transparent' }]}>
                        { title &&
                            <Text style={styles.title}>{title}</Text>
                        }

                        { false && !this.state.isSocketConnected &&
                            <View style={[styles.customCenterViewContainer, customCenterViewContainerStyle]}>
                                <ActivityIndicator
                                    size={"small"}
                                    color={"white"}/>
                                <Text style={[styles.title, { fontSize: Global.normalizeFontSize(12), marginTop: 5 }]}>Conectando..</Text>
                            </View>
                        }

                        { (true || this.state.isSocketConnected) && customCenterView != null &&
                            <View style={[styles.customCenterViewContainer, customCenterViewContainerStyle]}>
                                { customCenterView() }
                            </View>
                        }
                    </View>
                    <View style={styles.item}>
                        { customRightView != null &&
                            <View style={[styles.customRightViewContainer, customRightViewContainerStyle]}>
                                { customRightView() }
                            </View>
                        }
                    </View>
                </View>
            </LinearGradient>
        );
    }
}

var {height, width} = Dimensions.get('window');
const styles = StyleSheet.create({
    navbar: {
        width: '100%',
        maxWidth: '95%',
        alignSelf: 'center',
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: Global.normalizeFontSize(18),
        fontFamily: Font.TitanOne,
        color: 'white',
        textAlign: 'center'
    },
    titleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    item: {
        flex: 1,
    },
    itemCenter: {
        flex: 1.5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    customLeftViewContainer: {
        flex: 1,
        width: '100%'
    },
    customCenterViewContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    customRightViewContainer: {
        flex: 1,
        width: '100%'
    },
});
