'use strict';

module.exports = function(server) {

    //Only do this for the first time.
    if (process.env.pm_id == 1) {
        //Create default roles
        server.models.Role.upsertWithWhere({name : 'Administrator'}, {
            name: 'Administrator',
            description: 'Administrator role'
        });

        server.models.Role.upsertWithWhere({name: 'Player'}, {
            name: 'Player',
            description: 'Player role'
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
            {name: 'Animales', image: 'https://s3-sa-east-1.amazonaws.com/wordeo/categories/animales.png'},
            {name: 'Matemática', image: 'https://s3-sa-east-1.amazonaws.com/wordeo/categories/matematica.png'},
            {name: 'Historia', image: 'https://s3-sa-east-1.amazonaws.com/wordeo/categories/historia.png'},
            {name: 'Cine y Televisión', image: 'https://s3-sa-east-1.amazonaws.com/wordeo/categories/cine_y_television.png'},
            {name: 'Cultura General', image: 'https://s3-sa-east-1.amazonaws.com/wordeo/categories/cultura_general.png'},
            {name: 'Deportes', image: 'https://s3-sa-east-1.amazonaws.com/wordeo/categories/deportes.png'},
            {name: 'Mundi', image: 'https://s3-sa-east-1.amazonaws.com/wordeo/categories/mundi.png'}
        ];
        var promises = [];
        for(var idx in categories) {
            const category = categories[idx];
            promises.push(new Promise((resolve, reject) => {
                setTimeout(() => {
                    server.models.QuestionCategory.upsertWithWhere({ name : category.name }, {
                        name: category.name,
                        image: category.image,
                        createdAt: new Date(),
                        lastModifiedAt: new Date()
                    });
                }, 100);
            }));
        }

        server.models.Room.destroyAll({});
        server.models.RoomUser.destroyAll({});
        server.models.Account.update({isOnline: false});
    }
};