import {
  StyleSheet,
  Image,
  Dimensions,
  Platform
} from 'react-native';

var {height, width} = Dimensions.get('window');
export const Color = {
    //Primary app colors
    BluePrimary: '#0368ff',
    BlueSecondary: '#3778d8',
    OrangePrimary: '#ed5e26',
    OrangeSecondary: '#ed6552',
    VioletPrimary: '#cd03ff',
    VioletSecondary: '#ab4bc3',
    GoldenPrimary: '#feb035',
    GoldenSecondary: '#ed9100',
    GreenPrimary: '#00c742',
    GreenSecondary: '#009d34',

    LightPrimary: '#fff',
    LightSecondary: '#cfcfcf',
    DarkPrimary: '#222',
    DarkSecondary: '#666',
};
export const Font = {
    //PTSans
    PTSansRegular: (Platform.OS === 'ios' ? 'PTSans-Regular' : 'Quicksand-Light'),
    PTSansBold: (Platform.OS === 'ios' ? 'PTSans-Bold' : 'Quicksand-Medium'),

    //Titan One
    TitanOne: (Platform.OS === 'ios' ? 'TitanOne' : 'TitanOne-Regular')
}
