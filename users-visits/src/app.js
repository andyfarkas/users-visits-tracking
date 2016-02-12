'use strict';

const U = require('../../utils/index');
const R = require('ramda');
const getOnUserJoinedHandler = require('./on-user-joined');

module.exports = function(
    EventsBus,
    Mongo,
    Visits,
    Users
) {

    class App {
        static start() {
            U.sequence([
                Mongo.connect,
                EventsBus.connect,
                listenToUserEvents(EventsBus),
                function(usersEvents) {
                    usersEvents.on('user_joined', getOnUserJoinedHandler(Visits, Users));
                    usersEvents.on('user_left', App.onUserLeft);
                }
            ])();
        }
    }

    return App;
};

const listenTo = R.curry(function(eventsGroup, EventsBus, eventsBusConnection) {
    return EventsBus.attachToExchange(eventsGroup, eventsBusConnection);
});
const listenToUserEvents = listenTo('user_events');

//let getUsernameProperty = U.maybeGetProperty('username');
//let createNewOrReturnExistingUser = R.curry(function(username, existingUser) {
//    return U.either(
//        function returnExistingUser() { return existingUser; },
//        function createNewUser() { return Users.createNew(username); }
//    )(existingUser);
//});
//
//App.onUserJoined = U.sequence([
//    getUsernameProperty,
//    Visits.createNewVisitForUser,
//    Visits.save,
//    function withVisit(visit) {
//        return U.sequence([
//            getUsernameProperty,
//            function getUserByUsername(username) {
//                return U.sequence([
//                    Users.tryFindByUsername,
//                    createNewOrReturnExistingUser(username)
//                ])(username);
//            },
//            Users.updateWithLastVisit(visit),
//            Users.putOnline,
//            Users.save
//        ])(visit);
//    },
//    console.log
//]);
//
//App.onUserLeft = U.sequence([k
//    U.maybeGetProperty('username'),
//    Users.tryFindByUsername,
//    U.maybeOf,
//    function endVisitOfUser(user) {
//        return U.sequence([
//            Visits.getLastVisitForUser,
//            Visits.end,
//            Visits.save,
//            function updateWithLastVisit(visit) {
//                return U.sequence([
//                    Users.updateWithLastVisit(visit),
//                    Users.putOffline,
//                    Users.save
//                ])(user);
//            }
//        ])(user);
//    },
//    console.log
//]);