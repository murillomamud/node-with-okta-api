const cors = require('cors');
const { response } = require('express');
const express = require('express');
var request = require("request");

const app = express();
const port = 8080;
const basic_url = process.env.OKTA_URL
const client = process.env.CLIENT
const secret = process.env.SECRET
var auth = 'Basic ' + Buffer.from(client + ':' + secret).toString('base64');


var whoami
var token

//create async function to reach token
async function getToken(req, res, next) {
    let response = await callOkta()
    console.log(response)
    token = response
    next()
}


function callOkta() {

    var json 

    var options = { method: 'POST',
      url: basic_url + 'v1/token',
      headers: 
       { 'cache-control': 'no-cache',
         'content-type': 'application/x-www-form-urlencoded',
         authorization: auth } ,
      form: { grant_type: 'client_credentials' } };
    
    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            if (error) {
                reject(error);
            } else {
                resolve({
                    access_token: JSON.parse(body).access_token
                });
            }                    
          });
    })    
}

const authenticationRequired = async (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/Bearer (.+)/);
    if (!match) {
        console.log('401 - Missing token')
        return res.status(401).send();
    }

    try {
        const accessToken = match[1];
        console.log(accessToken);
        if (!accessToken) {
            console.log('Not authorized');
            return res.status(401, 'Not authorized').send();
        }

        var options = { method: 'POST',
          url: basic_url + 'v1/introspect',
          headers: 
           { 'cache-control': 'no-cache',
             'content-type': 'application/x-www-form-urlencoded',
             accept: 'application/json',
             authorization: auth },
          form: { token: accessToken } };
        
        request(options, function (error, response, body) {
          if (error) throw new Error(error);
        
          whoami = JSON.parse(body)
          next();
        });
        


    } catch (err) {
        console.log(err)
        return res.status(401).send(err.message);
    }
};


app
.use(cors())
.listen(port, () => console.log('Server running on port ' + port));

// app.all('*', authenticationRequired); // Require authentication for all routes

app.get('/api/hello', (req, res) => {
    res.send('Hello world!');
});

app.get('/api/whoami', authenticationRequired, (req, res) => {
    console.log(whoami)
    if (whoami.active == true){
        res.json(whoami);
    }else{
        res.status(401).send('Invalid Token')
    }
    
});

app.get('/api/token', getToken, (req, res, next) => {
    res.json(token);    
})

