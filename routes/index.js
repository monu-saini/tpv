'use strict';

var express = require('express'),
    router = express.Router(),
    path = require('path');

const Config = require('config'),
    Spanwgo = require('../SpanwgoCustomize'),
    DB = require('../models'),
    fs = require('fs');


let connectingJSON = {
    'db': 'tpv',
    'collection': 'products'
}

let helperFunctions = {
    importCSVTOMongo: (filepath) => {
        let mongonaut = new Spanwgo(connectingJSON);
        return new Promise((resolve, reject) => {
            try {
                let output = '',
                    childProcess = mongonaut.import(filepath);

                childProcess.stderr.on('data', function(data) {
                    output += data
                })

                childProcess.on('close', function(status) {
                    if (status !== 0) {
                        reject({
                            out: output,
                            code: status
                        })
                    } else {
                        resolve({
                            out: output,
                            code: status
                        })
                    }
                })
            } catch (e) {
                console.log('eeeee', e)
                reject(e)
            }
        })
    },
    removeFile: (path) => {
        fs.unlink(path, function(err) {
            if (err) return console.log(err);
            console.log('file deleted successfully');
        });
    }
}

let auth = require('./authentication'),
    multer = require('multer'),
    storage = multer.diskStorage({
        destination: function(req, file, callback) {
            callback(null, './uploads')
        },
        filename: function(req, file, callback) {
            console.log('file', file)
            callback(null, Date.now() + path.extname(file.originalname))
        }
    }),
    upload = multer({ storage: storage });

router.post('/saveDataInDB', upload.single('file'), function(req, res) {
    let data = req.body;
    if (req.file) {
        let filePath = path.join(process.cwd(), req.file.path);
        helperFunctions
            .importCSVTOMongo(filePath)
            .then((result) => {
                helperFunctions.removeFile(filePath);
            })
            .catch((err) => {
                console.log('Error Importing File:', err);
                helperFunctions.removeFile(filePath);
            })
        res.status(200).send({
            success: true,
            data: "File is uploaded successfully. Now we are processing the file."
        })
    } else {
        res.status(500).send({
            success: false,
            message: 'Unable to upload file.'
        })
    }

    // DB
    //   .ProductSchema
    //   .insertMany(req.body)
    //   .then(() => {
    //     console.log('All documennts inserted successfully.')
    //     res.status(200).send({
    //       message: 'All Data Saved Successfully.'
    //     });
    //   })
    //   .catch((err) => {
    //     console.log('[Error Inserting Documents.]', err);
    //     res.status(500).send(err);
    //   })
});

router.get('/getCategories', auth.authenticate, function(req, res) {

    DB
        .ProductSchema
        .aggregate([{
            $group: {
                _id: { code: "$Product_Category_Code", "name": "$Product_Category_Name" }
            }
        }])
        .then((result) => {
            let parsedRes = [];
            result.forEach((obj) => {
                parsedRes.push(obj._id);
            })

            if (parsedRes.length === 0) {
                return res.status(200).send({
                    message: 'No Product Categories Found.',
                    success: false
                });
            }

            res.status(200).send({
                data: parsedRes,
                success: true
            });
        })
        .catch((err) => {
            console.log('[Error In Finding distinct Categrories.]', err);
            res.status(500).send({
                success: false,
                message: err
            });
        })
});

router.get('/getProductGroups', auth.authenticate, function(req, res) {
    let categoryId = req.query.categoryId;

    if (!categoryId) {
        return res.status(400).send({
            message: 'Missing Fields.',
            success: false
        })
    }
    DB
        .ProductSchema
        .aggregate([{
                $match: {
                    'Product_Category_Code': parseInt(categoryId)
                }
            },
            {
                $group: {
                    _id: { code: "$Product_Group", "name": "$Product_Group_Name" }
                }
            }
        ])
        .then((result) => {
            let parsedRes = [];
            result.forEach((obj) => {
                parsedRes.push(obj._id);
            })

            if (parsedRes.length === 0) {
                return res.status(200).send({
                    message: 'No Product Group in this category.',
                    success: false
                });
            }

            res.status(200).send({
                success: true,
                data: parsedRes
            });
        })
        .catch((err) => {
            console.log('[Error In Finding distinct Product Groups.]', err);
            res.status(500).send({
                success: false,
                message: err
            });
        })
});

router.get('/getProducts', auth.authenticate, function(req, res) {
    let groupId = req.query.groupId;

    if (!groupId) {
        return res.status(400).send({
            message: 'Missing Fields.',
            success: false
        })
    }

    DB
        .ProductSchema
        .find({
            "Product_Group": parseInt(groupId)
        }, {
            "Product_Category_Code": false,
            "Product_Category_Name": false,
            "Product_Group": false,
            "Product_Group_Name": false,
            "__v": false
        })
        .then((result) => {
            result = JSON.parse(JSON.stringify(result));

            if (result.length === 0) {
                return res.status(200).send({
                    message: 'No products in this product group.',
                    success: false
                });
            }

            res.status(200).send({
                success: true,
                data: result
            });
        })
        .catch((err) => {
            console.log('[Error In Finding distinct Product.]', err);
            res.status(500).send({
                success: false,
                message: err
            });
        })
});

module.exports = router;