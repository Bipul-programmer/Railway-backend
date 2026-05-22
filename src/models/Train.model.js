import mongoose from 'mongoose';

const trainSchema = new mongoose.Schema({
  trainNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String, // Express, Shatabdi, Rajdhani, etc.
  },
  sourceStation: {
    code: String,
    name: String,
  },
  destinationStation: {
    code: String,
    name: String,
  },
  runsOn: {
    monday: { type: Boolean, default: true },
    tuesday: { type: Boolean, default: true },
    wednesday: { type: Boolean, default: true },
    thursday: { type: Boolean, default: true },
    friday: { type: Boolean, default: true },
    saturday: { type: Boolean, default: true },
    sunday: { type: Boolean, default: true },
  },
  classes: [String], // ['1A', '2A', '3A', 'SL', '2S']
  route: [{
    stationCode: String,
    stationName: String,
    arrivalTime: String,
    departureTime: String,
    distance: Number,
    day: Number,
  }],
}, {
  timestamps: true,
});

const Train = mongoose.model('Train', trainSchema);

export default Train;
