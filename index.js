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

// Mongodb user
var MongoClient = mongodb.MongoClient;

// URL
var url = 'mongodb://localhost:27017' // change when deploy

MongoClient.connect(url,{useNewUrlParser: true}, function(err,client){
    if(err)
    console.log('Unbale connect mongodb', err)
    else{
        app.listen(3000, ()=>{
            console.log('Connected to Mongodb, running port 3000')
        })
    }
})
