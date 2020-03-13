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
    Animated,
    ScrollView,
    NetInfo
} from 'react-native';

import Moment from 'moment';

//Localization
import { strings } from '../../components/localization/strings';

//Components
//import TutorialOverlay from '../../components/componentsJs/TutorialOverlay'
import RoundBeginTimer from '../../components/componentsJs/RoundBeginTimer'
import EmoticonItem from '../../components/componentsJs/EmoticonItem'
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
import Interactable from 'react-native-interactable';
import { ActionSheetCustom as ActionSheet } from 'react-native-actionsheet'
import Orientation from 'react-native-orientation';

//Services
import { AuthService, QuestionService, SocketService, AnalyticsService, PreferencesService } from '../../services/Services';

var {height, width} = Dimensions.get('window');
var _ = require('lodash');

const INITIAL_COUNTDOWN_VALUE = 9;
const options = [
    'Cancelar',
    'Salir de la sala',
    'Invitar a un amigo'
];
const RANDOM_PLACEHOLDERS = [
    require("../../images/wordeo/room_placeholders/1.png"),
    require("../../images/wordeo/room_placeholders/2.png"),
    require("../../images/wordeo/room_placeholders/3.png"),
    require("../../images/wordeo/room_placeholders/4.png"),
    require("../../images/wordeo/room_placeholders/5.png"),
    require("../../images/wordeo/room_placeholders/6.png"),
    require("../../images/wordeo/room_placeholders/7.png"),
    require("../../images/wordeo/room_placeholders/8.png"),
    require("../../images/wordeo/room_placeholders/9.png"),
    require("../../images/wordeo/room_placeholders/10.png")
];
const NUMBER_PLACEHOLDER_IMAGES = RANDOM_PLACEHOLDERS.length;

export default class Round extends Component {
    constructor(props) {
        super(props);
        this.state = {
            round: {
                name: '',
                players: []
            },
            spinner: true,
            isPairing: true,
            isStartingRound: false,
            countDown: INITIAL_COUNTDOWN_VALUE,
            image: RANDOM_PLACEHOLDERS[_.random(0, NUMBER_PLACEHOLDER_IMAGES - 1)],
            isMounted: true,
            isInvitingFriend: false,
            isChallenging: false,
            challengingRetries: 0,
            backgroundColorAnimation: new Animated.Value(0),
            monster1TranslateX: new Animated.Value(-45),
            monster2TranslateX: new Animated.Value(45),
            emoticonQueue: [],
            emoticonAnimatedTranslateY: new Animated.Value(height * 2),
            emoticonAnimatedOpacity: new Animated.Value(1),
            emoticonInProgress: false
        }

        this.intervalCountDown = null;
        this.intervalWaitingOpponent = null;
        this.commonDialog = null;
        this._actionsDeltaY = new Animated.Value(0);
        this.ActionSheet = null;

        AnalyticsService.trackScreenView('round_preview');

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) {
        if (event.id === 'backPress') {
            AnalyticsService.trackEvent('round_press_back');
            if(!this.state.isStartingRound) {
                if(this.intervalCountDown){
                    clearInterval(this.intervalCountDown);
                }
                this.props.navigator.dismissModal();
            }
        }
    }

    componentWillUnmount() {
        SocketService.socket.emit('onLeaveRoom', { roomId : this.props.round.id });

        this.setState({ isMounted : false })
        if(this.intervalCountDown != null)
            clearInterval(this.intervalCountDown);

        SocketService.removeListener('onReceivedEmoticon', this.onReceivedEmoticon);
        SocketService.removeListener('onFinishedRound', this.onFinishedRound);
        SocketService.removeListener('onStartRound', this.onStartRound);
        SocketService.removeListener('onRoomActivity', this.onRoomActivity);

        //Remove listener for changing connection
        if(this.handleFirstConnectivityChange != null) {
            NetInfo.removeEventListener(
                'connectionChange',
                this.handleFirstConnectivityChange
            );
        }
    }

