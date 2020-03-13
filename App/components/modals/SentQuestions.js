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
    ImageBackground
} from 'react-native';

import Moment from 'moment';

//Localization
import { strings } from '../../components/localization/strings';
import CustomNavbar from '../../components/navigation/CustomNavbar';
import CustomMenu from '../../components/navigation/CustomMenu'

import Overlay from 'react-native-modal-overlay';
import LinearGradient from 'react-native-linear-gradient';
import SpinnerComponent from '../../components/SpinnerComponent';
import CommonDialog from '../../components/dialogs/CommonDialog';
import ConfirmationDialog from '../../components/dialogs/ConfirmationDialog';
import OneSignal from 'react-native-onesignal';
import { Button } from 'react-native-elements'

import { AuthService, QuestionService } from '../../services/Services';
import { Navigation } from 'react-native-navigation';
import { Global } from '../../components/common/global';
import { GeneralStyle } from '../../styles/general';
import { Color, Font } from '../../styles/default';
import * as Animatable from 'react-native-animatable';
//import AnalyticsService from '../../services/AnalyticsService.js';

import ModalDropdown from 'react-native-modal-dropdown';
import Orientation from 'react-native-orientation';

/* Components */
import RoundPlayer from '../../components/componentsJs/RoundPlayer';
import RoundItem from '../../components/componentsJs/RoundItem';
import NewRoomWizard from '../../components/modals/NewRoomWizard';

var Sound = require('react-native-sound');
Sound.setCategory('Playback');

const BackgroundOptionCell = 'rgba(28, 34, 40, .4)';
var {height, width} = Dimensions.get('window');

var MODES = {
    ACCESORIES: 1,
    CHARACTERS: 2
}

export default class SentQuestions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sentQuestions: [],
            isLoading: false
        };

        this.loadQuestions = this.loadQuestions.bind(this);
    }

    componentWillMount() {

    }

    componentDidMount() {
        this.setState({ isMounted : true });
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.isVisible) {
            this.loadQuestions();
        }
    }

    loadQuestions() {
        if(this.refs.spinner)
            this.refs.spinner.show();
        this.setState({ isLoading : true })
        QuestionService.getSentQuestions({}, (questions) => {
            this.setState({ sentQuestions : questions, isLoading: false })
        }, (err) => {
            this.setState({ isLoading : false })
        });
    }

    render() {
        if(!this.props.isVisible)
            return null;

        return (
            <View style={{ width: '100%', height: '100%' }}>
                <Overlay visible={this.props.isVisible}
                    closeOnTouchOutside
                    animationType={'bounceInDown'}
                    animationOutType={'none'}
                    animationDuration={0}
                    onClose={() => {
                        this.props.onClose()
                    }}
                    containerStyle={{backgroundColor: 'rgba(140, 140, 140, 0.6)', flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
                    childrenWrapperStyle={[styles.overlayChildren]} >

                    <SpinnerComponent
                        ref={'spinner'}
                    />

                    <CommonDialog
                        ref='dialog' />

                    <Text style={{ marginRight: 5, marginVertical: 10, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(30), color: Color.BluePrimary, textAlign: 'center', backgroundColor: 'transparent'}}>TUS PREGUNTAS</Text>
                    { (this.state.sentQuestions == null || this.state.sentQuestions.length == 0) && !this.state.isLoading &&
                        <Text style={{ maxWidth: '80%', alignSelf: 'center', marginVertical: 10, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(18), color: Color.GoldenPrimary, textAlign: 'center', backgroundColor: 'transparent'}}>No tienes preguntas enviadas aún. ¿Que estás esperando para ganar Tuls con tus preguntas?</Text>
                    }
                    { this.state.sentQuestions != null &&
                        <FlatList
                            style={{ width: '100%', height: '100%', flex: 0 }}
                            centerContent={false}
                            bounces={false}
                            data={this.state.sentQuestions}
                            extraData={this.state.sentQuestions.length}
                            renderItem={(rowData) => {
                                return (
                                    <View style={styles.questionContainer}
                                        onStartShouldSetResponder={() => { return true }}>

                                        <View style={styles.questionTopDetails}>
                                            <Text style={{ backgroundColor: 'transparent', fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(20), color: 'white', textAlign: 'center'}}>{rowData.item.question}</Text>
                                            <Text style={{ backgroundColor: 'transparent', fontFamily: Font.PTSansBold, fontSize: Global.normalizeFontSize(16), color: '#00ff48', textAlign: 'center'}}>- {rowData.item.option1}</Text>
                                            <Text style={{ backgroundColor: 'transparent', fontFamily: Font.PTSansBold, fontSize: Global.normalizeFontSize(16), color: 'white', textAlign: 'center'}}>- {rowData.item.option2}</Text>
                                            <Text style={{ backgroundColor: 'transparent', fontFamily: Font.PTSansBold, fontSize: Global.normalizeFontSize(16), color: 'white', textAlign: 'center'}}>- {rowData.item.option3}</Text>
                                            <Text style={{ backgroundColor: 'transparent', fontFamily: Font.PTSansBold, fontSize: Global.normalizeFontSize(16), color: 'white', textAlign: 'center'}}>- {rowData.item.option4}</Text>
                                        </View>

                                        <View style={styles.questionBottomDetails}>
                                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                                <Text style={styles.bottomDetailText}>Creada</Text>
                                                <Text style={[styles.bottomDetailText, { fontFamily: Font.PTSansBold, fontSize: Global.normalizeFontSize(14) }]}>{Moment(rowData.item.createdAt).format('dd DD/MM/YYYY HH:mm')}</Text>
                                            </View>
                                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                                <Text style={styles.bottomDetailText}>Estado</Text>
                                                <Text style={[styles.bottomDetailText, { fontFamily: Font.PTSansBold, fontSize: Global.normalizeFontSize(14) }]}>{rowData.item.isApproved ? 'APROBADA' : 'PENDIENTE'}</Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            }}
                        />
                    }
                </Overlay>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    overlayChildren: {
        maxHeight: height - 100,
        shadowColor: Color.GoldenPrimary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
        padding: 0,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderRadius: 20
    },
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255,255,255,.8)',
        padding: 10
    },
    questionContainer: {
        width: '90%',
        alignSelf: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: Color.GoldenPrimary,
        padding: 10,
        marginVertical: 10,
    },
    questionText: {

    },
    questionTopDetails: {
        flex: 1
    },
    questionBottomDetails: {
        flex: 1,
        flexDirection: 'row',
        marginTop: 10
    },
    bottomDetailText: {
        flex: 1,
        color: 'white',
        fontFamily: Font.TitanOne,
        color: 'white',
        fontSize: Global.normalizeFontSize(18),
        textAlign: 'center'
    }
});
