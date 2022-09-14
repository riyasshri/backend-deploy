const mongoose = require("mongoose");
const sendEmail = require("../lib/sendEmail");
const Bought = require("../models/Bought");
const Item = require("../models/Item");
const User = require("../models/User");

exports.getuser = async (req, res, next) => {
  try {
    const user = await User.findById(mongoose.Types.ObjectId(req.params.id));
    if (!user) {
      return res.status(404).json({
        status: "failure",
        msg: "Invalid email id",
      });
    }
    res.status(200).json({
      status: "success",
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.placebid = async (req, res, next) => {
  try {
    const { email, id, amount } = req.body;
    const user = await User.findOne({
      email: email,
    });
    const item = await Item.findById(mongoose.Types.ObjectId(id));
    if (!user) {
      return res.status(404).json({
        status: "failure",
        msg: "User not found",
      });
    }
    if (!item) {
      res.status(404).json({
        status: "failure",
        msg: "Item not found",
      });
    }
    let prevPrice = item.currentPrice;
    if (amount - prevPrice < item.minInc) {
      console.log(amount, prevPrice, item.minInc);
      return res.status(403).json({
        status: "failure",
        msg: "Less than minimum increment",
      });
    }
    if (item.owner.toString() == user._id.toString()) {
      return res.status(403).json({
        status: "failure",
        msg: "Owner cannot bid for the product",
      });
    }
    if (amount > item.basePrice && amount > item.currentPrice) {
      const emailData = `The item ${item.name}'s price have increased from ${prevPrice} to ${item.currentPrice}.`;
      const subject = `Update on ${item.name}`;
      if (item.heldBy) {
        const oldUser = await User.findByIdAndUpdate(
          item.heldBy,
          {
            $pull: {
              heldItems: mongoose.Types.ObjectId(item._id),
            },
          },
          { new: true }
        );
        sendEmail(oldUser.email, emailData, subject);
      }
      item.currentPrice = amount;
      item.heldBy = user._id;
      user.heldItems.push(item._id);
      item.watchers.forEach(async (id) => {
        const user = await User.findById(mongoose.Types.ObjectId(id), {
          email: 1,
          _id: 0,
        });
        sendEmail(user.email, emailData, subject);
      });
      await item.save();
      await user.save();
      res.status(200).json({
        status: "success",
        item,
      });
    } else {
      return res.status(409).json({
        status: "failure",
        msg: "Value is either less than base price or current bid",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.addToWatchlist = async (req, res, next) => {
  try {
    const { email, id } = req.body;
    const user = await User.findOne({
      email: email,
    });
    const item = await Item.findById(mongoose.Types.ObjectId(id));
    if (!item) {
      return res.status(404).json({
        status: "failure",
        msg: "Item doesnt exists",
      });
    }
    if (!user) {
      return res.status(404).json({
        status: "failure",
        msg: "User doesnt exists",
      });
    }
    if (user.watchlist.includes(id)) {
      return res.status(404).json({
        status: "failure",
        msg: "Item already exists",
      });
    }
    user.watchlist.push(id);
    item.watchers.push(user._id);
    await user.save();
    await item.save();
    return res.status(200).json({
      status: "success",
      msg: "Item added to watchlist",
    });
  } catch (error) {
    next(error);
  }
};

exports.removeFromWatchlist = async (req, res, next) => {
  try {
    const { email, id } = req.body;
    const user = await User.findOne({
      email: email,
    });
    const item = await Item.findById(mongoose.Types.ObjectId(id));
    if (!item) {
      return res.status(404).json({
        status: "failure",
        msg: "Item doesnt exists",
      });
    }
    if (!user) {
      return res.status(404).json({
        status: "failure",
        msg: "User doesnt exists",
      });
    }
    if (user.watchlist.includes(id)) {
      let index = user.watchlist.indexOf(id);
      user.watchlist = user.watchlist.splice(index, 1);
      let windex = item.watchers.indexOf(user._id);
      item.watchers = item.watchers.splice(windex, 1);
      await item.save();
      await user.save();
      return res.status(200).json({
        status: "success",
        msg: "Item removed from watchlist",
      });
    }
    return res.status(402).json({
      status: "failure",
      msg: "Item doesnt exists in watchlist",
    });
  } catch (error) {
    next(error);
  }
};

exports.getWatchlist = async (req, res, next) => {
  try {
    const { email, pgNo, limit } = req.body;
    let user = await User.findOne(
      {
        email,
      },
      {
        watchlist: {
          $slice: [limit * (pgNo - 1), limit],
        },
      }
    );
    if (user) {
      const list = user.watchlist;
      return res.status(200).json({
        status: "success",
        list,
      });
    }
    return res.status(404).json({
      status: "failure",
      msg: "User doesnt exists",
    });
  } catch (error) {
    next(error);
  }
};

exports.makepayment = async (req, res, next) => {
  try {
    const { email, id, transactionid } = req.body;
    const user = await User.findOne(
      {
        email: email,
      },
      { _id: 1, heldItems: 1 }
    );
    const item = await Item.findById(mongoose.Types.ObjectId(id));
    if (!item) {
      return res.status(404).json({
        status: "failure",
        msg: "Item not available",
      });
    }
    if (!user) {
      return res.status(404).json({
        status: "failure",
        msg: "User doesnt exists",
      });
    }
    if (!item.status == "live") {
      return res.status(403).json({
        status: "failure",
        msg: "Auction item not live",
      });
    }
    if (user.heldItems) {
      const index = user.heldItems.indexOf(id);
      if (index > -1) {
        const bitem = new Bought({ prodId: item._id, transactionid });
        await User.findByIdAndUpdate(user._id, {
          $pull: {
            heldItems: item._id,
          },
          $push: {
            bought: bitem,
          },
        });
        item.status = "sold";
        item.boughtBy = user._id;
        await item.save();
        res.status(200).json({
          status: "success",
          msg: "Payment recorded",
        });
      } else {
        return res.status(401).json({
          status: "failure",
          msg: "This object is not held by the user",
        });
      }
    } else {
      return res.status(401).json({
        status: "failure",
        msg: "Nothing in held items",
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.heldup = async (req, res, next) => {
  try {
    let user = await User.findById(mongoose.Types.ObjectId(req.params.id), {
      heldItems: {
        $slice: [req.body.limit * (req.body.pgNo - 1), req.body.limit],
      },
    });
    if (user) {
      user = user.heldItems;
      return res.status(200).json({
        status: "success",
        user,
      });
    } else {
      return res.status(404).json({
        status: "failure",
        msg: "User not found",
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async(req, res, next)=>{
  try {
    const {id}=req.params;
    const body = req.body;
    const user = await User.findByIdAndUpdate(id, body, { new: true })
    res.status(200).json({
      status: "success",
      user
    })
  } catch (error) {
    next(error);
  }
}