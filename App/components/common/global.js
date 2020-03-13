import EventEmitter from 'EventEmitter';
import Orientation from 'react-native-orientation';
import { Color, Font } from '../../styles/default'
import { Platform, PermissionsAndroid, Dimensions, PixelRatio } from 'react-native';

//Localization
import { strings } from '../localization/strings'

export class Global {
    static Screen = {
        Home: {
            screen: 'OpenEnglish.Home',
            path: 'home',
            title: '',
            navigatorStyle: {
                navBarHidden: true,
                statusBarHidden: true,
                statusBarTextColorScheme: 'light'
            },
            navigatorButtons: {}
        },
        Login: {
            screen: 'OpenEnglish.Login',
            path: 'login',
            title: '',
            navigatorStyle: {
                navBarHidden: true,
                statusBarHidden: true,
                statusBarTextColorScheme: 'light'
            },
            navigatorButtons: {}
        },
        Demo: {
            screen: 'OpenEnglish.Demo',
            path: 'demo',
            title: '',
            navigatorStyle: {
                navBarHidden: true,
                statusBarHidden: true,
                statusBarTextColorScheme: 'light'
            },
            navigatorButtons: {}
        },
        Dashboard: {
            Home: {
                screen: 'OpenEnglish.Dashboard.Home',
                path: 'home',
                title: '',
                navigatorStyle: {
                    statusBarHidden: true,
                    navBarHideOnScroll: false,
                    navBarTranslucent: false,
                    navBarTransparent: false,
                    drawUnderNavBar: false,
                    navBarHidden: true,
                    navBarBackgroundColor: Color.blue,
                    navBarButtonColor: Color.white,
                    navBarTextFontFamily: Font.PTSansRegularRegular,
                    navBarTextColor: Color.white,
                    navBarTitleTextCentered: true,
                    statusBarTextColorScheme: 'light'
                },
                navigatorButtons: {},
            },
            Community: {
                screen: 'OpenEnglish.Dashboard.Community',
                path: 'community',
                title: '',
                navigatorStyle: {
                    statusBarHidden: true,
                    disabledBackGesture: true,
                    navBarHideOnScroll: false,
                    navBarTranslucent: false,
                    navBarTransparent: false,
                    drawUnderNavBar: false,
                    navBarHidden: true,
                    navBarBackgroundColor: Color.blue,
                    navBarButtonColor: Color.white,
                    navBarTextFontFamily: Font.PTSansRegularRegular,
                    navBarTextColor: Color.white,
                    navBarTitleTextCentered: true,
                    statusBarTextColorScheme: 'light'
                },
                navigatorButtons: {},
            },
            FacebookFriends: {
                screen: 'OpenEnglish.Dashboard.FacebookFriends',
                path: 'facebook_friends',
                title: '',
                navigatorStyle: {
                    statusBarHidden: true,
                    disabledBackGesture: true,
                    navBarHideOnScroll: false,
                    navBarTranslucent: false,
                    navBarTransparent: false,
                    drawUnderNavBar: false,
                    navBarHidden: true,
                    navBarBackgroundColor: Color.blue,
                    navBarButtonColor: Color.white,
                    navBarTextFontFamily: Font.PTSansRegularRegular,
                    navBarTextColor: Color.white,
                    navBarTitleTextCentered: true,
                    statusBarTextColorScheme: 'light'
                },
                navigatorButtons: {},
            },
            Round: {
                screen: 'OpenEnglish.Dashboard.Round',
                path: 'round',
                title: '',
                overrideBackPress: true,
                navigatorStyle: {
                    statusBarHidden: true,
                    disabledBackGesture: true,
                    navBarHideOnScroll: false,
                    navBarTranslucent: false,
                    navBarTransparent: false,
                    drawUnderNavBar: false,
                    navBarHidden: true,
                    navBarBackgroundColor: Color.blue,
                    navBarButtonColor: Color.white,
                    navBarTextFontFamily: Font.PTSansRegularRegular,
                    navBarTextColor: Color.white,
                    navBarTitleTextCentered: true,
                    statusBarTextColorScheme: 'light'
                },
                navigatorButtons: {},
            },
            InRoundCategories: {
                screen: 'OpenEnglish.Dashboard.InRoundCategories',
                path: 'in-round-categories',
                title: '',
                overrideBackPress: true,
                navigatorStyle: {
                    statusBarHidden: true,
                    disabledBackGesture: true,
                    navBarHideOnScroll: false,
                    navBarTranslucent: false,
                    navBarTransparent: false,
                    drawUnderNavBar: false,
                    navBarHidden: true,
                    navBarBackgroundColor: Color.blue,
                    navBarButtonColor: Color.white,
                    navBarTextFontFamily: Font.PTSansRegularRegular,
                    navBarTextColor: Color.white,
                    navBarTitleTextCentered: true,
                    statusBarTextColorScheme: 'light'
                },
                navigatorButtons: {},
            },
            InRoundQuestion: {
                screen: 'OpenEnglish.Dashboard.InRoundQuestion',
                path: 'in-round-questions',
                title: '',
                overrideBackPress: true,
                navigatorStyle: {
                    statusBarHidden: true,
                    disabledBackGesture: true,
                    navBarHideOnScroll: false,
                    navBarTranslucent: false,
                    navBarTransparent: false,
                    drawUnderNavBar: false,
                    navBarHidden: true,
                    navBarBackgroundColor: Color.blue,
                    navBarButtonColor: Color.white,
                    navBarTextFontFamily: Font.PTSansRegularRegular,
                    navBarTextColor: Color.white,
                    navBarTitleTextCentered: true,
                    statusBarTextColorScheme: 'light'
                },
                navigatorButtons: {},
            },
            Profile: {
                screen: 'OpenEnglish.Dashboard.Profile',
                path: 'profile',
                title: strings.MyProfile,
                navigatorStyle: {
                    statusBarHidden: true,
                    navBarHideOnScroll: false,
                    navBarTranslucent: false,
                    navBarTransparent: false,
                    drawUnderNavBar: false,
                    navBarHidden: true,
                    navBarBackgroundColor: Color.blue,
                    navBarButtonColor: Color.white,
                    navBarTextFontFamily: Font.PTSansRegularRegular,
                    navBarTextColor: Color.white,
                    navBarTitleTextCentered: true,
                    statusBarTextColorScheme: 'light'
                },
                navigatorButtons: {},
                passProps: {
                    activeView: 'OpenEnglish.Dashboard.Profile'
                }
            },
            Ranking: {
                screen: 'OpenEnglish.Dashboard.Ranking',
                path: 'profile',
                navigatorStyle: {
                    statusBarHidden: true,
                    navBarHideOnScroll: false,
                    navBarTranslucent: false,
                    navBarTransparent: false,
                    drawUnderNavBar: false,
                    navBarHidden: true,
                    navBarBackgroundColor: Color.blue,
                    navBarButtonColor: Color.white,
                    navBarTextFontFamily: Font.PTSansRegularRegular,
                    navBarTextColor: Color.white,
                    navBarTitleTextCentered: true,
                    statusBarTextColorScheme: 'light'
                }
            },
            AddQuestion: {
                screen: 'OpenEnglish.Dashboard.AddQuestion',
                path: 'profile',
                navigatorStyle: {
                    statusBarHidden: true,
                    navBarHideOnScroll: false,
                    navBarTranslucent: false,
                    navBarTransparent: false,
                    drawUnderNavBar: false,
                    navBarHidden: true,
                    navBarBackgroundColor: Color.blue,
                    navBarButtonColor: Color.white,
                    navBarTextFontFamily: Font.PTSansRegularRegular,
                    navBarTextColor: Color.white,
                    navBarTitleTextCentered: true,
                    statusBarTextColorScheme: 'light'
                }
            },
            Contact: {
                screen: 'OpenEnglish.Dashboard.Contact',
                path: 'profile',
                navigatorStyle: {
                    statusBarHidden: true,
                    navBarHideOnScroll: false,
                    navBarTranslucent: false,
                    navBarTransparent: false,
                    drawUnderNavBar: false,
                    navBarHidden: true,
                    navBarBackgroundColor: Color.blue,
                    navBarButtonColor: Color.white,
                    navBarTextFontFamily: Font.PTSansRegularRegular,
                    navBarTextColor: Color.white,
                    navBarTitleTextCentered: true,
                    statusBarTextColorScheme: 'light'
                }
            }
        }
    }
    
