'use strict';

const request = require('request');
var _ = require('lodash');

module.exports = function(server) {

    //Only do this for the first time.
    if (process.env.pm_id == 0) {
        //Create default roles
        server.models.Role.upsertWithWhere({name : 'Administrator'}, {
            name: 'Administrator',
            description: 'Administrator role'
        });

        server.models.Role.upsertWithWhere({name: 'Player'}, {
            name: 'Player',
            description: 'Player role'
        });

        server.models.Role.upsertWithWhere({name: 'Bot'}, {
            name: 'Bot',
            description: 'Bot role'
        });

        server.models.Configuration.upsertWithWhere({ name: 'TULS_RATE' }, {
            name: 'TULS_RATE',
            value: '20.00'
        });

        server.models.Configuration.upsertWithWhere({ name: 'LAST_VERSION' }, {
            name: 'LAST_VERSION',
            value: '1.0.0.15'
        });

        server.models.Room.destroyAll({});
        //server.models.RoomUser.destroyAll({});
        server.models.Account.update({isOnline: false}, (err, updated) => {
            //Generate random bots if neccesary
            server.models.Account.count({ isBot : true }, (err, count) => {
                if(count <= 50) {
                    const maxBotUsersQty = Math.floor(Math.random() * 20) + 70;
                    request('https://randomuser.me/api/?results=' + maxBotUsersQty + '&nat=es', { json: true }, (err, res, body) => {
                        for(var idx in body.results) {
                            const result = body.results[idx];
                            let account = {
                                password: '$2a$10$jnAHPNshl50APC11tVFAzu5WGAw5rSsZtvq4xvebzFh.7mqbIBcIC',
                                email: result.email,
                                isOnline: true,
                                lastLogin: new Date(),
                                createdAt: new Date(),
                                isBot: true,
                                username: (result.name.first.toUpperCase().substr(0, 4) + result.name.last.toUpperCase().substr(0, 4) + _.random(0, 2000).toString())
                            };

                            server.models.Account.create(account, (err, saved) => {
                                if(saved) {
                                    let profile = {
                                        accountId: saved.id,
                                        name: result.name.first.charAt(0).toUpperCase() + result.name.first.slice(1),
                                        lastName: result.name.last.charAt(0).toUpperCase() + result.name.last.slice(1),
                                        birthday: result.dob,
                                        totalGames: 0,
                                        totalWins: 0,
                                        totalLost: 0,
                                        experience_points: 0,
                                        avatar: result.picture.large,
                                        isBot: true
                                    };
                                    server.models.Profile.create(profile, (err1, savedProfile) => {
                                        //Do nothing
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });

        var monsters = [
            { name: 'Mixi', price: 4000, imageBase: 'monster_1.png' },
            { name: 'Tukipo', price: 2000, imageBase: 'monster_2.png' },
            { name: 'Mavertin', price: 3000, imageBase: 'monster_3.png' },
            { name: 'Munray', price: 1500, imageBase: 'monster_4.png' },
            { name: 'Plebo', price: 1000, imageBase: 'monster_5.png' },
            { name: 'Dunky', price: 1200, imageBase: 'monster_6.png' },
            { name: 'Rubix', price: 1300, imageBase: 'monster_7.png' }
        ];

        var promises = [];
        for(var idx in monsters) {
            const monster = monsters[idx];
            promises.push(new Promise((resolve, reject) => {
                server.models.Character.upsertWithWhere({ name: monster.name }, {
                    name: monster.name,
                    price: monster.price,
                    image_base: monster.imageBase
                }, (err, result) => { resolve() });
            }));
        }

        Promise.all(promises).then((result) => {
            console.log('-------- Migrated monsters -------');
        });

        //Character accesories
        const commonAccesories = [
            { zIndex: 1, characterId: 1, category: 'MANOS', name: 'Manos 1', image: 'monster_1_hands_1.png', image_placeholder: 'monster_1_hands_1_ph.png', price: 3000},
            { zIndex: 1, characterId: 1, category: 'MANOS', name: 'Manos 2', image: 'monster_1_hands_2.png', image_placeholder: 'monster_1_hands_2_ph.png', price: 3000},
            { zIndex: 1, characterId: 1, category: 'MANOS', name: 'Manos 3', image: 'monster_1_hands_3.png', image_placeholder: 'monster_1_hands_3_ph.png', price: 3500},
            { zIndex: 1, characterId: 1, category: 'MANOS', name: 'Manos 4', image: 'monster_1_hands_4.png', image_placeholder: 'monster_1_hands_4_ph.png', price: 4000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Ojos 1', image: 'eyes_1.png', image_placeholder: 'eyes_1_ph.png', price: 8000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Ojos 2', image: 'eyes_2.png', image_placeholder: 'eyes_2_ph.png', price: 5000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Ojos 3', image: 'eyes_3.png', image_placeholder: 'eyes_3_ph.png', price: 5000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Ojos 4', image: 'eyes_4.png', image_placeholder: 'eyes_4_ph.png', price: 4000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Ojos 5', image: 'eyes_5.png', image_placeholder: 'eyes_5_ph.png', price: 15000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Ojos 6', image: 'eyes_6.png', image_placeholder: 'eyes_6_ph.png', price: 2000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Ojos 7', image: 'eyes_7.png', image_placeholder: 'eyes_7_ph.png', price: 10000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Ojos 8', image: 'eyes_8.png', image_placeholder: 'eyes_8_ph.png', price: 7500},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Ojos 9', image: 'eyes_9.png', image_placeholder: 'eyes_9_ph.png', price: 13000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Ojos 10', image: 'eyes_10.png', image_placeholder: 'eyes_10_ph.png', price: 13000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Ojos 11', image: 'eyes_11.png', image_placeholder: 'eyes_11_ph.png', price: 14000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Ojos 12', image: 'eyes_12.png', image_placeholder: 'eyes_12_ph.png', price: 7500},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Ojos 13', image: 'eyes_13.png', image_placeholder: 'eyes_13_ph.png', price: 9000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Ojos 14', image: 'eyes_14.png', image_placeholder: 'eyes_14_ph.png', price: 9000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Ojos 15', image: 'eyes_15.png', image_placeholder: 'eyes_15_ph.png', price: 9000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Ojos 16', image: 'eyes_16.png', image_placeholder: 'eyes_16_ph.png', price: 9000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Ojos 17', image: 'eyes_17.png', image_placeholder: 'eyes_17_ph.png', price: 9000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Ojos 18', image: 'eyes_18.png', image_placeholder: 'eyes_18_ph.png', price: 9000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Ojos 19', image: 'eyes_19.png', image_placeholder: 'eyes_19_ph.png', price: 9000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Ojos 20', image: 'eyes_20.png', image_placeholder: 'eyes_20_ph.png', price: 9000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Lentes 1', image: 'glass_1.png', image_placeholder: 'glass_1_ph.png', price: 12000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Lentes 2', image: 'glass_2.png', image_placeholder: 'glass_2_ph.png', price: 7500},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Lentes 3', image: 'glass_3.png', image_placeholder: 'glass_3_ph.png', price: 10000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Lentes 4', image: 'glass_4.png', image_placeholder: 'glass_4_ph.png', price: 15000},
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Lentes 5', image: 'glass_5.png', image_placeholder: 'glass_5_ph.png', price: 15000},
            { zIndex: 1, characterId: -1, category: 'BOCA', name: 'Boca 1', image: 'mouth_1.png', image_placeholder: 'mouth_1_ph.png', price: 3000},
            { zIndex: 1, characterId: -1, category: 'BOCA', name: 'Boca 2', image: 'mouth_2.png', image_placeholder: 'mouth_2_ph.png', price: 5000},
            { zIndex: 1, characterId: -1, category: 'BOCA', name: 'Boca 3', image: 'mouth_3.png', image_placeholder: 'mouth_3_ph.png', price: 2000},
            { zIndex: 1, characterId: -1, category: 'BOCA', name: 'Boca 4', image: 'mouth_4.png', image_placeholder: 'mouth_4_ph.png', price: 2000},
            { zIndex: 1, characterId: -1, category: 'BOCA', name: 'Boca 5', image: 'mouth_5.png', image_placeholder: 'mouth_5_ph.png', price: 7500},
            { zIndex: 1, characterId: -1, category: 'BOCA', name: 'Boca 6', image: 'mouth_6.png', image_placeholder: 'mouth_6_ph.png', price: 15000},
            { zIndex: 1, characterId: -1, category: 'BOCA', name: 'Boca 7', image: 'mouth_7.png', image_placeholder: 'mouth_7_ph.png', price: 15000},
            { zIndex: 1, characterId: -1, category: 'BOCA', name: 'Boca 8', image: 'mouth_8.png', image_placeholder: 'mouth_8_ph.png', price: 7500},
            { zIndex: 1, characterId: -1, category: 'BOCA', name: 'Boca 9', image: 'mouth_9.png', image_placeholder: 'mouth_9_ph.png', price: 15000},
            { zIndex: 1, characterId: -1, category: 'BOCA', name: 'Boca 10', image: 'mouth_10.png', image_placeholder: 'mouth_10_ph.png', price: 18000},
            { zIndex: 1, characterId: -1, category: 'BOCA', name: 'Boca 11', image: 'mouth_11.png', image_placeholder: 'mouth_11_ph.png', price: 7500},
            { zIndex: 1, characterId: -1, category: 'BOCA', name: 'Boca 12', image: 'mouth_12.png', image_placeholder: 'mouth_12_ph.png', price: 7500},
            { zIndex: 1, characterId: -1, category: 'BOCA', name: 'Boca 13', image: 'mouth_13.png', image_placeholder: 'mouth_13_ph.png', price: 20000},
            { zIndex: 1, characterId: -1, category: 'BOCA', name: 'Boca 14', image: 'mouth_14.png', image_placeholder: 'mouth_14_ph.png', price: 18000},
            { zIndex: 1, characterId: -1, category: 'EXTRAS', name: 'Sombrero de ángel', image: 'head_element_2.png', image_placeholder: 'head_element_2_ph.png', price: 3500 },
            { zIndex: 1, characterId: -1, category: 'EXTRAS', name: 'Cuernos del horizonte', image: 'head_element_1.png', image_placeholder: 'head_element_1_ph.png', price: 7500 },
            { zIndex: 1, characterId: -1, category: 'EXTRAS', name: 'Galera', image: 'head_element_3.png', image_placeholder: 'head_element_3_ph.png', price: 10000},
            { zIndex: -1, characterId: -1, category: 'ALAS', name: 'Ala basica', image: 'wings_1.png', image_placeholder: 'wings_1_ph.png', price: 30000},
            { zIndex: -1, characterId: -1, category: 'ALAS', name: 'Ala de angel', image: 'wings_2.png', image_placeholder: 'wings_2_ph.png', price: 50000},
            { zIndex: -1, characterId: -1, category: 'ALAS', name: 'Ala legendaria', image: 'wings_3.png', image_placeholder: 'wings_3_ph.png', price: 70000},
        ];
        var accesories = commonAccesories;

        var promisesAccesories = [];
        for(var idx in accesories) {
            const accesory = accesories[idx];
            promisesAccesories.push(new Promise((resolve, reject) => {
                server.models.CharacterAccesory.upsertWithWhere({ characterId: accesory.characterId, name: accesory.name }, {
                    characterId: accesory.characterId,
                    name: accesory.name,
                    category: accesory.category,
                    image: accesory.image,
                    image_placeholder: accesory.image_placeholder,
                    price: accesory.price,
                    zIndex: accesory.zIndex
                }, (err, result) => { resolve() });
            }));
        }

        Promise.all(promisesAccesories).then((result) => {
            console.log('-------- Migrated accesories for monsters -------');
        });

        //Create bot player
        server.models.Account.findOne({ where : { email: 'bot@wordeo.com' }}, (err, user) => {
            if(!user) {
                server.models.Account.create({
                    password: 'test',
                    socketId: null,
                    isOnline: true,
                    lastLogin: new Date(),
                    email: 'bot@wordeo.com',
                }, (err, result) => {
                    server.models.Profile.create({
                        accountId: result.id,
                        name: 'Guest',
                        lastName: 'Test',
                        level: 1,
                        birthday: '2018/01/01',
                        avatar: 'http://blogdailyherald.com/wp-content/uploads/2014/10/wallpaper-for-facebook-profile-photo-1024x645.jpg',
                        createdAt: new Date(),
                        lastModifiedAt: new Date()
                    });
                });
            }
        });

        //Create categories
        var categories = [
            {name: 'Naturaleza', image: 'https://s3-sa-east-1.amazonaws.com/wordeo/categories/naturaleza.png'},
            {name: 'Matemática', image: 'https://s3-sa-east-1.amazonaws.com/wordeo/categories/matematica.png'},
            {name: 'Historia', image: 'https://s3-sa-east-1.amazonaws.com/wordeo/categories/historia.png'},
            {name: 'Cine, música y televisión', image: 'https://s3-sa-east-1.amazonaws.com/wordeo/categories/cine_y_television.png'},
            {name: 'Cultura General', image: 'https://s3-sa-east-1.amazonaws.com/wordeo/categories/cultura_general.png'},
            {name: 'Deportes', image: 'https://s3-sa-east-1.amazonaws.com/wordeo/categories/deportes.png'},
            {name: 'Mundi', image: 'https://s3-sa-east-1.amazonaws.com/wordeo/categories/mundi.png'}
        ];
        var promises = [];
        for(var idx in categories) {
            const category = categories[idx];
            promises.push(new Promise((resolve, reject) => {
                server.models.QuestionCategory.upsertWithWhere({ name : category.name }, {
                    name: category.name,
                    image: category.image,
                    createdAt: new Date(),
                    lastModifiedAt: new Date()
                }, () => {
                    setTimeout(() => {
                        resolve();
                    }, 5000);
                });
            }));
        }
    }
};