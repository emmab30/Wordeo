var server = require('../server/server');
var ds = server.dataSources.mysql;
//var lbTables = ['Badge', 'Room', 'RoomUser', 'Profile', 'Account', 'User', 'AccessToken', 'ACL', 'RoleMapping', 'Role'];
var lbTables = ['RoomUser'];
ds.automigrate(lbTables, function(er) {
    if (er) throw er;
    console.log('Loopback tables [' + lbTables + '] created in ', ds.adapter.name);
    ds.disconnect();
});