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

module.exports = mongoose.model("Bought", BoughtSchema);
