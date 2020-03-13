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
import { AuthService } from '../../../services/Services';
import { Color, Font } from '../../../styles/default';
import { GeneralStyle } from '../../../styles/general';

var Sound = require('react-native-sound');
Sound.setCategory('Playback');

// Store width in variable
var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height;

const POINTS_PER_STREAK = 100;

export default class StreakCorrectReward extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAnimationInProgress: false,
            tulsQuestion: 0,
            tulsAccumulated: 0,
            expAccumulated: 0,
            expQuestion: 0
        };

        this.topContainer = new Animated.Value(Math.floor(Math.random() * 0) + 150);
        this.opacityContainer = new Animated.Value(0);
    }

    componentWillMount() {

    }

    onLayout(e) {
        this.setState({height: Dimensions.get('window').height});
    }

    setRandomValues() {
        let randomHeight = Math.floor(Math.random() * 0) + 150;
        this.topContainer.setValue(randomHeight)
        this.opacityContainer.setValue(.6);
    }

    onEarned = (data) => {
        this.setRandomValues();

        this.setState({ isAnimationInProgress : true, tulsAccumulated: data.tulsAccumulated, tulsQuestion: data.tulsQuestion, expAccumulated: data.expAccumulated, expQuestion: data.expQuestion });

        Animated.parallel([
            Animated.spring(this.topContainer, {
                toValue: Math.floor(Math.random() * 0) + 150,
                duration: 750
            }),
            Animated.timing(this.opacityContainer, {
                toValue: 1,
                duration: 900
            })
        ]).start(() => {
            setTimeout(() => {
                Animated.spring(this.opacityContainer, {
                    toValue: 0
                }).start();
                this.setState({ isAnimationInProgress : false });
            }, 750);
        });
    }

    render() {

        return (
            <Animated.View style={[styles.container, { left: '10%', top: this.topContainer, opacity: this.opacityContainer}]}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
                    <Text style={{ fontFamily: Font.TitanOne, fontSize: 20, color: 'white' }}>+{POINTS_PER_STREAK} por seguidilla!</Text>
                </View>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 20,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        width : '75%',
        height: 40,
        opacity: .7,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Color.BluePrimary,
        borderRadius: 40,
        shadowColor: 'white',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: .5,
        shadowRadius: 10,
        elevation: 4
    }
})