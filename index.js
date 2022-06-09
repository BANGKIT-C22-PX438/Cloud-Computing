// Import package
var mongodb = require('mongodb')
var ObjectID = mongodb.ObjectId
var crypto = require('crypto')
var express = require('express')
var bodyParser = require('body-parser')

// Password Utilis
// Create function
var genRandomString = function(length) {
    return crypto.randomBytes(Math.ceil(length/2))
    .toString('hex')
    .slice(0, length)
}

var sha512 = function(password, salt) {
    var hash = crypto.createHmac('sha512', salt)
    hash.update(password)
    var value = hash.digest('hex')
    return {
        salt:salt,
        passwordHash:value
    }
}

function saltHashPassword(userPassword) {
    var salt = genRandomString(16)
    var passwordData = sha512(userPassword,salt) 
    return passwordData;
}

function checkHashPassword(userPassword,salt) {
    var passwordData = sha512(userPassword,salt)
    return passwordData
}

// Create Express
var app = express
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


