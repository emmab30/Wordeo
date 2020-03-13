/**
* Sample React Native App
* https://github.com/facebook/react-native
* @flow
*/

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Dimensions,
    AsyncStorage,
    ScrollView,
    Platform,
    Animated,
    FlatList,
    ActivityIndicator,
    ImageBackground,
    BackHandler
} from 'react-native';

//Localization
import { strings } from '../../components/localization/strings';

//Components
import { Global } from '../../components/common/global';
import CustomNavbar from '../../components/navigation/CustomNavbar';
import CustomMenu from '../../components/navigation/CustomMenu'
import SpinnerComponent from '../../components/SpinnerComponent';
import RoundItem from '../../components/componentsJs/RoundItem';

//Plugins
import Orientation from 'react-native-orientation';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';

//Styles
import { Color, Font } from '../../styles/default';

//Services
import { AnalyticsService, PreferencesService } from '../../services/Services';

var Sound = require('react-native-sound');
Sound.setCategory('Playback');

const BackgroundOptionCell = Color.BluePrimary;

var {height, width} = Dimensions.get('window');

export default class InRoundQuestion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            question: {},
            spinner: false,
            isCorrectAnswer: false,
            selectedAnswerIdx: null,
            widthReward: new Animated.Value(0),
            heightReward: new Animated.Value(0),
            blockTaps: false,
            soundEnabled: true
        };

        this.successSound = new Sound('success.mp3', Sound.MAIN_BUNDLE, (err) => {});
        this.errorSound = new Sound('wrong.mp3', Sound.MAIN_BUNDLE, (err) => {});
        this.handleBackButton = this.handleBackButton.bind(this);

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

        AnalyticsService.trackScreenView('in_round_question');
    }

    onNavigatorEvent(event) {
        if (event.id === 'backPress') {
            //Do nothing, we need to prevent this behavior.
        }
    }

    componentWillMount() {
        Orientation.lockToPortrait();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton() {
        //Do nothing. We need to prevent that the user press the back button in Android.
        return false;
    }

    componentDidMount() {
        this.setState({ question: this.props.question });
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

        PreferencesService.getPreferenceByKey('soundEnabled', (value) => {
            this.setState({ soundEnabled : value })
        });
    }

    _onReply = (question) => {
        this.setState({ blockTaps : true })
        let selectedIdx = this.state.question.options.indexOf(question);
        if(this.state.question.options[selectedIdx].isCorrect) {
            AnalyticsService.trackEvent('in_round_reply', {
                correct: true
            });

            if(this.state.soundEnabled)
                this.successSound.play();
            this.setState({ isCorrectAnswer : true, selectedAnswerIdx : selectedIdx })
        } else {
            AnalyticsService.trackEvent('in_round_reply', {
                correct: false
            });

            if(this.state.soundEnabled)
                this.errorSound.play();
            this.setState({ isCorrectAnswer : false, selectedAnswerIdx : selectedIdx })
        }

        var fn = () => {
            this.props.onReplyQuestion({
                categoryId: this.props.categoryId,
                isCorrect: this.state.question.options[selectedIdx].isCorrect ? true : false,
                questionId: this.state.question.id,
                optionId: this.state.question.options[selectedIdx].id,
                profitExp: this.state.question.profitExp
            });
            this.props.navigator.pop();
        }

        if(Platform.OS === 'android') {
            setTimeout(() => {
                fn();
            }, 0);
        } else {
            fn();
        }
    }

    render() {
        let isCorrect = false;
        let gradientColors = [];
        if(this.state.selectedAnswerIdx != null && this.state.selectedAnswerIdx >= 0) {
            if(this.state.isCorrectAnswer) {
                isCorrect = true;
                gradientColors = ['#24e571', '#24e551'];
            } else {
                gradientColors = ['#e15c3e', '#e54824'];
            }
        }

        return (
            <View
                style={{ flex: 1, width: '100%', height: '100%', justifyContent: 'center', backgroundColor: 'rgba(22,22,22,1)' }}>

                <ImageBackground
                    source={require('../../images/wordeo/general/background.jpg')}
                    style={styles.mainContainer}>
                    <View style={[styles.questionBox]}>
                        { this.state.question.photoURL != null &&
                            <Animatable.View useNativeDriver={true} animation={'zoomIn'} duration={800} style={{ flex: 1, padding: 0, margin: 0, width: '100%', alignSelf: 'center', overflow: 'hidden' }}>
                                <Image source={{ uri : this.state.question.photoURL }}
                                    style={{ width: '100%', height: '100%', resizeMode: 'cover', overflow: 'hidden' }} />
                            </Animatable.View>
                        }
                        <View style={{flex: 1, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: Color.LightPrimary, backgroundColor: 'transparent', fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(25), textAlign: 'center' }}> { this.state.question.question }</Text>
                        </View>
                    </View>

                    <View style={styles.repliesBox}>
                        <FlatList
                            scrollEnabled={false}
                            contentContainerStyle={{ flex: 0 }}
                            centerContent={false}
                            snapToAlignment={'start'}
                            data={this.state.question.options}
                            renderItem={(rowData) => {
                                return (
                                    <Animatable.View key={'questionId-' + rowData.item.id} animation={'fadeIn'} style={[styles.replyOptionContainer]}>
                                        <LinearGradient
                                            start={{x: 0.0, y: 0.35}} end={{x: 1, y: 1}}
                                            style={{ borderRadius: 10, width: '100%', height: '100%' }} colors={(gradientColors.length > 0 && (rowData.index == this.state.selectedAnswerIdx) ? gradientColors : [this.props.gradientFrom, this.props.gradientTo])}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    if(this.state.blockTaps)
                                                        return;

                                                    this._onReply(rowData.item);
                                                }}
                                                style={{ width: '100%', height: '100%', flex: 1, justifyContent: 'center' }}>
                                                <Text style={styles.replyOptionText}>{rowData.item.name}</Text>
                                            </TouchableOpacity>
                                        </LinearGradient>
                                    </Animatable.View>
                                );
                            }}
                        />
                    </View>

                    { /* <ScrollView
                        horizontal
                        style={styles.items}
                        contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <RoundItem
                            count={10}
                            image={{ uri : 'https://cdn1.iconfinder.com/data/icons/free-98-icons/32/back-256.png'}}/>
                        <RoundItem
                            count={5}
                            image={{ uri : 'https://cdn2.iconfinder.com/data/icons/font-awesome/1792/random-256.png'}}/>
                        <RoundItem
                            count={4}
                            image={{ uri : 'https://cdn2.iconfinder.com/data/icons/smileys-for-fun-2/512/confused_emoji_smiley_emotion-256.png'}}/>
                        <RoundItem
                            count={1}
                            image={{ uri : 'https://cdn3.iconfinder.com/data/icons/picons-social/57/06-facebook-256.png'}}/>
                    </ScrollView> */ }
                </ImageBackground>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,.2)'
    },
    questionBox: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center'
    },
    repliesBox: {
        flex: 0,
        marginBottom: 30,
        justifyContent: 'space-around',
        marginHorizontal: 20,
    },
    replyOptionContainer: {
        width: '100%',
        height: 60,
        marginVertical: 3,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderRadius: 10
    },
    replyOptionText: {
        backgroundColor: 'transparent',
        fontFamily: Font.TitanOne,
        textAlign: 'center',
        fontSize: Global.normalizeFontSize(18),
        padding: 5,
        color: 'white'
    },
    items: {
        flex: 0.5,
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        width: '100%'
    }
});
