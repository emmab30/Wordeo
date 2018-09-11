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
            value: '1.0.0.16'
        });

        server.models.Room.destroyAll({ deletedAt : null });
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

        /* var monsters = [
            { name: 'Mixi', price: 4000, imageBase: 'monster_1.png' },
            { name: 'Tukipo', price: 2000, imageBase: 'monster_2.png' },
            { name: 'Mavertin', price: 3000, imageBase: 'monster_3.png' },
            { name: 'Munray', price: 1500, imageBase: 'monster_4.png' },
            { name: 'Plebo', price: 1000, imageBase: 'monster_5.png' },
            { name: 'Dunky', price: 1200, imageBase: 'monster_6.png' },
            { name: 'Rubix', price: 1300, imageBase: 'monster_7.png' },
            { name: 'Pipi', price: 3000, imageBase: 'monster_8.png' },
            { name: 'Turis', price: 3000, imageBase: 'monster_9.png' },
            { name: 'Rainbow', price: 5000, imageBase: 'monster_10.png' },
            { name: 'Rucula', price: 9000, imageBase: 'monster_11.png' },
            { name: 'Bombai', price: 7000, imageBase: 'monster_12.png' },
        ];

        var lifeAccesories = [
            { name: 'Pancho', price: 200, imageBase: 'food_2.png', life: 5 },
            { name: 'Pata de pollo', price: 400, imageBase: 'food_4.png', life: 10 },
            { name: 'Pizza', price: 600, imageBase: 'food_5.png', life: 15 },
            { name: 'Papas', price: 1000, imageBase: 'food_6.png', life: 30 },
            { name: 'Sandwich', price: 1500, imageBase: 'food_7.png', life: 40 },
            { name: 'Comida china', price: 2500, imageBase: 'food_8.png', life: 60 },
            { name: 'Helado', price: 3000, imageBase: 'food_9.png', life: 70 },
            { name: 'Queso', price: 3500, imageBase: 'food_10.png', life: 80 },
            { name: 'Churrasco', price: 5000, imageBase: 'food_3.png', life: 95 }
        ];

        var promisesLifeAccesories = [];
        for(var idx in lifeAccesories) {
            const accesory = lifeAccesories[idx];
            promisesLifeAccesories.push(new Promise((resolve, reject) => {
                server.models.ElementalLifeAccesory.upsertWithWhere({ name: accesory.name }, {
                    name: accesory.name,
                    price: accesory.price,
                    image: accesory.imageBase,
                    life: accesory.life,
                    createdAt: new Date()
                }, (err, result) => {
                    resolve()
                });
            }));
        }

        Promise.all(promisesLifeAccesories).then((result) => {
            console.log('-------- Migrated life accesories -------');
        });

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
        }); */

        //Character accesories
        /* const commonAccesories = [
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
            { zIndex: 1, characterId: -1, category: 'OJOS', name: 'Ojos 21', image: 'eyes_21.png', image_placeholder: 'eyes_21_ph.png', price: 12000},
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
        ]; */
        var accesories = [
            //Pelos
            { name: 'Sin pelo', listId: 0, partId: 0, price: 0 },
            { name: 'Pelo largo', listId: 0, partId: 1, price: 8000 },
            { name: 'Pelo corto', listId: 0, partId: 2, price: 3500 },
            { name: 'Pelo rockero', listId: 0, partId: 3, price: 5000 },
            { name: 'Pelo hoja', listId: 0, partId: 4, price: 2500 },
            { name: 'Pelo aplastado', listId: 0, partId: 5, price: 2500 },
            //Cuernos
            { name: 'Sin cuernos', listId: 1, partId: 0, price: 0 },
            { name: 'Cuernos 1', listId: 1, partId: 1, price: 8000 },
            { name: 'Cuernos 2', listId: 1, partId: 2, price: 3500 },
            { name: 'Cuernos 3', listId: 1, partId: 3, price: 5000 },
            //Ojos
            { name: 'Sin ojos', listId: 2, partId: 0, price: 0 },
            { name: 'Ojos saltones', listId: 2, partId: 1, price: 8000 },
            { name: 'Ojos de orco', listId: 2, partId: 2, price: 3500 },
            { name: 'Ojos negros', listId: 2, partId: 3, price: 5000 },
            { name: 'Tres ojos', listId: 2, partId: 4, price: 2500 },
            { name: 'Ojos malvadiscos', listId: 2, partId: 5, price: 2500 },
            { name: 'Ojos coqueta', listId: 2, partId: 6, price: 2500 },
            { name: 'Ojos dulces', listId: 2, partId: 7, price: 2500 },
            { name: 'Ojos dulces 2', listId: 2, partId: 8, price: 2500 },
            { name: 'Cuatro ojos', listId: 2, partId: 9, price: 2500 },
            { name: 'Lentes de sol', listId: 2, partId: 10, price: 2500 },
            //Bocas
            { name: 'Sin boca', listId: 3, partId: 0, price: 0 },
            { name: 'Bigote', listId: 3, partId: 1, price: 8000 },
            { name: 'Sonrisa', listId: 3, partId: 2, price: 3500 },
            { name: 'Cloy', listId: 3, partId: 3, price: 5000 },
            { name: 'Boca Shrek', listId: 3, partId: 4, price: 5000 },
            { name: 'Babosa', listId: 3, partId: 5, price: 5000 },
            { name: 'Boca de conejo', listId: 3, partId: 6, price: 5000 },
            { name: 'Gruñon', listId: 3, partId: 7, price: 5000 },
            { name: 'Lenguetazo', listId: 3, partId: 8, price: 5000 },
            //Brazos
            { name: 'Sin brazos', listId: 4, partId: 0, price: 0 },
            { name: 'Brazos de mariposa', listId: 4, partId: 1, price: 8000 },
            { name: 'Brazos de Gorila', listId: 4, partId: 2, price: 3500 },
            { name: 'Brazos largos', listId: 4, partId: 3, price: 5000 },
            { name: 'Brazos cortos', listId: 4, partId: 4, price: 5000 },
            { name: 'Tentáculos', listId: 4, partId: 5, price: 5000 },
            //Top
            { name: 'Top 1', listId: 5, partId: 0, price: 0 },
            { name: 'Top 2', listId: 5, partId: 1, price: 2000 },
            { name: 'Top 3', listId: 5, partId: 2, price: 3000 },
            { name: 'Top 4', listId: 5, partId: 3, price: 4000 },
            //Bottom
            { name: 'Base 1', listId: 6, partId: 0, price: 0 },
            { name: 'Base 2', listId: 6, partId: 1, price: 2000 },
            { name: 'Base 3', listId: 6, partId: 2, price: 3000 },
            { name: 'Base 4', listId: 6, partId: 3, price: 4000 },
            { name: 'Base 5', listId: 6, partId: 4, price: 5000 },
            //Pies
            { name: 'Sin patas', listId: 7, partId: 0, price: 0 },
            { name: 'Patas de pollo', listId: 7, partId: 1, price: 8000 },
            { name: 'Patas de elefante', listId: 7, partId: 2, price: 8000 },
            { name: 'Patas de monito', listId: 7, partId: 3, price: 3500 },
            { name: 'Patas de gorila', listId: 7, partId: 4, price: 5000 },
            { name: 'Tentáculos', listId: 7, partId: 5, price: 5000 },
            { name: 'Patas de zebra', listId: 7, partId: 6, price: 5000 },
            //Alas
            { name: 'Sin alas', listId: 8, partId: 0, price: 0 },
            { name: 'Alas de murciélago', listId: 8, partId: 1, price: 8000 },
            { name: 'Alas de mariposa', listId: 8, partId: 2, price: 8000 },
            { name: 'Alas de dragon', listId: 8, partId: 3, price: 3500 },
            //Orejas
            { name: 'Sin orejas', listId: 9, partId: 0, price: 0 },
            { name: 'Orejas peludas', listId: 9, partId: 1, price: 8000 },
            { name: 'Orejas de orco', listId: 9, partId: 2, price: 8000 }
        ];

        var promisesAccesories = [];
        for(var idx in accesories) {
            const accesory = accesories[idx];
            promisesAccesories.push(new Promise((resolve, reject) => {
                server.models.CharacterAccesory.upsertWithWhere({ listId: accesory.listId, partId: accesory.partId, name: accesory.name }, {
                    name: accesory.name,
                    listId: accesory.listId,
                    partId: accesory.partId,
                    price: accesory.price,
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