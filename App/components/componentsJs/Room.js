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
import { GeneralStyle } from '../../styles/general';
import { Color, Font } from '../../styles/default';

import moment from 'moment-with-locales-es6';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

let {height, width} = Dimensions.get('window');
var _ = require('lodash');
moment.locale('es');

const RANDOM_PLACEHOLDERS = [
    require("../../images/wordeo/room_placeholders/2.png"),
    require("../../images/wordeo/room_placeholders/3.png"),
    require("../../images/wordeo/room_placeholders/4.png"),
    require("../../images/wordeo/room_placeholders/5.png"),
    require("../../images/wordeo/room_placeholders/6.png"),
    require("../../images/wordeo/room_placeholders/7.png"),
    require("../../images/wordeo/room_placeholders/8.png"),
    require("../../images/wordeo/room_placeholders/9.png"),
    require("../../images/wordeo/room_placeholders/10.png")
];
const NUMBER_PLACEHOLDER_IMAGES = 6;

export default class Room extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: true,
            isPairing: false,
            width: new Animated.Value(width),
            height: new Animated.Value(100),
            opacity: new Animated.Value(0),
            image: RANDOM_PLACEHOLDERS[_.random(0, NUMBER_PLACEHOLDER_IMAGES - 1)],
            usersPlaying: 0,
            room: null,
            needsToUpdateUI: false
        }
    }

    componentWillMount() {

    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.room) {
            if(this.state.room){
                if(!_.isEqual(this.state.room, nextProps.room)) {
                    this.setState({ room : nextProps.room, needsToUpdateUI : true })
                }
            } else {
                this.setState({ room : nextProps.room })
            }
        }
    }

    componentDidMount() {
        this.setState({ spinner : false });

        Animated.parallel([
            Animated.timing(this.state.opacity, {
                toValue: 1,
                duration: 350,
                easing: Easing.Ease
            })
        ]).start();
    }

    _hide = (callback) => {
        Animated.parallel([
            Animated.timing(this.state.opacity, {
                toValue: 1,
                duration: 1000,
                easing: Easing.Ease
            }),
            Animated.timing(this.state.height, {
                toValue: 0,
                duration: 1000,
                easing: Easing.Ease
            })
        ]).start(() => {
            callback();
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.state.needsToUpdateUI){
            this.setState({ needsToUpdateUI : false })
            return true;
        }
        return false;
    }

    getAnimation() {
        if(this.props.room.multiplierExp > 1) {
            return {
                0: {
                    backgroundColor: Color.OrangePrimary
                },
                0.5: {
                    backgroundColor: Color.LightPrimary
                },
                0.75: {
                    backgroundColor: Color.BluePrimary
                },
                1: {
                    backgroundColor: Color.OrangePrimary
                },
            }
        }

        return null;
    }

    render() {
        if(this.state.isPairing){
            return this.renderLoading();
        }

        const { name, players, isProtected } = this.props.room;
        const playing = this.props.room.users.length;
        const multiplier = this.props.room.multiplierExp;
        let readableTime = '';
        try {
            readableTime = _.upperFirst(_.toLower(moment(this.props.room.createdAt).fromNow()))
        } catch(e) {}

        return (
            <Animatable.View
                animation={this.getAnimation()}
                iterationCount={'infinite'}
                duration={1500}
                style={[styles.roomContainer, { backgroundColor: Color.BluePrimary, opacity: this.state.opacity, width : '100%', height: this.state.height }]}>
                <TouchableOpacity
                    style={{flex: 1, flexDirection: 'row', height: '100%', width: '100%'}}
                    onPress={() => {
                        if(this.props.room.multiplierExp > 1) {
                            var confirmationDialog = this.props.getConfirmationDialog();
                            confirmationDialog.show('Sala multiplicadora x' + this.props.room.multiplierExp + '. Generarás ' + this.props.room.multiplierExp + ' veces más de experiencia y de tuls en ésta partida. ¿Quieres entrar?', {
                                onSuccess: () => {
                                    confirmationDialog.hide();
                                    this.props.onTapRoom(this.props.room);
                                },
                                onCancel: () => {
                                    confirmationDialog.hide();
                                }
                            });
                        } else {
                            this.props.onTapRoom(this.props.room)
                        }
                    }}>
                    <View style={styles.roomInfoContainer}>
                        <Image source={this.state.image}
                            style={{flex: 0.5, width: 55, height: 75, resizeMode: 'contain'}} />
                        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={[styles.roomText, { fontSize: Global.normalizeFontSize(18) }]}>{name}</Text>
                            <Text style={[styles.roomText, { fontFamily: Font.PTSansRegular, fontSize: Global.normalizeFontSize(14) }]}>{playing} / {players} jugadores</Text>
                            <Text style={[styles.roomText, { fontFamily: Font.PTSansRegular, fontSize: Global.normalizeFontSize(13) }]}>{this.props.room.hasStarted ? 'Iniciada' : 'Disponible. Toca para unirte'}</Text>
                            <Text style={[styles.roomText, { fontFamily: Font.PTSansRegular, fontSize: Global.normalizeFontSize(12), marginVertical: 0 }]}>{ readableTime }</Text>
                        </View>
                        { this.props.room.multiplierExp > 1 &&
                            <View style={{marginHorizontal: 10, flex: 0, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                                <Text style={[styles.roomText, { fontSize: Global.normalizeFontSize(30) }]}>x{this.props.room.multiplierExp}</Text>
                            </View>
                        }

                        { isProtected &&
                            <View style={{ flex: 0, height: '100%', padding: 10, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                                <Image source={require('../../images/wordeo/room/locked.png')}
                                    style={{opacity: (isProtected ? 1 : .2), width: 25, height: 25, resizeMode: 'contain', tintColor: '#ddd'}} />
                            </View>
                        }
                    </View>
                </TouchableOpacity>
            </Animatable.View>
        );
    }

    renderLoading() {
        return (
            <LinearGradient colors={[Color.OrangePrimary, Color.OrangeSecondary]} style={styles.roomContainer}>
                <ActivityIndicator color={'white'} size={1} />
            </LinearGradient>
        );
    }
}

const styles = StyleSheet.create({
    /** Room related **/
    mainContainer: {
        shadowColor: 'rgba(255,255,255,.8)',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 1,
    },
    roomContainer: {
        flex: 1,
        flexDirection: 'row',
        height: 100,
        maxWidth: '97%',
        alignSelf: 'center',
        backgroundColor: 'transparent',
        marginHorizontal: 5,
        marginVertical: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5
    },
    roomInfoContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    roomText: {
        color: Color.LightPrimary,
        fontFamily: Font.TitanOne,
        fontSize: Global.normalizeFontSize(16)
    },
    basicRoomInfo: {
        flex: 1,
        flexDirection: 'row',
        maxHeight: '100%',
    }
});
