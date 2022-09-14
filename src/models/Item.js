const mongoose = require("mongoose");
const ItemSchema = new mongoose.Schema(
  {
    name: { //Req
      type: String,
      required: true,
    },
    desc: {//Req
      type: String,
      required: true,
    },
    basePrice: {//Req
      type: Number,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    minInc: {//Req
      type: Number,
      required: true,
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    img: {//Req
      type: [String],
      default: [],
    },
    watchers: {
      type: [mongoose.Schema.Types.ObjectId],
      defualt: [],
    },
    status: {
      type: String,
      enum: ["live", "down", "sold"],
      default: "live",
    },
    boughtBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    heldBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    proof: {//Req
      type: [String],
      default: [],
    },
    category: {//Req
      type: [String],
      default: [],
      enum: [
        "collectibles & art",
        "electronics",
        "fashion",
        "home & garden",
        "auto parts & accessories",
        "musical instruments & gears",
        "spoorting goods",
        "toys & hobbies",
        "video games & consoles",
        "business & international",
      ],
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Item", ItemSchema);
