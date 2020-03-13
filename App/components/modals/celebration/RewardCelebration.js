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

export default class RewardCelebration extends Component {
    constructor(props) {
        super(props);
        this.state = {
            height: height,
            user: null,
            isVisible: false,
            needsToUpdateUI: false,
            title: '',
            text: ''
        };

        this.winnerSound = new Sound('finish_round_success.mp3', Sound.MAIN_BUNDLE, (err) => {});
    }

    componentWillMount() {

    }

    onLayout(e) {
        this.setState({height: Dimensions.get('window').height});
    }

    componentWillReceiveProps(nextProps) {

    }

    show = (title, text) => {
        this.winnerSound.play();
        this.setState({ isVisible : true, needsToUpdateUI: true, title: title, text: text })
        this.forceUpdate();
    }

    shouldComponentUpdate(){
        if(this.state.needsToUpdateUI) {
            this.setState({ needsToUpdateUI : false });
            return true;
        }
        return false;
    }

    render() {
        if(!this.state.isVisible)
            return null;

        let gradientColors = ['#ff6000', '#ff7800'];
        let translatedLevelUp = '';
        let image = null;

        return (
            <View
                onLayout={this.onLayout.bind(this)}>
                <Overlay visible={true}
                    closeOnTouchOutside
                    animationType={'fadeInDown'}
                    animationOutType={'none'}
                    animationDuration={300}
                    onClose={() => {
                        this.setState({ isVisible : false, needsToUpdateUI: true })
                        this.forceUpdate();
                    }}
                    containerStyle={{backgroundColor: 'rgba(250, 250, 250, 0.90)', flex: 1, width: '100%'}}
                    childrenWrapperStyle={[styles.overlayChildren, {padding: 0, borderRadius: 10, width: '100%', maxHeight: height / 1.5, overflow: 'hidden'}]} >
                    <View style={{ width: '100%', height: '100%', overflow: 'hidden'}} onStartShouldSetResponder={() => { return true; }}>
                        <LinearGradient style={[styles.innerView]} colors={gradientColors}>
                            <View
                                style={{ position: 'relative', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>

                                <TouchableOpacity
                                    style={{ width: '100%', height: 'auto' }}>
                                    <View style={popupStyle.ImageContainer}>
                                        <Image
                                            style={popupStyle.Image}
                                            source={{ uri: 'https://cdn0.iconfinder.com/data/icons/geek-2/24/Domo_Kun_character-256.png' }}
                                        />
                                    </View>
                                </TouchableOpacity>
                                <View style={popupStyle.TopTextContainer}>
                                    <Text style={[popupStyle.TopText, GeneralStyle.transparentText]}>{ this.state.title }</Text>
                                </View>
                                <View style={popupStyle.BottomTextContainer}>
                                    <Text style={[popupStyle.BottomText, GeneralStyle.transparentText]}>
                                        { this.state.text }
                                    </Text>
                                </View>
                            </View>
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