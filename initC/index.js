const mongoose=require("mongoose");
const initData=require("./data.js");
const Category=require("../models/category.js")

main().then(()=>{
    console.log("connected to DB")
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/shopwave');
}

const initDB=async()=>{
    await Category.deleteMany({});
    await Category.insertMany(initData.data);
    console.log("data was initialized");
}
initDB();