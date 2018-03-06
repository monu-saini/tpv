const Config = require('config'),
    jwt = require('jsonwebtoken');

let adminAuthenticate = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['authorization'] || getTokenFromCookie(req);
    if (token) {
        //Decode the token
        let regex = new RegExp(`^${Config.JWT.prefix}\\s`);
        token = token.replace(regex, '')
        jwt.verify(token, Config.JWT.secret, (err, decod) => {
            if (err) {
                return res.redirect('/login');
            }
            else {
                req.user = decod.data;
                next()
            }
        });
    }
    else {
        return res.redirect('/login');
    }
};

let authenticate = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['authorization'] || getTokenFromCookie(req);
    if (token) {
        //Decode the token
        let regex = new RegExp(`^${Config.JWT.prefix}\\s`);
        token = token.replace(regex, '')
        jwt.verify(token, Config.JWT.secret, (err, decod) => {
            if (err) {
                res.status(403).json({
                    message: "Wrong Token",
                    success: false
                });
            }
            else {
                req.user = decod.data;
                next();
            }
        });
    }
    else {
        res.status(403).json({
            message: "No Token",
            success: false
        });
    }
};

function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    return list;
}

function getTokenFromCookie (request) {
    var list = parseCookies(request);
    return list.Authorization;
}

/**
 * User authorizations routing middleware
 * Check if user have role admin
 */
let hasAuthorization = function(req, res, next) {
    if (req.user && req.user.role && req.user.role == '1') {
            return next();
    } else {
        return res.redirect('/login');
    }
};

module.exports = {
    hasAuthorization,
    adminAuthenticate,
    authenticate
};