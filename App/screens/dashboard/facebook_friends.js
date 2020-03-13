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

import Moment from 'moment';

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

        this.commonDialog = null;

        AnalyticsService.trackScreenView('facebook_friends');

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) {

    }

    componentWillMount() {

    }

    componentWillUnmount() {

    }

    componentDidMount() {
        this.refs.spinner.show();
        AuthService.getFriends({}, (friends) => {
            this.setState({ friends : friends })
            this.refs.spinner.hide();
        }, (err) => {
            //Do nothing
            this.refs.spinner.hide();
        });
    }

    renderNavbar() {
        return (
            <CustomNavbar
                ref={(e) => { this.customNavbar = e; }}
                onNavigatorEvent={this.onNavigatorEvent.bind(this)}
                navigator={this.props.navigator}
                backButton={false}
                gradientColors={['#ED6552', '#ed5e26']}
                customCenterView={() => {
                    return (
                        <TouchableOpacity
                            activeOpacity={1}
                            style={{flex: 1, flexDirection: 'row', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%'}}>
                            <Text style={[GeneralStyle.customNavbarTitle]}>
                                AMIGOS
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
        return (
            <View style={{ width: '98%', alignSelf: 'center', marginVertical: 5, height: 100, padding: 10, backgroundColor: (friend.isOnline ? Color.GreenPrimary : Color.BluePrimary), borderRadius: 5, shadowColor: 'rgba(255,255,255,.5)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 1, elevation : 3, justifyContent: 'center', alignItems: 'center' }}>
                <View key={'friend' + friend.id} style={{ width: '100%', marginHorizontal: 5, alignItems: 'center', alignSelf: 'center', flexDirection: 'row'}}>
                    <Image style={{ flex: 0, marginLeft: 0, width: 50, height: 50, minWidth: 50, minHeight: 50, borderRadius: 25, resizeMode: 'contain' }} source={{ uri : friend.character }} />
                    <View style={{ flex: 1, flexDirection: 'column', paddingLeft: 20 }}>
                        <Text style={{ fontFamily: Font.TitanOne, fontSize: 17, color: 'white' }}>{ friend.username }</Text>
                        <Text style={{ fontFamily: Font.PTSansBold, fontSize: 14, color: 'white' }}>{ friend.profile.name } { friend.profile.lastName }</Text>
                        <Text style={{ fontFamily: Font.PTSansBold, fontSize: 14, color: 'white' }}>#{ friend.rank } en el ranking</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ flex: 1, textAlign: 'center', fontFamily: Font.PTSansRegular, fontSize: 13, color: 'white' }}>{ friend.isOnline ? 'Conectado' : 'Desconectado' }</Text>
                        <TouchableOpacity
                            onPress={() => {
                                this.refs.spinner.show();
                                AuthService.getUserStatus(friend.id, (data) => {
                                    this.refs.spinner.hide(() => {
                                        if(data.isPlaying) {
                                            this.commonDialog.show('error', '¡Tu amigo se encuentra jugando en este momento! Espera que termine e intenta nuevamente.');
                                        } else {
                                            this.props.challengeFriend(friend);
                                        }
                                    });
                                }, (err) => {
                                    this.refs.spinner.show();
                                });
                            }}
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: Color.GoldenPrimary, padding: 5, borderRadius: 5, shadowColor: 'rgba(255,255,255,.5)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 1, elevation : 3 }}>
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
