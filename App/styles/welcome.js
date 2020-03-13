import {
  StyleSheet,
  Image,
  Dimensions
} from 'react-native';
import { Color, Font } from './default';

var {height, width} = Dimensions.get('window');
export const WelcomeStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.darkBlue,
    alignItems: 'center',
    justifyContent: 'center'
  },
  welcomeContainer: {
      width: width,
      alignItems: 'center',
      alignSelf: 'center',
      justifyContent: 'center'
  },
  nextContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  welcomeText: {
      fontFamily: Font.ProximaNovaRegular,
      color: 'white',
      fontSize: 50,
      marginBottom: 15,
      textAlign: 'center'
  },
  startChattingText: {
    fontFamily: Font.ProximaNovaRegular,
    color: Color.yellow,
    fontSize: 15
  },
  nextText: {
    fontFamily: Font.ProximaNovaRegular,
    color: 'white',
    fontSize: 15,
    marginRight: 10
  },
  nextArrow: {
    resizeMode: 'contain',
    width: 25
  }
});
