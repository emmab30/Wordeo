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
    Animated,
    FlatList,
    AppState
} from 'react-native';

//Localization
import { strings } from '../../components/localization/strings';

//Components
import FinishedRound from '../../components/modals/celebration/FinishedRound'
import { Global } from '../../components/common/global';
import CustomNavbar from '../../components/navigation/CustomNavbar';
import CustomMenu from '../../components/navigation/CustomMenu'
import Room from '../../components/componentsJs/Room';
import NotificationList from '../../components/componentsJs/NotificationList'
import NewRoomWizard from '../../components/modals/NewRoomWizard';
import JoinToRoom from '../../components/modals/JoinToRoom';
import RewardCelebration from '../../components/modals/celebration/RewardCelebration'
import NewsModal from '../../components/modals/celebration/NewsModal'

//Services
import { AuthService, ConfigurationService, RoomService, SocketService, AnalyticsService, PreferencesService, NotificationService, RewardService, NewsService } from '../../services/Services';

//Plugins
import SpinnerComponent from '../../components/SpinnerComponent';
import CommonDialog from '../../components/dialogs/CommonDialog';
import ConfirmationDialog from '../../components/dialogs/ConfirmationDialog';
import { Navigation } from 'react-native-navigation';
import Orientation from 'react-native-orientation';
import OneSignal from 'react-native-onesignal';

//Styles
import { GeneralStyle } from '../../styles/general';
import { Color, Font } from '../../styles/default';

