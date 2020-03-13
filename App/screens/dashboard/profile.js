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
  Image,
  TouchableOpacity,
  Dimensions,
  AsyncStorage,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  ImageBackground
} from 'react-native';

//Localization
import { strings } from '../../components/localization/strings';

//Components
import TutorialOverlay from '../../components/componentsJs/TutorialOverlay'
import CustomNavbar from '../../components/navigation/CustomNavbar'
import CustomizeCharacter from '../../components/modals/CustomizeCharacter';
import SpinnerComponent from '../../components/SpinnerComponent';
import DialogError from '../../components/DialogError';

//Styles
import { Global } from '../../components/common/global';
import { ProfileStyle } from '../../styles/dashboard/profile';
import { Color, Font } from '../../styles/default';

//Services
import { AnalyticsService, AuthService, PreferencesService, SocketService } from '../../services/Services'

//Plugins
import Orientation from 'react-native-orientation';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Divider, Button } from 'react-native-elements';
import OneSignal from 'react-native-onesignal';

var {height, width} = Dimensions.get('window');
var Sound = require('react-native-sound');
var _ = require('lodash');

const FBSDK = require('react-native-fbsdk');
const {
  LoginButton,
  AccessToken,
  LoginManager,
  GraphRequest,
  GraphRequestManager
} = FBSDK;

