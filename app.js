const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use(cors());
const department_controller = require('./department_controller')
const product_controller = require('./product_controller')

mongoose.connect('mongodb://localhost:27017/http_app', { useNewUrlParser: true});

app.use('/departments', department_controller);
app.use('/products', product_controller);
// app.use('/products', product_controller);

app.listen(3000);