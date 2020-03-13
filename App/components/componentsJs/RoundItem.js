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

export default class RoundItem extends Component {
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
            <TouchableOpacity
                onPress={() => {
                    if(this.props.onTapItem) {
                        this.props.onTapItem(1); //Id of the item.
                    }
                }}
                style={styles.itemContainer}>
                <Image source={this.props.image} style={styles.itemImage} />
                <View style={styles.itemCountContainer}>
                    <Text style={styles.itemText}>{ this.props.count }</Text>
                </View>
                { /* <Text style={styles.itemText}>Randomizar</Text> */ }
            </TouchableOpacity>
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
        width: 60,
        height: 60,
        borderRadius: 30,
        flexDirection: 'column',
        backgroundColor: Color.OrangePrimary,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10
    },
    itemImage: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        tintColor: 'white'
    },
    itemCountContainer: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderRadius: 12,
        top: -2,
        right: -2,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center'
    },
    itemText: {
        backgroundColor: 'transparent',
        fontSize: Global.normalizeFontSize(12),
        color: Color.OrangePrimary,
        textAlign: 'center'
    }
});
