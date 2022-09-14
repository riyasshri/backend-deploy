const mongoose = require("mongoose");
const BoughtSchema = new mongoose.Schema({
  prodId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  transactionid: {
    type: String,
    required: true,
  },
});

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    ethAddr: {
      type: String,
      required: true,
    },
    listed: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    bought: {
      type: [BoughtSchema],
      default: [],
    },
    watchlist: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    heldItems: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    resetToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("User", UserSchema);