    static getFileExtension = (url) => {
        try {
            let extension = url.split('.').pop()
            return {extension: extension}
        }catch(error) {
            console.warn("getFileExtension error: ", error)
            return {extension : null}
        }
    }
    static eventEmitter = {
        instance: null,
        getInstance: function(){
            if(Global.eventEmitter.instance === null) {
                Global.eventEmitter.instance = new EventEmitter();
            }
            return Global.eventEmitter.instance;
        },
        addListener: function(nameListener, callback){
            return Global.eventEmitter.getInstance().addListener(nameListener, callback);
        },
        emit: function(nameListener, message) {
            return Global.eventEmitter.getInstance().emit(nameListener, message);
        }
    }

    static validatePassword = (password) => {
        /** var regExp = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{6,}$/;
        if(password.length < 6){
            return {result: false, message: strings.PasswordCriteria};
        }
        if(!regExp.test(password)) {
            return {result: false, message: strings.PasswordCriteria};
        } */
        if(password.length < 8){
            return {result: false, message: strings.PasswordCriteriaMinLength};
        }
        return {result: true}
    }

    static validatePhoneNumberForCountry = (number, country) => {
        if(country == 'MX') {
            var re = /^52-([1-9]\d{1}-\d{4}-\d{4}|[1-9]\d{2}-\d{3}-\d{4})$/;
            return re.test(number);
        }
    }

