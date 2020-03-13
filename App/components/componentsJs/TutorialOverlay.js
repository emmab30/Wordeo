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
    Switch,
    Platform,
    Animated,
    FlatList,
    ActivityIndicator,
    Easing
} from 'react-native';

import { strings } from '../../components/localization/strings';
import { Navigation } from 'react-native-navigation';
import { Global } from '../../components/common/global';
import SpinnerComponent from '../../components/SpinnerComponent'
import CommonDialog from '../../components/dialogs/CommonDialog'
import { GeneralStyle } from '../../styles/general';
import { Color, Font } from '../../styles/default';

import { NotificationService } from '../../services/Services'

import Moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';
import Overlay from 'react-native-modal-overlay';

let {height, width} = Dimensions.get('window');
var _ = require('lodash');

export default class TutorialOverlay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            elementX: new Animated.Value(0),
            elementY: new Animated.Value(0),
            elementWidth: new Animated.Value(0),
            elementHeight: new Animated.Value(0),
            x: new Animated.Value(0),
            y: new Animated.Value(0),
            text: '',
            isVisible: false,
            needsToUpdateUI: true,
            isAnimating: true
        }
    }

    componentWillMount() {

    }

    componentWillReceiveProps(nextProps) {

    }

    hide = () => {
        this.setState({ isVisible : false, needsToUpdateUI : true })
        this.forceUpdate();
    }

    showTutorial = (data) => {
        this.setState({ text : data.text, isVisible: true, isAnimating: true, needsToUpdateUI: true })

        Animated.parallel([
            Animated.spring(this.state.elementX, {
                toValue: data.elementX,
                duration: 300
            }),
            Animated.spring(this.state.elementY, {
                toValue: data.elementY,
                duration: 300
            }),
            Animated.spring(this.state.elementWidth, {
                toValue: data.elementWidth,
                duration: 300
            }),
            Animated.spring(this.state.elementHeight, {
                toValue: data.elementHeight,
                duration: 300
            })
        ]).start(() => {
            var x, y;
            if(data.elementY > height / 2) {
                y = data.elementY - 20;
                x = data.elementX / 2;
            } else {
                y = data.elementY + 20;
                x = data.elementX / 2;
            }

            Animated.parallel([
                Animated.spring(this.state.x, {
                    toValue: x
                }),
                Animated.spring(this.state.y, {
                    toValue: y
                })
            ]).start(() => {
                this.setState({ isAnimating : false })
            });
        });
        //this.setState({ animated });
    }

    shouldComponentUpdate() {
        if(this.state.needsToUpdateUI && !this.state.isAnimating) {
            this.setState({ needsToUpdateUI : false })
            return true;
        }
        return false;
    }

    render() {
        if(!this.state.isVisible)
            return null;

        return (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: '100%', width: '100%', backgroundColor: 'rgba(0,0,0,.6)', zIndex: 10 }}>
                <TouchableOpacity
                    onPress={() => {
                        this.hide();
                    }}
                    style={{ position: 'absolute', right: 10, top: 10, backgroundColor: Color.GoldenPrimary, borderRadius: 5, padding: 10 }}>
                    <Text style={{ fontSize: 13, fontFamily: Font.TitanOne, color: 'white'}}>¡OK, LO ENTENDÍ!</Text>
                </TouchableOpacity>

                <Animated.View style={{ width : '100%', height: '100%', position: 'absolute', left: this.state.elementX, top: this.state.elementY, width: this.state.elementWidth, height: this.state.elementHeight, backgroundColor: 'rgba(255,255,255,.5)', borderWidth: 1, borderColor: Color.GoldenPrimary, borderRadius: 30 }}></Animated.View>
                <Animated.View style={{ width : '100%', height: '100%', position: 'absolute', left: this.state.x, top: this.state.y, width: 'auto', maxWidth: (width - this.state.x._value - 50), height: 'auto', padding: 10, backgroundColor: 'transparent', borderRadius: 10 }}>
                    <Text style={{ textAlign: 'center', fontSize: Global.normalizeFontSize(17), color: Color.GoldenPrimary, fontFamily: Font.TitanOne }}>{ this.state.text }</Text>
                </Animated.View>
            </View>
        );
    }
}

const styles = StyleSheet.create({

});