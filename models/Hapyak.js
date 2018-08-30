const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const mongoddbErrorHandler = require("mongoose-mongodb-errors");

const projectSchema = new Schema({
  id: {
    type: Number,
    unique: true
  },
  title: {
    type: String
  },
  trackId: {
    type: Number
  },
  video: {
    type: Number
  }
});

projectSchema.plugin(mongoddbErrorHandler);
let HapyProj = mongoose.model("HapyProj", projectSchema);

const annotationSchema = new Schema({
  id: {
    type: Number,
    unique: true
  },
  type: {
    type: String
  }
});

annotationSchema.plugin(mongoddbErrorHandler);
let HapyAnno = mongoose.model("HapyAnno", annotationSchema);

module.exports = {
  HapyProj,
  HapyAnno
};
