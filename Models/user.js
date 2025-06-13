const mongoose = require("mongoose");

mongoose.connect(`mongodb://127.0.0.1:27017/miniProject`);

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  age: Number,
  email: String,
  password: String,
  profile: {
    type: String,
    default: "default.png",
  },
  post: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});

module.exports = mongoose.model("user", userSchema);
