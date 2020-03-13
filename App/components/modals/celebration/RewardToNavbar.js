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
    ScrollView
} from 'react-native';

//Localization
import { strings } from '../../../components/localization/strings';

import Overlay from 'react-native-modal-overlay';
import LinearGradient from 'react-native-linear-gradient';
import { AuthService, PreferencesService } from '../../../services/Services';
import { Color, Font } from '../../../styles/default';
import { GeneralStyle } from '../../../styles/general';

var Sound = require('react-native-sound');
//Sound.setCategory('Playback');

// Store width in variable
var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height;
var _ = require('lodash');

export default class RewardToNavbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAnimationInProgress: false,
            tulsQuestion: 0,
            tulsAccumulated: 0,
            expAccumulated: 0,
            expQuestion: 0,
            soundEnabled: true
        };

        this.topContainer = new Animated.Value(80);
        this.leftContainer = new Animated.Value(80);
        this.scaleContainer = new Animated.Value(1);
        this.opacityContainer = new Animated.Value(0);
        this.earnedTulsSound = new Sound('tuls_sound.mp3', Sound.MAIN_BUNDLE, (err) => {});
    }

    componentWillMount() {

    }

    componentDidMount() {
        PreferencesService.getPreferenceByKey('soundEnabled', (value) => {
            this.setState({ soundEnabled : value })
        });
    }

    onLayout(e) {
        this.setState({height: Dimensions.get('window').height});
    }

    setRandomValues() {
        let randomHeight = Math.floor(Math.random() * height / 2) + (height / 5);
        let randomLeft = Math.floor(Math.random() * 10) + width / 2;
        this.topContainer.setValue(randomHeight)
        this.leftContainer.setValue(randomLeft);
        this.opacityContainer.setValue(.6);
        this.scaleContainer.setValue(0);
    }

    onEarned = (data) => {
        this.setRandomValues();

        this.setState({ isAnimationInProgress : true, tulsAccumulated: data.tulsAccumulated, tulsQuestion: data.tulsQuestion, expAccumulated: data.expAccumulated, expQuestion: data.expQuestion });
        if(this.earnedTulsSound && this.state.soundEnabled) {
            this.earnedTulsSound.play();
        }

        Animated.parallel([
            Animated.spring(this.topContainer, {
                toValue: 0,
                duration: 750
            }),
            Animated.spring(this.leftContainer, {
                toValue: width - 130,
                duration: 750
            }),
            Animated.timing(this.opacityContainer, {
                toValue: 1,
                duration: 900
            }),
            Animated.timing(this.scaleContainer, {
                toValue: 1.3,
                duration: 500
            })
        ]).start(() => {
            Animated.spring(this.scaleContainer, {
                toValue: 0.8
            }).start(() => {
                this.setState({ isAnimationInProgress : false });
            });
        });
    }

    render() {

        return (
            <Animated.View style={[styles.container, { transform: [{ scale: this.scaleContainer}], left: this.leftContainer, top: this.topContainer, opacity: this.opacityContainer}]}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
                    <Text style={{ fontFamily: Font.TitanOne, fontSize: 20, color: 'white', textAlign: 'center' }}>{ this.state.isAnimationInProgress ? ("+" + _.round(this.state.tulsQuestion, 2) + " tuls") : (_.round(this.state.tulsAccumulated, 2) + " tuls") }</Text>
                    <Text style={{ fontFamily: Font.TitanOne, fontSize: 20, color: 'white', textAlign: 'center' }}>{ this.state.isAnimationInProgress ? ("+" + this.state.expQuestion + " exp") : (this.state.expAccumulated + " exp") }</Text>
                </View>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 80,
        bottom: 0,
        left: 80,
        right: 0,
        zIndex: 999,
        width : 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffa312',
        borderRadius: 60,
        shadowColor: 'white',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: .5,
        shadowRadius: 10,
        elevation: 4
    }
})