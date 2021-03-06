import {
  StyleSheet,
  Image,
  Dimensions,
  Platform
} from 'react-native';
import { Color, Font } from './default';

var {height, width} = Dimensions.get('window');
export const RegisterStyle = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: Color.lightGray
  },
  avatarImageContainer: {
    marginRight: 20,
    marginTop: 10,
    marginBottom: 30,
    height: width * .3,
    width: width * .3,
    zIndex: 2,
    alignSelf: 'flex-end'
  },
  avatarImage: {
    width: width * .3,
    height: width * .3,
    alignSelf: 'flex-end',
    borderRadius: 64
  },
  keyboardContainer: {
    flex: 1,
    flexDirection: 'column'
  },
  scrollView: {
    zIndex: 1,
    width: width,
    alignSelf: 'center',
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    paddingLeft: 30,
    paddingRight: 30,
  },
  scrollViewContent: {
    paddingBottom: 70,
    flexDirection: 'column',
    flex: 1
  },
  bottomButtonsContainer: {
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
    marginTop: 20,
    padding: 3,
    flexDirection: 'row',
  },
  finishButton: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    marginRight: 10,
    backgroundColor: 'transparent'
  },
  imageNextBack: {
    alignSelf: 'center',
    height: '100%',
    resizeMode: 'contain',
  },
  verificationNumberContainer: {
    flexDirection: 'row',
  },
  verificationNumber: {
    flex: 1,
    backgroundColor: 'white',
    margin: 10,
    marginLeft: 0,
    height: 'auto'
  },
  verificationNumberInput: {
    fontSize: 20,
    height: 50,
    textAlign: 'center',
    fontFamily: Font.ProximaNovaRegular,
  },
  verificationNumberLabel: {
    height: 50
  },
  iconEye: {
    width: 22,
    height: 13
  },
  containerIconPassword: {
    padding: 5,
    borderRadius: 10,
    backgroundColor: 'transparent',
    position: 'absolute',
    right: '5%',
    top: 0,
    width: 30,
    height: 30,
    flexDirection: 'row'
  },
  resendCode: {
    fontFamily: Font.ProximaNovaBold,
    alignSelf: 'center',
    color: '#888888'
  },
  ageBracketContainer: {
    marginTop: 13,
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
    maxWidth: '85%',
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#E0E0E0',
  },
  topEmptyBarBlue: {
    height: 20,
    width: '100%',
    backgroundColor: Color.blue
  },
  headerTitle: {
    marginTop: 20,
    marginBottom: 15
  },
  headerTitleText: {
    color: Color.blue,
    fontSize: 21,
  },
  inputsInline: {
    position: 'relative',
    width: '100%',
    flexDirection: 'row',
    height: (Platform.OS === 'ios' ? 35 : 40),
    marginTop: 0
  }
});
