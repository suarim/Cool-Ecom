require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const router = require('./routes/product-routes');
app.use(cors());
app.use(bodyParser.json());
app.use("/api/products/",router);
app.listen(process.env.PORT || 3000, () => {
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("Connected to MongoDB");
    }).catch((err)=>{       
        console.log(err);
    })
})