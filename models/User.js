const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const mongoddbErrorHandler = require("mongoose-mongodb-errors");

const userSchema = new Schema({
  oauthID: {
    type: Number,
    unique: true
  },
  name: {
    type: String
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true
  },
  picture: {
    type: String
  },
  created: {
    type: Date
  }
});

userSchema.plugin(mongoddbErrorHandler);

module.exports = mongoose.model("User", userSchema);
