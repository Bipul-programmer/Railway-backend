import mongoose from 'mongoose';

const passengerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: Number,
  gender: {
    type: String,
    enum: ['M', 'F', 'O'],
  },
  bookingStatus: {
    type: String,
    required: true,
  },
  currentStatus: {
    type: String,
    required: true,
  },
  coach: String,
  berth: Number,
});

const pnrRecordSchema = new mongoose.Schema({
  pnrNumber: {
    type: String,
    required: true,
    unique: true,
    length: 10,
    index: true,
  },
  trainNumber: {
    type: String,
    required: true,
  },
  trainName: {
    type: String,
    required: true,
  },
  dateOfJourney: {
    type: Date,
    required: true,
  },
  sourceStation: {
    code: { type: String, required: true },
    name: String,
  },
  destinationStation: {
    code: { type: String, required: true },
    name: String,
  },
  className: {
    type: String, // e.g. 2A, 3A, SL
  },
  chartStatus: {
    type: String,
    default: 'CHART NOT PREPARED',
  },
  passengers: [passengerSchema],
  lastUpdated: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

const PNRRecord = mongoose.model('PNRRecord', pnrRecordSchema);

export default PNRRecord;
