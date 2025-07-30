const mongoose = require('mongoose');

const URI = "mongodb+srv://harshits0147:Harsh123%40@cluster0.thsfpgk.mongodb.net/HotelManagement";

mongoose.connect(URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });