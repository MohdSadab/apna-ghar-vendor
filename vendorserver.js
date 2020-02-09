const express = require('express');
const venderRoute = require('./vendor/vendor-auth.js');
const itemRoute=require('./vendor/items');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/' + 'public'));


//@vendor auth route
//@public route
app.use("/vendor", venderRoute);

//@vendor item upload route
app.use("/vendor/api",itemRoute);



app.listen(8000, () => console.log("app is started"));
