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
    FlatList,
    BackHandler,
    Animated,
    NetInfo
} from 'react-native';

import Moment from 'moment';

//Localization
import { strings } from '../../components/localization/strings';

//Styles
import { Global } from '../../components/common/global';
import { GeneralStyle } from '../../styles/general';
import { Color, Font } from '../../styles/default';
import * as Animatable from 'react-native-animatable';

//Services
import { AuthService, ConfigurationService, SocketService, QuestionService, RoomService, AnalyticsService } from '../../services/Services';

//Plugins
import queueFactory from 'react-native-queue';
import Orientation from 'react-native-orientation';
import LinearGradient from 'react-native-linear-gradient';

//Components
import RoundCategory from '../../components/componentsJs/RoundCategory'
import RoundTimer from '../../components/componentsJs/RoundTimer'
import FinishedRound from '../../components/modals/celebration/FinishedRound'
import CustomNavbar from '../../components/navigation/CustomNavbar';
import CustomMenu from '../../components/navigation/CustomMenu'
import CommonDialog from '../../components/dialogs/CommonDialog';
import SpinnerComponent from '../../components/SpinnerComponent';
import RewardToNavbar from '../../components/modals/celebration/RewardToNavbar';
import StreakCorrectReward from '../../components/modals/celebration/StreakCorrectReward';

var {height, width} = Dimensions.get('window');
var _ = require('lodash');

let COUNTDOWN_SECONDS = 10;

//Queue
const QUEUE_NAME = 'send_replies'
const FBSDK = require('react-native-fbsdk');
const {
  ShareDialog,
} = FBSDK;

