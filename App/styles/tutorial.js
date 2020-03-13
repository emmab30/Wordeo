import {
  StyleSheet,
  Image,
  Dimensions,
  Platform
} from 'react-native';
import { Color, Font } from './default';

var {height, width} = Dimensions.get('window');
export const TutorialStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.darkBlue,
    alignItems: 'center',
    justifyContent: 'center'
  },
  imageContainer: {
      justifyContent: 'center'
  },
  bgImageContainer: {
      width: width,
      height: (Platform.OS === 'ios' ? height : height - 20),
      justifyContent: 'center',
      resizeMode: 'stretch'
  },
  image1: {
      position: 'relative',
      width: width,
      height: height / 2,
      alignSelf: 'center',
      resizeMode: 'contain'
  },
  image2: {
      position: 'relative',
      width: width,
      height: height / 2,
      alignSelf: 'center',
      resizeMode: 'contain'
  },
  image3: {
      position: 'relative',
      width: width,
      height: height / 2,
      alignSelf: 'center',
      resizeMode: 'contain'
  },
  image4: {
      maxWidth: width,
      height: height - 20,
      alignSelf: 'flex-start',
      resizeMode: 'stretch'
  }
});
