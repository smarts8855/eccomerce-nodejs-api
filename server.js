const express = require('express')
const dotenv = require('dotenv').config()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const PORT = process.env.PORT ||5000

const productRouter = require('./routers/productRouter');
const categoryRouter = require('./routers/categoryRouter');
const userRouter = require('./routers/userRouter');
const orderRouter = require('./routers/orderRouter');
const { authJwt } = require('./helper/jwt')
const { errorhandler } = require('./helper/error-handler')
// const errorhandler = require('./helper/error-handler');





const app = express()

app.use(cors());
app.options('*', cors())

//DB config
const db = require('./config/db').MongoURI;

//Database Connection
mongoose.connect(db, {useNewUrlParser: true, dbName: process.env.DB_NAME})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

const api = process.env.API_URL;

// middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorhandler);




// Product routes
app.use(`${api}/products`, productRouter);

// Category routes
app.use(`${api}/category`, categoryRouter);

// User routes
app.use(`${api}/user`, userRouter);

// Order routes
app.use(`${api}/order`, orderRouter);

app.listen(PORT, ()=> console.log(`Server start on port ${PORT}`));