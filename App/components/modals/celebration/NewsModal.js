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
import CommonDialog from '../../../components/dialogs/CommonDialog';
import { AuthService, RoomService, QuestionService } from '../../../services/Services';
import { Color, Font } from '../../../styles/default';
import { GeneralStyle } from '../../../styles/general';
import { Global } from '../../../components/common/global';

//Services
import { NewsService } from '../../../services/Services';

var Sound = require('react-native-sound');
Sound.setCategory('Playback');

// Store width in variable
var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height;
var _ = require('lodash')

export default class NewsModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            height: height,
            user: null,
            isVisible: false,
            needsToUpdateUI: false,
            news: [],
            newsProcessed: false,
            isTappingButton: false
        };
    }

    componentWillMount() {

    }

    onLayout(e) {
        this.setState({height: Dimensions.get('window').height});
    }

    componentWillReceiveProps(nextProps) {

    }

    show = (news) => {
        this.setState({ isVisible : true, needsToUpdateUI: true, news: news })
    }

    hide = () => {
        this.setState({ isVisible : false, needsToUpdateUI: true, news: news })
    }

    shouldComponentUpdate(nextProps, nextState){
        return nextState.needsToUpdateUI ||
            (nextState.isTappingButton != this.state.isTappingButton) ||
            (nextState.isVisible != this.state.isVisible) ||
            (!_.isEqual(nextState.news, this.state.news));
    }

    render() {
        if(!this.state.isVisible)
            return null;

        let gradientColors = ['#0575E6', '#021B79'];
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
                        this.setState({ isVisible: false, needsToUpdateUI: true })
                        this.forceUpdate();
                    }}
                    containerStyle={{backgroundColor: 'rgba(250, 250, 250, 0.90)', flex: 1, width: '100%'}}
                    childrenWrapperStyle={[styles.overlayChildren, {padding: 0, borderRadius: 10, width: '100%', maxHeight: height / 1.2, overflow: 'hidden'}]} >
                    <View
                        onStartShouldSetResponder={() => true}
                        style={{ width: '100%', height: '100%', overflow: 'hidden'}}>

                        <CommonDialog
                            ref='dialog' />

                        <LinearGradient
                            style={[styles.innerView]} colors={gradientColors}>

                            <Text style={[popupStyle.TopText, {flex:0}, GeneralStyle.transparentText]}>¡NOTICIAS!</Text>

                            <View
                                style={{ flex: 1, width: '100%', maxWidth: '98%', backgroundColor: 'rgba(255,255,255,.1)', borderRadius: 5, marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>

                                { this.state.news.length > 1 &&
                                    <Image
                                        source={{ uri: 'https://cdn3.iconfinder.com/data/icons/faticons/32/arrow-right-01-256.png' }}
                                        style={{ position: 'absolute', right: 0, width: 30, height: 30, alignSelf: 'center', tintColor: 'white' }} />
                                }

                                <ScrollView
                                    ref={'scrollView'}
                                    style={{ height: '100%' }}
                                    pagingEnabled={true}
                                    contentContainerStyle={{ width: (parseInt(this.state.news.length * 100) + '%'), height: '100%', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}
                                    horizontal={true}
                                    scrollEnabled={true}>
                                    { this.renderNews() }
                                </ScrollView>
                            </View>
                        </LinearGradient>
                    </View>
                </Overlay>
            </View>
        );
    }

    renderNews() {
        let news = this.state.news;
        let views = [];
        for(var idx in news) {
            const item = news[idx];
            const newsItem = JSON.parse(item.payload);
            views.push(
                <ScrollView
                    contentContainerStyle={{ marginBottom: 20 }}
                    style={styles.newsItem}>
                    <Text style={[styles.newsText, { fontSize: 20 }]}>{newsItem.title}</Text>
                    <Text style={styles.newsText}>{newsItem.texto}</Text>

                    {
                        this.state.isTappingButton &&
                            <ActivityIndicator style={{ marginVertical: 10 }} color={'white'} />
                    }

                    <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}}>
                        { newsItem.buttons && newsItem.buttons.length > 0 && newsItem.buttons.map((e) => {
                            return (
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({ isTappingButton: true })
                                        NewsService.onTapNewsButton({
                                            newsId: item.id,
                                            buttonId: e.id
                                        }, (data) => {
                                            this.setState({ isTappingButton: false })

                                            var _spliceNews = () => {
                                                //Splice
                                                let news = this.state.news;
                                                if(news) {
                                                    news.splice(news.indexOf(item), 1)
                                                    this.setState({ news: news, needsToUpdateUI: true })
                                                    this.forceUpdate();

                                                    if(news.length == 0){
                                                        this.setState({ isVisible : false, needsToUpdateUI: true })
                                                        this.forceUpdate();
                                                    } else {
                                                        setTimeout(() => {
                                                            this.refs.scrollView.scrollTo({x: 0, y: 0, animated: true});
                                                            this.forceUpdate();
                                                        }, 500);
                                                    }
                                                }
                                            }

                                            if(data.message != null) {
                                                this.refs.dialog.show('success', data.message, () => {
                                                    _spliceNews();
                                                });
                                            } else {
                                                _spliceNews();
                                            }
                                        }, (err) => {})
                                    }}
                                    style={styles.newsButton}>
                                    <Text style={{ textAlign : 'center', color: 'white', fontSize: Global.normalizeFontSize(17), fontFamily: Font.TitanOne, borderRadius: 10 }}>{e.text}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
            );
        }

        return views;
    }
}

const styles = StyleSheet.create({
    newsItem: {
        flex: 1,
        marginHorizontal: 2,
        width: '100%',
        height: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,.1)',
        shadowColor: 'rgba(255,255,255,.5)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
        padding: 5,
    },
    newsText: {
        marginTop: 10,
        flex: 0,
        textAlign: 'center',
        fontSize: Global.normalizeFontSize(14),
        color: 'white',
        fontFamily: Font.TitanOne,
    },
    newsButton: {
        flex: 1,
        backgroundColor: Color.GreenPrimary,
        padding: 10,
        marginVertical: 10,
        maxWidth: '80%',
        alignSelf: 'center',
        borderRadius: 10
    },
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
        flex: 0
    },
    TopText: {
        color: 'white',
        fontFamily: Font.TitanOne,
        fontSize: Global.normalizeFontSize(20),
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