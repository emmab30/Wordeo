import {
  StyleSheet,
  Image,
  Dimensions,
  Platform
} from 'react-native';
import { Color, Font } from './default';

var {height, width} = Dimensions.get('window');
export const DropdownStyle = StyleSheet.create({
    dropdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 15,
        marginBottom: 7
    },
    dropdown: {
        textAlign: 'left',
        width: '100%',
        alignSelf: 'center',
        borderBottomWidth: 1,
        borderColor: '#e4e4e6',
        backgroundColor: 'transparent',
        zIndex: 99,
    },
    dropdownText: {
        marginTop: 7,
        marginBottom: 3,
        marginHorizontal: 3,
        fontSize: 16,
        fontFamily: Font.NunitoBold,
        color: '#a0a0a3',
        position: 'relative',
        left: -3,
    },
    dropdownDropdown: {
        width: '35%',
        shadowColor: '#222',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
        paddingHorizontal: 0,
        height: 85,
    },
    dropdownSeparator: {
        height: 1,
        width: '90%',
        alignSelf: 'center',
        backgroundColor: 'rgba(200,199,204,.5)',
    },
    dropdownTextHighlightStyle: {
        backgroundColor: '#fff',
    },
    dropdownRowText: {
        flex: 8,
        marginHorizontal: 4,
        marginLeft: 10,
        fontSize: 16,
        fontFamily: Font.NunitoRegular,
        color: '#7f7f7f',
        textAlignVertical: 'center',
    },
    dropdownRow: {
        flex: 1,
        flexDirection: 'row',
        height: 40,
        alignItems: 'center',
    },
    dropdownImage: {
        flex: 2,
        marginLeft: 4,
        width: 30,
        height: 30,
        alignSelf: 'flex-end',
        position: 'relative',
        top: -3,
    },
    downArrow: {
        position: 'relative',
        left: -20,
        height: 20,
        width: 20,
        zIndex: -1,
    },
});