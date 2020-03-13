/**
* Custom Menu (Abby)
* @eabuslaiman
*/

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Dimensions,
  Keyboard,
  Animated,
  Platform,
  ImageBackground
} from 'react-native';

import { Global } from '../../components/common/global';
import { strings } from '../localization/strings'
import { Color, Font } from '../../styles/default';
import LinearGradient from 'react-native-linear-gradient';
import Orientation from 'react-native-orientation';
import Overlay from 'react-native-modal-overlay';

var {height, width} = Dimensions.get('window');

const OVERLAY_BACKGROUND = 'rgba(0,96,255,.85)'

export default class CustomMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpened: false,
            heightMenu: new Animated.Value(0)
        }
    }

    onNavigatorEvent(event) {
        switch(event.id) {
            case 'willAppear':
                Keyboard.dismiss();
                break;
            case 'didAppear':
                break;
            case 'willDisappear':
                break;
            case 'didDisappear':
                break;
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.isOpened) {
            this.setState({ isOpened : nextProps.isOpened });
            this.onShow();
        }
    }

    onShow = (callback) => {
        Animated.spring(this.state.heightMenu, {
            toValue: height,
            duration: 3000
        }).start();
    }

    onHide = (callback) => {
        let animatedValue = new Animated.Value(0);
        this.setState({ heightMenu : animatedValue });
    }

    render() {
        if(!this.props.isOpened)
            return null;

        return (
            <Animated.View style={{height: this.state.heightMenu}}>
                <Overlay visible={this.props.isOpened}
                    closeOnTouchOutside
                    animationType={'flipInY'}
                    animationOutType={'none'}
                    animationDuration={1000}
                    onClose={() => {
                        this.props.onClose()
                    }}
                    containerStyle={{backgroundColor: OVERLAY_BACKGROUND, flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center'}}
                    childrenWrapperStyle={[styles.overlayChildren, {overflow: 'hidden', paddingTop: 0, marginTop: 0, backgroundColor: "transparent", paddingHorizontal: 0, borderRadius: 10, width: (this.state.isLandscape ? '80%' : '100%'), height: '100%', justifyContent: 'center', paddingBottom: (this.props.paddingBottom !== undefined ? this.props.paddingBottom : 0)}]} >

                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => {
                                this.props.onClose()
                            }}
                            style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            { this.renderMenuItem({ backgroundColor: '#1aba5d', image: require('../../images/wordeo/menu/1.png'), title: 'Mi perfil', screen: Global.Screen.Dashboard.Profile })  }
                            { this.renderMenuItem({ backgroundColor: '#f4ae01', image: require('../../images/wordeo/menu/2.png'), title: 'Ranking', screen: Global.Screen.Dashboard.Ranking })  }
                            { this.renderMenuItem({ backgroundColor: '#2ba9e0', image: require('../../images/wordeo/menu/3.png'), title: '¡Seguir jugando!', screen: Object.assign({}, Global.Screen.Dashboard.Home) })  }
                            { this.renderMenuItem({ backgroundColor: '#f85200', image: require('../../images/wordeo/menu/4.png'), title: 'Cargá preguntas y ganá tuls!', screen: Object.assign({}, Global.Screen.Dashboard.AddQuestion) })  }
                            { this.renderMenuItem({ backgroundColor: '#db457e', image: require('../../images/wordeo/menu/5.png'), title: 'Zona de contacto', screen: Object.assign({}, Global.Screen.Dashboard.Contact) })  }
                            { /* this.renderMenuItem({ backgroundColor: '#f4ae01', image: { uri: 'https://cdn1.iconfinder.com/data/icons/free-98-icons/32/shop-256.png' }, title: 'Shop', screen: Object.assign({}, Global.Screen.Dashboard.Shop) }) */ }
                        </TouchableOpacity>

                </Overlay>
            </Animated.View>
        );
    }

    renderMenuItem(item) {
        return (
            <TouchableOpacity
                onPress={() => {
                    if(item.screen != null) {
                        this.props.onClose()
                        rootNavigator.push(item.screen);
                    }
                }}
                style={[styles.menuItem, { backgroundColor: item.backgroundColor }]}>
                <Image source={item.image} style={styles.menuItemIcon} />
                <Text style={styles.menuItemText}>{item.title}</Text>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    menuItem: {
        flexDirection: 'row',
        height: 80,
        borderRadius: 10,
        width: '100%',
        marginVertical: 15,
        backgroundColor: '#0088ff',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: '#aaa',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: .9,
        shadowRadius: 10,
        elevation: 4
    },
    menuItemIcon: {
        width: 65,
        height: 65,
        marginHorizontal: 5,
        resizeMode: 'contain'
    },
    menuItemText: {
        marginHorizontal: 10,
        fontFamily: Font.PTSansBold,
        fontSize: Global.normalizeFontSize(18),
        color: 'white'
    }
});