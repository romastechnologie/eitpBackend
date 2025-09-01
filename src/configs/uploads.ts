import multer = require('multer');
import fs = require('fs');
import path = require('path');
var moment = require('moment-timezone');

const timezone_name = "Asia/Kolkata";
function serverDateTime(format) {
  var jun = moment(new Date());
  jun.tz(timezone_name).format();
  return jun.format(format);
}

const fileNameGenerate =  (extension) => {
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  var result = '';
  for (let i = 10; i > 0; i--) result += chars[Math.floor(Math.random() * chars.length)];
  return serverDateTime('YYYYMMDDHHmmssms') + result + '.' + extension;
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const nmbre = file.originalname.split(".");
    file.originalname = fileNameGenerate(nmbre[nmbre.length - 1]);
    cb(null, file.originalname);
   // files.push(file);
  }
});

const produitstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/Produits/');
  },
  filename: function (req, file, cb) {
    const nmbre = file.originalname.split(".");
    file.originalname = fileNameGenerate(nmbre[nmbre.length - 1]);
    cb(null, file.originalname);
   // files.push(file);
  }
});
const articlestorage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("REQUEST ==> ",req.files);
    cb(null, 'uploads/Articles/');
  },
  filename: function (req, file, cb) {
    const nmbre = file.originalname.split(".");
    file.originalname = fileNameGenerate(nmbre[nmbre.length - 1]);
    cb(null, file.originalname);
   // files.push(file);
  }
});


const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'video/*' || file.mimetype === 'video/mp4' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf' || file.mimetype === 'application/msword') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 //5Mo
  },
  fileFilter: fileFilter
});

export const listen = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 115 //115Mo
    },
    fileFilter: fileFilter
});

export const prduitListen = multer({
  storage: produitstorage,
  limits: {
    fileSize: 1024 * 1024 * 115 //115Mo
  },
  fileFilter: fileFilter
});

export const articleListen = multer({
  storage: articlestorage,
  limits: {
    fileSize: 1024 * 1024 * 115 //115Mo
  },
  fileFilter: fileFilter
});