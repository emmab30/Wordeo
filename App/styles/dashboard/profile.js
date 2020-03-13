import {
    StyleSheet,
    Image,
    Dimensions,
    Platform
} from 'react-native';

import { Color, Font } from './../default';
import { Global } from '../../components/common/global';

var {height, width} = Dimensions.get('window');
export const ProfileStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    inner: {
        flex: 1,
        zIndex: 99
    },
    avatarHeader: {
        height: 100,
        alignItems: 'flex-start',
        justifyContent: 'center',
        flex: 1,
        marginVertical: 10,
        width: '100%',
        zIndex: 99,
        overflow: 'hidden',
    },
    avatarImageContainer: {
        height: 100,
        width: 100,
        //flex: 1,
        flexDirection: 'row',
        overflow: 'hidden',
        marginHorizontal: 10
    },
    avatarImage: {
        width: (Platform.OS === 'ios' ? 90 : '100%'),
        height: (Platform.OS === 'ios' ? 90 : '100%'),
        //resizeMode: 'cover',
        borderRadius: (Platform.OS === 'ios' ? 45 : 50),
        borderColor: 'white',
        elevation: 3,
        borderWidth: 1,
    },
    nameUploadPhoto: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    name: {
        alignSelf: 'flex-start',
        textAlign: 'left',
        color: '#000000',
        fontFamily: Font.NunitoBold,
        fontSize: Global.normalizeFontSize(18),
        marginVertical: 15,
        maxWidth: '99%'
    },
    uploadPhotoText: {
        alignSelf: 'flex-start',
    },
    scrollView: {
        width: width,
        alignSelf: 'center',
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white',
        paddingLeft: 30,
        paddingRight: 30,
        paddingTop: 0,
        zIndex: 99
    },
    scrollViewContent: {
        paddingBottom: 15,
    },
    finishButton: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: Color.blue,
        justifyContent: 'center',
        alignItems: 'center',
        height: 70,
        width: width,
    },
    finishButtonText: {
        color:'#fff',
        textAlign:'center',
        fontWeight: 'bold',
        paddingVertical: 10,
        fontFamily: 'karla_bold'
    },
    ageBracketContainer: {
        marginTop: 0,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start'
    },
    ageBracket: {
        flex: 1,
        alignSelf: 'flex-start',
        height: 20
    },
    iconArrowBottom: {
        height: 20,
        width: 15,
        alignSelf: 'flex-start',
        resizeMode: 'center',
    },
    separator: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginTop: 10
    },
    input: {
        minHeight: (Platform.OS === 'ios' ? 40 : 'auto')
    }
});
