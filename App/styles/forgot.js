import {
  StyleSheet,
  Image,
  Dimensions
} from 'react-native';

import { Color, Font } from './default';
import { Global } from '../components/common/global';

var {height, width} = Dimensions.get('window');
export const ForgotStyle = StyleSheet.create({
  containerPrimary: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: null
  },
  containerLogo: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20
  },
  logo: {
    width: width / 1.3,
    height: 105
  },
  keyboardContainer: {
      height: height - 80, //Navbar height
      flexDirection: 'row',
      justifyContent: 'center',
  },
  containerForm: {
    alignItems: 'center',
    flex: 1,
    marginBottom: 0
  },
  textMargin: {
    marginTop: 30
  },
  loginButton: {
    backgroundColor: Color.blue,
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 40,
    flex: 0.2,
    marginHorizontal: 20,
    flexDirection: 'row'
  },
  loginButtonText: {
    color:'#fff',
    textAlign:'center',
    fontWeight: 'bold',
    paddingVertical: 10,
    fontFamily: Font.KarlaBold
  },
  bottomButton: {
    flex: 1
  },
  containerBottom: {
    backgroundColor: 'black',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 36
  },
  bottomButtonText: {
    color:'#fff',
    textAlign:'center',
    paddingVertical: 10,
    fontSize: 12,
    fontFamily: Font.KarlaItalic
  },
  containerInput: {
    width: width / 1.2,
    justifyContent: 'center',
  },
  input: {
    color: 'white',
    fontSize: 15,
    flex: 1,
    height: height / 10,
    alignSelf: 'center'
  },
  iconFieldUsername: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    alignSelf: 'flex-end',
    position: 'absolute',
    right: '0%',
    bottom: 2.5
  },
  iconFieldPassword: {
    width: 23,
    height: 28,
    alignSelf: 'flex-end',
    position: 'absolute'
  },
  iconEye: {
    width: 23,
    height: 28
  },
});
