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
  Alert,
  KeyboardAvoidingView,
  Dimensions,
  AsyncStorage,
  Keyboard,
  Platform,
  ScrollView,
  Animated
} from 'react-native';

//Localization
import { strings } from '../localization/strings'

import Moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';
import { Color, Font } from '../../styles/default';
import { Global } from '../common/global';
import { ApiUrl } from '../../services/BaseService.js';
import AuthService from '../../services/AuthService.js';
import Helper from '../common/Helper'
import CustomNavbarNotification from './CustomNavbarNotification'

import { Navigation } from 'react-native-navigation';

import DialogConfirmation from '../DialogConfirmation';
import { AnalyticsService, SocketService } from '../../services/Services.js';
import * as Animatable from 'react-native-animatable';

import { CachedImage } from 'react-native-cached-image';

export default class EntranceAfterLaunchScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isVisible : false,
            isMounted : true
        }

        this.circleScale = new Animated.Value(0);
    }

    componentDidMount() {
        //this.setState({ isMounted : true })
    }

    componentWillMount() {
        //Do nothing
    }

    componentWillUnmount() {
        //this.setState({ isMounted: false });
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.isVisible && (this.state.isVisible != nextProps.isVisible)) {
            this.show();
        } else if(nextProps.isVisible == false && (this.state.isVisible == true)) {
            this.hide();
        }
    }

    show = () => {
        if(this.state.isMounted) {
            this.setState({ isVisible : true })
            Animated.spring(this.circleScale, {
                toValue: 1,
                duration: 2000
            }).start();
        }
    }

    hide = (cb) => {
        if(this.state.isMounted) {
            setTimeout(() => {
                if(cb)
                    cb();
            }, 200);
            Animated.spring(this.circleScale, {
                toValue: 2,
                duration: 2000
            }).start(() => {
                this.setState({ isVisible : false })
            });
        }
    }

    getAnimationForContainer() {
        return {
            0: {
                scale: 1.15,
                backgroundColor: Color.BluePrimary
            },
            0.2: {
                scale: 1.10,
                backgroundColor: Color.GoldenPrimary
            },
            0.4: {
                scale: 1,
                backgroundColor: Color.VioletPrimary
            },
            0.6: {
                scale: .95,
                backgroundColor: Color.OrangePrimary
            },
            0.8: {
                scale: 1.20,
                backgroundColor: Color.BluePrimary
            },
            1: {
                scale: 1.20
            }
        }
    }

    getAnimationForLogo() {
        return {
            0: {
                opacity: .9,
                tintColor: '#5080c9'
            },
            0.2: {
                tintColor: '#ca7c00'
            },
            0.4: {
                tintColor: '#fff'
            },
            0.6: {
                opacity: 1,
                tintColor: '#ca7c00'
            },
            0.8: {
                tintColor: '#fea07b'
            },
            1: {
                tintColor: '#5080c9'
            }
        }
    }

    render() {
        if(!this.state.isVisible || !this.state.isMounted)
            return null;

        const opacityInterpolate = this.circleScale.interpolate({
            inputRange: [1, 2],
            outputRange: [1, 0]
        });

        return (
            <Animated.View style={{ zIndex: 100000, position: 'absolute', top: 0, left: 0, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', opacity: opacityInterpolate, backgroundColor: 'rgba(0,0,0,.8)', zIndex: 999}}>
                <Animatable.View animation={this.getAnimationForContainer()} duration={2500} iterationCount={'infinite'} style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: Color.BluePrimary, borderRadius: width / 2, width : width / 2, height: width / 2, transform: [{ scale : this.circleScale }], opacity: opacityInterpolate}}>
                    <Animatable.Image
                        animation={this.getAnimationForLogo()}
                        iterationCount={'infinite'}
                        duration={2500}
                        style={styles.image}
                        source={require('../../images/wordeo/general/logo_transparent.png')} />
                </Animatable.View>
            </Animated.View>
        );
    }
}

var {height, width} = Dimensions.get('window');
const styles = StyleSheet.create({
    image: {
        width: 100,
        height: 100
    }
});