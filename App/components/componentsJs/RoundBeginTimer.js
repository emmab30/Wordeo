/**
* Sample React Native App
* https://github.com/facebook/react-native
* @flow
*/

import React, { PureComponent } from 'react';
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
    Switch,
    Platform,
    Animated,
    FlatList,
    ActivityIndicator
} from 'react-native';

import { strings } from '../../components/localization/strings';
import { Navigation } from 'react-native-navigation';
import { Global } from '../../components/common/global';
import { GeneralStyle } from '../../styles/general';
import { Color, Font } from '../../styles/default';

//Services
import { PreferencesService } from '../../services/Services';

import Moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

var Sound = require('react-native-sound');
Sound.setCategory('Playback');
let {height, width} = Dimensions.get('window');

const FONTSIZE_COUNTDOWN_OFF = 45;
const FONTSIZE_COUNTDOWN_ON = 70;

export default class RoundBeginTimer extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            seconds: 0,
            receivedDuration: false
        }

        this.interval = null;
        this.countDownSound = new Sound('countdown.mp3', Sound.MAIN_BUNDLE, (err) => {});
    }

    componentWillUnmount() {
        if(this.interval){
            console.log("Cleared interval from RoundBeginTimer")
            clearInterval(this.interval);
        }
    }

    componentWillMount() {}

    componentDidMount() {

        //Set if sound
        PreferencesService.getPreferenceByKey('soundEnabled', (value) => {
            this.setState({ soundEnabled : value })
        });

        if(this.props.duration && !this.state.receivedDuration) {
            this.setState({ seconds: this.props.duration, receivedDuration : true });

            this.interval = setInterval(() => {
                let seconds = this.state.seconds - 1;
                if(seconds <= 0) {
                    this.setState({ seconds : seconds })
                    clearInterval(this.interval);
                    this.props.onStart()
                } else if(seconds > 0) {
                    if(this.countDownSound)
                        this.countDownSound.play();

                    this.setState({ seconds : seconds })
                    if(this.numberCountDown != null) {
                        this.numberCountDown.transitionTo({
                            fontSize: FONTSIZE_COUNTDOWN_ON
                        });
                        setTimeout(() => {
                            if(this.numberCountDown != null){
                                this.numberCountDown.transitionTo({
                                    fontSize: FONTSIZE_COUNTDOWN_OFF
                                });
                            }
                        }, 100);
                    }
                }
            }, 1000);
        }
    }

    componentWillReceiveProps(nextProps) {}

    render() {
        return (
            <View style={{ flex: 1, maxHeight: (height / 3), justifyContent: 'flex-start', alignItems: 'center', width: '100%', marginTop: 40 }}>
                <Text style={styles.loadingPairingText}>Comenzando ronda en..</Text>
                <View style={{ zIndex: 9999, width: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 10, overflow: 'hidden' }}>
                    <Animatable.Text style={[styles.loadingPairingText, { backgroundColor: 'rgba(0,0,0,.1)', width: '60%', textAlign: 'center'  }]}
                        ref={(e) => { this.numberCountDown = e } }>{ this.state.seconds }</Animatable.Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    loadingPairingText: {
        marginTop: 20,
        backgroundColor: 'transparent',
        width: '80%',
        textAlign: 'center',
        alignSelf: 'center',
        color: 'white',
        fontFamily: Font.TitanOne,
        fontSize: Global.normalizeFontSize(24)
    }
});
