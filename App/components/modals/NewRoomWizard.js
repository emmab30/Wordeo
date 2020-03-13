/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    ListView,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    StatusBar
} from 'react-native';

import Overlay from 'react-native-modal-overlay';
import Icon from 'react-native-vector-icons/FontAwesome';

import { AnalyticsService, AuthService, RoomService } from '../../services/Services'

import { Divider, Button, CheckBox } from 'react-native-elements';
import { strings } from '../../components/localization/strings';
import { LoginStyle } from '../../styles/login';
import { CachedImage } from 'react-native-cached-image';
import { Input } from 'react-native-elements';
import { Color, Font } from '../../styles/default';
import { GeneralStyle } from '../../styles/general';
import { Global } from '../../components/common/global';
import CommonDialog from '../../components/dialogs/CommonDialog';
import * as Animatable from 'react-native-animatable';

// Store width in variable
var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height;

export default class NewRoomWizard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            height: height,
            width: width,
            room: {
                name: '',
                isProtected: false,
                password: '',
                players: 2,
                duration: 90
            },
            isLandscape: false,
            isCreatingRoom: false
        };
    }


    onLayout(e) {
        Global.getOrientation(function(orientation) {
            this.setState({
                isLandscape: (orientation == 'LANDSCAPE'),
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height,
            })
        }.bind(this));
    }

    componentWillMount() {
        if(Platform.OS === 'android') {
            StatusBar.setHidden(true);
        }
    }

    createRoom() {
        var room = {
            name: this.state.room.name,
            players: this.state.room.players,
            isProtected: this.state.room.isProtected,
            password: this.state.room.password,
            duration: this.state.room.duration
        };

        //Validate input info
        let isValid = false;
        if(this.state.room.name.trim().length == 0) {
            this.refs.dialog.show('error', 'Debes colocar un nombre de sala correcto para poder jugar');
            AnalyticsService.trackEvent('create_room_error', {
                details: 'name_incomplete'
            });
        } else if(this.state.room.isProtected && this.state.room.password.trim().length == 0) {
            this.refs.dialog.show('error', 'Debes colocar una contraseña si deseas que la sala sea privada');
            AnalyticsService.trackEvent('create_room_error', {
                details: 'password_incomplete'
            });
        } else {
            isValid = true;
        }

        if(isValid) {
            this.setState({ isCreatingRoom : true });
            RoomService.create(room, (data) => {
                AnalyticsService.trackEvent('created_room');
                this.setState({ isCreatingRoom : false })

                setTimeout(() => {
                    this.props.onCreatedRoom(data);
                    this.props.onClose()
                });
            }, (err) => {
                AnalyticsService.trackEvent('create_room_error', {
                    error: 'err_server'
                });
                this.setState({ isCreatingRoom : false });
            });
        }
    }

    render() {
        if(!this.props.isVisible)
            return null;

        return (
            <View
                onLayout={this.onLayout.bind(this)}>
                <Overlay visible={this.props.isVisible}
                    closeOnTouchOutside
                    animationType={'slideInDown'}
                    animationOutType={'none'}
                    animationDuration={300}
                    onClose={() => {
                        this.props.onClose()
                    }}
                    containerStyle={{backgroundColor: 'rgba(140, 140, 140, 0.8)', flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center'}}
                    childrenWrapperStyle={[styles.overlayChildren, {overflow: 'hidden', paddingTop: 0, marginTop: 0, backgroundColor: "#fff", paddingHorizontal: 0, borderRadius: 10, width: (this.state.isLandscape ? '80%' : '100%'), maxHeight: (this.state.room.isProtected ? 600 : 550) }]} >
                    { this.renderPortraitMode() }
                </Overlay>
            </View>
        );
    }

    renderPortraitMode() {
        return (
            <View
                onStartShouldSetResponder={() => { return true; }}
                style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <ScrollView
                    style={{width: '100%', alignSelf: 'center', height: '100%'}}>

                    <CommonDialog
                        ref={'dialog'} />

                    <View style={styles.formContainer}>
                        <Text style={GeneralStyle.header}>CREAR SALA</Text>
                        <Animatable.Text animation={'bounceInDown'} style={{ fontSize: Global.normalizeFontSize(17), color: '#222', fontFamily: Font.PTSansBold, textAlign: 'center' }}>Recuerda que para jugar con amigos, debes crear una sala privada con contraseña. Una vez dentro de la sala, ¡tendrás posibilidad de invitarlo a jugar contigo!</Animatable.Text>
                        { /* <View style={{ width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', backgroundColor: Color.VioletPrimary }}>
                            <Image source={require('../../images/wordeo/room_placeholders/1.png')} style={{ width : 80, height: 80, resizeMode: 'contain' }} />
                        </View> */ }
                        <View style={styles.inputContainer}>
                            <Icon style={styles.formIcon} name="user-circle" size={20} color={Color.BluePrimary} />
                            <TextInput
                                multiline={false}
                                underlineColorAndroid={'transparent'}
                                placeholder={'Nombre de la sala'}
                                style={styles.formInput}
                                onChangeText={(text) => {
                                    let room = { ...this.state.room };
                                    room.name = text;
                                    this.setState({ room })
                                }}
                                value={this.state.room.name}
                            />
                        </View>
                        <Divider style={{ backgroundColor: '#ededed' }} />

                        <View style={styles.inputContainer}>
                            <CheckBox
                                containerStyle={{ width : '100%', backgroundColor: 'white', borderWidth: 0, marginLeft: 0, paddingLeft: 5}}
                                textStyle={{ fontFamily: Font.PTSansRegular }}
                                title='Sala privada'
                                onPress={(event, value) => {
                                    let room = { ...this.state.room };
                                    room.isProtected = !room.isProtected;
                                    this.setState({ room })
                                }}
                                checked={this.state.room.isProtected}
                            />
                        </View>

                        { this.state.room.isProtected &&
                            <Divider style={{ backgroundColor: '#ededed' }} />
                        }

                        { this.state.room.isProtected &&
                            <View style={[styles.inputContainer, { marginLeft: 30 }]}>
                                <Icon style={styles.formIcon} name="unlock" size={20} color={Color.BluePrimary} />
                                <TextInput
                                    multiline={false}
                                    placeholder={'Contraseña'}
                                    underlineColorAndroid={'transparent'}
                                    style={styles.formInput}
                                    onChangeText={(text) => {
                                        let room = { ...this.state.room };
                                        room.password = text;
                                        this.setState({ room })
                                    }}
                                    value={this.state.room.password}
                                />
                            </View>
                        }

                        { this.state.room.isProtected &&
                            <Divider style={{ backgroundColor: '#ededed' }} />
                        }

                        <View style={{ width: '100%' , marginVertical: 10, height: 'auto' }}>
                            <Text style={GeneralStyle.header}>Numero de jugadores</Text>
                            <View style={{ flexDirection: 'row', height: 50, width: '100%' }}>
                                <TouchableOpacity
                                    activeOpacity={.7}
                                    onPress={() => {
                                        let room = { ...this.state.room }
                                        room.players = 2;
                                        this.setState({ room })
                                    }}
                                    style={{backgroundColor: (this.state.room.players == 2 ? Color.BluePrimary : Color.VioletPrimary), flex: 1, justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 10, borderBottomLeftRadius: 10, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,.3)' }}>
                                    <Text style={{ fontFamily: Font.PTSansBold, fontSize: Global.normalizeFontSize(15), color: 'white' }}>2</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={.7}
                                    onPress={() => {
                                        AnalyticsService.trackEvent('config_room_players', {
                                            players: 3
                                        });

                                        let room = { ...this.state.room }
                                        room.players = 3;
                                        this.setState({ room })
                                    }}
                                    style={{backgroundColor: (this.state.room.players == 3 ? Color.BluePrimary : Color.VioletPrimary), flex: 1, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,.3)'}}>
                                    <Text style={{ fontFamily: Font.PTSansBold, fontSize: Global.normalizeFontSize(15), color: 'white' }}>3</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={.7}
                                    onPress={() => {
                                        AnalyticsService.trackEvent('config_room_players', {
                                            players: 4
                                        });

                                        let room = { ...this.state.room }
                                        room.players = 4;
                                        this.setState({ room })
                                    }}
                                    style={{backgroundColor: (this.state.room.players == 4 ? Color.BluePrimary : Color.VioletPrimary), flex: 1, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,.3)'}}>
                                    <Text style={{ fontFamily: Font.PTSansBold, fontSize: Global.normalizeFontSize(15), color: 'white' }}>4</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={.7}
                                    onPress={() => {
                                        AnalyticsService.trackEvent('config_room_players', {
                                            players: 5
                                        });

                                        let room = { ...this.state.room }
                                        room.players = 5;
                                        this.setState({ room })
                                    }}
                                    style={{backgroundColor: (this.state.room.players == 5 ? Color.BluePrimary : Color.VioletPrimary), flex: 1, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,.3)'}}>
                                    <Text style={{ fontFamily: Font.PTSansBold, fontSize: Global.normalizeFontSize(15), color: 'white' }}>5</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={.7}
                                    onPress={() => {
                                        AnalyticsService.trackEvent('config_room_players', {
                                            players: 6
                                        });

                                        let room = { ...this.state.room }
                                        room.players = 6;
                                        this.setState({ room })
                                    }}
                                    style={{backgroundColor: (this.state.room.players == 6 ? Color.BluePrimary : Color.VioletPrimary), flex: 1, justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 10, borderBottomRightRadius: 10}}>
                                    <Text style={{ fontFamily: Font.PTSansBold, fontSize: Global.normalizeFontSize(15), color: 'white' }}>6</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Divider style={{ backgroundColor: '#ededed' }} />

                        <View style={{ width: '100%' , marginVertical: 10, height: 'auto' }}>
                            <Text style={GeneralStyle.header}>Duración de ronda</Text>
                            <View style={{ flexDirection: 'row', height: 50, width: '100%' }}>
                                <TouchableOpacity
                                    activeOpacity={.7}
                                    onPress={() => {
                                        AnalyticsService.trackEvent('config_room_duration', {
                                            duration: 60
                                        });

                                        let room = { ...this.state.room }
                                        room.duration = 60;
                                        this.setState({ room })
                                    }}
                                    style={{backgroundColor: (this.state.room.duration == 60 ? Color.BluePrimary : Color.VioletPrimary), flex: 1, justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 10, borderBottomLeftRadius: 10, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,.3)' }}>
                                    <Text style={{ fontFamily: Font.PTSansBold, fontSize: Global.normalizeFontSize(15), color: 'white' }}>60s</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={.7}
                                    onPress={() => {
                                        let room = { ...this.state.room }
                                        room.duration = 90;
                                        this.setState({ room })
                                    }}
                                    style={{backgroundColor: (this.state.room.duration == 90 ? Color.BluePrimary : Color.VioletPrimary), flex: 1, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,.3)'}}>
                                    <Text style={{ fontFamily: Font.PTSansBold, fontSize: Global.normalizeFontSize(15), color: 'white' }}>90s</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={.7}
                                    onPress={() => {
                                        let room = { ...this.state.room }
                                        room.duration = 120;
                                        this.setState({ room })
                                    }}
                                    style={{backgroundColor: (this.state.room.duration == 120 ? Color.BluePrimary : Color.VioletPrimary), flex: 1, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,.3)'}}>
                                    <Text style={{ fontFamily: Font.PTSansBold, fontSize: Global.normalizeFontSize(15), color: 'white' }}>120s</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={.7}
                                    onPress={() => {
                                        let room = { ...this.state.room }
                                        room.duration = 160;
                                        this.setState({ room })
                                    }}
                                    style={{backgroundColor: (this.state.room.duration == 160 ? Color.BluePrimary : Color.VioletPrimary), flex: 1, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,.3)', borderTopRightRadius: 10, borderBottomRightRadius: 10}}>
                                    <Text style={{ fontFamily: Font.PTSansBold, fontSize: Global.normalizeFontSize(15), color: 'white' }}>160s</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Divider style={{ backgroundColor: '#ededed' }} />

                        <Button
                            loading={this.state.isCreatingRoom}
                            onPress={this.createRoom.bind(this)}
                            containerViewStyle={{ width: '100%', marginLeft: 0, flex: 1, marginVertical: 10 }}
                            buttonStyle={styles.buttonUpdate}
                            icon={(this.state.isCreatingRoom ? null : {name: 'thumbs-up', type: 'font-awesome'})}
                            textStyle={{fontFamily: Font.PTSansBold}}
                            title='Crear Sala' />
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    overlayChildren: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 20,
        elevation: 6,
    },
    loadingContainer : {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    formContainer: {
        alignSelf: 'center',
        width: '90%',
        maxWidth: '90%',
        flex: 1
    },
    inputContainer: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    formInput: {
        fontFamily: Font.PTSansBold,
        fontSize: Global.normalizeFontSize(17),
        height: 40,
        flex: 1
    },
    formIcon: {
        marginRight: 10
    },
    buttonUpdate: {
        minWidth: '100%',
        width: '100%',
        borderRadius: 10,
        backgroundColor: Color.VioletPrimary,
        height: 50
    }
});