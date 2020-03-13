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
import { CachedImage } from 'react-native-cached-image';

let {height, width} = Dimensions.get('window');
var _ = require('lodash');

const STYLES_AVAILABLE = [
    { image: require("../../images/wordeo/room_placeholders/1.png"), gradientFrom: '#fd5644', gradientTo: '#ea3232' },
    { image: require("../../images/wordeo/room_placeholders/2.png"), gradientFrom: '#bfd920', gradientTo: '#a3ad44' },
    { image: require("../../images/wordeo/room_placeholders/3.png"), gradientFrom: '#fc9b00', gradientTo: '#ff7900' },
    { image: require("../../images/wordeo/room_placeholders/4.png"), gradientFrom: '#1cb2c0', gradientTo: '#8ed3d8' },
    { image: require("../../images/wordeo/room_placeholders/5.png"), gradientFrom: '#fcc105', gradientTo: '#ff6652' },
    { image: require("../../images/wordeo/room_placeholders/6.png"), gradientFrom: '#d576ea', gradientTo: '#8f3da3' },
    { image: require("../../images/wordeo/room_placeholders/7.png"), gradientFrom: '#ea9a32', gradientTo: '#c66e17' },
    { image: require("../../images/wordeo/room_placeholders/8.png"), gradientFrom: '#222', gradientTo: '#fff' },
    { image: require("../../images/wordeo/room_placeholders/9.png"), gradientFrom: '#222', gradientTo: '#fff' },
    { image: require("../../images/wordeo/room_placeholders/10.png"), gradientFrom: '#222', gradientTo: '#fff' },
];
const NUMBER_PLACEHOLDER_IMAGES = 7;

export default class RoundCategory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: true,
            category: {},
            needsToUpdateUI: false,
            desiredPoints: _.random(25, 100)
        }

        this.onTapCategory = this.onTapCategory.bind(this);
    }

    componentWillMount() {
        setTimeout(() => {
            this.setState({ spinner : false })
        }, 1500);
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.category){
            if(!_.isEqual(nextProps.category, this.state.category)) {
                this.setState({ category : nextProps.category, needsToUpdateUI: true })
            }
        }
    }

    shouldComponentUpdate() {
        if(this.state.needsToUpdateUI){
            this.setState({ needsToUpdateUI : false })
            return true;
        }
        return true;
    }

    onTapCategory() {
        if(this.props.isLastSelected)
            return;

        if(this.props.onTapCategory) {
            setTimeout(() => {
                let random = _.random(10, 100);
                this.setState({ desiredPoints : random, needsToUpdateUI: true })
            }, 1500);
            this.props.onTapCategory(this.state.category.id, {
                gradientFrom: STYLES_AVAILABLE[this.props.index].gradientFrom,
                gradientTo: STYLES_AVAILABLE[this.props.index].gradientTo,
                desiredPoints: this.state.desiredPoints
            });
        }
    }

    render() {

        var colorPoints = 'red';
        if(this.state.desiredPoints > 30 && this.state.desiredPoints < 70) {
            colorPoints = Color.GoldenPrimary;
        } else if(this.state.desiredPoints > 70) {
            colorPoints = Color.GreenPrimary;
        }

        return (
            <LinearGradient
                style={{flexDirection: 'row', height: 100, marginBottom: 3, flex: 1, width: '100%', paddingVertical: 0, borderRadius: 10 }}
                colors={[STYLES_AVAILABLE[this.props.index].gradientFrom, STYLES_AVAILABLE[this.props.index].gradientTo]}>
                { this.props.innerContent && this.props.innerContent() }
                <TouchableOpacity
                    activeOpacity={.55}
                    onPress={_.debounce(this.onTapCategory, 300, { leading : true, trailing : false })}
                    style={{ width: '100%', height: '100%', backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            style={{ flex: 0.3, resizeMode: 'contain', marginLeft: 5, height: '100%', width: '100%', borderRadius: 0, marginBottom: 5, resizeMode: 'contain' }}
                            source={STYLES_AVAILABLE[this.props.index].image} />
                        <Text style={{ flex: 1, backgroundColor: 'transparent', marginLeft: 20, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(18), color: '#222', color: Color.LightPrimary, marginVertical: 10, textAlign: 'left' }}>{ this.state.category.name }</Text>
                        <View style={{ flex: 0.3, marginRight: 10, marginVertical: 10, backgroundColor: 'rgba(255,255,255,.9)', borderRadius: 10, height: '60%', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(20), color: colorPoints, textAlign: 'center' }}>+{this.state.desiredPoints} exp</Text>
                        </View>
                </TouchableOpacity>
            </LinearGradient>
        );
    }
}

const styles = StyleSheet.create({

});
