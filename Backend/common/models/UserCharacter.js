'use strict';

const app = require('../../server/server');
const loopbackContext = require("loopback-context");
const log = require('fancy-log');
var _ = require('lodash');

module.exports = function(UserCharacter) {
	UserCharacter.getMyCharacter = getMyCharacter;
	UserCharacter.getCharacterByUserId = getCharacterByUserId;
	UserCharacter.updateMyCharacter = updateMyCharacter;

	function getMyCharacter(next) {
		let error = new Error();
		let ctx = loopbackContext.getCurrentContext();
        let accessToken = ctx && ctx.get('accessToken');

        if(accessToken != null && accessToken.userId) {
        	UserCharacter.findOne({ where : { accountId : accessToken.userId }}, function(err, character) {
	        	if(character != null) {

	        		app.models.UserCharacterAccesory.find({ where : { userCharacterId : character.id }}, (err, userCharacterAccesories) => {
	        			app.models.CharacterAccesory.find({ where : { id : { inq: userCharacterAccesories.map((e) => { return e.accesoryId }) } }}, (err, accesories) => {

	        				app.models.Profile.findOne({ where : { accountId : accessToken.userId }}, (err, profile) => {
		                        for(var idx in userCharacterAccesories) {
		                            let accesory = accesories[idx];
		                            accesories[idx].isBuyable = accesory.price <= profile.balance_tuls;
		                            accesories[idx].isEquipped = userCharacterAccesories[idx].isEquipped;
		                        }

		                        character.accesories = accesories;
		                        next(null, {
				        			success: true,
				        			data: character
				        		});
	                        });
	        			});
	        		});
	        	} else {
	        		UserCharacter.create({
	        			accountId: accessToken.userId,
	        			life: 100,
	        			colorId: 0
	        		}, (err, created) => {
	        			next(null, {
		        			success: true,
		        			data: created
		        		})
	        		});
	        	}
	        });
        };
	}

	function getCharacterByUserId(userId, next) {
		let error = new Error();
		let ctx = loopbackContext.getCurrentContext();
        let accessToken = ctx && ctx.get('accessToken');

        if(accessToken != null && accessToken.userId) {
        	UserCharacter.findOne({ where : { accountId : userId }}, function(err, character) {
	        	if(character != null) {

	        		app.models.UserCharacterAccesory.find({ where : { userCharacterId : character.id }}, (err, userCharacterAccesories) => {
	        			app.models.CharacterAccesory.find({ where : { id : { inq: userCharacterAccesories.map((e) => { return e.accesoryId }) } }}, (err, accesories) => {

	        				app.models.Profile.findOne({ where : { accountId : userId }}, (err, profile) => {
		                        for(var idx in userCharacterAccesories) {
		                            let accesory = accesories[idx];
		                            accesories[idx].isBuyable = accesory.price <= profile.balance_tuls;
		                            accesories[idx].isEquipped = userCharacterAccesories[idx].isEquipped;
		                        }

		                        character.accesories = accesories;
		                        next(null, {
				        			success: true,
				        			data: character
				        		});
	                        });
	        			});
	        		});
	        	} else {
	        		UserCharacter.create({
	        			accountId: accessToken.userId,
	        			life: 100,
	        			colorId: 0
	        		}, (err, created) => {
	        			next(null, {
		        			success: true,
		        			data: created
		        		})
	        		});
	        	}
	        });
        };
	}

	function updateMyCharacter(data, next) {

		let error = new Error();
		let ctx = loopbackContext.getCurrentContext();
        let accessToken = ctx && ctx.get('accessToken');

        let colorId = data.colorId;
        let accesories = data.accesories;
        UserCharacter.findOne({ where : { accountId: accessToken.userId }}, (err, character) => {
        	app.models.Profile.findOne({ where : { accountId : accessToken.userId }}, (err, profile) => {
	        	let promises = [];
	        	for(var idx in accesories) {
	        		const accesory = accesories[idx];
	        		promises.push(new Promise((resolve, reject) => {
	        			app.models.CharacterAccesory.findOne({ where : { partId : accesory.partId, listId: accesory.listId }}, (err, acc) => {
	        				if(acc != null) {

	        					//Check if the user has another accesory with the same listID. Then we need to remove it.
	        					app.models.CharacterAccesory.find({ where : { listId: accesory.listId }}, (err, accesoriesSameListId) => {
	        						app.models.UserCharacterAccesory.count({ userCharacterId: character.id, accesoryId : { inq: accesoriesSameListId.map((e) => e.id) } }, (err, count) => {

	        							var _insertItem = () => {
	        								profile.balance_tuls -= acc.price;
	        								profile.save();

		        							//Then the user is buying, we need to take the tuls for this payment.
		        							app.models.UserCharacterAccesory.create({
					        					accesoryId: acc.id,
					        					userCharacterId: character.id,
					        					isEquipped: true
					        				}, (err, created) => {
					        					resolve();
					        				});
	        							}

		        						if(count == 0) {
		        							_insertItem();
		        						} else {
		        							//Remove the last item then add this new one
		        							app.models.UserCharacterAccesory.destroyAll({ accesoryId : { inq: accesoriesSameListId.map((e) => e.id) } }, (err, success) => {
		        								_insertItem();
		        							});
		        						}
		        					});
	        					});
	        				} else {
	        					resolve();
	        				}
	        			});
	        		}));
	        	}

	        	Promise.all(promises).then((values) => {
	        		next(null, {
	        			success: true
	        		});
	        	});
        	});
        });
	}
};