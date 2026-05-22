import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  city: String,
  state: String,
  coordinates: {
    latitude: Number,
    longitude: Number,
  }
}, {
  timestamps: true,
});

const Station = mongoose.model('Station', stationSchema);

export default Station;