export default class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {
                profile: {}
            },
            avatarSource: { uri: 'https://randomuser.me/api/portraits/men/18.jpg' },
            avatar: null,
            id: null,
            spinner: false,
            errorVisible: false,
            errorMessage: '',
            avatarChanged: false,
            changesToSubmit: false,
            confirmationLogout: false,
            height: height,
            pushNotificationEnabled: true,
            soundEnabled: true,
            language: null,
            isUpdatingProfile: true,
            isLoadedProfile: false,
            characterLife: 0
        }

        this._logout = this._logout.bind(this);
        this._forceLogout = this._forceLogout.bind(this);
        this.getProfile = this.getProfile.bind(this);

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        currentScreen = 'OpenEnglish.Dashboard.Profile';

        AsyncStorage.getItem('Language').then((value) => {
            this.setState({language: value});
        }).done();

        AnalyticsService.trackScreenView('profile');
    }

    getProfile() {
        this.refs.spinner.show();
        AuthService.getMe((profile) => {
            this.refs.spinner.hide();
            setTimeout(() => {
                if(profile.result) {
                    this.setState({ user : profile.user, isLoadedProfile: true })
                    if(profile.user.profile.avatar != null) {
                        this.setState({
                            //avatarSource: { uri : profile.user.profile.avatar }
                            avatarSource: { uri : profile.user.profile.character }
                        });
                    }
                    if(profile.user.profile.characterLife) {
                        this.setState({ characterLife : profile.user.profile.characterLife })
                        if(parseFloat(profile.user.profile.characterLife) == 100) {
                            this.refs.dialog.show('success', '¡Felicitaciones, la vida de tu monstruo está completa y el te lo agradece mucho!');
                        }
                    }
                }
            }, 200)
        }, (err) => {
            //Do nothing
        })
    }

    componentWillUnmount() {
        //Do nothing
    }

    componentDidMount() {
        this.setState({ isUpdatingProfile : false })
        this.getProfile();

        OneSignal.getPermissionSubscriptionState((status) => {
            if(status && status.subscriptionEnabled) {
                this.setState({ pushNotificationEnabled: true })
            } else {
                this.setState({ pushNotificationEnabled: false })
            }
        });

        PreferencesService.getPreferenceByKey('soundEnabled', (value) => {
            this.setState({ soundEnabled : value });
        });
    }

    _finish = () => {
        /* var fileName = (new Date()).getTime() + '.jpg';
        var dataUser = {
          name: this.state.name,
          lastname: this.state.lastname,
          email : this.state.email,
          phone: this.state.phone,
          avatar: (this.state.avatarChanged === true) ? fileName : this.state.avatar,
          age: (this.state.age !== null) ? this.state.age : null
        }
        if(!Global.validateOnlyString(this.state.name)){
          AnalyticsService.trackError('ERROR_PROFILE', 'profile', 'firstname_is_mandatory');
          this._error(strings.NameRequired);
        } else if(!Global.validateOnlyString(this.state.lastname)){
          AnalyticsService.trackError('ERROR_PROFILE', 'profile', 'lastname_is_mandatory');
          this._error(strings.LastNameRequired);
        } else if((Helper.getPrototype() == 3 || Helper.isTelcelFlow()) && !Global.validateAge(this.state.age)){
          AnalyticsService.trackError('ERROR_PROFILE', 'profile', 'age_is_mandatory');
          this._error(strings.AgeRequired);
        } else if((Helper.getPrototype() == 3 || Helper.isTelcelFlow()) && !Global.validateMinimumAge(this.state.age)) {
          AnalyticsService.trackError('ERROR_PROFILE', 'profile', 'underage');
          this._error(strings.AgeInsufficient);   
        } else if(this.state.email.replace(/ /g,'').length == 0){
          AnalyticsService.trackError('ERROR_PROFILE', 'profile', 'email_is_mandatory');
          this._error(strings.EmailRequired);
        } else if(!Global.validateEmail(this.state.email)){
          AnalyticsService.trackError('ERROR_PROFILE', 'profile', 'invalid_email');
          this._error(strings.EmailNotValid);
        } else {

            this.setState({ spinner: true });
            AuthService.update(this.state.id, dataUser, (dataRegister) => {
                if(this.state.avatarChanged === true) {
                    ImageService.upload('avatars', this.state.avatar, dataRegister.avatar, (data) => {
                        this.setState({
                            nameTitle: dataRegister.name,
                            lastNameTitle: dataRegister.lastname,
                            spinner: false,
                            avatarChanged: false
                        });
                        AuthService.updateProfile(dataRegister, () => {
                            this.setState({
                                changesToSubmit: false
                            })
                            this.pullUserData();
                            this._success(strings.ProfileUpdated);
                            Global.eventEmitter.emit('changeProfile', dataRegister);
                            AnalyticsService.trackEvent('save_profile');
                        });
                        Global.eventEmitter.emit('changeAvatar', this.state.avatar);
                    }, (error) => {
                        AnalyticsService.trackError('ERROR_PROFILE', 'profile', 'uploading_avatar');

                        this.setState({
                            nameTitle: dataRegister.name,
                            lastNameTitle: dataRegister.lastname,
                            spinner: false
                        });
                        this._error(strings.ErrorSendingImage);
                    })
                } else {
                    this.setState({
                        nameTitle: dataRegister.name,
                        lastNameTitle: dataRegister.lastname,
                        spinner: false,
                        avatarChanged: false
                    });
                    AuthService.updateProfile(dataRegister, () => {
                        this.setState({
                            changesToSubmit: false
                        })
                        this.pullUserData();
                        this._success(strings.ProfileUpdated);
                        Global.eventEmitter.emit('changeProfile', dataRegister);
                        AnalyticsService.trackEvent('save_profile');
                    });
                }
            }, (error) => {
                if(error.response != null && error.response.data != null && error.response.data.error != null && error.response.data.error.message != null) {
                    if(error.response.data.error.message.indexOf('Email already exists')) {
                        AnalyticsService.trackError('ERROR_PROFILE', 'profile', 'email_already_taken');
                        this._error(strings.ProfileEmailAlreadyExists);
                    } else {
                        AnalyticsService.trackError('ERROR_PROFILE', 'profile', 'invalid_save_profile');
                        this._error(strings.ProfileError);
                    }
                } else {
                    AnalyticsService.trackError('ERROR_PROFILE', 'profile', 'invalid_save_profile');
                    this._error(strings.ProfileError);
                }
                this.setState({
                    spinner: false,
                });
            })
        } */
        alert("Update!");
    }

    _error = (message) => {
        this.refs.dialog.show('error', message);
    }

    _success = (message) => {
        this.refs.dialog.show('success', message);
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        
    }

    _pickAvatar() {
        this.setState({ isCustomizingCharacter: true });
        AnalyticsService.trackEvent('profile_customize_character', {
            correct: true
        });
        /* Global.ImagePickerOnlyCamera((source) => {
            this.setState({
                avatarSource: source,
                avatar: source,
                avatarChanged: true,
                changesToSubmit: true
            })
        }, (error) => {
            if(Platform.OS !== 'ios') {
                this._error(strings.ErrorSendingImage);
            } else {
                if(error != null && error.indexOf('permissions') > -1) {
                    this._error(strings.PermissionDenied)
                } else {
                    this.setState({ spinner: false, spinnerText: '' });
                    this._error(strings.ErrorSendingImage);
                }
            }
        }); */
    }

    onSwitchSound() {
        PreferencesService.setPreferenceByKey('soundEnabled', !this.state.soundEnabled, (newValue) => {
            this.setState({ soundEnabled : newValue });
        });
    }

    onSwitchNotification() {
        OneSignal.getPermissionSubscriptionState((status) => {
            if(status && status.subscriptionEnabled) {
                OneSignal.setSubscription(!status.subscriptionEnabled)
            } else {
                OneSignal.setSubscription(true)
            }

            this.setState({pushNotificationEnabled: !this.state.pushNotificationEnabled});
            AnalyticsService.trackEvent('toggle_push_notifications', {
                value: (this.state.pushNotificationEnabled ? 'on' : 'off')
            });
        });
    }

    goResetPassword() {
        var screen = Object.assign({}, Global.Screen.ChangePassword);
        screen.passProps = {
            'fromProfile': true
        };
        this.props.navigator.showModal(screen);
    }

    goReportTeacher() {
        var screen = Object.assign({}, Global.Screen.Dashboard.ReportTeacher);
        this.props.navigator.push(screen);
    }

    goTermsAndConditions() {
        AnalyticsService.trackEvent('terms_module');
        var screen = Object.assign({}, Global.Screen.Dashboard.TermsAndConditions);
        this.props.navigator.push(screen);
    }

    goPrivacyPolicy() {
        AnalyticsService.trackEvent('privacy_module');
        var screen = Object.assign({}, Global.Screen.Dashboard.PrivacyPolicy);
        this.props.navigator.push(screen);
    }

    _dismissError() {
        this.setState({ errorVisible : false, errorMessage : null });
    }

    goSettings = () => {
        pushingView = Object.assign({}, Global.Screen.Dashboard.Settings);
        rootNavigator.push(pushingView)
    }

    goContact = () => {
        pushingView = Object.assign({}, Global.Screen.Dashboard.Contact);
        rootNavigator.push(pushingView)
    }

    goLogout = () => {
        if(this.state.changesToSubmit == true) {
            this.setState({ exitWithoutSave : true, exitWithoutSaveMethod: 'logout'});
        } else {
            this.setState({ confirmationLogout : true });
        }
    }

    _logout() {
        AnalyticsService.trackEvent('logout');
        this.setState({ confirmationLogout : false })
        AuthService.logout((success) => {}, (error) => {});
        AsyncStorage.removeItem('userCredentials');
        AsyncStorage.removeItem('userFacebookToken');
        AsyncStorage.removeItem('user');
    }

    _forceLogout() {
        this.setState({ confirmationLogout : false })
        AuthService.logout((success) => {}, (error) => {});
        AsyncStorage.removeItem('userCredentials');
        AsyncStorage.removeItem('userFacebookToken');
        AsyncStorage.removeItem('user');
    }

    onLayout(e) {
        this.setState({height: Dimensions.get('window').height});
    }

    _onBack = () => {
        if(this.state.changesToSubmit == true) {
            this.setState({ exitWithoutSave : true, exitWithoutSaveMethod: 'back' });
        } else {
            Orientation.unlockAllOrientations();
            this.props.navigator.pop();
        }
    }

    _exitWithoutSave = () => {  
        if (this.state.exitWithoutSaveMethod == 'back') {
            this.props.navigator.pop();
        } else {
            if (this.state.exitWithoutSaveMethod == 'logout') {
                this._logout();
            }
        }
    }

    renderNavbar() {
        return (
            <CustomNavbar
                backButtonFn={this._onBack.bind(this)}
                navigator={this.props.navigator}
                gradientColors={['#ED6552', '#ed5e26']}
                backButton={true}
                title={'Mi perfil'}
            />
        );
    }

    onLogout() {
        AnalyticsService.trackEvent('logout');
        this.setState({ confirmationLogout : false })
        AuthService.logout((success) => {}, (error) => {});
        AsyncStorage.removeItem('userCredentials');
        AsyncStorage.removeItem('userFacebookToken');
        AsyncStorage.removeItem('user');
        SocketService.disconnect(() => {
            SocketService.socket = null;
            let pushingView = _.clone(Global.Screen.Login);
            if(pushingView !== null) {
                rootNavigator.resetTo(pushingView)
            }
        });
        LoginManager.logOut();
    }

    onLayoutLogoutContainer(e) {
        this.refs.logoutContainer.measure((x, y, width, height, pageX, pageY) => {
            //console.log(x, y, width, height, pageX, pageY)
            if(this.refs.tutorialOverlay) {
                this.refs.tutorialOverlay.showTutorial({
                    elementX: pageX,
                    elementY: pageY,
                    elementWidth: width,
                    elementHeight: height,
                    text: '¡Con este boton lograrás salir de tu cuenta!'
                });
                setTimeout(() => {
                    this.refs.tutorialOverlay.hide();
                }, 1500);
            }
        });
    }

    render() {
        return (
            <View style={{ width: '100%', height: '100%' }}>

                <DialogError
                    ref='dialog' />

                { this.renderNavbar() }

                { this.state.spinner &&
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator />
                    </View>
                }

                <ScrollView
                    bounces={false}
                    style={[ProfileStyle.container, {marginTop: 0}]}>

                    { !this.state.spinner &&
                        <View style={styles.container}>
                            <View style={styles.avatarImageContainer}>
                                <ImageBackground style={styles.avatarImageBackground} source={{ uri : 'data:image/jpeg;base64,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' }}>
                                    <TouchableOpacity
                                        style={{ maxWidth: '100%', width: '100%', alignSelf: 'center', paddingVertical: 10 }}
                                        onPress={this._pickAvatar.bind(this)}>

                                        { this.state.isLoadedProfile &&
                                            <Animatable.Text
                                                style={{ textAlign: 'center', backgroundColor: 'transparent', fontFamily: Font.TitanOne, color: 'white', fontSize: Global.normalizeFontSize(13), marginBottom: 10 }}
                                                animation={'bounceIn'}
                                                iterationCount={3}
                                                duration={1200}>Toca para editarme</Animatable.Text>
                                        }

                                        { this.state.isLoadedProfile &&
                                            <Animatable.Image
                                                animation={'bounceIn'}
                                                iterationCount={1}
                                                duration={1800}
                                                source={this.state.avatarSource} style={styles.avatar} />
                                        }
                                    </TouchableOpacity>
                                    <View style={{ flexDirection: 'column', width: '90%', alignSelf: 'center' }}>
                                        <View style={{ alignSelf: 'center', width : (this.state.characterLife + '%'), height: 3, backgroundColor: (this.state.characterLife <= 15 ? 'red' : '#17d104'), borderRadius: 5 }}></View>
                                        <Text style={{ fontFamily : Font.TitanOne, fontSize: Global.normalizeFontSize(20), marginTop: 5, color: 'white', textAlign: 'center' }}>{this.state.characterLife}% de vida</Text>
                                    </View>
                                    <Text style={styles.avatarName}>{this.state.user.username}</Text>
                                </ImageBackground>
                            </View>

                            <View style={styles.formContainer}>
                                <View style={styles.inputContainer}>
                                    <Icon style={styles.formIcon} name="user-circle" size={20} color="#0088ff" />
                                    <TextInput
                                        placeholder={'Nombre'}
                                        underlineColorAndroid={'transparent'}
                                        style={styles.formInput}
                                        value={this.state.user.profile.name}
                                        onChangeText={(text) => {
                                            let user = { ...this.state.user };
                                            user.profile.name = text;
                                            this.setState({ user })
                                        }}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Icon style={styles.formIcon} name="user-circle" size={20} color="#0088ff" />
                                    <TextInput
                                        placeholder={'Apellido'}
                                        underlineColorAndroid={'transparent'}
                                        style={styles.formInput}
                                        value={this.state.user.profile.lastName}
                                        onChangeText={(text) => {
                                            let user = { ...this.state.user };
                                            user.profile.lastName = text;
                                            this.setState({ user })
                                        }}
                                    />
                                </View>
                                <Divider style={{ backgroundColor: '#ededed' }} />

                                <View style={styles.inputContainer}>
                                    <Icon style={styles.formIcon} name="envelope-open" size={20} color="#0088ff" />
                                    <TextInput
                                        placeholder={'E-mail'}
                                        underlineColorAndroid={'transparent'}
                                        style={styles.formInput}
                                        value={this.state.user.email}
                                        onChangeText={(text) => {
                                            let user = { ...this.state.user };
                                            user.email = text;
                                            this.setState({ user })
                                        }}
                                    />
                                </View>

                                <Divider style={{ backgroundColor: '#ededed' }} />

                                <View style={[styles.inputContainer, { alignItems: 'center', justifyContent: 'space-between' }]}>
                                    <Text style={{ fontFamily: Font.PTSansBold, fontSize: Global.normalizeFontSize(18), marginRight: 10 }}>Activar notificationes</Text>
                                    <Switch
                                        tintColor={'rgba(0,0,0,.15)'}
                                        onTintColor={Color.BluePrimary}
                                        onValueChange={(e) => this.onSwitchNotification()}
                                        value={this.state.pushNotificationEnabled}></Switch>
                                </View>

                                <Divider style={{ backgroundColor: '#ededed' }} />

                                <View style={[styles.inputContainer, { alignItems: 'center', justifyContent: 'space-between' }]}>
                                    <Text style={{ fontFamily: Font.PTSansBold, fontSize: Global.normalizeFontSize(18), marginRight: 10 }}>Activar sonido</Text>
                                    <Switch
                                        tintColor={'rgba(0,0,0,.15)'}
                                        onTintColor={Color.BluePrimary}
                                        onValueChange={(e) => this.onSwitchSound()}
                                        value={this.state.soundEnabled}></Switch>
                                </View>

                                <Divider style={{ backgroundColor: '#ededed' }} />

                                <View
                                    onLayout={this.onLayoutLogoutContainer.bind(this)}
                                    ref={'logoutContainer'}
                                    style={[styles.inputContainer, { alignItems: 'center', justifyContent: 'center' }]}>
                                    <TouchableOpacity onPress={this.onLogout.bind(this)} style={{ padding: 10, backgroundColor: Color.BluePrimary, borderRadius: 10 }}>
                                        <Text style={{ fontFamily: Font.PTSansBold, marginRight: 10, fontSize: Global.normalizeFontSize(18), backgroundColor: 'transparent', color: 'white', fontFamily: Font.TitanOne }}>Salir de mi cuenta</Text>
                                    </TouchableOpacity>
                                </View>

                                <Divider style={{ backgroundColor: '#ededed' }} />

                                { /* <Button
                                    large
                                    loading={this.state.isUpdatingProfile}
                                    onPress={() => {
                                        this._finish();
                                    }}
                                    containerViewStyle={{ width: '100%', marginLeft: 0, flex: 1, marginVertical: 10 }}
                                    buttonStyle={styles.buttonUpdate}
                                    textStyle={{ fontFamily: Font.TitanOne }}
                                    title='Actualizar Perfil' /> */ }
                            </View>
                        </View>
                    }

                    <View style={styles.stats}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ flex: 1, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(15), color: '#eee', textAlign: 'center', backgroundColor: 'transparent'}}>TULS ACUMULADOS</Text>
                            <Text style={{ flex: 1, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(20), color: Color.VioletPrimary, textAlign: 'center', backgroundColor: 'transparent'}}>{Global.formatPrice(this.state.user.profile.balance_tuls)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', marginVertical: 4, alignItems: 'center' }}>
                            <Text style={{ flex: 1, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(15), color: '#eee', textAlign: 'center', backgroundColor: 'transparent'}}>PUNTOS DE EXPERIENCIA</Text>
                            <Text style={{ flex: 1, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(20), color: Color.VioletPrimary, textAlign: 'center', backgroundColor: 'transparent'}}>{this.state.user.profile.experience_points}</Text>
                        </View>
                        <Divider style={{ marginVertical: 5, backgroundColor: '#ededed' }} />
                        <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'column'}}>
                                <Text style={{ flex: 1, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(15), color: '#eee', textAlign: 'center', backgroundColor: 'transparent'}}>NIVEL</Text>
                                <Text style={{ flex: 1, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(20), color: Color.VioletSecondary, textAlign: 'center', backgroundColor: 'transparent'}}>{this.state.user.profile.level}</Text>
                            </View>
                            <View style={{ flexDirection: 'column'}}>
                                <Text style={{ flex: 1, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(15), color: '#eee', textAlign: 'center', backgroundColor: 'transparent'}}>PART. JUGADAS</Text>
                                <Text style={{ flex: 1, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(20), color: Color.VioletSecondary, textAlign: 'center', backgroundColor: 'transparent'}}>{this.state.user.profile.totalGames}</Text>
                            </View>
                            <View style={{ flexDirection: 'column'}}>
                                <Text style={{ flex: 1, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(15), color: '#eee', textAlign: 'center', backgroundColor: 'transparent'}}>GANADAS</Text>
                                <Text style={{ flex: 1, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(20), color: Color.VioletSecondary, textAlign: 'center', backgroundColor: 'transparent'}}>{this.state.user.profile.totalWins}</Text>
                            </View>
                        </View>
                    </View>

                    <CustomizeCharacter
                        onStartLoading={() => {
                            this.refs.spinner.show();
                        }}
                        onStopLoading={() => {
                            this.refs.spinner.hide();
                        }}
                        onClose={() => {
                            this.setState({ isCustomizingCharacter : false })
                        }}
                        profile={this.state.user.profile}
                        onUpdateProfile={(closeCustomizeCharacter = false) => {
                            if(closeCustomizeCharacter) {
                                this.setState({ isCustomizingCharacter : false })
                            }
                            this.getProfile();
                        }}
                        isVisible={this.state.isCustomizingCharacter}
                    />

                </ScrollView>

                <SpinnerComponent
                    ref={'spinner'} />

                <TutorialOverlay
                    ref='tutorialOverlay' />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    loadingContainer : {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    formContainer: {
        width: '90%',
        maxWidth: '90%',
        alignSelf: 'center',
        flex: 1,
        flexDirection: 'column'
    },
    inputContainer: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    formInput: {
        flex: 1,
        fontFamily: Font.PTSansBold,
        fontSize: Global.normalizeFontSize(18)
    },
    formIcon: {
        marginRight: 10
    },
    avatarImageContainer: {
        flex: 1,
        width: '100%'
    },
    avatarImageBackground: {
        minHeight: 200,
        width: '100%',
        height: '100%',
        justifyContent: 'center'
    },
    avatar: {
        flex: 0,
        width: '100%',
        height: 100,
        resizeMode: 'contain',
        //width: 100,
        //height: 100,
        //borderRadius: 50,
        alignSelf: 'center'
    },
    avatarName: {
        color: 'white',
        fontSize: Global.normalizeFontSize(20),
        marginVertical: 10,
        backgroundColor: 'transparent',
        color: Color.GoldenPrimary,
        shadowColor: 'rgba(255,255,255,.5)',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        fontFamily: Font.TitanOne,
        textAlign : 'center'
    },
    buttonUpdate: {
        minWidth: '100%',
        width: '100%',
        borderRadius: 10,
        backgroundColor: Color.OrangePrimary,
        height: 50
    },
    stats: {
        flex: 0,
        borderTopLeftRadius: 10,
        borderBottomRightRadius: 10,
        margin: 10,
        padding: 5,
        backgroundColor: 'rgba(22,22,22,0.95)'
    }
});