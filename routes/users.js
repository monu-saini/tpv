var express = require('express');
var router = express.Router();
let DB = require('../models'),
    tokenHandling = require('./toeknhandling'),
    auth = require('./authentication'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    errorHandler = require('./errorsHandler');

router.post('/admin-signin', function(req, res, next) {
    if (!req.body.email || !req.body.password) {
        return res.status(404).json({ success: false, message: 'Authentication failed. Missing credentials.' });
    }

    let criteria = {
        email: req.body.email,
        role: {
            $in: ["1"]
        }
    };

    DB
        .UserSchema.findOne(criteria, function(err, user) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err),
                    success: false,
                });
            }
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Authentication failed. User not found.'
                });
            } else {
                // Check if password matches
                if (!user.authenticate(req.body.password)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Authentication failed. Passwords did not match.'
                    });
                }

                delete user.__v;
                delete user.password;
                delete user.salt;
                req.auth = user;
                next();
            }
        });
}, tokenHandling.generateToken, tokenHandling.sendToken);

router.post('/signup', auth.adminAuthenticate, auth.hasAuthorization, function(req, res, next) {

    if (!req.body.email) {
        return res.status(404).json({ success: false, message: 'Email is required.' });
    }

    let user = new User({
        email: req.body.email,
        password: 'user12345',
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });

    // Then save the user 
    user.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err),
                success: false
            });
        } else {
            let user1 = JSON.parse(JSON.stringify(user));
            delete user1.salt;
            delete user1.__v;

            res.status(200).send({
                success: true,
                data: user1
            })
        }
    });
});

router.post('/signin', function(req, res, next) {
    if (!req.body.email || !req.body.password) {
        return res.status(404).json({ success: false, message: 'Authentication failed. Missing credentials.' });
    }

    let criteria = {
        email: req.body.email,
    };

    DB
        .UserSchema.findOne(criteria, function(err, user) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err),
                    success: false,
                });
            }
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Authentication failed. User not found.'
                });
            } else {
                // Check if password matches
                if (!user.authenticate(req.body.password)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Authentication failed. Passwords did not match.'
                    });
                }
                user = JSON.parse(JSON.stringify(user));
                delete user.__v;
                delete user.password;
                delete user.salt;
                req.auth = user;
                next();

            }
        });
}, tokenHandling.generateToken, function(req, res) {
    res.status(200).send({
        success: true,
        data: {
            token: req.token,
            prefix: 'JWT'
        }
    })
});


router.post('/change-password', auth.authenticate, function(req, res) {
    var passwordDetails = req.body;
    if (req.user) {
        if (passwordDetails.newPassword) {
            User.findById(req.user._id, function(err, user) {
                if (!err && user) {

                    if (user.authenticate(passwordDetails.currentPassword)) {
                        if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
                            user.password = passwordDetails.newPassword;

                            user.save(function(err) {
                                if (err) {
                                    console.log('Err', err)
                                    return res.status(400).send({
                                        message: errorHandler.getErrorMessage(err),
                                        success: false
                                    });
                                } else {
                                    res.send({
                                        message: 'Password changed successfully.',
                                        success: true
                                    });
                                }
                            });
                        } else {
                            res.status(400).send({
                                message: 'Passwords do not match.',
                                success: false
                            });
                        }
                    } else {
                        res.status(400).send({
                            message: 'Current password is incorrect',
                            success: false
                        });
                    }
                } else {
                    res.status(400).send({
                        message: 'User is not found',
                        success: false
                    });
                }
            });
        } else {
            res.status(400).send({
                message: 'Please provide a new password',
                success: false
            });
        }
    } else {
        res.status(400).send({
            message: 'User is not signed in',
            success: false
        });
    }
})


router.post('/update-profile', auth.authenticate, function(req, res) {
    let update = {};

    if (req.body.email) {
        update['email'] = req.body.email
    }

    DB
        .UserSchema
        .findOneAndUpdate({
            _id: req.user._id,
            role: {
                $nin: ["1"]
            }
        }, {
            $set: update
        }, {
            new : true
        })
        .then((updates) => {
            let user1 = JSON.parse(JSON.stringify(updates));
            delete user1.salt;
            delete user1.__v;
            delete user1.password;

            res.status(200).send({
                success: true,
                data: user1
            });
        })
        .catch((err) => {
            res.status(500).send({
                success: false,
                message: errorHandler.getErrorMessage(err)
            });
        })

})
module.exports = router;