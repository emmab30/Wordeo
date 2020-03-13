import axios from 'axios';
import { AsyncStorage } from 'react-native';
import Config from 'react-native-config'

/** This function configure the Axios library **/
export function ApiService() {
    GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest; //To debug requests in Chrome

    //Instance the webservice caller
    var api = axios.create({
        baseURL: ApiUrl(),
        timeout: 30000
    });
    /* api.interceptors.response.use(undefined, function axiosRetryInterceptor(err) {
        var config = err.config;
        // If config does not exist or the retry option is not set, reject
        if(!config || !config.retry) return Promise.reject(err);
        // Set the variable for keeping track of the retry count
        config.__retryCount = config.__retryCount || 0;
        // Check if we've maxed out the total number of retries
        if(config.__retryCount >= config.retry) {
            // Reject with the error
            return Promise.reject(err);
        }
        // Increase the retry count
        config.__retryCount += 1;
        //console.log(config.__retryCount);
        // Create new promise to handle exponential backoff
        var backoff = new Promise(function(resolve) {
            setTimeout(function() {
                resolve();
            }, config.retryDelay || 1);
        });
        // Return the promise in which recalls axios to retry the request
        return backoff.then(function() {
            return axios.create(config);
        });
    }); */

    //Set the token if it's available
    AsyncStorage.getItem("user").then((value) => {
        if(value != null) {
            var user = JSON.parse(value);
            axios.defaults.headers.common['Authorization'] = user.session.id;
        }
    }).done();

    return api;
}

/** This function configure the Axios library **/
export function GiphyServiceWrapper() {
    GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest; //To debug requests in Chrome

    //Instance the webservice caller
    var api = axios.create({
        baseURL: "https://api.giphy.com/v1/gifs",
        timeout: 5000
    });

    delete axios.defaults.headers.common['Authorization'];

    return api;
}

export function ApiUrl() {
    //return "http://216.172.179.17:12002/api";
    //return "http://192.168.0.12:3000/api";
    return "http://142.93.28.18:3000/api";
    return Config.API_URL;
}

export function SocketUrl() {
    //return "http://216.172.179.17:12002";
    //return "http://192.168.0.12:3000";
    return null;
    return Config.SOCKET_URL;
}

export function BucketS3URL() {
    return Config.BUCKET_S3_URL;
}