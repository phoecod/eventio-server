const authentication = require('./controllers/authentication');
const event = require('./controllers/event');
const passportService = require('./services/passport');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', {session: false});
const requireSignin = passport.authenticate('local', {session: false});

module.exports = function (app) {

    // auth/sign in routes
    app.get('/', requireAuth, function(req,res) {
    });
    app.post('/signin', requireSignin, authentication.signin)
    app.post('/signup', authentication.signup);

    // event model routes
    // adds event to db
    app.post('/event', event.addEvent);
    // updates event to db
    app.put('/event', event.editEvent);
    // fetches all event from db
    // events are populated with full users and host(event creator)
    app.get('/events', event.getEvents);
    // fetches events greater than or less than specified date
    app.post('/events/date', event.getEventsByDateRange);
    // modified user association with events
    // used when user, joins or leaves an event
    app.put('/user/events', event.removeOrAddUserFromEvent);
    // delete event only by its creator
    app.post('/event/delete', event.deleteEvent);
}