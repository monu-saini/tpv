const UserSchema = require('../models').UserSchema;
UserSchema.findOne({
        'role': '1' //Role 1 means Admin User 
})
    .then(user => {
        if (!user) {
            UserSchema.create({
                email: 'admin@tpv.com',
                password: 'tpv@dev',
                role: '1'
            }, function(err, user) {
                if(!err) {
                    console.log('Admin user created successfully.')
                } else {
                    console.log('err', err)
                }
            });
        } else {
            console.log('Admin user exists.')
        }
    })