export default class InRoundCategories extends Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: [],
            missingTime: '01:00',
            countDownSeconds: this.props.duration,
            //countDownSeconds: COUNTDOWN_SECONDS,
            rewardValue: 0,
            finishedRoundModal: {
                visible: false,
                players: []
            },
            opponents: [],
            user: AuthService.getUser(),
            totalEarnedTuls: 0,
            totalEarnedExp: 0,
            totalQuestions: 0,
            totalCorrect: 0,
            totalConsecutiveCorrects: 0,
            blockTaps: false,
            lastCategorySelected: null,
            opacityOpponents: new Animated.Value(0)
        }

        this.onEndCountDown = this.onEndCountDown.bind(this);

        //Socket functions related
        this.onFinishedRound = this.onFinishedRound.bind(this);
        this.onBlockCategory = this.onBlockCategory.bind(this);
        this.checkRoundStatus = this.checkRoundStatus.bind(this);

        //Initialize common variables
        this.intervalTimer = null;
        this.commonDialog = null;

        //Create the queue job
        queueFactory().then((queue) => {
            this.repliesQueue = queue;
            this.repliesQueue.addWorker(QUEUE_NAME, async (id, payload) => {

                payload.roomId = this.props.roomId;
                RoomService.postStats(payload, (success) => {
                    //Post stats!
                }, (err) => {
                    //Post stats error. Silent error.
                });
            });
        });

        this.widthBlockedCategory = new Animated.Value(0);

        AnalyticsService.trackScreenView('in_round_categories');
    }

    componentWillMount() {
        Orientation.lockToPortrait();
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton.bind(this));
        SocketService.on('onFinishedRound', this.onFinishedRound.bind(this));
        SocketService.on('onRoundStats', this.onRoundStats.bind(this));
    }

    componentWillReceiveProps(nextProps){
        //Do nothing
    }

    componentDidMount() {
        this.setState({ categories: this.props.categories });

        NetInfo.addEventListener(
            'connectionChange',
            this.handleFirstConnectivityChange.bind(this)
        );
    }

    handleFirstConnectivityChange(connectionInfo) {
        if(connectionInfo.effectiveType == 'unknown') { //The user has been disconnected
            if(this.commonDialog) {
                this.commonDialog.show('error', '¡Oops! Al parecer estás teniendo problemas con tu conexión. No perderás los puntos ni los tuls que ya haz ganado.', () => {
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

    componentWillUnmount() {
        if(this.intervalTimer) {
            clearInterval(this.intervalTimer)
            this.intervalTimer = null;
        }

        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
        SocketService.removeListener('onFinishedRound', this.onFinishedRound);
        SocketService.removeListener('onRoundStats', this.onRoundStats);
    }

    handleBackButton() {
        AnalyticsService.trackEvent('in_round_press_back');
        return false;
    }

    /* Socket related */
    onRoundStats(data) {
        let users = data.accounts;
        users.sort((a,b) => {
            return b.stats.points - a.stats.points;
        })

        this.setState({ opponents : users })
    }

    onFinishedRound(data) {
        if(this.refs.spinner)
            this.refs.spinner.show();
        if(data.isOwnerDisconnected) {
            AnalyticsService.trackEvent('in_round_finished', {
                ownerDisconnected: true
            });
            var _fn = () => {
                if(this.commonDialog != null) {
                    this.commonDialog.show('error', 'El creador de la sala se ha desconectado.', () => {
                        setTimeout(() => {
                            this.props.navigator.dismissModal()
                        }, 500);
                    });
                }
            }
            if(this.refs.spinner) {
                this.refs.spinner.hide(_fn);
            } else {
                _fn();
            }
        } else if(data.allUsersDisconnected) {
            AnalyticsService.trackEvent('in_round_finished', {
                allUsersDisconnected: true
            });
            var _fn = () => {
                if(this.refs.spinner && this.onEndCountDown) {
                    this.refs.spinner.hide(() => {
                        this.onEndCountDown();
                    });
                }
            }
            if(this.refs.spinner){
                this.refs.spinner.hide(_fn);
            } else {
                _fn();
            }
        } else if(data.roundTerminatedWithSuccess) {
            AnalyticsService.trackEvent('in_round_finished', {
                success: true
            });

            SocketService.removeListener('onFinishedRound', this.onFinishedRound);

            RoomService.getStatsForRoom(this.props.roomId, (data) => {
                let finishedRoundModal = this.state.finishedRoundModal
                finishedRoundModal.visible = true;
                finishedRoundModal.players = data;
                this.setState({ finishedRoundModal })
                if(this.refs.spinner)
                    this.refs.spinner.hide();
            }, (err) => {
                if(this.refs.spinner)
                    this.refs.spinner.hide();
            });
        }
    }

    onReplyQuestion(data) {

        //Block the category
        if(data.categoryId) {
            this.onBlockCategory(_.find(this.state.categories, { id : data.categoryId }));
        }

        let totalQuestions = this.state.totalQuestions;
        totalQuestions += 1;
        this.setState({ totalQuestions: totalQuestions, blockTaps: false });

        let totalCorrect = this.state.totalCorrect;
        if(this.state.totalConsecutiveCorrects == 4 && data.isCorrect)
            data.isStreakReward = true;

        if(this.repliesQueue != null) {
            this.repliesQueue.createJob(QUEUE_NAME, data, {}, true);
            if(data.isCorrect) {

                let consecutiveCorrects = this.state.totalConsecutiveCorrects;
                consecutiveCorrects += 1;
                this.setState({ totalConsecutiveCorrects : consecutiveCorrects })

                let totalCorrect = this.state.totalCorrect;
                totalCorrect += 1;
                this.setState({ totalCorrect });

                if(consecutiveCorrects >= 5) {
                    this.setState({ consecutiveCorrects })
                    this.refs.streakCorrectReward.onEarned({
                        tulsAccumulated: totalEarnedTuls,
                        tulsQuestion: tulsQuestion,
                        expAccumulated: totalEarnedExp,
                        expQuestion: data.profitExp
                    });
                    //totalCorrect = 0;
                    //this.setState({ totalCorrect })
                    this.setState({ totalConsecutiveCorrects : 0 })
                } else if(consecutiveCorrects == 3) {
                    if(this.refs.customNavbar) {
                        this.refs.customNavbar.showMessage('2 preguntas correctas seguidas más y obtendrás 100 puntos exp. por seguidilla!', {
                            containerTextStyle: {
                                maxWidth: width / 1.5
                            },
                            backgroundColor: '#1aba5d',
                            duration: 3500,
                            animation: "bounceInUp",
                            animationDuration: 1000,
                            onPress: () => {
                                if(this.refs.customNavbar)
                                    this.refs.customNavbar.hide();
                            }
                        });
                    }
                }

                //Total earned exp and tuls.
                let totalEarnedExp = this.state.totalEarnedExp;
                totalEarnedExp += parseInt(data.profitExp) * this.props.multiplierExp;
                let totalEarnedTuls = parseFloat(this.state.totalEarnedTuls).toFixed(2);
                let tulsQuestion = Math.round(parseFloat((data.profitExp * ConfigurationService.tulsRate / 100) * 100)) / 100;
                totalEarnedTuls = (parseFloat(totalEarnedTuls) + parseFloat(tulsQuestion) *  this.props.multiplierExp);
                this.setState({ totalEarnedTuls: totalEarnedTuls, totalEarnedExp: totalEarnedExp })
                if(this.refs.rewardToNavbar) {
                    this.refs.rewardToNavbar.onEarned({
                        tulsAccumulated: totalEarnedTuls,
                        tulsQuestion: tulsQuestion,
                        expAccumulated: totalEarnedExp,
                        expQuestion: data.profitExp
                    });
                }
            } else {
                let consecutiveCorrects = this.state.totalConsecutiveCorrects;
                consecutiveCorrects = 0;
                this.setState({ totalConsecutiveCorrects : consecutiveCorrects })
            }
        }

        Animated.sequence([
            Animated.spring(this.state.opacityOpponents, {
                toValue: 1,
                useNativeDriver: true
            }),
            Animated.spring(this.state.opacityOpponents, {
                toValue: .5,
                delay: 2000,
                useNativeDriver: true
            })
        ]).start();
    }

    onEndCountDown() {
        if(this.refs.spinner != null) {
            this.refs.spinner.show();
        }
        this.checkRoundStatus();
        /* SocketService.emit('onPlayerFinishedRound', {
            roomId: this.props.roomId
        });
        if(this.refs.spinner != null) {
            this.refs.spinner.show();
        } */
    }

    checkRoundStatus() {
        var check = _.delay(this.checkRoundStatus, 5000);
        RoomService.finish({ roomId : this.props.roomId }, (data) => {
            if(data.finished) {
                this.onFinishedRound({
                    roundTerminatedWithSuccess: true
                });
            } else {
                check();
            }
        }, (err) => {
            check();
        });
    }

    onBlockCategory(category) {
        let lastCategorySelected = this.state.lastCategorySelected;
        if(lastCategorySelected != null) {
            //Check if it's the same category
            if(lastCategorySelected.categoryId != category.id) {
                this.widthBlockedCategory.setValue(0);
                this.widthBlockedCategory.stopAnimation();
            }
        }

        //Set the new category
        let cat = { categoryId: category.id };
        this.setState({ lastCategorySelected : cat })

        Animated.sequence([
            Animated.timing(this.widthBlockedCategory, {
                toValue: width - 5,
                duration: 5000
            }),
            Animated.timing(this.widthBlockedCategory, {
                toValue: 0,
                duration: 300
            })
        ]).start(() => {
            this.widthBlockedCategory.setValue(0);
            this.setState({ lastCategorySelected: null })
        });
    }

    renderNavbar() {
        return (
            <CustomNavbar
                ref={'customNavbar'}
                navigator={this.props.navigator}
                backButton={false}
                gradientColors={['#ED6552', '#ed5e26']}
                customLeftView={() => {
                    return (
                        <RoundTimer
                            duration={this.state.countDownSeconds}
                            onEndCountDown={this.onEndCountDown}
                        />
                    );
                }}
                customCenterView={() => {
                    return (
                        <TouchableOpacity
                            style={{flex: 1, flexDirection: 'row', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%'}}>
                            <Text style={{backgroundColor: 'transparent', fontSize: Global.normalizeFontSize(17), fontFamily: Font.TitanOne, color: '#fff', textAlign: 'center', alignSelf: 'center', marginRight: 5}}>
                                { strings.Categories.toUpperCase() }
                            </Text>
                        </TouchableOpacity>
                    );
                }}
                customRightView={() => {
                    return null;
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

    renderFinishPopup() {
        return (
            <FinishedRound
                isVisible={this.state.finishedRoundModal.visible}
                players={this.state.finishedRoundModal.players}
                roomId={this.props.roomId}
                onClose={() => {
                    let finishedRoundModal = this.state.finishedRoundModal;
                    finishedRoundModal.players = [];
                    finishedRoundModal.visible = false;
                    this.setState({ finishedRoundModal })
                    setTimeout(() => {
                        this.props.navigator.dismissModal()
                    }, 750);
                }}
                onShareFacebook={() => {
                    var tmp = this;
                    var content = {
                        contentType: 'link',
                        contentUrl: "https://play.google.com/store/apps/details?id=com.openenglish.chatbyoe&hl=en",
                        quote: 'He ganado respondiendo X preguntas correctas en una ronda de 10! :-)',
                        contentDescription: 'He ganado respondiendo X preguntas correctas en una ronda de 10! :-)',
                        hashtag: '#WordeoApp'
                    };
                    ShareDialog.canShow(content).then((canShow) => {
                        if(canShow) {
                            return ShareDialog.show(content)
                        }
                    }).then((result) => {
                        if (result.isCancelled) {
                            alert('Share cancelled');
                        } else {
                            alert('Share success with postId: '
                              + result.postId);
                        }
                    }).catch((err) => {
                        alert(JSON.stringify(err));
                    });
                }}
            />
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        var update = false;

        if(update || !_.isEqual(this.state.categories, nextState.categories))
            update = true;
        if(update || this.state.finishedRoundModal.visible)
            update = true;
        if(update || !_.isEqual(this.state.lastCategorySelected, nextState.lastCategorySelected))
            update = true;
        if(update || !_.isEqual(this.state.opacityOpponents, nextState.opacityOpponents))
            update = true;
        if(update || !_.isEqual(this.state.opponents, nextState.opponents))
            update = true;

        return update;
    }

    render() {
        return (
            <View style={{flex: 1, width: '100%', height: '100%'}}>
                { this.renderNavbar() }
                { this.renderCustomMenu() }
                { this.renderFinishPopup() }

                <RewardToNavbar
                    ref={'rewardToNavbar'} />

                <StreakCorrectReward
                    ref={'streakCorrectReward'} />

                <CommonDialog
                    ref={(e) => { this.commonDialog = e } } />

                <FlatList
                    contentContainerStyle={{ padding: 2 }}
                    numColumns={1}
                    bounces={false}
                    style={styles.container}
                    centerContent={false}
                    snapToAlignment={'start'}
                    data={this.state.categories}
                    keyExtractor={(item, index) => {
                        return 'categoryId-' + item.id
                    }}
                    ListHeaderComponent={() => {
                        return (
                            <Text style={{ flex: 1, backgroundColor: 'transparent', marginRight: 10, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(18), color: Color.BluePrimary, marginVertical: 10, textAlign: 'center' }}>SELECCIONA UNA CATEGORÍA</Text>
                        );
                    }}
                    renderItem={(rowData) => {
                        return (
                            <RoundCategory
                                index={rowData.index}
                                category={rowData.item}
                                isLastSelected={(this.state.lastCategorySelected != null && this.state.lastCategorySelected.categoryId == rowData.item.id)}
                                innerContent={() => {

                                    if(this.state.lastCategorySelected && this.state.lastCategorySelected.categoryId == rowData.item.id) {
                                        return (
                                            <Animated.View style={{ backgroundColor: 'rgba(255,255,255,.7)', zIndex: 9999, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: this.widthBlockedCategory, height: '100%', borderRadius: 5}}></Animated.View>
                                        );
                                    }

                                    return null;
                                }}
                                onTapCategory={(id, extraData) => {

                                    //If the animation is in progress for this category, block the tap.
                                    if(this.state.lastCategorySelected && (rowData.item.id == this.state.lastCategorySelected.categoryId && this.widthBlockedCategory._value > 0)) {
                                        return;
                                    }

                                    this.setState({ blockTaps : true })

                                    var screen = Object.assign({}, Global.Screen.Dashboard.InRoundQuestion);
                                    if(rowData.item.questions && rowData.item.questions.length > 0) {
                                        QuestionService.getRandomQuestionForCategory({ categoryId: id, desiredPoints: extraData.desiredPoints }, (question) => {
                                            AnalyticsService.trackEvent('in_round_request_question', {
                                                category: rowData.item.name
                                            });

                                            screen.passProps = {
                                                question: question,
                                                categoryId: id,
                                                onReplyQuestion: this.onReplyQuestion.bind(this)
                                            };
                                            if(extraData) {
                                                screen.passProps.gradientFrom = extraData.gradientFrom;
                                                screen.passProps.gradientTo = extraData.gradientTo;
                                            }
                                            this.props.navigator.push(screen);
                                        }, (err) => {});
                                    }
                                }}
                            />
                        );
                    }}
                />

                { this.renderOpponents() }

                <SpinnerComponent
                    ref={'spinner'} />
            </View>
        );
    }

    renderOpponents() {
        return (
            <Animated.View style={{ position: 'absolute', height: 'auto', bottom: 20, right: 5, backgroundColor: 'transparent', zIndex: 9999999, opacity: this.state.opacityOpponents }}>
                <FlatList
                    contentContainerStyle={{ padding: 2 }}
                    numColumns={1}
                    centerContent={false}
                    snapToAlignment={'start'}
                    scrollEnabled={false}
                    data={this.state.opponents}
                    extraData={this.state.opponents}
                    renderItem={(rowData) => {
                        return (
                            <View style={[stylesOpponent.flatListItemContainer, { backgroundColor: rowData.index == 0 ? Color.BluePrimary : 'rgba(0,0,0,.65)', width: (rowData.index == 0 ? 80 : 70), height: (rowData.index == 0 ? 80 : 70), borderRadius: (rowData.index == 0 ? 40 : 35), zIndex: 999999 }]}>
                                <Text style={{backgroundColor: 'transparent', fontSize: Global.normalizeFontSize(25), fontFamily: Font.TitanOne, color: '#fff'}}>{ rowData.index + 1 }</Text>
                                <Text style={{backgroundColor: 'transparent', fontSize: Global.normalizeFontSize(13), fontFamily: Font.TitanOne, color: '#fff', textAlign: 'right' }}>{rowData.item.profile.name}</Text>
                                <Text style={{backgroundColor: 'transparent', fontSize: Global.normalizeFontSize(13), fontFamily: Font.TitanOne, color: '#fff', textAlign: 'right' }}>{rowData.item.stats.points} pts.</Text>
                            </View>
                        );
                    }}
                />
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    }
});

const stylesOpponent = StyleSheet.create({
    flatListItemContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        marginVertical: 1,
        shadowColor: 'white',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 4
    }
})
