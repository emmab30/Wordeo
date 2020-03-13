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
    ActivityIndicator
} from 'react-native';

import { strings } from '../../components/localization/strings';
import { Navigation } from 'react-native-navigation';
import { Global } from '../../components/common/global';
import { GeneralStyle } from '../../styles/general';
import { Color, Font } from '../../styles/default';

import Moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';

let {height, width} = Dimensions.get('window');

export default class EmoticonItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: true
        }
    }

    componentWillMount() {
        setTimeout(() => {
            this.setState({ spinner : false })
        }, 1500);
    }

    render() {
        return (
            <Animated.View style={[styles.itemContainer]}>
                <TouchableOpacity
                    onPress={() => {
                        if(this.props.onTapEmoticon) {
                            this.props.onTapEmoticon(this.props.keyEmoticon);
                        }
                    }}>
                    <Image source={this.props.image} style={[styles.itemImage]}></Image>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    renderLoading() {
        return (
            <LinearGradient colors={[Color.OrangePrimary, Color.OrangeSecondary]} style={styles.roundPlayerContainer}>
                <ActivityIndicator color={'white'} size={1} />
            </LinearGradient>
        );
    }
}

const styles = StyleSheet.create({
    /* Item related */
    itemContainer: {
        flexDirection: 'column',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10
    },
    itemImage: {
        width: 30,
        height: 30,
        resizeMode: 'contain'
    },
    itemText: {
        backgroundColor: 'transparent',
        fontSize: Global.normalizeFontSize(12),
        color: Color.OrangePrimary,
        textAlign: 'center'
    }
});
