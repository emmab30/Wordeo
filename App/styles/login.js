import {
  StyleSheet,
  Image,
  Dimensions,
  Platform,
  PixelRatio
} from 'react-native';

import { Color, Font } from './default';
import { Global } from '../components/common/global';

var {height, width} = Dimensions.get('window');
if(Platform.OS === 'ios') {
    height = height + 5;
}

export const LoginStyle = StyleSheet.create({
  containerPrimary: {
    flex: 1,
    //minHeight: height
  },
  backgroundImage: {
      flex: 1,
      width: '100%',
      maxWidth: '90%',
      alignSelf: 'center',
      height: null,
  },
  containerLogo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  logo: {
    width: width * .8,
    height: '80%',
    resizeMode: 'contain',
    alignSelf: 'flex-end',
    marginVertical: 0
  },
  keyboardContainer: {
    height: height,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  containerForm: {
    alignItems: 'center',
    alignSelf: 'center',
    flex: 2.5,
    flexDirection: 'column',
    maxWidth: width * .8
  },
  loginButton: {
    marginTop: 20,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: width * .8,
    borderRadius: 22,
    backgroundColor: '#ff6600'
  },
  loginButtonText: {
    color:'#fff',
    backgroundColor: 'transparent',
    textAlign:'center',
    paddingVertical: 10,
    fontSize: Global.normalizeFontSize(18),
    fontFamily: Font.NunitoBold
  },
  loginButtonFacebook: {
    marginTop: 10,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    width: width * .8,
    borderRadius: 22,
    marginTop: '20%',
    backgroundColor: Color.BluePrimary,
    borderWidth: 2,
    borderColor: '#fff',
    flexDirection: 'row'
  },
  loginButtonFacebookText: {
    marginLeft: 10,
    color:'#fff',
    backgroundColor: 'transparent',
    textAlign:'center',
    paddingVertical: 10,
    fontSize: Global.normalizeFontSize(18),
    fontFamily: Font.PTSansRegular
  },
  forgotPasswordButton: {
    marginTop: 10
  },
  forgotPasswordButtonText: {
    color: Color.primaryBlue,
    fontSize: Global.normalizeFontSize(16),
    fontFamily: Font.NunitoSemiBold
  },
  buttonRegister: {
    width: width,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  bottomButtonTextRegister: {
    fontSize: Global.normalizeFontSize(16),
    color: Color.primaryBlue,
    fontFamily: Font.NunitoSemiBold,
  },
  bottomButtonTextForgot: {
      backgroundColor: 'transparent',
      textAlign: 'center',
      color: 'white',
      fontFamily: Font.ProximaNovaSemibold,
      fontSize: Global.normalizeFontSize(14)
  },
  containerBottom: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    paddingBottom: 40
  },
  bottomButtonText: {
    color:'#fff',
    textAlign:'center',
    paddingVertical: 10,
    fontSize: Global.normalizeFontSize(12),
    fontFamily: Font.KarlaItalic
  },
  containerInput: {
    width: '85%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center'
  },
  input: {
    fontFamily: Font.NunitoSemiBold,
    color:'#7f7f7f',
    width: '100%',
    fontSize: Global.normalizeFontSize(16),
    paddingLeft: 10,
    minHeight: Platform.OS == 'ios' ? 45 : 'auto'
  },
  iconFieldUsername: {
    width: 25,
    height: 25,
    alignSelf: 'flex-end',
    position: 'absolute'
  },
  iconFieldPassword: {
    width: 23,
    height: 28
  },
  iconEye: {
    width: 22,
    height: 13
  },
  containerIconPassword: {
    position: 'absolute',
    alignSelf: 'flex-end',
    flexDirection: 'row'
  }
});