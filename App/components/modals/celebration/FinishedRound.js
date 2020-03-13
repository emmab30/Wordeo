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
    ActivityIndicator,
    Image,
    Button,
    ImageBackground,
    Platform,
    Animated,
    PanResponder,
    ScrollView,
    FlatList,
    AsyncStorage,
    Share
} from 'react-native';

//Localization
import { strings } from '../../../components/localization/strings';

import Overlay from 'react-native-modal-overlay';
import LinearGradient from 'react-native-linear-gradient';
import { AuthService, RoomService, QuestionService } from '../../../services/Services';
import { Color, Font } from '../../../styles/default';
import { GeneralStyle } from '../../../styles/general';
import { Global } from '../../../components/common/global';

var Sound = require('react-native-sound');
Sound.setCategory('Playback');

// Store width in variable
var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height;
var _ = require('lodash')

export default class FinishedRound extends Component {
    constructor(props) {
        super(props);
        this.state = {
            height: height,
            user: null,
            absoluteTop: new Animated.Value(height),
            opacityOverlay: new Animated.Value(0),
            questions: null,
            reportQuestionId: null,
            reportedQuestions: [],
            isVisible: false,
            needsToUpdateUI: false
        };

        this.winnerSound = new Sound('finish_round_success.mp3', Sound.MAIN_BUNDLE, (err) => {});
        this.losserSound = new Sound('finish_round_lost.mp3', Sound.MAIN_BUNDLE, (err) => {})
    }

    componentWillMount() {

    }

