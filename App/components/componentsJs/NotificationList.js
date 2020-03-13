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
    ActivityIndicator,
    Easing
} from 'react-native';

import { strings } from '../../components/localization/strings';
import { Navigation } from 'react-native-navigation';
import { Global } from '../../components/common/global';
import SpinnerComponent from '../../components/SpinnerComponent'
import CommonDialog from '../../components/dialogs/CommonDialog'
import { GeneralStyle } from '../../styles/general';
import { Color, Font } from '../../styles/default';

import { NotificationService } from '../../services/Services'

import moment from 'moment-with-locales-es6';
moment.locale('es');
import LinearGradient from 'react-native-linear-gradient';
import Overlay from 'react-native-modal-overlay';

import * as Animatable from 'react-native-animatable';

let {height, width} = Dimensions.get('window');
var _ = require('lodash');

export default class NotificationList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            notifications: [],
            isListVisible: false,
            isReceivedNotifications: false
        }
    }

    componentWillMount() {

    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.notifications){
            this.setState({ notifications : nextProps.notifications })
        }
    }

    componentDidMount() {
        //this.setState({ spinner : false });

        setTimeout(() => {
            if(this.props.notifications != null && !this.state.isReceivedNotifications) {
                this.setState({ notifications : this.props.notifications, isReceivedNotifications: true })
            }
        }, 1000);
    }

    //Exposed methods
    showSpinner = () => {
        if(this.refs.spinner)
            this.refs.spinner.show();
    }

    hideSpinner = () => {
        if(this.refs.spinner)
            this.refs.spinner.hide();
    }

    showMessage = (type, message) => {
        if(this.refs.commonDialog)
            this.refs.commonDialog.show(type, message);
    }

    show = () => {
        this.setState({ isListVisible : true })
    }

    hide = () => {
        this.setState({ isListVisible : false })
    }

    isVisible = () => {
        return this.state.isListVisible;
    }

    getPendingNotificationsAnimation(){
        return {
            0: {
                scale: 1
            },
            0.5: {
                scale: 1.4
            },
            0.9: {
                scale: 0.9
            },
            1: {
                scale: 1
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState){
        return true;
    }

    render() {
        let notificationsCount = 0;
        if(this.state.notifications && this.state.notifications.length > 0)
            notificationsCount = this.state.notifications.length;

        if(this.state.isListVisible && notificationsCount == 0) {
            return this.renderListEmpty();
        } else if(this.state.isListVisible && notificationsCount > 0){
            return this.renderListNotifications();
        }

        return (
            <View>
                <TouchableOpacity
                    activeOpacity={.95}
                    onPress={() => {
                        this.setState({ isListVisible : true })
                    }} style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,.05)', backgroundColor: 'rgba(255,255,255,.1)', position: 'absolute', bottom: 20, right: 5, width: 80, height: 80, borderRadius: 40 }}>
                    <View style={{ padding: 10 }}>
                        <Animatable.Image
                            animation={notificationsCount > 0 ? this.getPendingNotificationsAnimation() : null}
                            iterationCount={'infinite'}
                            style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                            source={require('../../images/wordeo/general/notification_icon.png')} />
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    renderListNotifications() {
        return (
            <View>

                <Overlay visible={true}
                    closeOnTouchOutside
                    animationType={'slideInDown'}
                    animationOutType={'none'}
                    animationDuration={300}
                    onClose={() => {
                        this.setState({ isListVisible: false })
                    }}
                    containerStyle={{backgroundColor: 'rgba(140, 140, 140, 0.6)', flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
                    childrenWrapperStyle={[styles.overlayChildren]} >

                    <SpinnerComponent
                        ref={'spinner'} />

                    <CommonDialog
                        ref={'commonDialog'} />

                    <View style={styles.container}>
                        <FlatList
                            style={{ width: '100%', height: '100%' }}
                            numColumns={1}
                            centerContent={false}
                            snapToAlignment={'start'}
                            data={this.state.notifications}
                            extraData={this.state.notifications.length}
                            keyExtractor={(item, index) => {
                                return 'notificationId-' + item.length
                            }}
                            ListHeaderComponent={() => {
                                return null;
                            }}
                            renderItem={(rowData) => {
                                if(rowData.item) {
                                    let payload = null;
                                    try {
                                        payload = JSON.parse(rowData.item.payload);
                                    } catch (e) {
                                        //Do nothing
                                    }

                                    let category = 'Invitación';
                                    if(rowData.item.category == 2) {
                                        category = 'Noticia';
                                    }
                                    let timeAgo = moment(payload.data.date)
                                    return (
                                        <View style={[styles.notificationContainer, { backgroundColor: (rowData.item.category == 1 ? Color.BluePrimary : '#47c140')}]}>
                                            <Text style={styles.notificationHeader}>{ category }</Text>
                                            <Text style={styles.notificationPayloadText}>{rowData.item.message}</Text>

                                            <View style={styles.notificationButtons}>
                                                { payload != null && payload.buttons && payload.buttons.map((e) => {
                                                    return (
                                                        <TouchableOpacity
                                                            key={'btnNotificationId-'+e.id}
                                                            onPress={() => {
                                                                if(e.id == 'Now') {
                                                                    this.setState({ isListVisible : false })
                                                                    NotificationService.deleteNotificationById(rowData.item.id, () => {});

                                                                    setTimeout(() => {
                                                                        this.props.onJoinToRoom(payload.data.roomId, true, true)
                                                                    }, 500);
                                                                } else {
                                                                    this.showSpinner();
                                                                    NotificationService.deleteNotificationById(rowData.item.id, () => {
                                                                        this.hideSpinner();
                                                                        this.props.onUpdateNotifications();
                                                                    });
                                                                }
                                                            }}
                                                            style={[styles.notificationButton, { backgroundColor: (e.id == 'Delete' ? '#f25619' : Color.GoldenPrimary) }]}>
                                                            <Text style={[styles.notificationButtonText]}>{e.text}</Text>
                                                        </TouchableOpacity>
                                                    );
                                                }) }
                                            </View>

                                            { timeAgo != null &&
                                                <Text style={[styles.notificationHeader, { fontSize: Global.normalizeFontSize(11), textAlign: 'right' }]}>{timeAgo.fromNow()}</Text>
                                            }
                                        </View>
                                    );
                                }
                            }}
                        />
                    </View>
                </Overlay>
            </View>
        );
    }

    renderListEmpty() {
        return (
            <View>

                <Overlay visible={true}
                    closeOnTouchOutside
                    animationType={'slideInDown'}
                    animationOutType={'none'}
                    animationDuration={300}
                    onClose={() => {
                        this.setState({ isListVisible: false })
                    }}
                    containerStyle={{backgroundColor: 'rgba(140, 140, 140, 0.6)', flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
                    childrenWrapperStyle={[styles.overlayChildren]} >

                    <SpinnerComponent
                        ref={'spinner'} />

                    <CommonDialog
                        ref={'commonDialog'} />

                    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={[styles.notificationHeader, { color: Color.GoldenPrimary, fontSize: Global.normalizeFontSize(30), textAlign: 'center', marginVertical: 10 }]}>¡Hey!</Text>
                        <Text style={[styles.notificationHeader, { fontSize: Global.normalizeFontSize(17), textAlign: 'center' }]}>Tu buzón de mensajes está vacío.</Text>
                    </View>
                </Overlay>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    overlayChildren: {
        maxHeight: height - 100,
        shadowColor: Color.OrangePrimary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
        padding: 0,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#222',
        padding: 10,
        alignItems: 'center'
    },
    notificationContainer: {
        backgroundColor: Color.BluePrimary,
        width: '100%',
        marginVertical: 10,
        padding: 10,
        borderTopLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    notificationHeader: {
        color: 'white',
        fontSize: Global.normalizeFontSize(17),
        fontFamily: Font.TitanOne
    },
    notificationPayloadText: {
        color: 'white',
        fontSize: Global.normalizeFontSize(15),
        fontFamily: Font.PTSansBold
    },
    notificationButtons: {
        marginVertical: 5,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    notificationButton: {
        flex: 1,
        backgroundColor: Color.GoldenPrimary,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        padding: 5,
        minHeight: 50,
        marginHorizontal: 10,
        borderRadius: 5
    },
    notificationButtonText: {
        textAlign: 'center',
        color: 'white',
        fontSize: Global.normalizeFontSize(17),
        fontFamily: Font.TitanOne,
        backgroundColor: 'transparent'
    }
});