import {
  StyleSheet,
  Image,
  Dimensions
} from 'react-native';

// ES6 module syntax
import LocalizedStrings from 'react-native-localization';

let translations = new LocalizedStrings({

    //Wordeo translations
    en: {
        LoginWithFacebook: 'Login with Facebook',
        Rooms: 'Rooms',
        Round: 'Round',
        Categories: 'Categories',
        Question: 'Question',
        Confirm: 'Confirm',
        Cancel: 'Cancel'
    },
    es: {
        LoginWithFacebook: 'Entrar con Facebook',
        Rooms: 'Salas',
        Round: 'Ronda',
        Categories: 'Categorias',
        Question: 'Pregunta',
        Confirm: 'Confirmar',
        Cancel: 'Cancelar'
    }
});

export var strings = translations;
