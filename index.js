const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require ('morgan');
const router = require('./router');
const mongoose = require('mongoose');
const cors = require('cors');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/eventio', { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);

const App = express();
// App setup
App.use(morgan('combined'));
App.use(cors());
App.use(bodyParser.json());
router(App);

// Server setup
console.log(process.env);
console.log(".......end......");
const port = process.env.MONGO_PORT || 3090;
const server = http.createServer(App);

server.listen(port);

console.log("server running on port " + port);