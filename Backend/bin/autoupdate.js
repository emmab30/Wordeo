var server = require('../server/server');
var ds = server.dataSources.mysql;

var models = [
    /* 'Configuration',
    'UserCharacter',
    'UserCharacterAccesory',
    'CharacterAccesory',
    'Character',
    'Badge',
    'Room',
    'RoomUser',
    'RoomUserQuestion',
    'Profile',
    'Account',
    'User',
    'AccessToken',
    'ACL',
    'RoleMapping',
    'Role',
    'Question',
    'QuestionCategory',
    'Notification',
    'PendingQuestion',
    'Contact', */
    'Account',
    'QuestionReport',
    'Reward'
];
ds.isActual(models, function(err, actual) {
    if (!actual) {
        ds.autoupdate(models, function(er) {
            if (er) throw er;
            console.log('Loopback tables [' + models + '] updated in ', ds.adapter.name);

            ds.disconnect();
        });
    } else {
        process.exit()
    }
});