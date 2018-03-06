'use strict';

module.exports = {
    // Find All
    dashboard: (req, response) => {
        response.render('dashboard');
    }
}

let express = require('express'),
    router = express.Router(),
    DB = require('../models'),
    tokenHandling = require('./toeknhandling'),
    auth = require('./authentication'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    errorHandler = require('./errorsHandler');

router.get('/', auth.adminAuthenticate, auth.hasAuthorization, function (req, res) {
    res.render('dashboard');
});

router.get('/login', function (req, res) {
    res.render('login');
});

router.get('/userList', auth.adminAuthenticate, auth.hasAuthorization, function (req, res) {
    DB
        .UserSchema
        .find({
            role: {
                $nin: ["1"]
            }
        })
        .then((users) => {
            res.render('user-list', { data: users });
        })
        .catch((err) => {
            res.status(500).send({
                success: false,
                message: err
            })
        })
});

router.get('/userCreate', auth.adminAuthenticate, auth.hasAuthorization, function (req, res) {
    res.render('user-create');
});

router.get('/logout', auth.adminAuthenticate, auth.hasAuthorization, function (req, res) {
    res.clearCookie("Authorization");
    res.send({ 'message': 'Logout Sucessfully.', success: true });
});

module.exports = router;