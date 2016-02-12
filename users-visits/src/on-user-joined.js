'use strict';

const U = require('../../utils/index');
const R = require('ramda');

module.exports = function(Visits, Users) {

    return function(payload) {
        return U.sequence([
            Visits.create,
            Visits.save,
            function(visit) {
                return U.sequence([
                    findExistingOrCreateNewUser(Users),
                    setLastVisit(visit),
                    putOnline,
                    Users.save
                ])(visit.username);
            }
        ])(payload.username);
    }
};

const setLastVisit = R.set(R.lensProp('lastVisit'));
const putOnline = R.set(R.lensProp('isOnline'), true);
const findExistingOrCreateNewUser = R.curry(function(Users, username) {
    return U.sequence([
        Users.findByUsername,
        U.either(
            R.identity,
            function createUser() {
                return Users.create(username);
            }
        )
    ])(username);
});