const mongoose = require('mongoose');

const URI = process.env.MONGO_URI;

mongoose.connect(URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });