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
import { CachedImage } from 'react-native-cached-image';

import { AuthService, CharacterService } from '../../services/Services';
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
var _ = require('lodash');

var MODES = {
    ACCESORIES: 1,
    CHARACTERS: 2,
    LIFE_ELEMENTS: 3
};

export default class CustomizeCharacter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            character: null,
            characterb64: null,
            accesories: null,
            selectedAccesories: [],
            user: null,
            lastCategoryRender: null,
            containerDimensions: null,
            currentMode: MODES.CHARACTERS,
            isMounted: false,
            characterMake: {
                character: {},
                accesories: []
            },
            lifeElements: []
        };

        this.loadCharacter = this.loadCharacter.bind(this);

        this.backgroundAnimation = new Animated.Value(0);
        this.containerWidth = new Animated.Value(0);
        this.containerHeight = new Animated.Value(0);
        this.tabIndicatorLeft = new Animated.Value(10);

        this.successSound = new Sound('finish_round_success.mp3', Sound.MAIN_BUNDLE, (err) => {});
    }

    componentWillMount() {

    }

    componentDidMount() {
        this.setState({ isMounted : true });
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.isVisible) {
            setTimeout(() => {
                if(this.state.currentMode == MODES.CHARACTERS) {
                    this.loadCharacters();
                } else if(this.state.currentMode == MODES.ACCESORIES) {
                    this.loadAccesories();
                } else if(this.state.currentMode == MODES.LIFE_ELEMENTS) {
                    this.loadElements()
                }
            }, 500);
        }
    }

    loadElements() {
        if(this.refs.spinner)
            this.refs.spinner.show();

        CharacterService.getAvailableLifeElements((elements) => {

            var fn = () => { this.setState({ lifeElements : elements, currentMode: MODES.LIFE_ELEMENTS }) };
            if(this.refs.spinner){
                this.refs.spinner.hide(fn);
            } else {
                fn();
            }
        }, (err) => {
            //Do nothing
        });
    }

    loadAccesories() {
        if(this.refs.spinner)
            this.refs.spinner.show();
        this.setState({ selectedAccesories : [] })
        CharacterService.getAvailableAccesories({characterId : (this.props.profile.characterId || -1)}, (accesories) => {

            var fn = () => { this.setState({ accesories : accesories, currentMode: MODES.ACCESORIES }) };
            if(this.refs.spinner){
                this.refs.spinner.hide(fn);
            } else {
                fn();
            }
        }, (err) => {
            //Do nothing
        });
    }

    loadCharacters() {
        if(this.refs.spinner)
            this.refs.spinner.show();
        CharacterService.getAvailableCharacters((characters) => {
            var fn = () => {
                this.setState({ characters : characters, currentMode: MODES.CHARACTERS })

                //Set the first monster for preview
                let firstItem = _.find(characters, { isBought: true });
                console.log(characters);
                if(firstItem){
                    this.loadCharacter(firstItem.id, []);
                }
            };
            if(this.refs.spinner){
                this.refs.spinner.hide(fn);
            } else {
                fn();
            }
        }, (err) => {
            console.log(err);
        });
    }

    loadCharacter(characterId, accesories) {
        this.refs.spinner.show();

        let characterMake = {
            character: _.find(this.state.characters, { id: characterId }),
            accesories: accesories
        };
        this.setState({ characterMake })
        CharacterService.make({
            characterId: characterId,
            accesories: accesories.map((e) => { return e.id })
        }, (base64) => {
            if(base64 != null) {
                let image = { uri : base64 };
                this.refs.spinner.hide(() => {
                    this.setState({ characterb64 : image })
                });
            }
        }, (err) => {})
    }

    onBuy() {
        this.refs.spinner.show();

        var _buyAccesories = () => {
            //Get the character make
            CharacterService.buyAccesories({
                accesories: this.state.selectedAccesories.map((e) => { return e.id })
            }, (data) => {
                this.refs.spinner.hide(() => {
                    this.refs.dialog.show('success', data.message, () => {
                        setTimeout(() => {
                            this.props.onClose();
                        });
                    });
                    this.props.onUpdateProfile();
                });
            }, (err) => {
                this.refs.dialog.show('error', err.response.data.error.message);
            })
        }

        this.refs.spinner.show();
        if(!this.state.characterMake.character.isBought) {
            CharacterService.buyCharacter({
                characterId: this.state.characterMake.character.id
            }, (data) => {
                if(this.refs.spinner)
                    this.refs.spinner.hide();

                _buyAccesories();
            }, (err) => {
                this.refs.spinner.hide();
                this.refs.dialog.show('error', err.response.data.error.message);
            })
        } else {
            _buyAccesories();
        }
    }

    /* onBuyCharacter(characterId, callback) {
        if(this.refs.spinner)
            this.refs.spinner.show();
    } */

    onLayoutContainer(e) {
        this.setState({ containerDimensions : e.nativeEvent.layout });
    }

    render() {
        var totalMount = 0;
        let pricing = this.state.selectedAccesories.map((e) => { return e.price || 0 });
        for(var idx in pricing) {
            totalMount += pricing[idx];
        }
        if(this.state.characterMake.character != null && this.state.characterMake.character.price > 0 && !this.state.characterMake.character.isBought){
            totalMount += this.state.characterMake.character.price;
        }

        return (
            <View>
                <Overlay visible={this.props.isVisible}
                    closeOnTouchOutside
                    animationType={'slideInDown'}
                    animationOutType={'none'}
                    animationDuration={300}
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

                    <ConfirmationDialog
                        ref='confirmationDialog' />

                    <View style={styles.container} onLayout={this.onLayoutContainer.bind(this)}>
                        { this.state.characterb64 != null &&
                            <CachedImage source={this.state.characterb64} style={styles.avatar} />
                        }

                        <View style={styles.tabs}>

                            <TouchableOpacity onPress={() => {
                                Animated.spring(this.tabIndicatorLeft, {
                                    toValue: 0,
                                    duration: 500
                                }).start();

                                this.loadCharacters();
                            }} style={[styles.tab]}>
                                <Text style={[styles.tab, { fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(15), color: 'white', textAlign: 'center', backgroundColor: 'transparent'}]}>Personajes</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => {
                                Animated.spring(this.tabIndicatorLeft, {
                                    toValue: ((this.state.containerDimensions.width / 3) * 1),
                                    duration: 500
                                }).start();

                                this.loadAccesories();
                            }}
                            style={[styles.tab, { flex : 1 }]}>
                                <Text style={[{ fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(15), color: 'white', textAlign: 'center', backgroundColor: 'transparent'}]}>Accesorios</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => {
                                Animated.spring(this.tabIndicatorLeft, {
                                    toValue: ((this.state.containerDimensions.width / 3) * 2),
                                    duration: 500
                                }).start();

                                this.loadElements();
                            }}
                            style={[styles.tab]}>
                                <Text style={[{ fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(15), color: 'white', textAlign: 'center', backgroundColor: 'transparent'}]}>Vitales</Text>
                            </TouchableOpacity>

                            <Animated.View style={[styles.tabIndicator, { left: this.tabIndicatorLeft }]}></Animated.View>
                        </View>

                        { this.state.characters != null && this.state.currentMode == MODES.CHARACTERS &&
                            <FlatList
                                style={{ width: '100%', height: '100%', borderTopLeftRadius: 80, borderTopRightRadius: 80 }}
                                numColumns={3}
                                centerContent={false}
                                snapToAlignment={'start'}
                                data={this.state.characters}
                                extraData={this.state.characters.length}
                                keyExtractor={(item, index) => {
                                    return 'character-' + item.id
                                }}
                                ListHeaderComponent={() => {
                                    return null;
                                }}
                                renderItem={(rowData) => {

                                    var item = (
                                        <View
                                            style={{ width: '30%', marginTop: 20, flexDirection: 'column', margin: 5 }}>
                                            <TouchableOpacity
                                                key={'character-' + rowData.item.id}
                                                activeOpacity={.3}
                                                onPress={() => {

                                                    this.loadCharacter(rowData.item.id, this.state.characterMake.accesories);

                                                }}>

                                                { !rowData.item.isBought && rowData.item.price != null && rowData.item.price > 0 &&
                                                    <View style={{ right: 0, top: 10, position: 'absolute', backgroundColor: ((this.props.profile.balance_tuls >= rowData.item.price) ? 'rgba(110,220,44,.95)' : 'rgba(255,198,0,.95)'), padding: 5, zIndex: 99, borderRadius: 5, shadowColor: 'white', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 3, elevation: 4, transform: [{ rotateZ: '25deg' }]}}>
                                                        <Text style={{ fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(12), color: '#222', textAlign: 'center', backgroundColor: 'transparent'}}>{ Global.formatPrice(rowData.item.price) } Tuls</Text>
                                                    </View>
                                                }

                                                { rowData.item.isBought &&
                                                    <View style={{ right: 0, top: 10, position: 'absolute', backgroundColor: 'rgba(22, 22,22,.8)', padding: 5, zIndex: 99, borderRadius: 5, shadowColor: 'white', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 3, elevation: 4, transform: [{ rotateZ: '25deg' }]}}>
                                                        <Text style={{ fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(15), color: 'white', textAlign: 'center', backgroundColor: 'transparent'}}>ADQUIRIDO</Text>
                                                    </View>
                                                }

                                                <CachedImage
                                                    style={{ width: '90%', alignSelf: 'center', height: 100, opacity: (rowData.item.price > this.props.profile.balance_tuls) ? .75 : 1, resizeMode: 'contain' }}
                                                    source={{ uri : rowData.item.imageb64 }} />
                                                <Text style={{ marginTop: 10, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(12), color: '#eee', textAlign: 'center', backgroundColor: 'transparent'}}>{ rowData.item.name }</Text>

                                                { this.state.characterMake.character.id == rowData.item.id &&
                                                    <View style={{ position: 'absolute', top: 15, left: 15, marginTop: 5, backgroundColor: 'red', padding: 1, zIndex: 99, borderRadius: 5, shadowColor: 'white', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 3, elevation: 4, width: 20}}>
                                                        <Text style={{ fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(12), color: '#222', textAlign: 'center', backgroundColor: 'transparent'}}>-</Text>
                                                    </View>
                                                }
                                            </TouchableOpacity>
                                        </View>
                                    );

                                    return item;
                                }}
                            />
                        }

                        { this.state.accesories != null && this.state.currentMode == MODES.ACCESORIES &&
                            <FlatList
                                style={{ width: '100%', height: '100%', borderTopLeftRadius: 80, borderTopRightRadius: 80 }}
                                numColumns={3}
                                centerContent={false}
                                snapToAlignment={'start'}
                                data={this.state.accesories}
                                extraData={this.state.accesories.length}
                                keyExtractor={(item, index) => {
                                    return 'accesory-' + item.id
                                }}
                                ListHeaderComponent={() => {
                                    return null;
                                }}
                                renderItem={(rowData) => {

                                    var item = (
                                        <View
                                            style={{ width: '30%', marginTop: 20, flexDirection: 'column', margin: 5 }}>
                                            <TouchableOpacity
                                                activeOpacity={.3}
                                                onPress={() => {

                                                    if(false && this.props.profile.balance_tuls < rowData.item.price) {
                                                        this.refs.dialog.show('error', 'No tienes suficientes tuls para comprar este item.');
                                                    } else {

                                                        let accesories = this.state.selectedAccesories;
                                                        if(accesories.indexOf(rowData.item) > -1){
                                                            accesories.splice(accesories.indexOf(rowData.item), 1);
                                                        } else {
                                                            let itemSameCategory = this.state.selectedAccesories.find((e) => { return e.category == rowData.item.category });
                                                            let existsItemWithSameCategory = itemSameCategory != null;
                                                            if(existsItemWithSameCategory){
                                                                accesories.splice(this.state.selectedAccesories.indexOf(itemSameCategory), 1);
                                                            }

                                                            accesories.push(rowData.item);
                                                        }
                                                        this.setState({ selectedAccesories: accesories })
                                                        this.loadCharacter(this.state.characterMake.character.id, accesories);
                                                    }
                                                }}>

                                                { rowData.item.price != null && rowData.item.price > 0 &&
                                                    <View style={{ right: 0, top: 10, position: 'absolute', backgroundColor: ((this.props.profile.balance_tuls >= rowData.item.price) ? 'rgba(110,220,44,.95)' : 'rgba(255,198,0,.95)'), padding: 5, zIndex: 99, borderRadius: 5, shadowColor: 'white', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 3, elevation: 4, transform: [{ rotateZ: '25deg' }]}}>
                                                        <Text style={{ fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(12), color: '#222', textAlign: 'center', backgroundColor: 'transparent'}}>{ Global.formatPrice(rowData.item.price) } Tuls</Text>
                                                    </View>
                                                }

                                                <CachedImage
                                                    style={{ width: '90%', alignSelf: 'center', height: 100, opacity: (rowData.item.price > this.props.profile.balance_tuls) ? .75 : 1, resizeMode: 'contain' }}
                                                    source={{ uri : rowData.item.imageb64 }} />
                                                <Text style={{ marginTop: 10, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(12), color: '#eee', textAlign: 'center', backgroundColor: 'transparent'}}>{ rowData.item.name }</Text>
                                                { this.state.selectedAccesories.indexOf(rowData.item) > -1 &&
                                                    <View style={{ position: 'absolute', top: 15, left: 15, marginTop: 5, backgroundColor: 'red', padding: 1, zIndex: 99, borderRadius: 5, shadowColor: 'white', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 3, elevation: 4, width: 20}}>
                                                        <Text style={{ fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(12), color: '#222', textAlign: 'center', backgroundColor: 'transparent'}}>-</Text>
                                                    </View>
                                                }
                                            </TouchableOpacity>
                                        </View>
                                    );

                                    return item;
                                }}
                            />
                        }

                        { this.state.lifeElements != null && this.state.currentMode == MODES.LIFE_ELEMENTS &&
                            <FlatList
                                style={{ width: '100%', height: '100%', borderTopLeftRadius: 80, borderTopRightRadius: 80 }}
                                numColumns={3}
                                centerContent={false}
                                snapToAlignment={'start'}
                                data={this.state.lifeElements}
                                extraData={this.state.lifeElements.length}
                                keyExtractor={(item, index) => {
                                    return 'lifeElement-' + item.id
                                }}
                                ListHeaderComponent={() => {
                                    return null;
                                }}
                                renderItem={(rowData) => {

                                    var item = (
                                        <View
                                            style={{ width: '30%', marginTop: 20, flexDirection: 'column', margin: 5 }}>
                                            <TouchableOpacity
                                                key={'lifeElement-' + rowData.item.id}
                                                activeOpacity={.3}
                                                onPress={() => {
                                                    CharacterService.buyElementalLifeAccesory(rowData.item.id, (response) => {
                                                        this.refs.dialog.show('success', response.message, () => {
                                                            this.successSound.play();
                                                            this.props.onUpdateProfile(true);
                                                        });
                                                    }, (err) => {
                                                        this.refs.dialog.show('error', err.response.data.error.message);
                                                    });
                                                }}>

                                                { rowData.item.price != null && rowData.item.price > 0 &&
                                                    <View style={{ right: 0, top: 10, position: 'absolute', backgroundColor: ((this.props.profile.balance_tuls >= rowData.item.price) ? 'rgba(110,220,44,.95)' : 'rgba(255,198,0,.95)'), padding: 5, zIndex: 99, borderRadius: 5, shadowColor: 'white', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 3, elevation: 4, transform: [{ rotateZ: '25deg' }]}}>
                                                        <Text style={{ fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(12), color: '#222', textAlign: 'center', backgroundColor: 'transparent'}}>{ Global.formatPrice(rowData.item.price) } Tuls</Text>
                                                    </View>
                                                }

                                                <CachedImage
                                                    style={{ width: '60%', alignSelf: 'center', height: 100, opacity: (rowData.item.price > this.props.profile.balance_tuls) ? .75 : 1, resizeMode: 'contain' }}
                                                    source={{ uri : rowData.item.imageb64 }} />
                                                <Text style={{ marginTop: 10, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(12), color: '#eee', textAlign: 'center', backgroundColor: 'transparent'}}>{ rowData.item.name }</Text>
                                                <Text style={{ marginTop: 10, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(10), color: '#aaa', textAlign: 'center', backgroundColor: 'transparent'}}>¡Suma { rowData.item.life }% de vida!</Text>
                                            </TouchableOpacity>
                                        </View>
                                    );

                                    return item;
                                }}
                            />
                        }

                        { totalMount > 0 &&
                            <TouchableOpacity
                                onPress={() => {
                                    if(totalMount > this.props.profile.balance_tuls) {
                                        this.refs.dialog.show('error', 'No tienes suficientes tuls para comprar estos items.');
                                    } else {
                                        this.refs.confirmationDialog.show('¿Seguro desea realizar la compra?', {
                                            onSuccess: () => {
                                                setTimeout(() => {
                                                    this.refs.confirmationDialog.hide();
                                                })
                                                this.onBuy();
                                            },
                                            onCancel: () => {
                                                this.refs.confirmationDialog.hide();
                                            }
                                        });
                                    }
                                }}
                                activeOpacity={1}
                                style={{ width: '100%', marginBottom: 0, paddingLeft: 0, justifyContent: 'center', width: '98%', height: 50, backgroundColor: Color.BluePrimary, alignSelf: 'center', marginVertical: 15, borderRadius: 5, shadowColor: 'rgba(255,255,255,.5)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 1 }}>
                                <Text style={{ marginRight: 5, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(24), color: '#eee', textAlign: 'center', backgroundColor: 'transparent'}}>COMPRAR ({Global.formatPrice(totalMount)} TULS)</Text>
                            </TouchableOpacity>
                        }
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
    avatar: {
        width: 250,
        height: 150,
        resizeMode: 'contain'
    },
    tabs: {
        flex: 0,
        flexDirection: 'row',
        width: '100%',
        paddingVertical: 10,
        borderBottomColor: 'rgba(255,255,255,.1)',
        borderBottomWidth: 1,
        justifyContent: 'space-between'
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 5
    },
    tabIndicator: {
        flex: 1,
        height: 4,
        position: 'absolute',
        left: 0,
        bottom: -2,
        borderRadius: 3,
        width: '30%',
        backgroundColor: Color.BluePrimary
    }
});
