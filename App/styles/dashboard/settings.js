import {
  StyleSheet,
  Image,
  Dimensions
} from 'react-native';

import { Color, Font } from './../default';
import { Global } from '../../components/common/global';

var {height, width} = Dimensions.get('window');
export const SettingsStyle = StyleSheet.create({
    /** Settings screen styles **/
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  inner: {
    flex: 1,
    marginTop: 20,
    marginBottom: 50,
    width: '90%',
    alignSelf: 'center'
  },
  blueBg: {
    backgroundColor: Color.blue,
    padding: 10,
  },
  item: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemText: {
    flex: 1,
    color: 'white',
    fontFamily: Font.ProximaNovaRegular,
    fontSize: 16
  },
  switch: {
    flex: 1
  },
  linkSocialMediaContainer: {
    marginTop: 30,
    flexDirection: 'row',
    height: 30,
    width: '80%',
    alignSelf: 'center',
    alignItems: 'center'
  },
  textSocialMedia: {
    flex: 1,
    color: '#565656',
    fontFamily: Font.ProximaNovaRegular,
    fontSize: 18
  },
  tick: {
    width: 20,
    resizeMode: 'contain'
  },
  footerView: {
    height: 1,
    marginTop: 10,
    width: '85%',
    backgroundColor: '#e9e9e9',
    alignSelf: 'center'
  },
  /** Link social screen styles **/
  lsContainer: {
    backgroundColor: Color.darkBlue,
    flex: 1,
  },
  lsItems: {
    flex: 1,
    paddingTop: 20,
    padding: 20,
  },
  lsItem: {
    marginTop: 10,
    marginBottom: 10,
  },
  lsHeaderText: {
    color: 'white',
    fontSize: 16,
    paddingLeft: 20,
    paddingTop: 40,
    paddingBottom: 0,
  }
});
