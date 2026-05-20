const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true // Ek naam ka ek hi banda register ho sake
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Agar model pehle se bana ho to wahi use karein, warna naya banayein
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);