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
    ImageBackground,
    ActivityIndicator
} from 'react-native';

import Moment from 'moment';

//Localization
import { strings } from '../../components/localization/strings';

//Components
import { Global } from '../../components/common/global';
import CustomNavbar from '../../components/navigation/CustomNavbar';
import CustomMenu from '../../components/navigation/CustomMenu'
import Room from '../../components/componentsJs/Room';
import NewRoomWizard from '../../components/modals/NewRoomWizard';
import JoinToRoom from '../../components/modals/JoinToRoom';

//Services
import { RoomService, SocketService, AnalyticsService } from '../../services/Services';

//Plugins
import LinearGradient from 'react-native-linear-gradient';
import SpinnerComponent from '../../components/SpinnerComponent';
import CommonDialog from '../../components/dialogs/CommonDialog';
import OneSignal from 'react-native-onesignal';
import { Navigation } from 'react-native-navigation';
import Orientation from 'react-native-orientation';

//Styles
import { GeneralStyle } from '../../styles/general';
import { Color, Font } from '../../styles/default';

var {height, width} = Dimensions.get('window');

export default class Shop extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rooms: [],
            isNewRoomWizard: false,
            spinner: true,
            usersStatistics: {
                online: 0
            },
            isPullingRooms: false
        }

        rootNavigator = this.props.navigator;
    }

    componentWillMount() {
        Orientation.lockToPortrait();
    }

    componentWillUnmount() {

    }

    componentDidMount() {
        this.setState({ spinner : false });
    }

    pullRooms() {
        //Get rooms
        this.setState({ isPullingRooms : true });
        RoomService.get({}, (rooms) => {
            this.setState({ rooms : rooms, isPullingRooms: false });
        }, (err) => {})
    }

    renderNavbar() {
        return (
            <CustomNavbar
                ref={(e) => { this.customNavbar = e; }}
                navigator={this.props.navigator}
                backButton={false}
                gradientColors={[Color.OrangePrimary, Color.OrangeSecondary]}
                customLeftView={() => {
                    return (
                        <TouchableOpacity onPress={() => {
                            this.setState({ menuOpened : true });
                        }} style={{flex: 1, paddingLeft: 0, justifyContent: 'center', width: '100%', height: '100%' }}>
                            <Image
                                style={{alignSelf: 'flex-start', resizeMode: 'contain', height: 15}}
                                source={require('../../images/wordeo/navbar/hamburguer.png')} />
                        </TouchableOpacity>
                    );
                }}
                customCenterView={() => {
                    return (
                        <TouchableOpacity
                            style={{flex: 1, flexDirection: 'row', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%'}}>
                            <Text style={GeneralStyle.customNavbarTitle}>
                                SHOP
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />
        );
    }

    renderCustomMenu(){
        return <CustomMenu
            isOpened={this.state.menuOpened}
            onClose={() => {
                this.setState({ menuOpened: false })
            }}
        />;
    }

    render() {
        return (
            <View style={styles.container}>

                <SpinnerComponent
                    isVisible={this.state.spinner} />

                <CommonDialog
                    ref={(e) => { this.commonDialog = e; } } />

                { this.renderNavbar() }
                { this.renderCustomMenu() }

                <View style={styles.expBlocksContainer}>
                    <View style={styles.expBlock}>
                        <Image style={styles.expBlockImage} source={{ uri : 'https://cdn2.iconfinder.com/data/icons/ios-7-icons/50/money-256.png' }} />
                        <Text style={styles.expBlockText}>5000</Text>
                    </View>
                </View>

                { /* <Text style={{ flex: 1, backgroundColor: 'transparent', marginRight: 10, fontFamily: Font.TitanOne, fontSize: 12, color: Color.LightPrimary, marginVertical: 10, textAlign: 'center' }}>APRIETA SOBRE UN ITEM PARA VER SU DESCRIPCION</Text> */ }

                <FlatList
                    centerContent={false}
                    numColumns={3}
                    snapToAlignment={'start'}
                    data={this.state.items}
                    ListFooterComponent={() => {
                        return (
                            <TouchableOpacity
                                onPress={() => {
                                    this.setState({ isNewRoomWizard : true })
                                }}
                                style={{ flex: 1, paddingLeft: 0, justifyContent: 'center', width: '98%', height: 50, backgroundColor: Color.BluePrimary, alignSelf: 'center', marginVertical: 15, borderRadius: 5, shadowColor: 'rgba(255,255,255,.5)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 1 }}>
                                <Text style={{ marginRight: 5, fontFamily: Font.TitanOne, fontSize: 24, color: '#eee', textAlign: 'center', backgroundColor: 'transparent'}}>CREAR SALA</Text>
                            </TouchableOpacity>
                        );
                    }}
                    renderItem={(rowData) => {
                        return this.renderRoom(rowData.item);
                    }}
                />

            </View>
        );
    }

    renderRoom(item) {
        return (
            <Room
                room={item}
                onTapRoom={(room) => {
                    if(room.isProtected) {
                        this.setState({ selectedRoom : room });
                    } else {
                        //Join to room
                        var joinReq = { roomId: room.id };
                        RoomService.join(joinReq, (success) => {
                            this.onJoinRoomSuccess(room);
                        }, (err) => {
                            if(err.message){
                                this.commonDialog.show('error', err.message);
                            }
                        });
                    }
                }}
            />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2a3a4b'
    },
    expBlocksContainer: {
        backgroundColor: Color.BluePrimary,
        maxWidth: '33%',
        margin: 5,
        borderRadius: 10,
        alignSelf: 'center',
        width: 100,
        height: 100,
        padding: 10,
        shadowColor: 'rgba(255,255,255,.5)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 1,
        marginVertical: 10,
    },
    expBlock: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-around'
    },
    expBlockText: {
        flex: 1,
        fontFamily: Font.TitanOne,
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        backgroundColor: 'transparent'
    },
    expBlockImage: {
        tintColor: 'white',
        flex: 2,
        alignSelf: 'center',
        width: '100%',
        resizeMode: 'contain',
        marginVertical: 5
    }
});
