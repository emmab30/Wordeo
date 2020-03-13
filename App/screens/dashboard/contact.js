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
  Alert,
  KeyboardAvoidingView,
  Dimensions,
  AsyncStorage,
  ScrollView,
  Animated,
  TextInput,
  Platform,
  PermissionsAndroid,
  Modal,
  Switch,
  TouchableHighlight,
  ActivityIndicator,
  ImageBackground,
  FlatList
} from 'react-native';

//Localization
import { strings } from '../../components/localization/strings';
import CustomNavbar from '../../components/navigation/CustomNavbar'
import RankingItem from '../../components/componentsJs/RankingItem';

import Icon from 'react-native-vector-icons/FontAwesome';
import { Divider, Button } from 'react-native-elements';

import Helper from '../../components/common/Helper';
import SentQuestions from '../../components/modals/SentQuestions'

import OneSignal from 'react-native-onesignal';
import { Navigation } from 'react-native-navigation';
import AuthService from '../../services/AuthService.js';
import { Global } from '../../components/common/global';
import { ProfileStyle } from '../../styles/dashboard/profile';
import { ApiUrl } from '../../services/BaseService.js';
import ImageService from '../../services/ImageService.js';
import CommonDialog from '../../components/dialogs/CommonDialog';
import SpinnerComponent from '../../components/SpinnerComponent';
import { Color, Font } from '../../styles/default';
import { GeneralStyle } from '../../styles/general';
import { RegisterStyle } from '../../styles/register';
import { AnalyticsService, CharacterService, QuestionService, ContactService } from '../../services/Services'

import { CachedImage } from 'react-native-cached-image';
import DialogConfirmation from '../../components/DialogConfirmation';
import Orientation from 'react-native-orientation';
import { DropdownStyle } from '../../styles/dropdown';
import ModalDropdown from 'react-native-modal-dropdown';
import * as Animatable from 'react-native-animatable';

var {height, width} = Dimensions.get('window');

const dropdownOptions = [strings.English, strings.Spanish];
const TOPICS_DETAILS = {
    SUGERENCIAS: 'Sugerencias',
    PROBLEMAS: 'Problemas'
};

export default class Contact extends Component {
    constructor(props) {
        super(props);
        this.state = {
            contact: {}
        }

        AnalyticsService.trackScreenView('contact_us');
    }

    componentDidMount() {

    }

    onSend() {
        this.refs.spinner.show();
        ContactService.send(this.state.contact, (data) => {
            this.refs.spinner.hide(() => {
                this.refs.dialog.show('success', data.message, () => {
                    this.props.navigator.pop();
                });
            });
        }, (err) => {
            this.refs.spinner.hide(() => {
                if(err){
                    this.refs.dialog.show('error', err.response.data.error.message);
                }
            });
        })
    }

    renderNavbar() {
        return (
            <CustomNavbar
                navigator={this.props.navigator}
                gradientColors={['#ED6552', '#ed5e26']}
                backButton={true}
                title={'Contáctanos'}
            />
        );
    }

    render() {
        return (
            <View style={[ProfileStyle.container]}>
                <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={-100}>
                    <ImageBackground
                        style={{ width: '100%', height: '100%' }}
                        source={require('../../images/wordeo/ranking/background.png')}>

                        { this.renderNavbar() }

                        <CommonDialog
                            ref='dialog' />

                        <SpinnerComponent
                            ref={'spinner'} />

                        <Text style={{ marginRight: 5, marginTop: 10, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(30), color: Color.BluePrimary, textAlign: 'center', backgroundColor: 'transparent', paddingHorizontal: 20 }}>ENVÍANOS UN MENSAJE</Text>

                        <View style={styles.questionAddContainer}>
                            <Text style={{ marginRight: 5, marginTop: 10, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(17), color: Color.BluePrimary, textAlign: 'center', backgroundColor: 'transparent'}}>TU INQUIETUD</Text>
                            <View style={styles.radios}>
                                <View style={styles.radio}>
                                    <TouchableOpacity onPress={() => {
                                        let contact = {...this.state.contact};
                                        contact.subject = TOPICS_DETAILS.SUGERENCIAS;
                                        this.setState({ contact })
                                    }} style={[styles.btnRadio, { backgroundColor: (this.state.contact.subject == TOPICS_DETAILS.SUGERENCIAS ? Color.BluePrimary : 'white') }]}></TouchableOpacity>
                                    <Text style={styles.radioText}>SUGERENCIAS</Text>
                                </View>
                                <View style={[styles.radio]}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            let contact = {...this.state.contact};
                                            contact.subject = TOPICS_DETAILS.PROBLEMAS;
                                            this.setState({ contact })
                                        }}
                                        style={[styles.btnRadio, { backgroundColor: (this.state.contact.subject == TOPICS_DETAILS.PROBLEMAS ? Color.BluePrimary : 'white') }]}></TouchableOpacity>
                                    <Text style={styles.radioText}>REPORTE DE UN PROBLEMA</Text>
                                </View>
                            </View>
                            <Text style={{ marginRight: 5, marginTop: 10, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(17), color: Color.BluePrimary, textAlign: 'center', backgroundColor: 'transparent'}}>MAS DETALLES</Text>
                            <TextInput
                                multiline={true}
                                placeholder={''}
                                style={styles.formInput}
                                onChangeText={(text) => {
                                    let contact = { ...this.state.contact };
                                    contact.message = text;
                                    this.setState({ contact })
                                }}
                                value={this.state.contact.message}
                            />

                            <Button
                                loading={this.state.isCreatingRoom}
                                onPress={this.onSend.bind(this)}
                                containerViewStyle={{ width: '100%', marginLeft: 0, marginVertical: 20 }}
                                buttonStyle={styles.buttonUpdate}
                                textStyle={{fontFamily: Font.PTSansBold}}
                                title='ENVIAR PREGUNTA' />
                        </View>
                    </ImageBackground>
                </KeyboardAvoidingView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    radios: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginVertical: 20
    },
    radio: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    btnRadio: {
        flex: 0.2,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'red',
        marginHorizontal: 5,
        borderWidth: 2,
        borderColor: Color.GoldenPrimary,
        backgroundColor: 'white'
    },
    radioText: {
        flex: 1,
        fontFamily: Font.TitanOne,
        color: '#aaa',
        backgroundColor: 'transparent',
        fontSize: Global.normalizeFontSize(18),
        textAlign: 'center',
    },
    questionAddContainer: {
        flex: 1,
        padding: 20
    },
    formInput: {
        fontFamily: Font.PTSansBold,
        marginTop: 5,
        minHeight: 80,
        padding: 5,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,.2)',
        borderRadius: 10,
        textAlign: 'center',
        backgroundColor: 'white'
    },
    buttonUpdate: {
        minWidth: '100%',
        width: '100%',
        borderRadius: 10,
        backgroundColor: Color.VioletPrimary,
        height: 50
    }
});