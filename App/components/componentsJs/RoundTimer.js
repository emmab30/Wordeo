/**
* Sample React Native App
* https://github.com/facebook/react-native
* @flow
*/

import React, { PureComponent } from 'react';
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

export default class RoundTimer extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            seconds: 0,
            receivedDuration: false
        }
    }

    componentWillMount() {

    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.duration && !this.state.receivedDuration){
            this.setState({ receivedDuration : true });

            var roundStarts = Moment();
            const roundEnds = Moment(roundStarts).add(nextProps.duration, 'seconds');
            var diffInSeconds = roundEnds.diff(Moment(), 'seconds');
            this.setState({ seconds: (diffInSeconds + "s") });

            var interval = setInterval(() => {
                const roundEnds = Moment(roundStarts).add(nextProps.duration, 'seconds');
                let missingInt = (parseInt(roundEnds.diff(Moment(), 'seconds')) + 1);
                var diffInSeconds = missingInt + "s";
                if(missingInt <= 0) {
                    if(interval){
                        if(this.props.onEndCountDown != null)
                            this.props.onEndCountDown()
                        if(interval != null)
                            clearInterval(interval);
                    }
                }
                this.setState({ seconds: diffInSeconds });
            }, 1000);
        }
    }

    render() {
        return (
            <TouchableOpacity
                onPress={() => {}}
                style={{flex: 1, flexDirection: 'row', alignSelf: 'center', justifyContent: 'flex-start', paddingRight: 10, alignItems: 'center', width: '100%', height: '100%'}}>
                <Text style={{backgroundColor: 'transparent', fontSize: Global.normalizeFontSize(18), fontFamily: Font.PTSansRegular, color: '#fff', textAlign: 'right' }}>
                    { this.state.seconds }
                </Text>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({});
