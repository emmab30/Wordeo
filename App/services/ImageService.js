import { ApiUrl } from './BaseService.js'
import { ApiService } from './BaseService.js'
import { Platform } from 'react-native';

//Localization
import { strings } from '../components/localization/strings'

GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest; //To debug requests in Chrome

//var FileTransfer = require('@remobile/react-native-file-transfer');
//var RNFS = require('react-native-fs');
//var FileOpener = require('react-native-file-opener-fix');
//var Mimetype = require('react-native-mimetype');

var ImageService = {
    /* upload: function(bucket, file, filename, success, error, progress) {
        var upload = {
            uri: file.uri, // either an 'assets-library' url (for files from photo library) or an image dataURL
            //uploadUrl: ApiUrl() + "/containers/" + bucket + '/upload?filename=' + bucket + '/' + filename
            uploadUrl: ApiUrl() + "/containers/s3/upload?filename=" + bucket + "/" + filename
        }

        var options = {};
        options.debug = true;
        options.fileKey = 'file';
        options.fileName = filename;
        options.mimeType = 'text/plain';

        var fileTransfer = new FileTransfer();
        fileTransfer.onprogress = progress;
        fileTransfer.upload(upload.uri, upload.uploadUrl, (result) => {
            success(result)
        }, (err) => {
            error(err);
        }, options, true);
    },
    uploadVideo: function(bucket, file, filename, success, error, progress) {
        var upload = {
            uri: file.uri, // either an 'assets-library' url (for files from photo library) or an image dataURL
            uploadUrl: ApiUrl() + "/containers/s3/upload?filename=" + bucket + '/' + filename
        }

        var options = {};
        options.debug = true;
        options.fileKey = 'file';
        options.fileName = filename;
        options.mimeType = 'video/mp4';

        var fileTransfer = new FileTransfer();
        fileTransfer.onprogress = progress;
        fileTransfer.upload(upload.uri, upload.uploadUrl, (result) => {
            success(result)
        }, (err) => {
            error(err);
        }, options, true);
    },
    remove: function(bucket, filename, success, error){
        ApiService().get('/containers/' + bucket + '/delete?filename=' + filename)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    download: function(bucket, filename, success, error) {
        ApiService().get('/containers/' + bucket + '/download/' + filename)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    openFile: function(filename, progress, finishDownload, error) {
        ImageService.downloadFile(filename, progress, (download) => {
            filename = ImageService.getFilenameByUrl(filename);
            var path = (Platform.OS === 'ios') ? (RNFS.TemporaryDirectoryPath + '/' + filename) : (RNFS.ExternalDirectoryPath + '/' + filename);
            FileOpener.open(
                path,
                Mimetype.lookup(filename)
            ).then(() => {
                finishDownload();
            },(e) => {
                error(strings.ErrorOpeningFile)
            });
        }, (err) => {
            error(strings.ErrorOpeningFile);
        });
    },
    openVideo: function(filename, progress, finishDownload) {
        var path = RNFS.DocumentDirectoryPath + '/' + 'test.mp4';
        FileOpener.open(
            path,
            Mimetype.lookup(filename)
        ).then(() => {
            //console.log('success!!');
        },(e) => {
            ImageService.downloadFile(filename, progress, finishDownload);
        });
    },
    downloadFile: function(filename, progress, finishDownload, error) {
        filename = ImageService.getFilenameByUrl(filename);
        var url = ApiUrl() + '/containers/documents/download/' + filename;
        var path = (Platform.OS === 'ios') ? (RNFS.TemporaryDirectoryPath + '/' + filename) : (RNFS.ExternalDirectoryPath + '/' + filename);
        RNFS.downloadFile({fromUrl:url, toFile: path, begin: progress}).promise.then(res => {
            finishDownload();
            //ImageService.openFile(filename, progress, finishDownload, error);
        });
    },
    downloadVideo: function(url, progress, finishDownload, errorCb) {
        var path = (Platform.OS === 'ios') ? (RNFS.TemporaryDirectoryPath + 'temp.mp4') : (RNFS.ExternalDirectoryPath + 'temp.mp4');
        RNFS.downloadFile({fromUrl:url, toFile: path, begin: progress}).promise.then(res => {
            finishDownload();
        }).catch(err => {
            if(errorCb != null)
                errorCb(err);
        });
    },
    getFilenameByUrl: function(url){
        var filename = url.substring(url.lastIndexOf('/')+1);
        return filename;
    } */
};

export { ImageService as default };
