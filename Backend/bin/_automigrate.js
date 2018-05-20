var server = require('../server/server');
var ds = server.dataSources.mysql;

var lbTables = [
    'Configuration',
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
    //'Question',
    'QuestionCategory',
    'QuestionReport',
    'Notification',
    //'QuestionOption',
    'PendingQuestion',
    'Contact'
];
ds.automigrate(lbTables, function(er) {
    if (er) throw er;
    console.log('Loopback tables [' + lbTables + '] created in ', ds.adapter.name);

    ds.disconnect();
});