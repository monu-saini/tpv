"use strict";

const Mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

Mongoose.Promise = global.Promise;

// specify custom property names for automatically all created at and updated at
Mongoose.plugin(timestamps,  {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const internals = {
    connect: function () {
        //const options = {server: {socketOptions: {keepAlive: 1}}};
        const options = { useMongoClient: true };
        let connectionString = `mongodb://localhost:27017/tpv`;

        /*if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
          // connectionString = `mongodb://${Config.db.userName}:${Config.db.password}@${Config.db.host}:${Config.db.port}/${Config.db.name}`;
          connectionString = `mongodb://${Config.db.userName}:${Config.db.password}@${Config.db.host}:${Config.db.port},ds133927-a1.jxj60.fleet.mlab.com:${Config.db.port}/${Config.db.name}?replicaSet=rs-ds133927&ssl=true`;
        }*/
        console.log("connection string***", connectionString);
        // Create the database connection 
        Mongoose.connect(connectionString);

        // CONNECTION EVENTS
        // When successfully connected
        Mongoose.connection.on('connected', function () {
            console.log('Mongoose default connection open to ' + connectionString);
        });

        // If the connection throws an error
        Mongoose.connection.on('error', function (err) {
            console.log('Mongoose default connection error: ' + err);
        });

        // When the connection is disconnected
        Mongoose.connection.on('disconnected', function () {
            console.log('Mongoose default connection disconnected. Try connecting');
        });

    }
};

module.exports = {
  connect: () => {
    internals
      .connect()
      
  },

  close: function (cb) {
    console.log('Database disconnected.');
    return Mongoose.connection.close(cb)
  }
};
