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
    FlatList,
    ActivityIndicator,
    ImageBackground,
    Animated
} from 'react-native';

import moment from 'moment-with-locales-es6';
moment.locale('es');

//Localization
import { strings } from '../../components/localization/strings';

//Components
import TutorialOverlay from '../../components/componentsJs/TutorialOverlay'
import CustomNavbar from '../../components/navigation/CustomNavbar';
import CustomMenu from '../../components/navigation/CustomMenu'
import SpinnerComponent from '../../components/SpinnerComponent';
import CommonDialog from '../../components/dialogs/CommonDialog';
import InviteFriend from '../../components/modals/InviteFriend'

//Plugins
import { Navigation } from 'react-native-navigation';
import { Global } from '../../components/common/global';
import { GeneralStyle } from '../../styles/general';
import { Color, Font } from '../../styles/default';
import * as Animatable from 'react-native-animatable';
import Interactable from 'react-native-interactable';
import { ActionSheetCustom as ActionSheet } from 'react-native-actionsheet'
import Orientation from 'react-native-orientation';

//Services
import { AuthService, QuestionService, SocketService, AnalyticsService, PreferencesService } from '../../services/Services';

var {height, width} = Dimensions.get('window');
var _ = require('lodash');

export default class FacebookFriends extends Component {
    constructor(props) {
        super(props);
        this.state = {
            friends: []
        }

        this.getPeople = this.getPeople.bind(this);
        this.commonDialog = null;

        AnalyticsService.trackScreenView('community');

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) {

    }

    componentWillMount() {

    }

    componentWillUnmount() {

    }

    componentDidMount() {
        this.getPeople();
    }

    getPeople() {
        this.refs.spinner.show();
        AuthService.getPeople({ onlines : true }, (people) => {
            this.setState({ friends : people })
            this.refs.spinner.hide();
        }, (err) => {
            //Do nothing
            this.refs.spinner.hide();
        })
    }

    shouldComponentUpdate(nextProps, nextState){
        var update = false;
        if(_.isEqual(nextState.friends, this.state.friends)) {
            update = true;
        }

        return update;
    }

