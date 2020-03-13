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
    Animated,
    ActivityIndicator
} from 'react-native';

//Localization
import { strings } from '../../components/localization/strings';

//Components
import SpinnerComponent from '../../components/SpinnerComponent';
import CommonDialog from '../../components/dialogs/CommonDialog';

//Services
import { RoomService } from '../../services/Services'

//Plugins
import Overlay from 'react-native-modal-overlay';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Divider, Button, CheckBox } from 'react-native-elements';
import { LoginStyle } from '../../styles/login';
import { Input } from 'react-native-elements';

//Styles
import { Color, Font } from '../../styles/default';
import { GeneralStyle } from '../../styles/general';
import { Global } from '../../components/common/global';

// Store width in variable
var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height;

export default class InviteFriendEmail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            height: height,
            width: width,
            isLandscape: false,
            isInvitingFriend: false,
            email: '',
            inviteList: [],
            heightScrollView: 0,
            isLoadingUsers: false
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

    componentWillReceiveProps(nextProps) {
        if(nextProps.isVisible == true) {
            setTimeout(() => {
                if(this.refs.username)
                    this.refs.username.focus();
            }, 500);
        }
    }

    onInvite() {
        if(this.refs.spinner){
            this.refs.spinner.show();
        }
        RoomService.invite({
            email: this.state.email,
            roomId: this.props.round.id
        }, (data) => {
            if(this.refs.commonDialog) {
                if(this.refs.spinner) {
                    this.refs.spinner.hide(() => {
                        let message = 'Tu invitacion se ha enviado a ' + this.state.email;
                        if(data.message) {
                            message = data.message;
                        }
                        this.refs.commonDialog.show('success', message, () => {
                            setTimeout(() => {
                                this.setState({ email : '' });
                                this.props.onClose()
                            }, 500);
                        });
                    });
                }
            }
        }, (error) => {
            if(this.refs.spinner) {
                this.refs.spinner.hide(() => {
                    if(this.refs.commonDialog){
                        this.refs.commonDialog.show('error', error.response.data.error.message, () => {

                        });
                    }
                })
            }
        })
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
                    childrenWrapperStyle={[styles.overlayChildren, {overflow: 'hidden', paddingTop: 0, marginTop: 0, backgroundColor: "#fff", paddingHorizontal: 0, borderRadius: 10, width: (this.state.isLandscape ? '80%' : '100%'), maxHeight: 300 }]} >

                    <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>

                        <CommonDialog
                            ref={'commonDialog'} />

                        <SpinnerComponent
                            ref={'spinner'} />

                        <View style={styles.formContainer}>
                            <Text style={[GeneralStyle.header, { flex : 0 }]}>INVITAR A UN AMIGO</Text>
                            <View style={{ flex: 1 }}>
                                <Image
                                    style={{ maxWidth: 70, maxHeight: 70, resizeMode: 'contain', alignSelf: 'center' }}
                                    source={require('../../images/wordeo/round/monster.png')} />
                            </View>

                            <View style={styles.bottomContainer}>
                                <Text style={{ textAlign: 'center', fontFamily: Font.PTSansBold, color: '#222', fontSize: Global.normalizeFontSize(16) }}>Escribe el nombre de usuario de tu amigo</Text>
                                <TextInput
                                    ref={'username'}
                                    placeholder={''}
                                    style={styles.formInput}
                                    onChangeText={(text) => {
                                        this.setState({ email : text })
                                        if(text.length >= 2) {
                                            this.setState({ isLoadingUsers : true })
                                            RoomService.getUsersBy({ pattern : text }, (users) => {
                                                let toValue = 75 * users.length;
                                                if(users.length > 2)
                                                    toValue = 180;
                                                this.setState({ heightScrollView: toValue, inviteList : users, isLoadingUsers: false });
                                            }, (err) => {});
                                        } else if(text.length < 2){
                                            this.setState({ inviteList : [], isLoadingUsers: false, heightScrollView: 0 })
                                        }
                                    }}
                                    value={this.state.email}
                                />
                                <Divider style={{ backgroundColor: '#ededed' }} />

                                <Button
                                    loading={this.state.isInvitingFriend}
                                    onPress={this.onInvite.bind(this)}
                                    containerViewStyle={{ width: '100%', flex: 1, marginVertical: 10 }}
                                    buttonStyle={styles.buttonUpdate}
                                    textStyle={styles.buttonUpdateText}
                                    title='ENVIAR INVITACIÓN'
                                />
                            </View>
                        </View>

                        { this.renderAutocomplete() }

                    </View>

                </Overlay>
            </View>
        );
    }

    renderAutocomplete() {
        if(this.state.isLoadingUsers){
            return (
                <View style={{ position: 'absolute', top: 0, left: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222', width: '100%', height: 50 }}>
                    <ActivityIndicator color={'white'} />
                </View>
            );
        } else {
            if(this.state.email.length < 2)
                return null;

            if(!this.state.isLoadingUsers && this.state.email.length > 2 && (this.state.inviteList == null || this.state.inviteList.length == 0)) {
                return (
                    <View style={{ position: 'absolute', top: 0, left: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222', width: '100%', height: 50 }}>
                        <Text style={{ fontSize: 18, textAlign: 'center', color: 'white', fontFamily: Font.TitanOne}}>No hay resultados</Text>
                    </View>
                );
            }

            return (
                <ScrollView
                    keyboardShouldPersistTaps={'always'}
                    contentContainerStyle={autocomplete.containerStyle}
                    style={[autocomplete.container, { height : this.state.heightScrollView }]}>
                    { this.state.inviteList.map((e) => {
                        const user = e;
                        return (
                            <View
                                onStartShouldSetResponder={() => true}
                                style={autocomplete.itemWrapper}>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({ email : user.username, inviteList: [] });

                                        setTimeout(() => {
                                            this.onInvite();
                                        });
                                    }}
                                    style={autocomplete.itemButton}>
                                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        <View style={{ width: 10, height: 10, backgroundColor: (user.isOnline ? Color.GreenPrimary : 'red'), borderRadius: 5, marginRight: 5 }}></View>
                                        <Text style={[autocomplete.itemText, {fontSize: Global.normalizeFontSize(17), color: Color.OrangePrimary, fontFamily: Font.TitanOne}]}>{e.username}</Text>
                                    </View>
                                    <Text style={[autocomplete.itemText, { fontFamily: Font.PTSansRegular }]}>{e.name} {e.lastName} (#{e.rank} en ranking)</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </ScrollView>
            );
        }
    }
}

const autocomplete = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 2,
        left: '1%',
        right: 0,
        flex: 0,
        width: '98%',
        paddingVertical: 10,
        backgroundColor: Color.BluePrimary,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: Color.BlueSecondary
    },
    containerStyle: {
        paddingBottom: 30
    },
    itemWrapper: {
        position: 'relative',
        borderRadius: 10,
        width: '95%',
        maxWidth: '95%',
        alignSelf: 'center',
        flex: 1,
        backgroundColor: 'blue',
        marginVertical: 5,
        borderWidth: 1,
        borderColor: 'white',
        paddingVertical: 5,
        backgroundColor: 'white'
    },
    itemButton: {
        flex: 1,
        flexDirection: 'column',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    itemText: {
        fontFamily: Font.PTSansBold,
        textAlign: 'center',
    }

});

const styles = StyleSheet.create({
    overlayChildren: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 20,
        elevation: 6,
        paddingBottom: 0
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bottomContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        paddingBottom: 10
    },
    inputContainer: {
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    formInput: {
        fontFamily: Font.PTSansBold,
        width: '100%',
        fontSize: Global.normalizeFontSize(17),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,.03)'
    },
    formIcon: {
        marginRight: 10
    },
    buttonUpdate: {
        flex: 0,
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