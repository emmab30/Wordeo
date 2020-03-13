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
import { CharacterService, QuestionService, AnalyticsService } from '../../services/Services'

import { CachedImage } from 'react-native-cached-image';
import DialogConfirmation from '../../components/DialogConfirmation';
import Orientation from 'react-native-orientation';
import { DropdownStyle } from '../../styles/dropdown';
import ModalDropdown from 'react-native-modal-dropdown';
import * as Animatable from 'react-native-animatable';

var {height, width} = Dimensions.get('window');

const dropdownOptions = [strings.English, strings.Spanish];

export default class AddQuestion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            question: {},
            viewSentQuestions: false
        }

        AnalyticsService.trackScreenView('add_question');
    }

    componentDidMount() {

    }

    onSend() {
        this.refs.spinner.show();
        QuestionService.addQuestionToRevision(this.state.question, (success) => {
            this.refs.spinner.hide(() => {
                this.refs.dialog.show('success', success.message, () => {
                    this.props.navigator.pop();
                });
            });
        }, (err) => {
            this.refs.spinner.hide(() => {
                if(err){
                    this.refs.dialog.show('error', err.response.data.error.message);
                }
            });
        });
    }

    renderNavbar() {
        return (
            <CustomNavbar
                navigator={this.props.navigator}
                gradientColors={['#ED6552', '#ed5e26']}
                backButton={true}
                title={'Enviar pregunta'}
            />
        );
    }

    render() {
        return (
            <ScrollView style={[ProfileStyle.container]}>
                <KeyboardAvoidingView behavior={'position'} keyboardVerticalOffset={-100}>
                    <ImageBackground
                        style={{ width: '100%', height: '100%' }}
                        source={require('../../images/wordeo/ranking/background.png')}>

                        { this.renderNavbar() }

                        <CommonDialog
                            ref='dialog' />

                        <SpinnerComponent
                            ref={'spinner'} />

                        <Text style={{ marginRight: 5, marginVertical: 10, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(30), color: Color.BluePrimary, textAlign: 'center', backgroundColor: 'transparent'}}>AGREGA TU PREGUNTA</Text>
                        <View style={{ marginVertical: 10, padding: 10, width: '95%', backgroundColor: Color.GoldenPrimary, borderRadius: 10, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontFamily: Font.PTSansRegular, fontSize: Global.normalizeFontSize(15), color: '#222', textAlign: 'center', backgroundColor: 'transparent'}}>Con Wordeo puedes cargar preguntas y ganar Tuls. Recuerda que una vez enviada la pregunta, entrará en un proceso de no más de 2 días de revisión. Si tu pregunta es aceptada, te avisaremos con cuantos Tuls te hemos recompensado a través de esta misma sección.</Text>
                        </View>

                        <View style={styles.questionAddContainer}>
                            <Text style={{ marginRight: 5, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(17), color: Color.BluePrimary, textAlign: 'center', backgroundColor: 'transparent'}}>PREGUNTA</Text>
                            <TextInput
                                multiline={false}
                                underlineColorAndroid={'transparent'}
                                placeholder={''}
                                style={styles.formInput}
                                onChangeText={(text) => {
                                    let question = { ...this.state.question };
                                    question.question = text;
                                    this.setState({ question })
                                }}
                                onSubmitEditing={() => {
                                    this.refs.option1.focus();
                                }}
                                value={this.state.question.question}
                            />
                            <Text style={{ marginRight: 5, marginTop: 10, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(17), color: Color.BluePrimary, textAlign: 'center', backgroundColor: 'transparent'}}>OPCIONES</Text>
                            <TextInput
                                ref={'option1'}
                                multiline={false}
                                underlineColorAndroid={'transparent'}
                                placeholder={'Opcion 1 (LA CORRECTA)'}
                                style={styles.formInput}
                                onChangeText={(text) => {
                                    let question = { ...this.state.question };
                                    question.option1 = text;
                                    this.setState({ question })
                                }}
                                onSubmitEditing={() => {
                                    this.refs.option2.focus();
                                }}
                                value={this.state.question.option1}
                            />
                            <TextInput
                                ref={'option2'}
                                multiline={false}
                                underlineColorAndroid={'transparent'}
                                placeholder={'Opcion 2'}
                                style={styles.formInput}
                                onChangeText={(text) => {
                                    let question = { ...this.state.question };
                                    question.option2 = text;
                                    this.setState({ question })
                                }}
                                onSubmitEditing={() => {
                                    this.refs.option3.focus();
                                }}
                                value={this.state.question.option2}
                            />
                            <TextInput
                                ref={'option3'}
                                multiline={false}
                                underlineColorAndroid={'transparent'}
                                placeholder={'Opcion 3'}
                                style={styles.formInput}
                                onChangeText={(text) => {
                                    let question = { ...this.state.question };
                                    question.option3 = text;
                                    this.setState({ question })
                                }}
                                onSubmitEditing={() => {
                                    this.refs.option4.focus();
                                }}
                                value={this.state.question.option3}
                            />
                            <TextInput
                                ref={'option4'}
                                multiline={false}
                                underlineColorAndroid={'transparent'}
                                placeholder={'Opcion 4'}
                                style={styles.formInput}
                                onChangeText={(text) => {
                                    let question = { ...this.state.question };
                                    question.option4 = text;
                                    this.setState({ question })
                                }}
                                value={this.state.question.option4}
                            />

                            <Button
                                loading={this.state.isCreatingRoom}
                                onPress={this.onSend.bind(this)}
                                containerViewStyle={{ width: '100%', marginLeft: 0, marginVertical: 20 }}
                                buttonStyle={styles.buttonUpdate}
                                textStyle={{fontFamily: Font.PTSansBold}}
                                title='ENVIAR PREGUNTA' />

                            <TouchableOpacity
                                style={{ width: '100%', paddingVertical: 0 }}
                                onPress={() => {
                                    this.setState({ viewSentQuestions : true })
                                }}>
                                <Text style={{ fontFamily: Font.PTSansRegular, fontSize: Global.normalizeFontSize(15), color: '#222', textAlign: 'center', backgroundColor: 'transparent'}}>VER PREGUNTAS ENVIADAS</Text>
                            </TouchableOpacity>
                        </View>
                    </ImageBackground>

                    <SentQuestions
                        isVisible={this.state.viewSentQuestions}
                        onClose={() => {
                            this.setState({ viewSentQuestions : false })
                        }}/>
                </KeyboardAvoidingView>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    questionAddContainer: {
        flex: 1,
        margin: 20
    },
    formInput: {
        fontFamily: Font.PTSansBold,
        marginTop: 5,
        height: 40,
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