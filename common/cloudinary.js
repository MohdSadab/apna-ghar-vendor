
const cloudinary = require("cloudinary").v2;
const config = require("config");

cloudinary.config({
  cloud_name: "petfinder",
  api_key: config.get("cloudinaryApi"),
  api_secret: config.get("cloudinarySecretKey")
});

module.exports=cloudinary;