/**
* Sample React Native App
* https://github.com/facebook/react-native
* @flow
*/

import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    KeyboardAvoidingView,
    Dimensions,
    AsyncStorage,
    AppState,
    Platform,
    ImageBackground,
    Linking
} from 'react-native';

//Localization
import { strings } from '../../components/localization/strings'

//Components
import EntranceAfterLaunchScreen from '../../components/navigation/EntranceAfterLaunchScreen'
import SpinnerComponent from '../../components/SpinnerComponent'
import CommonDialog from '../../components/dialogs/CommonDialog'

//Services
import { AuthService, AnalyticsService, ConfigurationService } from '../../services/Services';

//Plugins
import OneSignal from 'react-native-onesignal';
import { Navigation } from 'react-native-navigation';
import { Global } from '../../components/common/global';
import { LoginStyle } from '../../styles/login';
import { Color, Font } from '../../styles/default';
import Orientation from 'react-native-orientation';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import DeviceInfo from 'react-native-device-info';

const FBSDK = require('react-native-fbsdk');
const {
  LoginButton,
  AccessToken,
  LoginManager,
  GraphRequest,
  GraphRequestManager
} = FBSDK;

const { height, width } = Dimensions.get('window');

export default class Login extends Component {
    constructor(props) {
        super(props);

        this.onSigninFacebook = this.onSigninFacebook.bind(this);
        this.state = {
            register: {
                name: '',
                email: '',
                password: ''
            },
            email : '',
            password : '',
            behavior: 'padding',
            modalOpen: false,
            spinner: false,
            errorVisible: false,
            errorMessage: '',
            appState: AppState.currentState,
            hidePassword: true,
            isLandscape: false,
            height: height,
            width: width,
            isEntranceAfterLaunchScreen: false
        }

        AnalyticsService.trackScreenView('home');
    }

    componentWillUnmount() {
        Orientation.unlockAllOrientations();
    }

    componentDidMount() {
        this._checkLogin();

        Orientation.lockToPortrait();

        if(this.refs.entrance != null) {
            this.refs.entrance.show();
            setTimeout(() => {
                if(this.refs.entrance != null)
                    this.refs.entrance.hide();
            }, 2500);
        }
    }

    _checkLogin = () => {
        AsyncStorage.getItem("userFacebookToken").then((value) => {
            if(value != null) {
                this.onSigninFacebook();
            }
        });
    }

    onSigninFacebook() {

        let ctx = this;

        AccessToken.getCurrentAccessToken().then((data) => {
            let currentDate = new Date();
            // && data.getPermissions().indexOf('user_friends') > -1
            if(data && data.expirationTime != null && currentDate < new Date(data.expirationTime)) {

                //Login automatically since the access token from facebook didn't expired
                ctx.setState({ spinner : true })

                AsyncStorage.getItem('IdOneSignal').then((notificationId) => {
                    let info = {
                        platform: Platform.OS,
                        preferredLanguage: strings.getLanguage(),
                        accessToken: data.accessToken
                    };

                    if(notificationId != null){
                        info.notificationId = notificationId;
                    }
                    info.appVersion = DeviceInfo.getReadableVersion();

                    this.refs.spinner.show();
                    AuthService.loginFacebook(info, (token) => {
                        this.refs.spinner.hide(() => {
                            //Go to completion profile
                            AuthService.user = token.user;
                            AsyncStorage.setItem('user', JSON.stringify(token), () => {
                                AsyncStorage.setItem('userFacebookToken', JSON.stringify(data), () => {

                                    if(token.version && token.version.isOldVersion) {
                                        this.dialog.show('error', token.version.message, () => {
                                            if(token.version.force) {
                                                if(Platform.OS === 'android') {
                                                    Linking.openURL('https://play.google.com/store/apps/details?id=com.qroom.wordeo');
                                                }
                                            } else {
                                                axios.defaults.headers.common['Authorization'] = token.session.id;

                                                var home = {};
                                                home.screen = Object.assign({}, Global.Screen.Dashboard.Home);
                                                Navigation.startSingleScreenApp(home);
                                            }
                                        });
                                    } else if(token.extraData && token.extraData.message) {
                                        his.dialog.show('error', token.extraData.message, () => {
                                            if(token.extraData.letsContinue) {
                                                axios.defaults.headers.common['Authorization'] = token.session.id;

                                                var home = {};
                                                home.screen = Object.assign({}, Global.Screen.Dashboard.Home);
                                                Navigation.startSingleScreenApp(home);
                                            }
                                        });
                                    } else {
                                        axios.defaults.headers.common['Authorization'] = token.session.id;

                                        var home = {};
                                        home.screen = Object.assign({}, Global.Screen.Dashboard.Home);
                                        Navigation.startSingleScreenApp(home);
                                    }
                                })
                            });
                        });
                    }, (error) => {
                        this.refs.spinner.hide();
                        if(typeof error == 'string') {
                            this.dialog.show('error', error);
                        } else {
                            alert("Otro error");
                        }
                    });
                });
            } else {
                LoginManager.logInWithReadPermissions(['public_profile', 'email']).then(
                    (result) => {
                        if (result.isCancelled) {
                            //Do nothing
                        } else {
                            ctx.setState({ spinner : true })
                            AccessToken.getCurrentAccessToken().then((data) => {
                                //Append mobile information like preferredLanguage, notificationId and platform.
                                AsyncStorage.getItem('IdOneSignal').then((notificationId) => {
                                    let info = {
                                        platform: Platform.OS,
                                        preferredLanguage: strings.getLanguage(),
                                        accessToken: data.accessToken
                                    };

                                    if(notificationId != null){
                                        info.notificationId = notificationId;
                                    }
                                    info.appVersion = DeviceInfo.getReadableVersion();

                                    this.refs.spinner.show();
                                    AuthService.loginFacebook(info, (token) => {

                                        this.refs.spinner.hide(() => {
                                            //Go to completion profile
                                            AsyncStorage.setItem('user', JSON.stringify(token), () => {
                                                AsyncStorage.setItem('userFacebookToken', JSON.stringify(data), () => {
                                                    ctx.setState({ spinner : false })
                                                    axios.defaults.headers.common['Authorization'] = token.session.id;

                                                    var home = {};
                                                    home.screen = Object.assign({}, Global.Screen.Dashboard.Home);
                                                    Navigation.startSingleScreenApp(home);
                                                })
                                            })
                                        });
                                    }, (error) => {
                                        this.refs.spinner.hide();
                                        console.log(error.status);
                                    });
                                });
                            })
                        }
                    },
                    function(error) {
                        //Do nothing
                    }
                );
            }
        });
    }

