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
    TouchableWithoutFeedback
} from 'react-native';

//Localization
import { strings } from '../../components/localization/strings';

//Services
import { RoomService } from '../../services/Services'

//Plugins
import Overlay from 'react-native-modal-overlay';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Divider, Button, CheckBox } from 'react-native-elements';
import { LoginStyle } from '../../styles/login';
import { CachedImage } from 'react-native-cached-image';
import { Input } from 'react-native-elements';

//Styles
import { Color, Font } from '../../styles/default';
import { GeneralStyle } from '../../styles/general';
import { Global } from '../../components/common/global';

// Store width in variable
var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height;

const MODES = {
    JoinRoomByCode: 1,
    ProtectedPassword: 2
}

export default class JoinToRoom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            height: height,
            width: width,
            isLandscape: false,
            isCheckingPassword: false,
            password: null,
            roomCode: null,
            mode: -1
        };

        this.onJoinRoom = this.onJoinRoom.bind(this);
        this.onResetUI = this.onResetUI.bind(this);
    }

    onResetUI() {
        this.setState({ mode : -1 , password: null, roomCode : null, isCheckingPassword : false })
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.room != null) {
            this.setState({ room : nextProps.room })
        }
        if(nextProps.mode != null) {
            this.setState({ mode : nextProps.mode })
        }
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

    onJoinRoom() {

        //Check room code
        if(this.state.mode == MODES.JoinRoomByCode) {
            this.setState({ isCheckingPassword : true })
            RoomService.getByCode(this.state.roomCode, (data) => {
                this.setState({ isCheckingPassword : false });
                if(data && data.length == 1) {
                    const room = data[0];
                    if(room.isProtected) {
                        this.setState({ room : room, mode: MODES.ProtectedPassword });
                    } else {
                        var joinData = {
                            roomId: room.id
                        };
                        RoomService.join(joinData, (success) => {
                            this.setState({ isCheckingPassword : false })

                            if(this.props.onClose && this.props.onJoin){
                                setTimeout(() => {
                                    this.props.onJoin(room);
                                    this.props.onClose();
                                })
                            }
                        }, (err) => {
                            this.setState({ isCheckingPassword : false })
                            alert(err.message);
                        });
                    }
                }
            }, (err) => {
                this.setState({ isCheckingPassword : false });
            })
        } else {
            this.setState({ isCheckingPassword : true })

            var joinData = {
                roomId: this.state.room.id,
                password: this.state.password
            };
            RoomService.join(joinData, (success) => {
                this.setState({ isCheckingPassword : false })

                if(this.props.onClose && this.props.onJoin){
                    setTimeout(() => {
                        if(this.state.room != null)
                            this.props.onJoin(this.state.room);
                        else
                            this.props.onJoin(this.state.room);

                        this.props.onClose();
                    })
                }
            }, (err) => {
                this.setState({ isCheckingPassword : false })
                alert(err.message);
            });
        }
    }

    render() {
        let isVisible = this.props.isVisible && this.state.mode > -1;
        if(!isVisible)
            return null;

        if(this.state.mode == 1) {
            return this.renderJoinToRoom();
        } else if(this.state.mode == 2) {
            return this.renderProtectedPassword();
        }
    }

    renderJoinToRoom() {
        return (
            <View
                onLayout={this.onLayout.bind(this)}>
                <Overlay visible={this.props.isVisible}
                    closeOnTouchOutside
                    animationType={'slideInDown'}
                    animationOutType={'none'}
                    animationDuration={300}
                    onClose={() => {

                        //Reset UI
                        this.onResetUI();
                        setTimeout(() => {
                            this.props.onClose()
                        }, 200);
                    }}
                    containerStyle={{backgroundColor: 'rgba(140, 140, 140, 0.8)', flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center'}}
                    childrenWrapperStyle={[styles.overlayChildren, {overflow: 'hidden', paddingTop: 0, marginTop: 0, backgroundColor: "#fff", paddingHorizontal: 0, borderRadius: 10, width: (this.state.isLandscape ? '80%' : '100%'), maxHeight: 300 }]} >

                    <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={styles.formContainer}>
                            <Text style={GeneralStyle.header}>UNIRSE A UNA SALA</Text>
                            <Image
                                style={{ maxWidth: 70, resizeMode: 'contain', alignSelf: 'center' }}
                                source={require('../../images/wordeo/room_placeholders/1.png')} />

                            <View style={[styles.inputContainer, { marginLeft: 3 }]}>
                                <TextInput
                                    placeholder={'Ingrese el código de la sala'}
                                    style={styles.formInput}
                                    onChangeText={(text) => {
                                        this.setState({ roomCode : text })
                                    }}
                                    value={this.state.roomCode}
                                />
                            </View>

                            <Divider style={{ backgroundColor: '#ededed' }} />

                            <Button
                                loading={this.state.isCheckingPassword}
                                onPress={() => {
                                    this.onJoinRoom();
                                }}
                                containerViewStyle={{ width: '100%', marginLeft: 0, flex: 1, marginVertical: 10 }}
                                buttonStyle={styles.buttonUpdate}
                                textStyle={styles.buttonUpdateText}
                                title='UNIRSE' />
                        </View>
                    </View>

                </Overlay>
            </View>
        );
    }

    renderProtectedPassword() {
        const room = this.state.room;

        return (
            <View
                onLayout={this.onLayout.bind(this)}>
                <Overlay visible={this.props.isVisible}
                    closeOnTouchOutside
                    animationType={'slideInDown'}
                    animationOutType={'none'}
                    animationDuration={300}
                    onClose={() => {

                        //Reset vars
                        this.onResetUI();
                        setTimeout(() => {
                            this.props.onClose()
                        }, 200);
                    }}
                    containerStyle={{backgroundColor: 'rgba(140, 140, 140, 0.8)', flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center'}}
                    childrenWrapperStyle={[styles.overlayChildren, {overflow: 'hidden', paddingTop: 0, marginTop: 0, backgroundColor: "#fff", paddingHorizontal: 0, borderRadius: 10, width: (this.state.isLandscape ? '80%' : '100%'), maxHeight: 350 }]} >

                    <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={styles.formContainer}>
                            <Text style={GeneralStyle.header}>SALA PROTEGIDA</Text>
                            <Image
                                style={{ maxWidth: 70, resizeMode: 'contain', alignSelf: 'center' }}
                                source={require('../../images/wordeo/room_placeholders/2.png')} />
                            <View style={styles.inputContainer}>
                                <Icon style={styles.formIcon} name="user-circle" size={20} color="#0088ff" />
                                <TextInput
                                    editable={false}
                                    placeholder={'Nombre de la sala'}
                                    style={styles.formInput}
                                    value={room.name}
                                />
                            </View>

                            <Divider style={{ backgroundColor: '#ededed' }} />

                            <View style={[styles.inputContainer, { marginLeft: 3 }]}>
                                <Icon style={styles.formIcon} name="unlock" size={20} color="#0088ff" />
                                <TextInput
                                    placeholder={'Contraseña'}
                                    style={styles.formInput}
                                    onChangeText={(text) => {
                                        this.setState({ password : text })
                                    }}
                                    value={this.state.password}
                                />
                            </View>

                            <Divider style={{ backgroundColor: '#ededed' }} />

                            <Button
                                loading={this.state.isCheckingPassword}
                                onPress={() => {
                                    this.onJoinRoom();
                                }}
                                containerViewStyle={{ width: '100%', marginLeft: 0, flex: 1, marginVertical: 10 }}
                                buttonStyle={styles.buttonUpdate}
                                icon={(this.state.isCheckingPassword ? null : {name: 'sign-in', type: 'font-awesome'})}
                                title='UNIRSE' />
                        </View>
                    </View>

                </Overlay>
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
        height: 40,
        fontSize: Global.normalizeFontSize(17),
        flex: 1
    },
    formIcon: {
        marginRight: 10
    },
    buttonUpdate: {
        minWidth: '100%',
        width: '100%',
        borderRadius: 10,
        backgroundColor: Color.GoldenPrimary,
        height: 50
    },
    buttonUpdateText: {
        fontFamily: Font.TitanOne,
        fontSize: Global.normalizeFontSize(17),
        color: 'white'
    }
});