    componentDidMount() {
        Orientation.lockToPortrait();

        if(this.intervalCountDown != null)
            clearInterval(this.intervalCountDown);

        SocketService.on('onReceivedEmoticon', this.onReceivedEmoticon.bind(this));
        SocketService.on('onFinishedRound', this.onFinishedRound.bind(this));
        SocketService.on('onStartRound', this.onStartRound.bind(this));
        SocketService.on('onRoomActivity', this.onRoomActivity.bind(this));

        this.setState({ spinner : false, round: { name : this.props.round.name, duration: this.props.round.duration }, isPairing: false });

        //Check if is challenging then we need to set a timeout until the another player is connected.
        if(this.props.round.isChallenging) {
            this.setState({ isChallenging : true, challengingRetries: 0 });
            this.intervalWaitingOpponent = setInterval(() => {
                if(this.state.challengingRetries >= 60) {
                    clearInterval(this.intervalWaitingOpponent);
                    this.props.navigator.dismissModal();
                } else {
                    let retries = this.state.challengingRetries;
                    retries += 1;
                    this.setState({ challengingRetries : retries })
                }
            }, 1000);
        }

        NetInfo.addEventListener(
            'connectionChange',
            this.handleFirstConnectivityChange.bind(this)
        );
    }

    handleFirstConnectivityChange(connectionInfo) {
        if(connectionInfo.effectiveType == 'unknown') { //The user has been disconnected
            this.setState({ isStartingRound : false })
            if(this.commonDialog != null) {
                this.commonDialog.show('error', '¡Oops! Al parecer estás teniendo problemas con tu conexión. Por favor comprueba que estés conectado a una red.', () => {
                    this.props.navigator.dismissModal();
                });
            } else {
                this.props.navigator.dismissModal();
            }
        }
        NetInfo.removeEventListener(
            'connectionChange',
            this.handleFirstConnectivityChange
        );
    }

    onFinishedRound(data) {
        clearInterval(this.intervalCountDown);
        if(this.commonDialog && data.isOwnerDisconnected) {
            this.commonDialog.show('error', 'El creador de la sala se ha desconectado.', () => {
                setTimeout(() => {
                    if(this.intervalCountDown){
                        clearInterval(this.intervalCountDown);
                    }
                    this.props.navigator.dismissModal()
                }, 500);
            });
        }
    }

    onStartRound(data) {
        AnalyticsService.trackEvent('round_start');
        this.setState({ isStartingRound : true, isChallenging: false, challengingRetries: 0 })

        Animated.timing(this.state.backgroundColorAnimation, {
            toValue: 1,
            duration: 1500
        }).start()

        //Get the categories and start the round
        if(this.customNavbar) {
            setTimeout(() => {
                this.customNavbar.showMessage('Recuerda: apenas inicie la ronda debes comenzar a responder. ¡Que lo disfrutes!', {
                    containerTextStyle: {
                        maxWidth: width / 1.3
                    },
                    backgroundColor: '#475764',
                    duration: 3000,
                    animation: "bounceInDown",
                    animationDuration: 250,
                    onPress: () => {
                        if(this.customNavbar)
                            this.customNavbar.hide();
                    },
                    onHide: () => {
                        setTimeout(() => {
                            Animated.sequence([
                                Animated.spring(this.state.monster1TranslateX, {
                                    toValue: 80,
                                    useNativeDriver: true
                                }),
                                Animated.spring(this.state.monster2TranslateX, {
                                    toValue: -80,
                                    useNativeDriver: true
                                })
                            ]).start();
                        }, 300);
                    }
                });
            }, 1500);
        }

        if(this.intervalWaitingOpponent){
            clearInterval(this.intervalWaitingOpponent);
        }
    }