    onLayout(e) {
        this.setState({height: Dimensions.get('window').height});
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.isVisible !== undefined) {
            if(nextProps.isVisible != this.state.isVisible) {

                this.setState({ isVisible: nextProps.isVisible, needsToUpdateUI : true })

                if(nextProps.isVisible) {
                    if(this.state.user != null) {
                        const winner = this.props.players.find((e) => { return e.isWinner });
                        const me = this.props.players.find((e) => { return e.id == this.state.user.id });

                        if(me == winner) {
                            this.winnerSound.play();
                        } else {
                            this.losserSound.play();
                        }
                    }
                }

                this.forceUpdate();
            }
        }
    }

    componentDidMount() {
        if(this.state.user == null) {
            AsyncStorage.getItem('user').then((value) => {
                if(value != null) {
                    value = JSON.parse(value);
                    this.setState({ user: value.user });
                }
            });
        }
    }

    shouldComponentUpdate(){
        if(this.state.needsToUpdateUI) {
            this.setState({ needsToUpdateUI : false });
            return true;
        }
        return false;
    }

    render() {
        if(!this.props.isVisible)
            return null;

        const { levelFrom, levelTo } = this.props;
        let gradientColors = ['#ff6000', '#ff7800'];
        let translatedLevelUp = '';
        let image = null;
        let players = this.props.players;

        const winner = players.find((e) => { return e.isWinner });
        const me = players.find((e) => { return e.id == this.state.user.id });
        const amWinner = (winner.id == this.state.user.id);

        return (
            <View
                onLayout={this.onLayout.bind(this)}>
                <Overlay visible={this.props.isVisible}
                    closeOnTouchOutside
                    animationType={'fadeInDown'}
                    animationOutType={'fadeOut'}
                    animationDuration={300}
                    onClose={() => {
                        if(this.props.onClose)
                            this.props.onClose()
                    }}
                    containerStyle={{backgroundColor: 'rgba(250, 250, 250, 0.90)', flex: 1, width: '100%'}}
                    childrenWrapperStyle={[styles.overlayChildren, {padding: 0, borderRadius: 10, width: '100%', height: 'auto', overflow: 'hidden'}]} >
                    <View style={{ width: '100%', height: '100%', overflow: 'hidden'}} onStartShouldSetResponder={() => { return true; }}>
                        <LinearGradient style={[styles.innerView]} colors={gradientColors}>
                            <View
                                style={{ position: 'relative', width: '100%', height: '100%' }}>

                                <TouchableOpacity
                                    onPress={() => {
                                        Animated.parallel([
                                            Animated.spring(this.state.absoluteTop, {
                                                toValue: height,
                                                duration: 10
                                            }),
                                            Animated.timing(this.state.opacityOverlay, {
                                                toValue: 0,
                                                duration: 35
                                            })
                                        ]).start(() => {
                                            this.setState({ questions : null })
                                        })
                                    }}
                                    style={{ width: '100%', height: 'auto' }}>
                                    <View style={popupStyle.ImageContainer}>
                                        <Image
                                            style={popupStyle.Image}
                                            source={{ uri: 'https://cdn0.iconfinder.com/data/icons/geek-2/24/Domo_Kun_character-256.png' }}
                                        />
                                    </View>
                                </TouchableOpacity>
                                <View style={popupStyle.TopTextContainer}>
                                    { winner.id == this.state.user.id ?
                                        <Text style={[popupStyle.TopText, GeneralStyle.transparentText]}>GANASTE!</Text>
                                    :
                                        <Text style={[popupStyle.TopText, GeneralStyle.transparentText]}>GANÓ { winner.profile.name.toUpperCase() }!</Text>
                                    }
                                </View>
                                <View style={popupStyle.BottomTextContainer}>
                                    { players.length == 1 ?
                                        <Text style={[popupStyle.BottomText, GeneralStyle.transparentText]}>
                                            Parece que todos tus enemigos se han desconectado! ¿Será el miedo que te tienen?
                                        </Text>
                                    :
                                        <Text style={[popupStyle.BottomText, GeneralStyle.transparentText]}>
                                            Mira la tabla de resultados!
                                        </Text>
                                    }
                                </View>
                                <ScrollView style={popupStyle.BottomPointsContainer}>
                                    { players.map((e, idx) => {
                                        const isLastItem = ((players.length - 1) == idx);
                                        return (
                                            <View
                                                key={'playerName-' + e.profile.name}
                                                onStartShouldSetResponder={() => true}
                                                style={{flex: 0, paddingVertical: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 3, marginBottom: 3, marginRight: (isLastItem ? 3 : 0), backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 5}}>
                                                <Text style={[popupStyle.BottomText, { fontSize: Global.normalizeFontSize(23), fontFamily: Font.TitanOne }, GeneralStyle.transparentText]}>
                                                    { e.profile.name.toUpperCase() }
                                                </Text>
                                                <Text style={[popupStyle.BottomText, { fontSize: Global.normalizeFontSize(22), fontFamily: Font.PTSansRegular }, GeneralStyle.transparentText]}>
                                                    { e.stats.points } PUNTOS
                                                </Text>
                                                <Text style={[popupStyle.BottomText, { fontSize: Global.normalizeFontSize(22), fontFamily: Font.PTSansRegular }, GeneralStyle.transparentText]}>
                                                    { e.stats.tulsProfit } TULS GANADOS
                                                </Text>
                                                <Text style={[popupStyle.BottomText, { fontSize: Global.normalizeFontSize(12), fontFamily: Font.PTSansRegular }, GeneralStyle.transparentText]}>
                                                    <Text style={{ fontFamily: Font.PTSansBold }}>{ e.stats.totalQuestions }</Text> preguntas respondidas
                                                </Text>
                                                <Text style={[popupStyle.BottomText, { fontSize: Global.normalizeFontSize(12), fontFamily: Font.PTSansRegular }, GeneralStyle.transparentText]}>
                                                    <Text style={{ fontFamily: Font.PTSansBold }}>{ e.stats.totalCorrect }</Text> correctas
                                                </Text>
                                                <Text style={[popupStyle.BottomText, { fontSize: Global.normalizeFontSize(12), fontFamily: Font.PTSansRegular }, GeneralStyle.transparentText]}>
                                                    <Text style={{ fontFamily: Font.PTSansBold }}>{ e.stats.totalIncorrect }</Text> incorrectas
                                                </Text>
                                            </View>
                                        );
                                    }) }

                                    <TouchableOpacity
                                        onPress={(e) => {
                                            Animated.parallel([
                                                Animated.spring(this.state.absoluteTop, {
                                                    toValue: 100,
                                                    duration: 10
                                                }),
                                                Animated.timing(this.state.opacityOverlay, {
                                                    toValue: 1,
                                                    duration: 35
                                                })
                                            ]).start(() => {
                                                RoomService.getQuestionsForRoom(this.props.roomId, (results) => {
                                                    this.setState({ needsToUpdateUI: true, questions : results })
                                                    this.forceUpdate();
                                                }, (err) => {
                                                    //Do nothing
                                                });
                                            })
                                        }}
                                        style={{flex: 0, padding: 10, marginVertical: 10, height: 'auto', marginVertical: 10, width: '100%'}}>
                                            <Text style={{ backgroundColor: 'transparent', fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(13), color: '#222', textAlign: 'center', alignSelf: 'center' }}>TOCA PARA VER LAS PREGUNTAS</Text>
                                    </TouchableOpacity>

                                </ScrollView>
                            </View>

                            <Animated.View
                                style={{ position: 'absolute', width: '100%', height: '100%', top: this.state.absoluteTop, backgroundColor: '#cd03ff', padding: 10, borderTopColor: 'white', borderTopWidth: 2 }}>

                                { this.state.questions == null &&
                                    <ActivityIndicator
                                        color={'white'} />
                                }

                                { this.state.questions != null && this.state.questions.length > 0 &&
                                    <View
                                        style={{ height: '90%', width: '100%' }}>
                                        <FlatList
                                            data={this.state.questions}
                                            extraData={this.state}
                                            keyExtractor={(item, index) => {
                                                return 'itemQuestion-' + item.id
                                            }}
                                            renderItem={(rowData) => {
                                                return (
                                                    <View
                                                        key={'questionId-' + rowData.item.id}
                                                        style={{ marginVertical: 5, backgroundColor: '#333', padding: 10, borderRadius: 5 }}
                                                        onStartShouldSetResponder={() => true }>
                                                        <Text style={popupStyle.QuestionTitle}>({rowData.index + 1}) Pregunta: {rowData.item.question}</Text>

                                                        { rowData.item.options.map((e) => {

                                                            let backgroundColor = null;
                                                            let isCorrect = e.isCorrect && (rowData.item.selectedOption == e.id);
                                                            if(isCorrect) {
                                                                backgroundColor = '#81db00';
                                                            } else if(e.isCorrect && rowData.item.selectedOption != e.id) {
                                                                backgroundColor = '#81db00';
                                                            } else if(!e.isCorrect && rowData.item.selectedOption != e.id) {
                                                                backgroundColor = 'rgba(0,0,0,.1)';
                                                            } else if(!e.isCorrect && rowData.item.selectedOption == e.id) {
                                                                backgroundColor = '#db2e00';
                                                            }

                                                            return (
                                                                <View key={'questionOption' + e.id} style={[popupStyle.QuestionOptionContainer, { backgroundColor: backgroundColor }]}>
                                                                    <Text style={[popupStyle.QuestionOptionText]}>{ e.name }</Text>
                                                                </View>
                                                            );
                                                        })}

                                                        <TouchableOpacity onPress={() => {

                                                            //Check if question was already sent to revision
                                                            if(this.state.reportedQuestions.indexOf(rowData.item.id) > -1)
                                                                return;

                                                            this.setState({ reportQuestionId : rowData.item.id, needsToUpdateUI : true })

                                                            QuestionService.reportQuestion({
                                                                questionId: rowData.item.id
                                                            }, (success) => {
                                                                let reportedQuestions = this.state.reportedQuestions;
                                                                reportedQuestions.push(rowData.item.id);
                                                                this.setState({ reportedQuestions : reportedQuestions, reportQuestionId: null });
                                                                this.forceUpdate();
                                                            }, (err) => {
                                                                this.setState({ reportQuestionId: null });
                                                            });
                                                        }}>
                                                            { this.state.reportQuestionId == rowData.item.id && this.state.reportedQuestions.indexOf(rowData.item.id) == -1 &&
                                                                <ActivityIndicator
                                                                    style={{ marginVertical: 10 }}
                                                                    color={'white'} />
                                                            }

                                                            { this.state.reportedQuestions.indexOf(rowData.item.id) > -1 &&
                                                                <Text style={[popupStyle.QuestionTitle, { color: Color.GoldenPrimary, marginVertical: 10 }]}>¡Pregunta enviada a revisión!</Text>
                                                            }

                                                            { this.state.reportQuestionId != rowData.item.id && this.state.reportedQuestions.indexOf(rowData.item.id) == -1 &&
                                                                <Text style={[popupStyle.QuestionTitle, { color: Color.GoldenPrimary, marginVertical: 10 }]}>Reportar pregunta</Text>
                                                            }
                                                        </TouchableOpacity>
                                                    </View>
                                                );
                                            }}
                                        />
                                    </View>
                                }
                            </Animated.View>
                        </LinearGradient>
                    </View>
                </Overlay>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    closeButtonContainer: {
        width: '100%',
        position: 'absolute',
        top: 5,
        left: 10,
        color: 'black',
        padding: 15,
    },
    overlayChildren: {
        shadowColor: '#222',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
    },
    innerView: {
        width: '100%',
        alignItems: 'center',
        flexDirection: 'column',
        flex: 1,
        borderRadius: 10,
        paddingVertical: 20
    }
});

