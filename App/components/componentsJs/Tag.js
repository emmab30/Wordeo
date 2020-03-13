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

export default class RoundPlayer extends Component {
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

    componentDidMount() {
        //this.setState({ spinner : false });
    }

    render() {
        if(this.state.spinner){
            return this.renderLoading();
        }

        const { name, avatar } = this.props.player;

        return (
            <LinearGradient colors={[Color.OrangePrimary, Color.OrangeSecondary]} style={styles.roundPlayerContainer}>
                <View style={styles.roundPlayerInfoContainer}>
                    <View style={styles.roundPlayerAvatarContainer}>
                        <Image style={styles.roundPlayerAvatar} source={{ uri : avatar }} />
                    </View>
                    <Text style={styles.roundPlayerNameText}>{name}</Text>
                </View>
            </LinearGradient>
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
    /** Room related **/
    roundPlayerContainer: {
        flex: 1,
        flexDirection: 'row',
        maxWidth: '100%',
        width: '80%',
        padding: 10,
        minHeight: 100,
        height: 100,
        paddingVertical: 5,
        alignSelf: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        marginHorizontal: 5,
        marginVertical: 5,
        borderRadius: 5
    },
    roundPlayerInfoContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    roundPlayerNameText: {
        flex: 1,
        color: Color.LightPrimary,
    },
    roundPlayerAvatarContainer: {
        flex: 0,
        marginRight: 10
    },
    roundPlayerAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    }
});
