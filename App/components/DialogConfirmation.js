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
import { strings } from './localization/strings';

import Overlay from 'react-native-modal-overlay';

import { Color, Font } from '../styles/default';

import { Global } from '../components/common/global';

// Store width in variable
var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height;

export default class DialogConfirmation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            height: height,
            isLandscape: false,
            heightInnerViewContent: 0
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

    render() {
        if(!this.props.isVisible)
            return null;

        return (
            <View
                onLayout={this.onLayout.bind(this)}>
                <Overlay visible={this.props.isVisible}
                    closeOnTouchOutside
                    animationType={'fadeInDown'}
                    animationOutType={'fadeOut'}
                    animationDuration={300}
                    onClose={() => {
                        this.props.onCancelAction();
                    }}
                    containerStyle={{backgroundColor: 'rgba(255, 255, 255, 0.95)', flex: 1, width: '100%'}}
                    childrenWrapperStyle={[styles.overlayChildren, {backgroundColor: "#fff", borderRadius: 10, width: (this.state.isLandscape ? '60%' : '100%'), maxHeight: 140, maxHeight: (this.state.heightInnerViewContent > 0 ? this.state.heightInnerViewContent : 180), height: (this.state.height - 100), paddingBottom: (this.props.paddingBottom !== undefined ? this.props.paddingBottom : 0)}]} >

                    <Text onLayout={this.onLayoutTextMessage.bind(this)} style={styles.errorMessage}>{this.props.message}</Text>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <TouchableOpacity
                            onPress={(e) => this.props.onCancelAction()}
                            style={styles.buttonCancel}>
                            <Text style={styles.buttonCancelText}>{strings.Cancel}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={(e) => this.props.onConfirmAction()}
                            style={styles.buttonOk}>
                            <Text style={styles.buttonOkText}>{strings.Confirm}</Text>
                        </TouchableOpacity>
                    </View>
                </Overlay>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    errorTitle: {
        color: '#ef3300',
        fontFamily: Font.ProximaNovaRegular,
        fontSize: Global.normalizeFontSize(16),
        marginBottom: 20,
    },
    errorMessage: {
        color: 'black',
        fontFamily: Font.NunitoSemiBold,
        fontSize: Global.normalizeFontSize(16),
        marginBottom: 20,
    },
    buttonCancel: {
        flex: 1,
        marginRight: 5,
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e6e7eb',
        borderRadius: 20,
    },
    buttonCancelText: {
        color: '#7f7f7f',
        fontFamily: Font.NunitoBold,
        fontSize: Global.normalizeFontSize(18),
        textAlign: 'center',
    },
    buttonOk: {
        flex: 1,
        height: 45,
        marginLeft: 5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ff6600',
        borderRadius: 20,
    },
    buttonOkText: {
        fontFamily: Font.NunitoBold,
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
