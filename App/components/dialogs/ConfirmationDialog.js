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

//Localization
import { strings } from '../localization/strings';

import Overlay from 'react-native-modal-overlay';

import { Color, Font } from '../../styles/default';

import { Global } from '../../components/common/global';

// Store width in variable
var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height;

export default class ConfirmationDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isVisible: false,
            height: height,
            isLandscape: false,
            heightInnerViewContent: 0,
            message: {
                message: '',
                opts: {}
            }
        };
    }

    componentWillUpdate() {

    }

    onLayoutTextMessage(e) {
        var {x, y, width, height} = e.nativeEvent.layout;
        if(height != null) {
            this.setState({ heightInnerViewContent : height + 100 });
        }
    }

    onLayout(e) {
        this.setState({height: Dimensions.get('window').height});

        Global.getOrientation((orientation) => {
            this.setState({
                isLandscape: (orientation == 'LANDSCAPE')
            })
        });
    }

    show = (message, opts) => {
        let msg = { ...this.state.message }
        msg.message = message;
        msg.opts = opts;
        this.setState({ isVisible : true, message: msg });
    }

    hide = () => {
        this.setState({ isVisible: false })
    }

    render() {
        if(!this.state.isVisible)
            return null;

        return (
            <View
                onLayout={this.onLayout.bind(this)}>
                <Overlay
                    ref={'overlay'}
                    visible={this.state.isVisible}
                    closeOnTouchOutside
                    animationType={'fadeInDown'}
                    animationOutType={'fadeOut'}
                    animationDuration={400}
                    onClose={() => {
                        if(this.state.message.opts.onCancel){
                            this.state.message.opts.onCancel();
                        }
                    }}
                    containerStyle={{backgroundColor: 'rgba(255, 255, 255, 0.95)', flex: 1, width: '100%'}}
                    childrenWrapperStyle={[styles.overlayChildren, {backgroundColor: Color.BluePrimary, borderRadius: 10, width: (this.state.isLandscape ? '60%' : '100%'), maxHeight: 140, maxHeight: (this.state.heightInnerViewContent > 0 ? this.state.heightInnerViewContent : 180), height: (this.state.height - 100), paddingBottom: (this.props.paddingBottom !== undefined ? this.props.paddingBottom : 0)}]} >

                    <Text onLayout={this.onLayoutTextMessage.bind(this)} style={styles.errorMessage}>{this.state.message.message}</Text>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <TouchableOpacity
                            onPress={(e) => {
                                if(this.state.message.opts.onSuccess){
                                    this.state.message.opts.onSuccess();
                                }
                            }}
                            style={styles.buttonOk}>
                            <Text style={styles.buttonOkText}>{strings.Confirm}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={(e) => {
                                if(this.state.message.opts.onCancel){
                                    this.state.message.opts.onCancel();
                                }
                            }}
                            style={styles.buttonCancel}>
                            <Text style={styles.buttonCancelText}>{strings.Cancel}</Text>
                        </TouchableOpacity>
                    </View>
                </Overlay>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    errorTitle: {
        textAlign: 'center',
        color: 'white',
        fontFamily: Font.PTSansBold,
        fontSize: Global.normalizeFontSize(17),
        marginBottom: 20,
    },
    errorMessage: {
        textAlign: 'center',
        color: 'white',
        fontFamily: Font.PTSansBold,
        fontSize: Global.normalizeFontSize(17),
        marginBottom: 20,
    },
    buttonCancel: {
        flex: 1,
        marginRight: 5,
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        //backgroundColor: '#e6e7eb',
        backgroundColor: Color.LightPrimary,
        borderRadius: 20,
    },
    buttonCancelText: {
        color: '#7f7f7f',
        fontFamily: Font.TitanOne,
        fontSize: Global.normalizeFontSize(18),
        textAlign: 'center',
    },
    buttonOk: {
        flex: 1,
        height: 45,
        marginRight: 5,
        alignItems: 'center',
        justifyContent: 'center',
        //backgroundColor: '#ff6600',
        backgroundColor: Color.OrangePrimary,
        borderRadius: 20,
    },
    buttonOkText: {
        fontFamily: Font.TitanOne,
        fontSize: Global.normalizeFontSize(18),
        color: 'white', 
        textAlign: 'center'
    },
    overlayChildren: {
        shadowColor: '#222',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: .3,
        shadowRadius: 10,
        elevation: 4,
        alignSelf: 'center'
    },
});
