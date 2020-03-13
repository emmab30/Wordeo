import { ApiService } from './BaseService.js';
import { AsyncStorage } from 'react-native';

var RoomService = {
    create: function(data, success, error) {
        ApiService().post('/rooms', data)
        .then(function (response) {
            if(success)
                success(response.data);
        })
        .catch(function (err) {
            if(error)
                error(err);
        });
    },
    get: function(data, success, error) {
        var url = '/rooms' + '?filter={"order": ["multiplierExp DESC", "createdAt DESC"], "where": {"isActive" : true}, "include": { "relation": "users", "scope": { "fields" : "userId" } }}';
        ApiService().get(url, data)
        .then(function (response) {
            if(success)
                success(response.data);
        })
        .catch(function (err) {
            if(error)
                error(err);
        });
    },
    getUsersBy: function(data, success, error) {
        ApiService().post('/rooms/find_people', data)
        .then(function (response) {
            if(success)
                success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    getByCode: function(code, success, error) {
        var url = '/rooms' + '?filter={"where": {"isActive": true, "code" : "' + code + '"}, "include": { "relation": "users", "scope": { "fields" : "userId" } }}';
        ApiService().get(url)
        .then(function (response) {
            if(success)
                success(response.data);
        })
        .catch(function (err) {
            if(error)
                error(err);
        });
    },
    invite: function(data, success, error) {
        ApiService().post('/rooms/invite', data)
        .then(function (response) {
            if(success)
                success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    join: function(data, success, error) {
        ApiService().post('/rooms/join', data)
        .then(function (response) {
            if(success)
                success(response.data);
        })
        .catch(function (err) {
            if(err && err.response && err.response.data && err.response.data.error) {
                if(error)
                    error(err.response.data.error);
            }
        });
    },
    finish: function(data, success, error) {
        ApiService().post('/rooms/finish', data)
        .then(function (response) {
            if(success)
                success(response.data);
        })
        .catch(function (err) {
            if(err && err.response && err.response.data && err.response.data.error) {
                if(error)
                    error(err.response.data.error);
            }
        });
    },
    postStats: function(data, success, error) {
        ApiService().post('/rooms/stats', data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    getStatsForRoom: function(roomId, success, error) {
        ApiService().get('/rooms/' + roomId + '/stats')
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    getQuestionsForRoom: function(roomId, success, error) {
        ApiService().get('/rooms/' + roomId + '/questions')
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    }
};

export { RoomService as default };