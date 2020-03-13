import { ApiService } from './BaseService.js';
import { AsyncStorage } from 'react-native';

var AuthService = {
    user: null,
    getUser: function(){
        return AuthService.user;
    },
    getMe: function(success, error){
        ApiService().get('/accounts/me')
        .then(function (response) {
            if(success) {
                success(response.data);
            }
        })
        .catch(function (err) {
            if(error) {
                error(err);
            }
        });
    },
    updateMe: function(id, data, success, error) {
        // Make a request for a user with a given ID
        ApiService().post('/users/upsertWithWhere?where={"id":'+id+'}', data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    loginFacebook: function(data, success, error) {
        // Make a request for a user with a given ID
        ApiService().post('/accounts/login/facebook', data) //ToDo: Retries { retry : 3, retryDelay: 10000 }
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            if(!err.response) {
                error('¡Actualmente nuestro servidor se encuentra caído. Por favor espera unos momentos y vuelve a intentarlo!');
            } else {
                console.log(err.response);
            }
        });
    },
    getPeople: function(data, success, error) {
        ApiService().post('/accounts/people', data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    getFriends: function(data, success, error) {
        // Make a request for a user with a given ID
        ApiService().get('/accounts/me/friends')
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    getUserStatus: function(userId, success, error) {
        // Make a request for a user with a given ID
        var data = {
            userId: userId
        };
        ApiService().post('/accounts/status', data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    logout: function(success, error) {
        AsyncStorage.getItem("user").then((value) => {
            if(value != null) {
                var user = JSON.parse(value);
                // Make a request for a user with a given ID
                ApiService().post('/accounts/logout', {access_token: user.session.id })
                .then(function (response) {
                    success(response.data);
                })
                .catch(function (err) {
                    error(err);
                });
            }
        });
    },
    register: function(data, success, error) {
        // Make a request for a user with a given ID
        ApiService().post('/users', data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    forgot: function(data, success, error) {
        ApiService().post('/users/reset', data)
        .then(function (response) {
            console.log(response);
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    getUserByEmail: function(email, success, error) {
        ApiService().get('/users/findOne?filter={"where": { "email" : "' + email + '"}}')
        .then(function (response) {
            console.log(response);
            success(response.data);
        })
        .catch(function (err) {
            console.log(err);
            error(err);
        });
    },
    verifyEmail: function(email, success, error) {
        ApiService().get('/users/email/verify?email='+email)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    verifyReferralCode: function(referralCode, success, error) {
        ApiService().get('/users/referralCode/verify?referralCode='+referralCode)
        .then(function (response) {
            console.log(response);
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    changePassword: function(data, success, error) {
        // Make a request for a user with a given ID
        ApiService().post('/users/password/change', data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    checkAuthentication: function(success, error) {
        AsyncStorage.getItem("userCredentials").then((value) => {
            if(value != null) {
                var user = JSON.parse(value);
                success(user);
            }
            else {
                error();
            }
        }).done();
    },
    uploadAvatar: function(uri, success, error) {
        let formdata = new FormData();
        formdata.append('file', {uri: uri, name: (new Date().getTime())+'.png', type: 'multipart/form-data'}, {
            contentType: 'multipart/form-data'
        });
        ApiService().post('/accounts/me/uploadAvatar', formdata, {
            headers: {
                "Content-Type": 'multipart/form-data'
            }
        })
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    updateProfile: function(data, callback) {
        AsyncStorage.getItem("user").then((value) => {
            if(value != null) {
                var user = JSON.parse(value);
                user.user = data;
                AsyncStorage.setItem("user", JSON.stringify(user));
            }

            if(callback){
                AsyncStorage.getItem("user").then((value) => {
                    if(value != null) {
                        callback(value);
                    }
                });
            }
        }).done();
    }
};

export { AuthService as default };
