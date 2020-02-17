const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  filename: function(req, file, cb) {
    var ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + Date.now() + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // console.log("req",req);
  var ext = path.extname(file.originalname);
  if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
    return cb(new Error("Only images are allowed"));
  }
  cb(null, true);
};

const limits = {
  fileSize: 1024 * 1024 * 7
};

const upload = multer({ storage, fileFilter, limits });

module.exports=upload;