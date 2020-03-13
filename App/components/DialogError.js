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
import { Color, Font } from '../styles/default';

import { Global } from '../components/common/global';

// Store width in variable
var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height;

export default class DialogError extends Component {

    constructor(props) {
        super(props);
        this.state = {
            height: height,
            isLandscape: false,
            visible: false,
            dialogType: 'success',
            message: '',
            heightInnerViewContent: 0
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

    onLayoutTextMessage(e) {
        var {x, y, width, height} = e.nativeEvent.layout;
        if(height != null) {
            this.setState({ heightInnerViewContent : height + 100 });
        }
    }

    show = (type, message) => {
        this.setState({ visible : true, dialogType: type, message: message })
    }

    reset() {
        this.setState({ dialogType : 'success', message: '', visible: false })
    }

    render() {
        if(!this.state.visible)
            return null;

        return (
            <View
                onLayout={this.onLayout.bind(this)}>
                <Overlay visible={this.state.visible}
                    closeOnTouchOutside
                    animationType={'fadeInDown'}
                    animationOutType={'fadeOut'}
                    animationDuration={300}
                    onClose={() => {
                        this.setState({ visible : false })
                    }}
                    containerStyle={{backgroundColor: 'rgba(255, 255, 255, 0.9)', flex: 1, width: '100%'}}
                    childrenWrapperStyle={[styles.overlayChildren, {backgroundColor: "#fff", borderRadius: 10, width: (this.state.isLandscape ? '60%' : '100%'), maxHeight: (this.state.heightInnerViewContent > 0 ? this.state.heightInnerViewContent : 180), height: (this.state.height - 100), paddingBottom: (this.props.paddingBottom !== undefined ? this.props.paddingBottom : 0)}]} >
                    <TouchableOpacity
                        onPress={(e) => {
                            if(this.props.onDismissPress){
                                this.props.onDismissPress()
                            }
                            this.reset()
                        }}
                        style={styles.closeButtonContainer}>
                        <Image source={require("../images/close.png")} />
                    </TouchableOpacity>
                    <View style={styles.innerView}>
                        { this.state.dialogType == 'success' &&
                            <Image
                                style={{display: ((this.state.dialogType == 'success') ? 'flex' : 'none')}}
                                source={require("../images/check-fill.png")} />
                        }

                        { this.state.dialogType == 'error' &&
                            <Image
                                style={{display: ((this.state.dialogType == 'error') ? 'flex' : 'none')}}
                                source={require("../images/dialog_error.png")} />
                        }

                        <Text onLayout={this.onLayoutTextMessage.bind(this)} style={styles.errorMessage}>{this.state.message}</Text>
                    </View>
                </Overlay>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    errorMessage: {
        color: '#000000',
        fontFamily: Font.NunitoSemiBold,
        fontSize: Global.normalizeFontSize(16),
        marginBottom: 20,
        marginTop: 20,
        textAlign: 'center'
    },
    closeButtonContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
        color: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        width: 27,
        height: 27,
        zIndex: 9999
    },
    overlayChildren: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
        alignSelf: 'center'
    },
    innerView: {
        flex: 1,
        zIndex: 10,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
