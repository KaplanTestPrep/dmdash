const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const mongoddbErrorHandler = require("mongoose-mongodb-errors");

const projectSchema = new Schema({
  id: {
    type: Number,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  track: {
    type: Number,
    required: true
  },
  video: {
    type: Number,
    required: true
  },
  brightcoveId: {
    type: Number,
    required: true
  },
  created: {
    type: Date,
    required: true
  }
});

const annotationSchema = new Schema({
  id: {
    type: Number,
    unique: true,
    required: true
  },
  projectId: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  startTime: {
    type: Number,
    required: true
  },
  created: {
    type: Date,
    required: true
  }
});

projectSchema.plugin(mongoddbErrorHandler);
let Project = mongoose.model("Project", projectSchema);

annotationSchema.plugin(mongoddbErrorHandler);
let Annotation = mongoose.model("Annotation", annotationSchema);

let ProjectSubA = mongoose.model("ProjectSubA", projectSchema);
let ProjectSubB = mongoose.model("ProjectSubB", projectSchema);

let AnnotationSubA = mongoose.model("AnnotationSubA", annotationSchema);
let AnnotationSubB = mongoose.model("AnnotationSubB", annotationSchema);

module.exports = {
  Hapyak: { Project, Annotation },
  HapyakSubA: { Project: ProjectSubA, Annotation: AnnotationSubA },
  HapyakSubB: { Project: ProjectSubB, Annotation: AnnotationSubB }
};
