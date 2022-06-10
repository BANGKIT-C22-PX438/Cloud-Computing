// Import Package
var mongodb = require('mongodb')
var ObjectID = mongodb.ObjectId
var crypto = require('crypto')
var express = require('express')
var bodyParser = require('body-parser')
const { request } = require('http')
const { response } = require('express')


// Create Function
var genRandomString =  function (length) {
    return crypto.randomBytes(Math.ceil(length/2))
    .toString('hex')
    .slice(0, length)
}

var sha512 = function (password, salt) {
    var hash = crypto.createHmac('sha512', salt)
    hash.update(password)
    var value = hash.digest('hex')
    return {
        salt:salt, passwordHash:value
    }
}

function saltHashPassword(userPassword) {
    var salt = genRandomString(16)
    var passwordData = sha512(userPassword, salt)
    return passwordData
}

function checkHashPassword(userPassword, salt) {
    var passwordData = sha512(userPassword, salt)
    return passwordData
}

// Express
var app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// MongoDB
var MongoClient = mongodb.MongoClient

// URL
var url = 'mongodb://localhost:27017'

MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
    if (err)
    console.log('Unable to connect', err)
    else{
        app.post('/register', (request, response, next)=> {
            var post_data = request.body

            var plaint_password = post_data.password
            var hash_data = saltHashPassword(plaint_password)

            var password = hash_data.passwordHash
            var salt = hash_data.salt

            var name = post_data.name
            var email = post_data.email

            var insertJson = {
                'email': email,
                'password': password,
                'salt': salt,
                'name': name
            }
            var db = client.db('chicky')

            db.collection('user')
            .find({'email': email}).count(function(err, number){
                if(number != 0) {
                    response.json('Email already exist')
                    console.log('Email already exist')
                }
                else {
                    db.collection('user')
                    .insertOne(insertJson,function(error, res){
                        response.json('Success')
                    console.log('Success')
                    })
                }
            })
        })

        app.post('/login', (request, response, next)=> {
            var post_data = request.body

            var email = post_data.email
            var userPassword = post_data.password

            
            var db = client.db('chicky')

            db.collection('user')
            .find({'email': email}).count(function(err, number){
                if(number == 0) {
                    response.json('Email not exist')
                    console.log('Email not exist')
                }
                else {
                    db.collection('user')
                    .findOne({'email': email}, function(err,user){
                        var salt = user.salt
                        var hashed_password = checkHashPassword(userPassword, salt).passwordHash
                        var encrypted_password = user.password
                        if(hashed_password == encrypted_password) {
                            response.json('Login success')
                            console.log('Login success')
                        } else {
                            response.json('Login Failed')
                            console.log('Login Failed')
                        }
                    })
                }
            })
        })


        app.listen(3000, ()=> {
            console.log('Connected to server')
        })
    }
})