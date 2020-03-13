import { ApiService, SocketUrl } from './BaseService.js';
import { Global } from '../components/common/global';
import SocketIOClient from 'react-native-socket.io-client';
import { AsyncStorage } from 'react-native';
import EventEmitter from 'EventEmitter';
import io from 'socket.io-client';
var SocketGD = require('socketgd').SocketGD;

var SocketService = {
    socket: null,
    socketGD: null,
    getSocket: function() {
        return SocketService.socket;
    },
    initialize: function(callback) {
        SocketService.connect(() => {
            callback();
        });
    },
    connect: function(callback) {
        if(SocketService.socket === null){
            SocketService.socket = io(SocketUrl(), {
                transports: ['websocket', 'polling'],
                autoConnect: true,
                reconnection: true
            })

            SocketService.socketGD = new SocketGD(SocketService.socket);
            SocketService.socketGD.on('connect', () => {
                AsyncStorage.getItem("user").then((value) => {
                    if(value != null) {
                        var user = JSON.parse(value);
                        SocketService.socket.emit('authentication', {id: user.session.id, userId: user.session.userId});
                    }
                }).done();
            });
            if(callback !== undefined) {
                callback();
            }
        }
    },
    disconnect: function(cb) {
        if(SocketService.socket !== null){
            SocketService.socket.disconnect();
            SocketService.socket = null;

            if(cb)
                cb();
        }
        else {
            if(cb)
                cb();
        }
    },
    on: function(eventName, callback) {
        if(SocketService.socketGD !== null) {
            SocketService.socketGD.on(eventName, (value) => {
                if(callback)
                    callback(value);
            });
        }
    },
    removeListener: function(eventName, fn) {
        if(SocketService.socketGD !== null)
            SocketService.socketGD.off(eventName, fn);
    },
    emit: function(eventName, parameters) {
        if(SocketService.socketGD != null && SocketService.socket != undefined) {
            SocketService.socketGD.emit(eventName, parameters);
        }
    },
    subscribe: {
        //All these will be subscribed on the index.js file since it will be maintained over all the session.
        //The functions that needs parameter to send through the websocket, needs to be subscribe only in the class/component you need.
        onDisconnect: function(callback){
            SocketService.socketGD.on('disconnect', (value) => {
                //callback(value);
                setTimeout(() => {
                    Global.eventEmitter.emit('onDisconnect', value);
                }, 1000);
            });
        },
        onUsersOnlineUpdate: function(callback) {
            SocketService.socketGD.on('onStatisticsUsers', (value) => {
                //callback(value);
                setTimeout(() => {
                    Global.eventEmitter.emit('onUsersOnlineUpdate', value);
                }, 1000);
            });
        },
        onRoomCreated: function(callback){
            SocketService.socketGD.on('onRoomCreated', (value) => {
                setTimeout(() => {
                    Global.eventEmitter.emit('onRoomCreated', value);
                }, 1000);
                //callback(value);
            });
        },
        onRoomRemoved: function(callback){
            SocketService.socketGD.on('onRoomRemoved', (value) => {
                setTimeout(() => {
                    Global.eventEmitter.emit('onRoomRemoved', value);
                }, 1000);
                //callback(value);
            });
        },
        onRoomActivity: function(roomId, callback) {
            SocketService.socketGD.on('onRoomActivity', (value) => {
                setTimeout(() => {
                    Global.eventEmitter.emit('onRoomActivity', value);
                }, 1000);
                //callback(value);
            });
        },
        onStartRound: function(callback) {
            SocketService.socketGD.on('onStartRound', (value) => {
                setTimeout(() => {
                    Global.eventEmitter.emit('onStartRound', value);
                }, 1000);
                //callback(value);
            });
        }
    }
};

export { SocketService as default };