    renderNavbar() {
        return (
            <CustomNavbar
                ref={(e) => { this.customNavbar = e; }}
                onNavigatorEvent={this.onNavigatorEvent.bind(this)}
                navigator={this.props.navigator}
                backButton={false}
                gradientColors={['#ED6552', '#ed5e26']}
                customLeftView={() => {
                    return (
                        <TouchableOpacity
                            onPress={() => {
                                this.getPeople()
                            }}
                            style={{flex: 1, flexDirection: 'row', alignSelf: 'center', justifyContent: 'flex-start', alignItems: 'center', width: '100%', height: '100%'}}>
                            <Text style={[GeneralStyle.customNavbarTitle, { fontFamily: Font.PTSansBold }]}>
                                Actualizar
                            </Text>
                        </TouchableOpacity>
                    );
                }}
                customCenterView={() => {
                    return (
                        <TouchableOpacity
                            activeOpacity={1}
                            style={{flex: 1, flexDirection: 'row', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%'}}>
                            <Text style={[GeneralStyle.customNavbarTitle]}>
                                ULTIMOS EN LÍNEA
                            </Text>
                        </TouchableOpacity>
                    );
                }}
                customRightView={() => {
                    return (
                        <TouchableOpacity
                            onPress={() => {
                                this.props.navigator.dismissModal();
                            }}
                            style={{flex: 1, flexDirection: 'row', alignSelf: 'center', justifyContent: 'flex-end', alignItems: 'center', width: '100%', height: '100%'}}>
                            <Text style={[GeneralStyle.customNavbarTitle, { fontFamily: Font.PTSansBold }]}>
                                Cerrar
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />
        );
    }

    shouldComponentUpdate(nextProps, nextState){
        var update = false;
        if(!_.isEqual(nextState.friends, this.state.friends))
            update = true;

        return update;
    }

    render() {

        return (
            <View
                style={styles.container}>

                <CommonDialog
                    ref={(e) => { this.commonDialog = e } } />

                <SpinnerComponent
                    ref={'spinner'} />

                { this.renderNavbar() }

                <View style={styles.container}>
                    { this.state.friends.length > 0 &&
                        <FlatList
                            centerContent={false}
                            snapToAlignment={'start'}
                            data={this.state.friends}
                            extraData={this.state.friends.length}
                            renderItem={(rowData) => {
                                return this.renderFriend(rowData);
                            }}
                        />
                    }

                    { this.state.friends.length == 0 &&
                        <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                            <Text style={{ fontFamily: Font.TitanOne, fontSize: 30, color: '#f43f00', textAlign: 'center', marginBottom: 5 }}>UPS,</Text>
                            <Text style={{ fontFamily: Font.TitanOne, fontSize: 20, color: '#ff652f', textAlign: 'center' }}>¡Aún no tienes amigos de Facebook que jueguen Wordeo!</Text>
                        </View>
                    }
                </View>
            </View>
        );
    }

    renderFriend(rowData) {
        const friend = rowData.item;
        let status = friend.isOnline ? 'Conectado' : 'Desconectado';
        /* if(friend.isOnline && friend.status && friend.status.isPlaying) {
            status = 'Jugando';
        } */

        return (
            <View style={{ width: '98%', alignSelf: 'center', marginVertical: 5, height: 100, padding: 10, backgroundColor: (friend.isOnline ? Color.GreenPrimary : Color.BluePrimary), borderRadius: 5, shadowColor: 'rgba(255,255,255,.5)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 1, elevation : 3, justifyContent: 'center', alignItems: 'center' }}>
                <View key={'friend' + friend.id} style={{ width: '100%', height: '100%', marginHorizontal: 5, alignItems: 'center', alignSelf: 'center', flexDirection: 'row'}}>
                    { friend.character != null &&
                        <Image style={{ flex: 0, marginLeft: 0, width: 50, height: 50, minWidth: 50, minHeight: 50, borderRadius: 25, resizeMode: 'contain' }} source={{ uri : friend.character }} />
                    }
                    <View style={{ flex: 1.5, flexDirection: 'column', paddingLeft: 20 }}>
                        <Text style={{ fontFamily: Font.TitanOne, fontSize: 17, color: 'white' }}>{ friend.username }</Text>
                        { !friend.isOnline &&
                            <Text style={{ fontFamily: Font.TitanOne, fontSize: 12, color: 'white' }}>{ moment(friend.lastReplyTime).fromNow() }</Text>
                        }
                    </View>
                    <View style={{ flex: 1, height: '100%' }}>
                        <Text adjustsFontSizeToFit style={{ flex: 1, textAlign: 'center', fontFamily: Font.PTSansRegular, fontSize: 13, color: 'white' }}>{ status }</Text>
                        { /* <Text style={{ flex: 1, textAlign: 'center', fontFamily: Font.PTSansRegular, fontSize: 10, color: 'white' }}>{ friend.status && friend.status.isPlaying ? friend.status.statusRoundString : '' }</Text> */ }

                        <TouchableOpacity
                            onPress={() => {
                                AuthService.getUserStatus(friend.id, (status) => {
                                    if(!status.isPlaying) {
                                        if(this.props.onCreateChallenge) {
                                            this.props.onCreateChallenge(friend);
                                        }
                                    } else {
                                        this.commonDialog.show('error', 'El usuario está jugando en este momento. Espera unos segundos a que termine la ronda para desafiarlo.');
                                    }
                                }, (err) => {

                                });
                            }}
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: Color.GoldenPrimary, padding: 5, borderRadius: 5, shadowColor: 'rgba(255,255,255,.5)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 1, elevation : 3, marginTop: 5 }}>
                            <Text style={{ fontFamily: Font.TitanOne, color: 'white', textAlign: 'center' }}>¡DESAFIAR!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    loadingPairingText: {
        marginTop: 20,
        backgroundColor: 'transparent',
        width: '80%',
        textAlign: 'center',
        alignSelf: 'center',
        color: 'white',
        fontFamily: Font.TitanOne,
        fontSize: Global.normalizeFontSize(24)
    },
    bubble: {
        flex: 1,
        width: '90%',
        height: 140,
        maxHeight: (height / 3),
        alignSelf: 'center',
        justifyContent: 'center'
    },
    bubbleContainer: {
        width: '100%',
        alignItems: 'center',
        flex: 1
    },
    actions: {
        width: '100%',
        position: 'absolute',
        bottom: -60,

    },
    actionButton: {
        position: 'absolute',
        bottom: 0,
        width: '95%',
        height: 40,
        marginBottom: 10,
        alignSelf: 'center',
        padding: 10,
        backgroundColor: Color.BluePrimary,
        borderRadius: 5
    },
    actionText: {
        position: 'absolute',
        backgroundColor: 'transparent',
        bottom: 10,
        padding: 5,
        alignSelf: 'center',
        textAlign: 'center',
        color: 'white',
        fontSize: Global.normalizeFontSize(13),
        fontFamily: Font.TitanOne
    }
});