    componentWillMount() {

        /*
        0 = None - Will not display a notification, instead only onNotificationReceived will fire where you can display your own in app messages.
        1 = InAppAlert - (Default) Will display an Android AlertDialog with the message contains.
        2 = Notification - Notification will display in the Notification Shade. Same as when the app is not in focus.
        */

        OneSignal.configure();
        OneSignal.inFocusDisplaying(2);
        OneSignal.addEventListener('ids', this.onIds);
    }

    onIds(device) {
        AsyncStorage.setItem("IdOneSignal", device.userId, () => {});
    }

    onLayout(e) {
        var context = this;
        Global.getOrientation(function(orientation) {
            context.setState({
                isLandscape: (orientation == 'LANDSCAPE'),
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height,
            })
        });
    }

    render() {
        return (
            <View style={{flex: 1}} onLayout={this.onLayout.bind(this)}>
                <SpinnerComponent
                    ref={'spinner'} />

                <CommonDialog
                    ref={(e) => { this.dialog = e; } } />

                <KeyboardAvoidingView behavior={this.state.behavior} style={[LoginStyle.keyboardContainer, {height: this.state.height}]}>
                    <ImageBackground
                        source={require('../../images/wordeo/login/background.jpg')}
                        style={{flex: 1, height: '100%', width: this.state.width}}>
                        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                            <View style={[{justifyContent: 'center', alignItems: 'center', flex: 1, marginBottom: 0}]}>
                                <TouchableOpacity
                                    style={LoginStyle.loginButtonFacebook}
                                    onPress={() => {
                                        AnalyticsService.trackEvent('login_facebook');
                                        this.onSigninFacebook();
                                    }}>
                                    <Icon name="facebook-f" size={20} color={'white'} />
                                    <Text style={LoginStyle.loginButtonFacebookText}>{strings.LoginWithFacebook}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ImageBackground>
                </KeyboardAvoidingView>

                <EntranceAfterLaunchScreen
                    ref={'entrance'}
                    navigator={this.props.navigator}
                    isVisible={this.state.isEntranceAfterLaunchScreen} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    inputIcon: {
        width: 19,
        height: 25,
        marginRight: 5
    },
    containerForm: {
        alignSelf: 'center',
        width: width / 1.2,
        height: height / 2.8,
    },
    forgotPasswordText: {
        fontSize: Global.normalizeFontSize(14),
        color: '#b7b7b7',
    }
});