    onRoomActivity(data) {
        let players = [];
        for(var i=0; i < data.accounts.length; i++) {
            const account = data.accounts[i];
            if(account) {
                players.push({
                    name: (account.username != null) ? account.username : (account.profile.name + ' ' + account.profile.lastName),
                    avatar: account.avatar,
                    rank: account.rank
                });
            }
        }

        let round = { ...this.state.round };
        round.players = players;
        this.setState({ round });
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
                            style={{flex: 1, flexDirection: 'row', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%'}}>
                            <Text style={GeneralStyle.customNavbarTitle}>
                                { strings.Round.toUpperCase() }
                            </Text>
                        </TouchableOpacity>
                    );
                }}
                customRightView={() => {
                    return (
                        <TouchableOpacity
                            onPress={() => {
                                this.setState({ isInvitingFriend : true })
                            }}
                            style={{flex: 1, flexDirection: 'row', alignSelf: 'center', justifyContent: 'flex-end', alignItems: 'center', width: '100%', height: '100%'}}>
                            <Text style={[GeneralStyle.customNavbarTitle, { fontSize: Global.normalizeFontSize(14) }]}>
                                INVITAR AMIGO
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />
        );
    }

    renderCustomMenu(){
        return <CustomMenu
            isOpened={this.state.openedHamburguerMenu}
            onClose={() => {
                this.setState({ openedHamburguerMenu: false })
            }}
        />;
    }

    onLayout(e) {

    }

    shouldComponentUpdate(nextProps, nextState) {
        var update = false;

        if(!_.isEqual(this.state.round, nextState.round))
            update = true;
        if(this.state.isStartingRound != nextState.isStartingRound)
            update = true;
        if(this.state.isInvitingFriend != nextState.isInvitingFriend)
            update = true;
        if(this.state.emoticonQueue != nextState.emoticonQueue)
            update = true;

        return true;
    }

    onTapEmoticon(key) {
        SocketService.socket.emit('onSendRoomEmoticon', { roomId : this.props.round.id, emoticonKey: key });
    }

    onReceivedEmoticon(data) {

        //Add emoticon to queue

        var key = data.emoticonKey;
        let queue = this.state.emoticonQueue;
        var queueEmoticon = null;
        if(key == 1) {
            queueEmoticon = require('../../images/wordeo/round/emoticons/1.png');
        } else if(key == 2) {
            queueEmoticon = require('../../images/wordeo/round/emoticons/2.png');
        } else if(key == 3) {
            queueEmoticon = require('../../images/wordeo/round/emoticons/3.png');
        } else if(key == 4) {
            queueEmoticon = require('../../images/wordeo/round/emoticons/4.png');
        } else if(key == 5) {
            queueEmoticon = require('../../images/wordeo/round/emoticons/5.png');
        } else if(key == 6) {
            queueEmoticon = require('../../images/wordeo/round/emoticons/6.png');
        } else if(key == 7) {
            queueEmoticon = require('../../images/wordeo/round/emoticons/7.png');
        }

        var obj = {
            emoticon: queueEmoticon,
            emoticonAnimatedTranslateY: new Animated.Value(height * 2),
            emoticonAnimatedOpacity: new Animated.Value(1),
            leftRandom: _.random(40, width / 1.2),
            isProcessed: false
        };
        queue.push(obj);
        this.setState({ emoticonQueue : queue });

        Animated.timing(this.state.emoticonQueue[this.state.emoticonQueue.indexOf(obj)].emoticonAnimatedTranslateY, {
            toValue: -100,
            duration: 1500,
            useNativeDriver: true
        }).start(() => {

            let item = this.state.emoticonQueue[this.state.emoticonQueue.indexOf(obj)];
            item.emoticonAnimatedTranslateY.setValue(height * 2);
            item.emoticonAnimatedOpacity.setValue(1);

            let queue = this.state.emoticonQueue;
            queue.splice(queue.indexOf(item), 1);
            this.setState({ emoticonQueue : queue })
        });
    }

    render() {
        if(this.state.isPairing)
            return this.renderLoading();

        const interpolate = this.state.backgroundColorAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['#475764', '#ed5e26']
        })

