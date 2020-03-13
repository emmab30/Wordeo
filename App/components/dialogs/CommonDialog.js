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
    Button
} from 'react-native';

import Overlay from 'react-native-modal-overlay';
import { Color, Font } from '../../styles/default';

import { Global } from '../../components/common/global';

// Store width in variable
var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height;

export default class CommonDialog extends Component {

    constructor(props) {
        super(props);
        this.state = {
            height: height,
            isLandscape: false,
            visible: false,
            dialogType: 'success',
            message: '',
            heightInnerViewContent: 0,
            randomAvatar: null,
            onCloseCallback: null
        };
    }

    componentWillUpdate() {

    }

    onLayout(e) {
        this.setState({height: Dimensions.get('window').height});

        Global.getOrientation((orientation) => {
            this.setState({
                isLandscape: (orientation == 'LANDSCAPE')
            })
        });
    }

    getRandomAvatar() {
        let avatars = [
            'https://cdn2.iconfinder.com/data/icons/cutecritters/t9elephant_trans.png',
            'https://cdn2.iconfinder.com/data/icons/cutecritters/t9lion_trans.png',
            'https://cdn2.iconfinder.com/data/icons/cutecritters/t9foxy_trans.png',
            'https://cdn2.iconfinder.com/data/icons/cutecritters/t9dog1_trans.png',
            'https://cdn2.iconfinder.com/data/icons/cutecritters/t9batty_trans.png',
            'https://cdn2.iconfinder.com/data/icons/cutecritters/t9ducky_trans.png',
            'https://cdn2.iconfinder.com/data/icons/cutecritters/t9froggy_trans.png',
            'https://cdn2.iconfinder.com/data/icons/cutecritters/t9panda_trans.png'
        ];

        return avatars[Math.floor(Math.random()*avatars.length)];
    }

    onLayoutTextMessage(e) {
        var {x, y, width, height} = e.nativeEvent.layout;
        if(height != null) {
            this.setState({ heightInnerViewContent : height + 130 });
        }
    }

    hide = () => {
        this.setState({ visible : false, dialogType : null, message : null, randomAvatar: null, onCloseCallback : null })
    }

    show = (type, message, onClose) => {
        this.setState({ visible : true, dialogType: type, message: message, randomAvatar: this.getRandomAvatar(), onCloseCallback : onClose })
    }

    reset() {
        this.setState({ dialogType : 'success', message: '', visible: false })
    }

    render() {
        if(!this.state.visible)
            return null;

        let avatar = { uri : this.state.randomAvatar };
        let backgroundOverlayColor = 'rgba(255, 90, 0, 0.55)';
        let extraMessageStyle = {};

        if(this.state.dialogType == 'error') {
            backgroundOverlayColor = 'rgba(6,119,255,.75)';
        }

        return (
            <View
                onLayout={this.onLayout.bind(this)}>
                <Overlay
                    ref={'overlay'}
                    visible={this.state.visible}
                    closeOnTouchOutside
                    easing={'ease-in-quart'}
                    animationType={'rubberBand'}
                    animationOutType={'zoomOut'}
                    animationDuration={300}
                    onClose={() => {
                        if(this.state.onCloseCallback){
                            this.state.onCloseCallback()
                        }
                        this.setState({ visible : false })
                    }}
                    containerStyle={{backgroundColor: backgroundOverlayColor, flex: 1, width: '100%'}}
                    childrenWrapperStyle={[styles.overlayChildren, {backgroundColor: "#fff", borderRadius: 10, width: (this.state.isLandscape ? '60%' : '100%'), maxHeight: (this.state.heightInnerViewContent > 0 ? this.state.heightInnerViewContent : 180), height: (this.state.height - 100), paddingBottom: (this.props.paddingBottom !== undefined ? this.props.paddingBottom : 0)}]} >
                    <Image
                        source={avatar}
                        style={{ resizeMode: 'contain', width: 45, height: 45, position: 'absolute', right: 10, top: 0, zIndex: -10000}}
                    />
                    <View style={{ width: '100%', height: '100%', zIndex: 999, overflow: 'hidden'}}>
                        <TouchableOpacity
                            onPress={(e) => {
                                this.reset()
                                if(this.state.onCloseCallback){
                                    this.state.onCloseCallback()
                                }
                            }}
                            style={styles.closeButtonContainer}>
                            <Image
                                style={{ width: 20, tintColor: 'rgba(0,0,0,.7)', height: 20, resizeMode: 'contain' }}
                                source={require("../../images/wordeo/dialogs/dialog_close.png")} />
                        </TouchableOpacity>
                        <View style={styles.innerView}>
                            <Text onLayout={this.onLayoutTextMessage.bind(this)} style={[styles.errorMessage, extraMessageStyle]}>{this.state.message}</Text>
                        </View>
                    </View>
                </Overlay>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    errorMessage: {
        color: '#000000',
        fontFamily: Font.PTSansBold,
        fontSize: Global.normalizeFontSize(14),
        marginBottom: 20,
        marginTop: 20,
        textAlign: 'center'
    },
    closeButtonContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        width: 27,
        height: 27,
        zIndex: 9999
    },
    overlayChildren: {
        shadowColor: '#444',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.95,
        shadowRadius: 100,
        elevation: 6,
        alignSelf: 'center'
    },
    innerView: {
        flex: 1,
        zIndex: 10,
        marginTop: 30,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
