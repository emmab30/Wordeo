import {
  StyleSheet,
  Image,
  Dimensions,
  Platform
} from 'react-native';
import { Color, Font } from './default';

var {height, width} = Dimensions.get('window');
export const DemoStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.OrangePrimary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  slideBackgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  skipContainer: {
    position: 'absolute',
    right: 20,
    top: 20,
    backgroundColor: 'transparent'
  },
  skipButton: {
    fontSize: 20
  },
  dotsContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 30,
    justifyContent: 'center', 
    alignSelf: 'center'
  },
  dot: {
    height: 6,
    width: 6,
    margin: 4,
    borderRadius: 3
  },
  inactive: {
    backgroundColor: 'rgba(255,255,255,.5)',
  },
  active: {
    backgroundColor: 'white',
  },
  imageContainer: {
      justifyContent: 'center'
  },
  bgImageContainer: {
      width: width,
      height: height,
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
  },
  slide1: {
    flex: 1,
    alignItems: 'center'
  },
  slide1LogoContainer: {
    flex: 4,
    maxWidth: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  slide1Logo: {
    resizeMode: 'contain'
  },
  slide1Content: {
    flex: 0.7,
    maxWidth: '80%'
  },
  slideContent: {
    flex: 0.9,
    maxWidth: '80%',
    width: '80%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  startNowBtn: {
    backgroundColor: 'white',
    borderRadius: 22,
    width: '100%',
    height: 45,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  startNowBtnText: {
    fontFamily: Font.NunitoBold,
    fontSize: 18,
    color: Color.primaryBlue,
  }
});
