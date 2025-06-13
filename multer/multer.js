const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

//? Disk storage

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../public/image/uploads");
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(10, (err, name) => {
      const fn = name.toString("hex") + path.extname(file.originalname);
      cb(null, fn);
    });
  },
});

//? export unload
const upload = multer({ storage: storage });

module.exports = upload;
