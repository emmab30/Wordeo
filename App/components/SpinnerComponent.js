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
    TouchableHighlight,
    ListView,
    Dimensions,
    ActivityIndicator
} from 'react-native';

/** Image progress **/
import EntranceAfterLaunchScreen from './navigation/EntranceAfterLaunchScreen';
import { Color, Font } from '../styles/default';
import { Global } from './common/global';

import Orientation from 'react-native-orientation';
import * as Animatable from 'react-native-animatable';

// Store width in variable
var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height;

export default class SpinnerComponent extends Component {
    constructor(props) {
        super(props);
        this.onLayoutSpinner = this.onLayoutSpinner.bind(this);

        this.state = this.getInitialState();
    }

    getInitialState() {
        return {
            index: 0,
            type: 'Bounce',
            size: 60,
            color: "#0e68bd",
            isVisible: false,
            width: width,
            height: height
        }
    }

    onLayoutSpinner = (e) => {
        var context = this;
        Global.getOrientation(function(orientation) {
            context.setState({
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height
            })
        });
    }

    getAnimation() {
        return {
            0: {
                scale: 0.5,
                tintColor: Color.OrangePrimary
            },
            0.5: {
                scale: 1.2,
                tintColor: Color.LightPrimary
            },
            1: {
                scale: 0.5,
                tintColor: Color.OrangeSecondary
            }
        }
    }

    show = () => {
        this.refs.dialog.show();
    }

    hide = (cb) => {
        this.refs.dialog.hide(cb);
    }

    render() {
        const { isVisible, text } = this.props;
        return (
            <EntranceAfterLaunchScreen
                { ...this.props }
                ref='dialog' />
        );
    }
}

const styles = StyleSheet.create({
    containerSpinner: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 100000,
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.80)'
    },
    spinner: {
        alignSelf: 'center',
        marginBottom: 10
    },
    imageContainer: {
        backgroundColor: 'rgba(0,0,0,.1)',
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        zIndex: 99
    },
    image: {
        alignSelf: 'center',
        maxWidth: 120,
        resizeMode: 'contain',
        tintColor: '#ddd'
    },
    hidden: {
        display: 'none',
        zIndex: -999999
    },
    normal: {
        display: 'flex',
        zIndex: 9999
    },
    textContainer: {
        backgroundColor: 'rgba(0,0,0,.75)',
        padding: 10,
        width: '70%',
        alignSelf: 'center',
        borderRadius: 10
    },
    text: {
        fontFamily: Font.TitanOne,
        fontSize: Global.normalizeFontSize(18),
        marginTop: 0,
        alignSelf: 'center',
        color: 'white'
    }
});
