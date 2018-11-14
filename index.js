const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require ('morgan');
const router = require('./router');
const mongoose = require('mongoose');
const cors = require('cors');

mongoose.Promise = global.Promise;
const uri = "mongodb+srv://ragy:ragy@eventio-b1hk3.mongodb.net/test?retryWrites=true"
mongoose.connect( uri || 'mongodb://localhost:27017/eventio', { useNewUrlParser: true }, (err, client) => {
    console.log(client);
});
mongoose.set('useCreateIndex', true);

const App = express();
// App setup
App.use(morgan('combined'));
App.use(cors());
App.use(bodyParser.json());
router(App);

// Server setup

console.log(process.env.PORT);
console.log(process.env.MONGOLAB_URI);
console.log("<<<<<<<<<<ends....PORT>>>>>>>")
const port = process.env.PORT || 5000;
const server = http.createServer(App);

server.listen(port);

console.log("server running on port " + port);