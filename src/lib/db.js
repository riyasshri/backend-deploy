const mongoose = require("mongoose");
const connectDb = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URL).catch((e) => {
    console.log(e.message.red);
  });
  console.log(`Connected to DB 👍`.green.bold);
  return conn;
};

module.exports = connectDb;
