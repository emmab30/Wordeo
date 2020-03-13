/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Dimensions,
  Animated,
  ImageBackground,
  FlatList
} from 'react-native';

//Localization
import { strings } from '../../components/localization/strings';

//Components
import CustomNavbar from '../../components/navigation/CustomNavbar'
import RankingItem from '../../components/componentsJs/RankingItem';
import SpinnerComponent from '../../components/SpinnerComponent';

//Services
import { AnalyticsService, CharacterService } from '../../services/Services'

//Plugins
import Icon from 'react-native-vector-icons/FontAwesome';
import { Navigation } from 'react-native-navigation';
import { Global } from '../../components/common/global';
import { ProfileStyle } from '../../styles/dashboard/profile';

//Styles
import { Color, Font } from '../../styles/default';

var {height, width} = Dimensions.get('window');

export default class Ranking extends Component {
    constructor(props) {
        super(props);
        this.state = {
            players: [],
            scrollOffsetY: new Animated.Value(0)
        }

        this.getRankingTopPlayers = this.getRankingTopPlayers.bind(this);

        AnalyticsService.trackScreenView('ranking');
    }

    getRankingTopPlayers() {
        this.refs.spinner.show();

        CharacterService.getRankingTopPlayers({}, (ranking) => {
            this.setState({ players: ranking.players, myPosition: ranking.myPosition });
            setTimeout(() => {
                this.refs.spinner.hide();
            }, 1300);
        }, (err) => {
            //Do nothing
        });
    }

    componentDidMount() {
        this.getRankingTopPlayers();
    }

    renderNavbar() {
        return (
            <CustomNavbar
                navigator={this.props.navigator}
                gradientColors={['#ED6552', '#ed5e26']}
                backButton={true}
                title={'Top ranking'}
            />
        );
    }

    getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    render() {
        const backgroundColor = this.state.scrollOffsetY.interpolate({
            inputRange: [-50, 150],
            outputRange: ['#fff', Color.GoldenPrimary]
        });

        return (
            <Animated.View style={[ProfileStyle.container, { backgroundColor: backgroundColor }]}>
                <ImageBackground
                    style={{ width: '100%', height: '100%' }}
                    source={require('../../images/wordeo/ranking/background.png')}>

                    { this.renderNavbar() }

                    <SpinnerComponent
                        ref={'spinner'} />

                    <FlatList
                        centerContent={false}
                        style={{ paddingTop: 15 }}
                        snapToAlignment={'start'}
                        data={this.state.players}
                        extraData={this.state.players.length}
                        keyExtractor={(item, index) => {
                            return 'playerId-' + item.id
                        }}
                        ListHeaderComponent={() => {
                            return (
                                <Text style={{ marginRight: 5, marginTop: 10, fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(30), color: Color.BluePrimary, textAlign: 'center', backgroundColor: 'transparent'}}>LOS MEJORES 20</Text>
                            );
                        }}
                        onScroll={Animated.event([
                            {
                                nativeEvent: {
                                    contentOffset: {
                                        y: this.state.scrollOffsetY
                                    }
                                }
                            }
                        ])}
                        renderItem={(rowData) => {
                            return (
                                <RankingItem
                                    player={rowData.item}
                                    index={rowData.index} />
                            );
                        }}
                    />

                    <View style={styles.stats}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontFamily: Font.TitanOne, fontSize: Global.normalizeFontSize(15), color: '#eee', textAlign: 'center', backgroundColor: 'transparent'}}>TU POSICION EN EL RANKING</Text>
                            <View style={{ marginLeft: 20, backgroundColor: Color.GoldenPrimary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontFamily: Font.TitanOne, backgroundColor: 'transparent', fontSize: Global.normalizeFontSize(30), color: Color.LightPrimary, textAlign: 'center' }}>{ this.state.myPosition }</Text>
                            </View>
                        </View>
                    </View>
                </ImageBackground>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    loadingContainer : {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    formContainer: {
        width: '90%',
        maxWidth: '90%',
        alignSelf: 'center',
        flex: 1,
        flexDirection: 'column'
    },
    inputContainer: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    formInput: {
        flex: 1,
        fontFamily: Font.PTSansRegular
    },
    formIcon: {
        marginRight: 10
    },
    avatarImageContainer: {
        flex: 1,
        width: '100%'
    },
    avatarImageBackground: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
        justifyContent: 'center'
    },
    avatar: {
        flex: 0,
        width: '100%',
        height: 100,
        resizeMode: 'contain',
        //width: 100,
        //height: 100,
        //borderRadius: 50,
        alignSelf: 'center'
    },
    avatarName: {
        color: 'white',
        fontSize: Global.normalizeFontSize(20),
        marginVertical: 10,
        backgroundColor: 'transparent',
        fontFamily: Font.PTSansRegular,
        textAlign : 'center'
    },
    buttonUpdate: {
        minWidth: '100%',
        width: '100%',
        borderRadius: 10,
        backgroundColor: Color.OrangePrimary,
        height: 50
    },
    stats: {
        flex: 0,
        borderTopLeftRadius: 10,
        borderBottomRightRadius: 10,
        margin: 10,
        padding: 5,
        backgroundColor: 'rgba(22,22,22,0.95)'
    }
});