const popupStyle = StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    TopTextContainer: {
        justifyContent: 'center',
        flex: 0,
        marginVertical: 10,
    },
    TopText: {
        color: 'white',
        fontFamily: Font.TitanOne,
        fontSize: Global.normalizeFontSize(30),
        textAlign: 'center'
    },
    BottomTextContainer: {
        justifyContent: 'flex-start',
        alignSelf: 'center',
        maxWidth: '70%',
        marginTop: 0,
        flex: 0,
        marginVertical: 10
    },
    BottomText: {
        color: 'white',
        fontFamily: Font.PTSansRegular,
        fontSize: Global.normalizeFontSize(20),
        textAlign: 'center'
    },
    BottomPointsContainer: {
        marginTop: 20,
        flex: 1,
        flexDirection: 'column',
    },
    ImageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 0,
        marginVertical: 0,
    },
    Image: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        marginTop: 10,
    },
    WhiteText: {
        color: '#eee',
        fontSize: Global.normalizeFontSize(18),
        marginVertical: 15
    },
    QuestionTitle: {
        fontFamily: Font.TitanOne,
        textAlign: 'center',
        fontSize: Global.normalizeFontSize(16),
        color: 'white',
        marginVertical: 10
    },
    QuestionOptionContainer: {
        width: '80%',
        alignSelf: 'center',
        paddingVertical: 10,
        marginVertical: 1,
        borderRadius: 5,
        borderWidth: .5,
        borderColor: 'white',
        shadowColor: '#222',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
    },
    QuestionOptionText: {
        fontFamily: Font.TitanOne,
        textAlign: 'center',
        fontSize: Global.normalizeFontSize(13),
        color: 'white'
    }
})