var {height, width} = Dimensions.get('window');
var _ = require('lodash');

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rooms: [],
            isNewRoomWizard: false,
            spinner: true,
            usersStatistics: {
                online: 0
            },
            isPullingRooms: false,
            isJoiningRoom: false,
            notifications: [],
            friends: []
        }

        rootNavigator = this.props.navigator;

        this.onJoinToRoom = this.onJoinToRoom.bind(this);
        this.onJoinRoomSuccess = this.onJoinRoomSuccess.bind(this);
        this.onCheckPendingNotifications = this.onCheckPendingNotifications.bind(this);
        //this.onCheckFacebookFriends = this.onCheckFacebookFriends.bind(this);
        this.pullRooms = this.pullRooms.bind(this);
        this.customNavbar = null;
        this._deltaY = new Animated.Value(0);
        this.mainInterval = null;

        AnalyticsService.trackScreenView('home');
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        if(event.id == 'didAppear') {
            OneSignal.clearOneSignalNotifications();
            NewsService.getNews((data) => {
                setTimeout(() => {
                    if(data && data.length > 0) {
                        this.refs.newsModal.show(data)
                    }
                }, 3000);
            }, (err) => {});

            RewardService.getMyRewards((data) => {
                if(data && data.length > 0) {
                    let reward = data[0];
                    this.refs.rewardCelebration.show(reward.title, reward.text);
                }
            }, (err) => {
                //console.log(err);
            });
        }
    }

    componentWillMount() {
        Orientation.lockToPortrait();
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.onChangeAppState);

        OneSignal.removeEventListener('opened', this.onOpenedNotification);
        OneSignal.removeEventListener('received', this.onReceivedNotification);

        //Clear main interval
        if(this.mainInterval){
            clearInterval(this.mainInterval);
        }

        SocketService.removeListener('onRoomsUpdated', this.onRoomsUpdated);
    }

    componentDidMount() {
        this.setState({ spinner : false });

        this.pullRooms(true);
        this.pullRate();
        this.pullUsersOnline();
        this.onCheckPendingNotifications();
        this.mainInterval = setInterval(() => {
            this.pullRooms();
            this.pullRate();
            this.pullUsersOnline();
            this.onCheckPendingNotifications();
            //this.onCheckFacebookFriends();
        }, 15000);

        //Subscribe listeners for websockets
        /* PreferencesService.loadPreferences((values) => {
            if(values.showTutorial) {
                setTimeout(() => {
                    let demo = Global.Screen.Demo;
                    this.props.navigator.showModal(demo);
                }, 1200);
                PreferencesService.setPreferenceByKey('showTutorial', false);
            }
        }); */

        SocketService.initialize(() => {
            this.onCheckPendingNotifications();

            SocketService.on('onRoomsUpdated', this.onRoomsUpdated.bind(this));
        });

        AppState.addEventListener('change', this.onChangeAppState.bind(this));

        OneSignal.addEventListener('opened', this.onOpenedNotification.bind(this));
        OneSignal.addEventListener('received', this.onReceivedNotification.bind(this));
    }

    onReceivedNotification(data) {
        this.onCheckPendingNotifications();
    }

    onOpenedNotification(data) {
        this.onCheckPendingNotifications();
    }

    onCheckPendingNotifications(callback) {
        NotificationService.getNotifications((notifications) => {
            this.setState({ notifications : notifications })
            this.forceUpdate();
            if(callback){
                callback()
            }
        }, (err) => {
            //Error getting notifications. Silence mode
        });
    }

    onCheckFacebookFriends() {
        AuthService.getFriends({}, (friends) => {
            this.setState({ friends : friends })
        }, (err) => {
            //Do nothing
        });
    }

    onJoinToRoom(roomId, isInvited = true, afterDismissPopup = false){
        setTimeout(() => {
            if(!afterDismissPopup && this.refs.notificationList){
                try {
                    this.refs.notificationList.showSpinner()
                } catch (e) {}
            } else if(this.refs.spinner) {
                try {
                    this.refs.spinner.show();
                } catch (e) {}
            }

            var joinReq = { roomId: roomId, isInvited : true };
            RoomService.join(joinReq, (room) => {

                AnalyticsService.trackEvent('room_join', {
                    afterInvite: true
                });

                if(!afterDismissPopup && this.refs.notificationList){
                    try {
                        this.refs.notificationList.hideSpinner(() => {
                            setTimeout(() => {
                                this.onJoinRoomSuccess(room);
                            }, 1500);
                        })
                    } catch (e) {}
                } else if(this.refs.spinner) {
                    try {
                        this.refs.spinner.hide(() => {
                            setTimeout(() => {
                                this.onJoinRoomSuccess(room);
                            }, 1500);
                        });
                    } catch (e) {}
                }
            }, (err) => {
                if(err.message) {
                    if(!afterDismissPopup){
                        try {
                            this.refs.notificationList.hideSpinner();
                        } catch(e) {}
                        try {
                            this.refs.notificationList.showMessage('error', err.message);
                        } catch(e) {}
                    } else {
                        try {
                            this.refs.spinner.hide();
                        } catch (e) {}
                        try {
                            this.commonDialog.show('error', err.message);
                        } catch (e) {}
                    }
                }
                //Do nothing
            });
        }, 500);
    }

    onChangeAppState(nextAppState) {
        if(nextAppState === 'active') {
            this.onCheckPendingNotifications();
        }
    }

    pullUsersOnline() {
        ConfigurationService.getUserStatistics((data) => {
            if(data.usersStatistics) {
                this.setState({ usersStatistics: data.usersStatistics })
            }
        }, (err) => {});
    }

    pullRate() {
        ConfigurationService.getTulsRate((data) => {
            if(data && data.value > 0) {
                this.setState({ tulsRate: parseFloat(data.value) })
                ConfigurationService.tulsRate = parseFloat(data.value);
            }
        }, (err) => {});
    }

    pullRooms(isFirstTime) {
        if(isFirstTime) {
            if(this.refs.spinner){
                this.refs.spinner.show();
            }
        }
        //Get rooms
        this.setState({ isPullingRooms : true });
        RoomService.get({}, (rooms) => {
            if(isFirstTime) {
                this.refs.spinner.hide();
            }
            this.setState({ rooms : rooms, isPullingRooms: false });
        }, (err) => {})
    }

    onRoomsUpdated(data) {
        this.pullRooms();
    }

    onJoinRoomSuccess(room) {
        this.setState({ spinner : true })
        var screen = Object.assign({}, Global.Screen.Dashboard.Round);
        screen.passProps = {
            round: room
        };
        this.props.navigator.showModal(screen);
        this.setState({ spinner : false })
    }

    renderNavbar() {
        return (
            <CustomNavbar
                ref={(e) => { this.customNavbar = e; }}
                navigator={this.props.navigator}
                onNavigatorEvent={this.onNavigatorEvent.bind(this)}
                backButton={false}
                gradientColors={[Color.OrangePrimary, Color.OrangeSecondary]}
                customLeftView={() => {
                    return (
                        <TouchableOpacity onPress={() => {
                            this.setState({ menuOpened : true });
                        }} style={{flex: 1, paddingLeft: 0, justifyContent: 'center', width: '100%', height: '100%' }}>
                            <Image
                                style={{alignSelf: 'flex-start', resizeMode: 'contain', height: 20}}
                                source={require('../../images/wordeo/navbar/hamburguer.png')} />
                        </TouchableOpacity>
                    );
                }}
                customCenterView={() => {
                    return (
                        <TouchableOpacity
                            style={{flex: 1, flexDirection: 'row', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%'}}>
                            <Text style={GeneralStyle.customNavbarTitle}>
                                { strings.Rooms.toUpperCase() }
                            </Text>
                        </TouchableOpacity>
                    );
                }}
                customRightView={() => {
                    let numbersOnline = this.state.usersStatistics.online;
                    if(numbersOnline > 1000) {
                        numbersOnline = numbersOnline.toString().substr(0,1) + 'k';
                    }
                    return (
                        <View style={{ flex: 1, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() => {
                                    this.customNavbar.showMessage('Hey! Esta es la cantidad de personas jugando Wordeo en este momento. Incluyéndote!', {
                                        backgroundColor: '#1aba5d',
                                        duration: 3500,
                                        animation: "bounceInDown",
                                        animationDuration: 500,
                                        onPress: () => {
                                            this.customNavbar.hide();
                                        }
                                    });
                                }}
                                style={{ flex: 1, backgroundColor: 'red', paddingLeft: 0, justifyContent: 'center', width: '100%', alignSelf: 'flex-end', height: '100%', backgroundColor: 'transparent', alignItems: 'center' }}>
                                <Text style={{ textAlign: 'center', color: 'white', fontSize: Global.normalizeFontSize(15), fontFamily: Font.TitanOne }}>
                                    { numbersOnline } jugadores
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    this.customNavbar.showMessage('Es el porcentaje de Tuls que ganarás por cada ronda con relacion a los puntos. Esto quiere decir que si en una ronda ganas 750 puntos de exp, ganarás ' + ((750 * this.state.tulsRate) / 100) + ' tuls.', {
                                        backgroundColor: '#1aba5d',
                                        duration: 10000,
                                        animation: "bounceInUp",
                                        animationDuration: 750,
                                        onPress: () => {
                                            this.customNavbar.hide();
                                        }
                                    });
                                }}
                                style={{ flex: 1, paddingLeft: 0, justifyContent: 'center', width: '100%', height: '100%', backgroundColor: 'transparent', alignItems: 'center' }}>
                                <Text style={{ textAlign: 'center', color: 'white', fontSize: Global.normalizeFontSize(15), fontFamily: Font.TitanOne }}>
                                    Rate { this.state.tulsRate }%
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                }}
            />
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        var update = false;

        if(!_.isEqual(this.state.rooms, nextState.rooms))
            update = true;
        if(!_.isEqual(this.state.notifications, nextState.notifications))
            update = true;
        if(!_.isEqual(this.state.friends, nextState.friends))
            update = true;
        if(this.state.menuOpened != nextState.menuOpened)
            update = true;
        if(this.state.isNewRoomWizard != nextState.isNewRoomWizard)
            update = true;
        if(this.state.isJoiningRoom != nextState.isJoiningRoom)
            update = true;
        if(this.state.selectedRoom != nextState.selectedRoom)
            update = true;

        return update;
    }

    renderCustomMenu(){
        return <CustomMenu
            isOpened={this.state.menuOpened}
            onClose={() => {
                this.setState({ menuOpened: false })
            }}
        />;
    }

    render() {
        return (
            <View style={styles.container}>

                <SpinnerComponent
                    ref={'spinner'} />

                <CommonDialog
                    ref={(e) => { this.commonDialog = e; } } />

                <ConfirmationDialog
                    ref={(e) => { this.confirmationDialog = e; } } />

                { this.renderNavbar() }
                { this.renderCustomMenu() }

                <FlatList
                    centerContent={false}
                    snapToAlignment={'start'}
                    data={this.state.rooms}
                    extraData={this.state.rooms.length}
                    ListHeaderComponent={() => {
                        return (
                            <View style={{ width: '100%' }}>
                                { false &&
                                    <View style={{ marginHorizontal: 5, height: 50, marginBottom: 5, marginTop: 5 }}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                AnalyticsService.trackEvent('invite_friend_btn');
                                                var screen = Object.assign({}, Global.Screen.Dashboard.FacebookFriends);
                                                screen.passProps = {
                                                    challengeFriend: (friend) => {
                                                        var room = {
                                                            name: ('Desafío a ' + friend.username),
                                                            isProtected: true,
                                                            password: friend.facebookId,
                                                            players: 2,
                                                            duration: 120,
                                                            challengeTo: friend.id,
                                                            isChallenging: true
                                                        };
                                                        if(this.refs.spinner) {
                                                            this.refs.spinner.show()
                                                        }
                                                        RoomService.create(room, (data) => {
                                                            AnalyticsService.trackEvent('on_challenge_friend');
                                                            this.refs.spinner.hide()

                                                            setTimeout(() => {
                                                                this.onJoinRoomSuccess(room);
                                                            });
                                                        }, (err) => {
                                                            this.refs.spinner.hide()
                                                            AnalyticsService.trackEvent('create_room_error', {
                                                                error: 'err_server'
                                                            });
                                                        });
                                                    }
                                                }
                                                this.props.navigator.showModal(screen);
                                            }}
                                            style={{ width: '100%', justifyContent: 'center', height: '100%', backgroundColor: Color.GreenPrimary, alignSelf: 'center', borderRadius: 5, shadowColor: 'rgba(255,255,255,.5)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 1 }}>
                                            <Text style={{ marginRight: 5, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(21), color: '#eee', textAlign: 'center', backgroundColor: 'transparent'}}>MIS AMIGOS ({this.state.friends.length})</Text>
                                        </TouchableOpacity>
                                    </View>
                                }

                                { true &&
                                    <View style={{ marginHorizontal: 5, height: 50, marginBottom: 5, marginTop: 5 }}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                AnalyticsService.trackEvent('community');
                                                var screen = Object.assign({}, Global.Screen.Dashboard.Community);
                                                screen.passProps = {
                                                    onCreateChallenge: (user) => {
                                                        var room = {
                                                            name: '¡Duelo!',
                                                            isProtected: true,
                                                            password: user.id,
                                                            players: 2,
                                                            duration: 120,
                                                            challengeTo: user.id,
                                                            isChallenging: true
                                                        };
                                                        if(this.refs.spinner) {
                                                            this.refs.spinner.show()
                                                        }
                                                        RoomService.create(room, (data) => {
                                                            AnalyticsService.trackEvent('on_create_challenge');
                                                            this.refs.spinner.hide()

                                                            var joinReq = { roomId: data.id, isInvited : true };
                                                            RoomService.join(joinReq, (success) => {
                                                                setTimeout(() => {
                                                                    this.onJoinRoomSuccess(data);
                                                                });
                                                            }, (err) => {
                                                                if(err.message){
                                                                    this.commonDialog.show('error', err.message);
                                                                }
                                                            });
                                                        }, (err) => {
                                                            this.refs.spinner.hide()
                                                            AnalyticsService.trackEvent('create_room_error', {
                                                                error: 'err_server'
                                                            });
                                                        });
                                                    }
                                                }
                                                this.props.navigator.showModal(screen);
                                            }}
                                            style={{ width: '100%', justifyContent: 'center', height: '100%', backgroundColor: Color.GreenPrimary, alignSelf: 'center', borderRadius: 5, shadowColor: 'rgba(255,255,255,.5)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 1 }}>
                                            <Text style={{ marginRight: 5, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(21), color: '#eee', textAlign: 'center', backgroundColor: 'transparent'}}>+ ACTIVOS</Text>
                                        </TouchableOpacity>
                                    </View>
                                }

                                <View style={{ height: 50, marginBottom: 5, marginTop: 5, backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'space-around' }}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            AnalyticsService.trackEvent('create_room_cta');
                                            this.setState({ isNewRoomWizard : true })
                                        }}
                                        style={{ flex: 1, padding: 5, marginHorizontal: 5, paddingLeft: 0, justifyContent: 'center', height: '100%', backgroundColor: Color.BluePrimary, alignSelf: 'center', borderRadius: 5, shadowColor: 'rgba(255,255,255,.5)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 1 }}>
                                        <Text style={{ marginRight: 5, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(21), color: '#eee', textAlign: 'center', backgroundColor: 'transparent'}}>CREAR SALA</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => {
                                            AnalyticsService.trackEvent('join_room_cta');
                                            this.setState({ isJoiningRoom : true })
                                        }}
                                        style={{ flex: 1, padding: 5, marginHorizontal: 5, justifyContent: 'center', height: '100%', backgroundColor: Color.BluePrimary, alignSelf: 'center', borderRadius: 5, shadowColor: 'rgba(255,255,255,.5)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 1 }}>
                                        <Text style={{ marginRight: 5, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(21), color: '#eee', textAlign: 'center', backgroundColor: 'transparent'}}>UNIRSE A UNA SALA</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    }}
                    renderItem={(rowData) => {
                        return this.renderRoom(rowData.item);
                    }}
                />

                <NewRoomWizard
                    onClose={() => {
                        this.setState({ isNewRoomWizard : false })
                    }}
                    onCreatedRoom={(room) => {
                        this.onJoinRoomSuccess(room);
                    }}
                    isVisible={this.state.isNewRoomWizard}
                />

                <JoinToRoom
                    onClose={() => {
                        this.setState({ selectedRoom : null, isJoiningRoom : false });
                    }}
                    onJoin={(room = null) => {
                        if(room == null) {
                            this.onJoinRoomSuccess(this.state.selectedRoom)
                        } else {
                            this.onJoinRoomSuccess(room)
                        }
                    }}
                    isVisible={((this.state.selectedRoom != null && this.state.selectedRoom.isProtected) || this.state.isJoiningRoom)}
                    mode={(this.state.selectedRoom != null && this.state.selectedRoom.isProtected) ? 2 : 1}
                    room={this.state.selectedRoom}
                />

                <NotificationList
                    ref={'notificationList'}
                    notifications={this.state.notifications}
                    onJoinToRoom={this.onJoinToRoom}
                    onUpdateNotifications={this.onCheckPendingNotifications}
                />

                <RewardCelebration
                    ref={'rewardCelebration'}
                />

                <NewsModal
                    ref={'newsModal'}
                />

            </View>
        );
    }

    renderRoom(item) {
        return (
            <Room
                key={'room-' + item.id}
                room={item}
                onTapRoom={(room) => {
                    if(room.isProtected) {
                        this.setState({ selectedRoom : room });
                    } else {
                        var joinReq = { roomId: room.id };
                        RoomService.join(joinReq, (success) => {
                            this.onJoinRoomSuccess(room);
                        }, (err) => {
                            if(err.message){
                                this.commonDialog.show('error', err.message);
                            }
                        });
                    }
                }}
                onShowDialog={(text) => {
                    this.commonDialog.show('success', text)
                }}
                getConfirmationDialog={() => {
                    return this.confirmationDialog;
                }}
            />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2a3a4b'
    }
});
