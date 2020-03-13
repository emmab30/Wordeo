import {
    StyleSheet,
    Image,
    Dimensions
} from 'react-native';
import { Color, Font } from './../default';

var {height, width} = Dimensions.get('window');
export const SubscriptionStyle = StyleSheet.create({
    container: {
        minHeight: '100%',
        flex: 0,
        backgroundColor: Color.white,
        paddingVertical: 30,
        alignSelf: 'center',
        alignItems: 'center'
    },
    headerText: {
        fontFamily: Font.ProximaNovaThin,
        color: Color.blue,
        fontSize: 30,
        marginVertical: 10,
        textAlign: 'center'
    },
    boxText: {
        width: width * .7,
        alignSelf: 'center',
        marginVertical: 10
    },
    lorem: {
        color: '#868686',
        fontFamily: Font.ProximaNovaRegular,
        fontSize: 15,
        textAlign: 'center'
    },
    bold: {
        color: '#868686',
        fontFamily: Font.ProximaNovaSemibold,
        fontSize: 16
    },
    boxBorderBlue: {
        borderRadius: 10,
        borderColor: Color.blue,
        borderWidth: 1,
        width: width * .8,
        padding: 10
    },
    item: {
        fontFamily: Font.ProximaNovaRegular,
        marginLeft: '10%',
        paddingVertical: 5
    },
    buttonIconLeft: {
        width: 30,
        marginRight: 10,
        resizeMode: 'contain'
    },
    noticePrice: {
        textAlign: 'center',
        fontSize: 19,
        color: Color.white,
        fontFamily: Font.ProximaNovaSemibold
    },
    price: {
        width: width * .9,
        paddingLeft: width * .1,
        marginVertical: 15,
        textAlign: 'left',
        alignSelf: 'flex-start',
        fontSize: 35,
        color: Color.white,
        fontFamily: Font.ProximaNovaItalic
    }
});