    static validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    static validateAge = (age) => {
        var valid = (age != null && age != '');
        valid = valid && !isNaN(age) && parseInt(age) > 0;
        return valid;
    }

    static validateMinimumAge = (age) => {
        var valid = parseInt(age) > 0;
        valid = parseInt(age) >= 18;
        return valid;
    }

    static validateOnlyString = (str) => {
        var matches = str.match(/\d+/g);
        var valid = (matches == null);
        valid = valid && (str.replace(/ /g,'').length > 0);
        return valid;
    }

    static msToTime = (s) => {

        // Pad to 2 or 3 digits, default is 2
        function pad(n, z) {
            z = z || 2;
            return ('00' + n).slice(-z);
        }

        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;

        return pad(mins) + ':' + pad(secs);
    }

    static toUppercase = (str) => {
        if(str != null && str != '') {
            return str.toUpperCase();
        }
    }

    static getOrientation = (callback) => {
        return Orientation.getOrientation((err, orientation) => {
            if(callback != null)
                callback(orientation);
        });
    }

    static getBucketImage(relativePath) {
        return 'https://s3-sa-east-1.amazonaws.com/wordeo/' + relativePath;
    }

    static formatPrice(price, inK = false) {
        price = parseFloat(price);
        price = price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
        if(inK) {
            if(parseFloat(price) >= 1000) {
                return (price / 1000) + 'k';
            }
        }

        return price;
    }

    static normalizeFontSize(size) {
        //Export function to normalize font sizes
        const {
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
        } = Dimensions.get('window');

        const scale = SCREEN_WIDTH / 320;

        if(Platform.OS === 'android') {
            if(scale == 1) { //Only for small devices
                size -= 3;
            }

            if(PixelRatio.getFontScale() > 1.2) {
                //Do nothing
                size -= 2;
            }
        }

        if (Platform.OS === 'ios') {
                return Math.round(PixelRatio.roundToNearestPixel(size))
        } else {
            return Math.round(PixelRatio.roundToNearestPixel(size)) - 2
        }
    }
}