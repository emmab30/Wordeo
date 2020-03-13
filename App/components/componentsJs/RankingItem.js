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

import Moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';

let {height, width} = Dimensions.get('window');

export default class RankingItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            player: null,
            width: new Animated.Value(0),
            height: new Animated.Value(100),
            opacity: new Animated.Value(0)
        }
    }

    componentWillMount() {

    }

    componentWillReceiveProps(nextProps){
        if(nextProps.player){
            nextProps.player.index = nextProps.index;
            this.setState({ player : nextProps.player });
        }
    }

    componentDidMount() {
        this.setState({ spinner : false });

        Animated.parallel([
            Animated.timing(this.state.width, {
                toValue: width,
                duration: 400,
                easing: Easing.Ease
            }),
            Animated.timing(this.state.opacity, {
                toValue: 1,
                duration: 1000,
                easing: Easing.Ease
            })
        ]).start();
    }

    render() {
        if(this.state.player == null)
            return null;

        if(this.state.player.character != null){
            console.log(this.state.player.character);
        }

        return (
            <LinearGradient colors={[Color.VioletPrimary, Color.VioletSecondary]} style={styles.roomContainer}>
                <View style={{ justifyContent: 'center', alignItems: 'center', position: 'absolute', top: -10, right: -10, borderRadius: 20, width: 40, height: 40, backgroundColor: Color.GoldenPrimary }}>
                    <Text style={{ fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(20), color: 'white' }}>{(this.state.player.index + 1)}</Text>
                </View>
                <TouchableOpacity
                    activeOpacity={1}
                    style={{flex: 1, flexDirection: 'row', height: '100%', width: '100%'}}>
                    <View style={styles.roomInfoContainer}>
                        <Image source={{ uri : this.state.player.character != null ? this.state.player.character : 'https://images.pexels.com/photos/34591/pexels-photo.jpg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260' }}
                            style={{flex: 0.5, height: '100%', resizeMode: 'cover'}} />
                        <View style={{ flexDirection: 'column', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={[styles.roomText, { fontSize: Global.normalizeFontSize(18), fontFamily: Font.TitanOne }]}>{this.state.player.name}</Text>
                            <Text style={[styles.roomText, { fontSize: Global.normalizeFontSize(12), fontFamily: Font.PTSansBold }]}>{this.state.player.experience_points || 0} puntos de exp.</Text>
                            <Text style={[styles.roomText, { fontSize: Global.normalizeFontSize(12), fontFamily: Font.PTSansBold }]}>{Global.formatPrice(this.state.player.balance_tuls || 0)} tuls.</Text>
                            <Text style={[styles.roomText, { fontSize: Global.normalizeFontSize(12), fontFamily: Font.PTSansBold }]}>{this.state.player.totalWins} partidas ganadas de {this.state.player.totalGames} jugadas.</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </LinearGradient>
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
    roomContainer: {
        flex: 1,
        maxWidth: '85%',
        alignSelf: 'center',
        flexDirection: 'row',
        height: 100,
        backgroundColor: 'transparent',
        marginHorizontal: 5,
        marginVertical: 10,
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
        fontFamily: Font.PTSansRegular,
        fontSize: Global.normalizeFontSize(16),
        flex: 0
    },
    basicRoomInfo: {
        flex: 1,
        flexDirection: 'row',
        maxHeight: '100%',
    }
});
