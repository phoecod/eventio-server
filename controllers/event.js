const User = require('../models/user');
const Event = require('../models/event');
const  validator = require("email-validator");
const moment = require('moment');
 
function eventValidator(event) {

    const errors = {};
    const validCapacity = parseInt(event.capacity) > 0 ? true : "Capacity    needs to be greater than 0";
    const validTitle = event.title === '' ? "A title is required" : true 
    const validDate = moment(event.date, "YYYY-MM-DD", true).isValid() ? true : "Invalid date format"
    const validTime = moment(event.time, "HH:mm", true).isValid() ? true : "Invalid time format"

    if (typeof validCapacity === 'string') errors['capacity'] = validCapacity;
    if (typeof validTitle  === 'string') errors['title'] = validTitle;
    if (typeof validDate  === 'string') errors['date'] = validDate;
    if (typeof validTime  === 'string') errors['time'] = validTime;

    if (Object.keys(errors).length === 0 && errors.constructor === Object) {
        return true;
    } else {
        return errors
    }
}

exports.addEvent = (req, res, next) => {
    const eventData = req.body;
    const dateStamp = moment.utc(eventData.date + ' ' + eventData.time, 'YYYY/MM/DD HH:mm').toDate();
    eventData.date = dateStamp;
    const validation = eventValidator(eventData);
    if ( typeof validation === 'boolean' && validation) {
        const event = new Event({
            title: eventData.title,
            description: eventData.description,
            date: eventData.date,
            capacity: parseInt(eventData.capacity),
            host: eventData.user.id,
            users: [eventData.user.id]
        });
        event.save(function (err) {
            if (err) return err;
        });
        const eventWithUsers = event.populate('users', 'first_name last_name').
        populate('host', 'first_name last_name', (err, eventUsers) => {});
        User.findById(eventData.user.id, (err, user) => {
            user.events.push(event._id);
            user.save((err, updatedUser) => {
                if (err) return err;
                res.status(200).send(eventWithUsers);
                
            });
        });
        
    } else {
        res.status(422).send(validation);
    }
}

exports.removeOrAddUserFromEvent = (req, res, next) => {
    const eventId = req.body.eventId;
    const users = req.body.users;
    const userId = req.body.currentUserId;
    const joinedEvent = req.body.joinedEvent;
    Event.findByIdAndUpdate(eventId, {users: users}, {new: true}).
    populate('users', 'first_name last_name').
    populate('host', 'first_name last_name').
    exec((err, newEvent) => {
        if (err) res.send(err);
        User.findById(userId, (err, user) => {
            if (err) res.send(err);
            if (joinedEvent) {
                const removedEvent = user.events.filter((event) => event._id === eventId);
                user.events = removedEvent;
            } else {
                user.events.push(eventId);
            }
            
            user.save((err, updatedUser) => {
                if (err) return err;
                res.status(200).send(newEvent);
            });

        });
    });
}

exports.deleteEvent = (req, res, next) => {
    const event = req.body;
    Event.findByIdAndDelete(event._id, (err, event) =>{
        if (err) return err;
        res.status(200).send({eventId: event._id, message: "Event successfully deleted!"});
    });
}

exports.editEvent = (req, res, next) => {
    const event = req.body;
    const title = event.title;
    const description = event.description;
    const capacity = event.capacity;
    const date = event.date;
    Event.findByIdAndUpdate(event.id, {title: title,description: description, capacity: capacity, date: date}, {new: true}).
    populate('users', 'first_name last_name').
    populate('host', 'first_name last_name').
    exec((err, updatedEvent) => {
        if (err) return err;
        res.status(200).send({event: updatedEvent, message: "Event successfully updated!"});
    });   
}

exports.getEvents = (req, res, next) => {
    Event.find({}).
    populate('users', 'first_name last_name').
    populate('host', 'first_name last_name').
    exec((err, events) => {
        if (err) res.send(err);
        res.send(events)
    });
}

exports.getEventsByDateRange = (req, res, next) => {
    const date =  req.body.date;
    const greater = req.body.greater;
    let event;
    if (greater) {
        event = Event.find({date: {$gt: date}});
    } else {
        event = Event.find({date: {$lt: date}});
    }
    event.
    populate('users', 'first_name last_name').
    populate('host', 'first_name last_name').
    exec((err, events) => {
        if (err) res.send(err);
        res.status(200).send(events);
    });
}