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
    ScrollView,
    Platform,
    ImageBackground
} from 'react-native';

//Localization
import { strings } from '../../components/localization/strings'

//Components
import SpinnerComponent from '../../components/SpinnerComponent';
import { Navigation } from 'react-native-navigation';
import { ApiUrl } from '../../services/BaseService.js';
import { Global } from '../../components/common/global';
import Helper from '../../components/common/Helper';

//Styles
import { Color, Font } from '../../styles/default';
import { GeneralStyle } from '../../styles/general'
import { DemoStyle } from '../../styles/demo'

//Services
import { AuthService, AnalyticsService } from '../../services/Services.js';

//Plugins
import { CachedImage } from 'react-native-cached-image';
import LinearGradient from 'react-native-linear-gradient';
import Orientation from 'react-native-orientation';

export default class Tutorial extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: false,
            currentDot: '1',
            dotBackgroundColorInactive: 'rgba(255,255,255,.5)',
            dotBackgroundColorActive: 'rgba(255,255,255,1)'
        };

        this.offset = 0;

        this.onStartNow = this.onStartNow.bind(this);
        this.onNext = this.onNext.bind(this);
        //this._handlePressImage = this._handlePressImage.bind(this);

        AnalyticsService.trackScreenView('demo_step_1');
        AnalyticsService.trackEvent('tutorial_begin');
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together

    }

    onStartNow() {
        this.props.navigator.dismissModal();
    }

    componentDidMount() {
        Orientation.lockToPortrait();
    }

    componentWillUnmount() {
        Orientation.unlockAllOrientations();
    }

    changeActiveDot(event){
        var currentOffset = event.nativeEvent.contentOffset.x;
        this.offset = currentOffset;
        if(this.offset < "1") {
            AnalyticsService.trackScreenView('demo_tutorial_1');
            this.setState({ currentDot: '1' });
        }
        if(this.offset == width) {
            AnalyticsService.trackScreenView('demo_tutorial_2');
            this.setState({ currentDot: '2' });
        }
        if(this.offset == width * 2) {
            AnalyticsService.trackScreenView('demo_tutorial_3');
            this.setState({ currentDot: '3' });
        }
        if(this.offset == width * 3) {
            AnalyticsService.trackScreenView('demo_tutorial_4');
            this.setState({ currentDot: '4' });
        }
    }

    onNext() {
        const offset = this.offset + width;
        if(this.refs.scrollView) {
            this.refs.scrollView.scrollTo({
                x: (parseInt(offset / width) * width),
                y: 0
            })
        }
    }

    render() {
        let classDotActive = DemoStyle.active;
        let classDotInactive = DemoStyle.inactive;

        if(this.state.currentDot == 1) {
            classDotActive = {backgroundColor: '#0084ff'};
            classDotInactive = {backgroundColor: 'rgba(0,0,0,0.09)'};
        }

        /* const language = strings.getLanguage();
        let demo2 = require('../../images/demo/demo-2-bg_en.png');
        let demo3 = require('../../images/demo/demo-3-bg_en.png');
        let demo4 = require('../../images/demo/demo-4-bg_en.png');
        if(language == 'es') {
            demo2 = require('../../images/demo/demo-2-bg_es.png');
            demo3 = require('../../images/demo/demo-3-bg_es.png');
            demo4 = require('../../images/demo/demo-4-bg_es.png');
        }

        //IPhone X special resources
        if(Helper.isIphoneX()) {
            if(language == 'es') {
                demo2 = require('../../images/demo/demo-2-bg_es_iphoneX.png');
                demo3 = require('../../images/demo/demo-3-bg_es_iphoneX.png');
                demo4 = require('../../images/demo/demo-4-bg_es_iphoneX.png');
            } else {
                demo2 = require('../../images/demo/demo-2-bg_en_iphoneX.png');
                demo3 = require('../../images/demo/demo-3-bg_en_iphoneX.png');
                demo4 = require('../../images/demo/demo-4-bg_en_iphoneX.png');
            }
        } */

        return (
            <View style={[DemoStyle.container, { position: 'relative' }]}>
                <SpinnerComponent
                    ref={'spinner'}
                />

                <ScrollView
                    ref='scrollView'
                    contentContainerStyle={{width: width * 2, height: height }}
                    style={{flex: 1, height: height}}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled={true}
                    scrollEventThrottle={200}
                    onScrollEndDrag={(evt) => {

                    }}
                    decelerationRate={0.5}
                    snapToInterval={0.5}
                    scrollEnabled={true}
                    onScroll={this.changeActiveDot.bind(this)}>

                    <CachedImage
                        source={require('../../images/wordeo/login/background.jpg')}
                        style={DemoStyle.bgImageContainer}>

                        <View style={{flex: 8, justifyContent: 'center', alignItems: 'center'}}>
                            <View style={{flex: 4, width: '80%', justifyContent: 'center', alignItems: 'center', marginTop: 30}}>
                                <Text style={{textAlign: 'center', backgroundColor: 'transparent', color: Color.GoldenPrimary, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(35)}}>Hey!</Text>
                                <Text style={{textAlign: 'center', backgroundColor: 'transparent', color: '#7f7f7f', fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(16)}}>Quiero recordarte como debes hacer para crear una sala y jugar con tus amigos.</Text>
                                <Text style={{textAlign: 'center', backgroundColor: 'transparent', color: '#7f7f7f', fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(16)}}>Desliza para tu derecha y descubrirás como hacerlo.</Text>
                            </View>
                        </View>
                    </CachedImage>

                    <CachedImage
                        source={require('../../images/wordeo/demo/create_room.jpg')}
                        style={[DemoStyle.bgImageContainer]}>

                    </CachedImage>

                </ScrollView>

                <TouchableOpacity
                    onPress={() => {
                        this.props.navigator.dismissModal()
                    }}
                    style={{position: 'absolute', left: 5, top: 5, zIndex: 9999}}>
                    <Text style={{textAlign: 'center', backgroundColor: 'transparent', color: Color.BluePrimary, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(23), padding: 10, backgroundColor: Color.BluePrimary, color: 'white', borderRadius: 5}}>OMITIR</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

var {height, width} = Dimensions.get('window');