        return (
            <View
                onLayout={this.onLayout.bind(this)}
                style={styles.container}>

                <CommonDialog
                    ref={(e) => { this.commonDialog = e } } />

                <SpinnerComponent
                    ref={'spinner'} />

                <InviteFriend
                    spinner={this.refs.spinner}
                    { ...this.props }
                    onClose={() => {
                        this.setState({ isInvitingFriend : false })
                    }}
                    isVisible={this.state.isInvitingFriend} />

                { this.renderNavbar() }
                { this.renderCustomMenu() }

                <ActionSheet
                    ref={o => this.ActionSheet = o}
                    title={<Text style={{color: '#222', fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(14)}}>Escoje una opción</Text>}
                    options={options}
                    cancelButtonIndex={0}
                    destructiveButtonIndex={1}
                    onPress={(index) => {
                        if(index == 1) {
                            setTimeout(() => {
                                if(this.intervalCountDown){
                                    clearInterval(this.intervalCountDown);
                                }
                                this.props.navigator.dismissModal()
                            }, 500);
                        } else if(index == 2) {
                            this.setState({ isInvitingFriend : true })
                        }
                    }}
                />

                <Interactable.View
                    ref={'interactableView'}
                    verticalOnly={true}
                    snapPoints={[{y: 0}, {y: -130}]}
                    boundaries={{top: -130, bottom: 25}}
                    onDrag={(e) => {
                        const { y, state, x } = e.nativeEvent;
                        if(y < -80 && state == 'end' && !this.state.isStartingRound) {
                            this.refs.interactableView.snapTo({index: 0});
                            this.ActionSheet.show()
                        }
                    }}
                    animatedValueY={this._actionsDeltaY}>

                    <Animated.View
                        //source={require('../../images/wordeo/general/background.jpg')}
                        style={{ width: '100%', height: '130%', justifyContent: 'center', backgroundColor: interpolate }}>

                        { !this.state.isChallenging &&
                            <TouchableOpacity
                                onPress={() => {
                                    this.setState({ isInvitingFriend : true })
                                }}
                                style={{ margin: 0, width: 'auto' }}>
                                <Text style={[styles.loadingPairingText, { marginBottom: 0, fontSize: Global.normalizeFontSize(16) }]}>CÓDIGO DE LA SALA</Text>
                                <Text
                                    ref={'roomCodeText'}
                                    style={[styles.loadingPairingText, { marginTop: 0, fontSize: Global.normalizeFontSize(16) , color: Color.GoldenPrimary, zIndex: 9999999999 }]}>{ this.props.round.code }</Text>
                            </TouchableOpacity>
                        }

                        { this.state.isChallenging && 
                            <Text
                                style={[styles.loadingPairingText, { marginTop: 15, fontSize: Global.normalizeFontSize(16) , color: Color.GoldenPrimary, zIndex: 9999999999 }]}>Tiempo para que tu oponente se una: { 60 - this.state.challengingRetries } segundos.</Text>
                        }

                        <View style={[styles.bubbleContainer]}>
                            <View style={[styles.bubble, { flex : 1 }]}>
                                <Text style={[GeneralStyle.header, { color: 'white', backgroundColor: 'transparent', marginBottom: 15 }]}>{ this.state.round.name }</Text>
                                {(this.state.round.players == null || this.state.round.players.length == 0) ?
                                    <ActivityIndicator color={'white'} size={1} />
                                :
                                    <FlatList
                                        horizontal={true}
                                        scrollEnabled={true}
                                        showsHorizontalScrollIndicator={false}
                                        style={{ flex: 1, width: '100%'}}
                                        contentContainerStyle={{width: '100%', justifyContent: 'space-around', alignItems: 'center'}}
                                        data={this.state.round.players}
                                        renderItem={(rowData) => {
                                            return (
                                                <View style={{ flex: 0, alignSelf: 'center', minWidth: (width / this.state.round.players.length), alignItems: 'center', alignSelf: 'center' }}>
                                                    { this.renderPlayer(rowData.item) }
                                                </View>
                                            );
                                        }}
                                    />
                                }
                            </View>


                            { this.state.isStartingRound &&
                                <RoundBeginTimer
                                    duration={INITIAL_COUNTDOWN_VALUE}
                                    onStart={() => {
                                        QuestionService.getCategoriesWithRandomQuestions({}, (categories) => {
                                            var screen = Object.assign({}, Global.Screen.Dashboard.InRoundCategories);
                                            screen.passProps = {
                                                categories: categories,
                                                roomId: this.props.round.id,
                                                duration: this.props.round.duration,
                                                multiplierExp: parseInt(this.props.round.multiplierExp)
                                            };
                                            this.props.navigator.push(screen);
                                        });
                                    }}
                                />
                            }

                            { !this.state.isStartingRound &&
                                <View style={{ flex: 0, marginBottom: 5, justifyContent: 'flex-start', alignItems: 'center', width: '100%', marginTop: 40 }}>
                                    <ActivityIndicator color={'white'} size={1} />
                                    <Text style={styles.loadingPairingText}>{this.state.round.players != null ? this.state.round.players.length : 1} de {this.props.round.players} jugadores</Text>
                                    <Text style={styles.loadingPairingText}>Esperando al resto...</Text>
                                </View>
                            }

                            <ScrollView
                                horizontal
                                style={styles.emoticonsContainer}
                                contentContainerStyle={{ flex: 1, alignSelf: 'center', maxHeight: 80, justifyContent: 'center', alignItems: 'center' }}>
                                <EmoticonItem
                                    onTapEmoticon={this.onTapEmoticon.bind(this)}
                                    keyEmoticon={1}
                                    image={require('../../images/wordeo/round/emoticons/1.png')}/>
                                <EmoticonItem
                                    onTapEmoticon={this.onTapEmoticon.bind(this)}
                                    keyEmoticon={2}
                                    image={require('../../images/wordeo/round/emoticons/2.png')}/>
                                <EmoticonItem
                                    onTapEmoticon={this.onTapEmoticon.bind(this)}
                                    keyEmoticon={3}
                                    image={require('../../images/wordeo/round/emoticons/3.png')}/>
                                <EmoticonItem
                                    onTapEmoticon={this.onTapEmoticon.bind(this)}
                                    keyEmoticon={4}
                                    image={require('../../images/wordeo/round/emoticons/4.png')}/>
                                <EmoticonItem
                                    onTapEmoticon={this.onTapEmoticon.bind(this)}
                                    keyEmoticon={5}
                                    image={require('../../images/wordeo/round/emoticons/5.png')}/>
                                <EmoticonItem
                                    onTapEmoticon={this.onTapEmoticon.bind(this)}
                                    keyEmoticon={6}
                                    image={require('../../images/wordeo/round/emoticons/6.png')}/>
                                <EmoticonItem
                                    onTapEmoticon={this.onTapEmoticon.bind(this)}
                                    keyEmoticon={7}
                                    image={require('../../images/wordeo/round/emoticons/7.png')}/>
                            </ScrollView>
                        </View>
                    </Animated.View>
                </Interactable.View>

                { false && !this.state.isStartingRound &&
                    <Text style={styles.actionText}>Desliza para opciones</Text>
                }

                <Animated.Image
                    source={require('../../images/wordeo/round/monster.png')}
                    style={{ position: 'absolute', bottom: 10, left: -130, transform:[{ translateX: this.state.monster1TranslateX }], maxHeight: 150, maxWidth: 150, resizeMode: 'contain' }}
                />

                <Animated.Image
                    source={require('../../images/wordeo/round/monster_2.png')}
                    style={{ position: 'absolute', bottom: 20, right: -130, transform:[{ translateX: this.state.monster2TranslateX }], maxHeight: 150, maxWidth: 150, resizeMode: 'contain' }}
                />

                { this.state.emoticonQueue && this.state.emoticonQueue.map((e) => {
                    return (
                        <Animated.Image
                            source={e.emoticon}
                            style={{ position: 'absolute', left: e.leftRandom, transform: [{ translateY: e.emoticonAnimatedTranslateY}], opacity: e.emoticonAnimatedOpacity, maxHeight: 75, maxWidth: 75, resizeMode: 'contain' }}
                        />
                    );
                })
                }
            </View>
        );
    }

    renderPlayer(item) {
        return (
            <View key={'player' + item.id} style={{ width: '100%', marginHorizontal: 5, alignItems: 'center', alignSelf: 'center' }}>
                <Image style={{ marginLeft: 0, width: 90, height: 90, minWidth: 90, minHeight: 90, borderRadius: 20, resizeMode: 'cover' }} source={{ uri : item.avatar }} />
                <View style={{flexDirection: 'column', height: 80, padding: 5, borderRadius: 10 }}>
                    <Text
                        numberOfLines={0}
                        style={{ flex: 1, flexWrap: 'wrap', height: 100, backgroundColor: 'transparent', color: 'white', fontFamily: Font.PTSansBold, marginTop: 5, fontSize: Global.normalizeFontSize(14), textAlign: 'center' }}>{ item.name }</Text>
                    { item.rank && item.rank > -1 && 
                        <Text
                            numberOfLines={0}
                            style={{ flex: 1, flexWrap: 'wrap', height: 100, backgroundColor: 'transparent', color: 'white', padding: 5, fontFamily: Font.TitanOne, marginTop: 5, fontSize: Global.normalizeFontSize(14), textAlign: 'center' }}>#{ item.rank } en ranking</Text>
                    }

                </View>
            </View>
        );
    }

    renderLoading() {
        return (
            <ImageBackground
                source={require('../../images/wordeo/general/background.jpg')}
                style={{ width: '100%', height: '100%', justifyContent: 'center' }}>
                <ActivityIndicator color={'white'} size={1} />
                <Text style={styles.loadingPairingText}>Esperando jugadores..</Text>
            </ImageBackground>
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
    },
    emoticonsContainer: {
        marginTop: 30,
        width: '100%',
        height: 90,
        maxHeight: 90
    }
});
