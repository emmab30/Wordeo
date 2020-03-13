import {
  StyleSheet,
  Image,
  Dimensions,
  Platform
} from 'react-native';

import { Color, Font } from './default';
import { Global } from '../components/common/global';

var {height, width} = Dimensions.get('window');
export const GeneralStyle = StyleSheet.create({
    headerCloseTitle: {
        marginTop: 20,
        paddingLeft: 10,
        height: 100,
    },
    closeIconContainer: {
        height: 30
    },
    closeIcon: {
        width: 20,
        resizeMode: 'contain',
        flex: 1
    },
    viewTitle: {
        fontFamily: Font.ProximaNovaRegular,
        color: 'white',
        fontSize: 24,
        backgroundColor: 'transparent',
        alignSelf: 'center'
    },
    fProximaNovaRegular: {
        fontFamily: Font.ProximaNovaRegular
    },
    fProximaNovaSemibold: {
        fontFamily: Font.ProximaNovaSemibold
    },
    fProximaNovaItalic: {
        fontFamily: Font.ProximaNovaItalic
    },
    centered: {
        textAlign: 'center'
    },
    white: {
        color: '#fff'
    },
    //Buttons
    buttonWhiteBlue: {
        height: 45,
        width: width/2.5,
        borderRadius: 23,

        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonWhiteBlueText: {
        color: Color.blue,
        fontFamily: Font.ProximaNovaSemibold
    },
    buttonBlueWhite: {
        height: 40,
        width: width/2.5,
        borderRadius: 25,
        backgroundColor: Color.blue,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonBlueWhiteText: {
        color: 'white',
        fontFamily: Font.ProximaNovaSemibold
    },
    //Font sizes
    f15: {
        fontSize: 15
    },
    f16: {
        fontSize: 16
    },
    f17: {
        fontSize: 17
    },
    f18: {
        fontSize: 18
    },
    f19: {
        fontSize: 19
    },
    header: {
        marginVertical: 10,
        width: '100%',
        fontSize: 17,
        fontFamily: Font.TitanOne,
        textAlign: 'center'
    },
    transparent: {
        backgroundColor: 'transparent'
    },
    textInput: {
        minHeight: (Platform.OS === 'ios' ? 45 : 'auto'),
        height: (Platform.OS === 'ios' ? 45 : 40),
        fontFamily: Font.NunitoRegular
    },
    transparentButton: {
        backgroundColor: 'transparent'
    },
    transparentText: {
        backgroundColor: 'transparent'
    },
    customNavbarTitle: {
        backgroundColor: 'transparent',
        fontSize: 15,
        fontFamily: Font.TitanOne,
        color: '#fff',
        textAlign: 'center',
        alignSelf: 'center',
        marginRight: 5
    }
});
