const express = require('express');
const venderRoute = require('./vendor/vendor-auth.js');


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/' + 'public'));


//@user signin route
//@public route
app.use("/vendor", venderRoute);

//@user signup route



app.listen(8000, () => console.log("app is started"));
