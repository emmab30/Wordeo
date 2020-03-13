import { ApiService } from './BaseService.js';
import { AsyncStorage } from 'react-native';

var CharacterService = {
    getCharacters: function(data, success, error){
        ApiService().post('/characters/filter', data)
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
    getMyCharacters: function(success, error) {
        ApiService().get('/characters/me')
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
    getAvailableCharacters: function(success, error) {
        ApiService().get('/Characters/availableCharacters')
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
    getAvailableAccesories: function(data, success, error) {
        var url = '/character-accesories/availableAccesories';
        if(data && data.characterId != null && data.characterId > -1) {
            url += '?characterId=' + data.characterId
        };
        ApiService().get(url)
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
    getAvailableLifeElements: function(success, error) {
        var url = '/elemental-life-accesories/availableElements';
        ApiService().get(url)
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
    buyCharacter: function(data, success, error) {
        ApiService().post('/characters/buy_character', data)
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
    buyAccesories: function(data, success, error) {
        ApiService().post('/characters/buy_accesories', data)
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
    buyElementalLifeAccesory: function(accesoryId, success, error) {
        ApiService().post('/characters/buy_elemental_life_accesory', {id : accesoryId})
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
    make: function(data, success, error){
        ApiService().post('/characters/make', data)
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
    getRankingTopPlayers: function(data, success, error){
        ApiService().get('/characters/ranking_top_players')
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
    }
};

export { CharacterService as default };