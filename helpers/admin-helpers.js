const bcrypt = require('bcrypt') 
const { ObjectId } = require('mongodb') 
const collection = require('../configration/collection') 
const db = require('../configration/connection') 

module.exports = {

  doLogin: (userData) => new Promise(async (resolve) => {
    // const loginStatus = false 
    const response = {} 
    const user = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: userData.email }) 
    if (user) {
      bcrypt.compare(userData.password, user.password).then((status) => {
        if (status) {
          response.user = user 
          response.status = true 
          resolve(response) 
        } else {
          resolve({ status: false }) 
        }
      }) 
    } else {
      resolve({ status: false }) 
    }
  }),

  getAllusers: () => new Promise(async (resolve) => {
    const users = await db.get().collection(collection.USER_COLLECTION).find().toArray() 
    resolve(users) 
  }),

  block: (userid) => new Promise((resolve) => {
    db.get().collection(collection.USER_COLLECTION).updateOne(
      { _id: ObjectId(userid) },
      { $set: { isActive: false } },
    ).then((response) => {
      resolve(response) 
    }) 
  }),

  unBlock: (userid) => new Promise((resolve) => {
    db.get().collection(collection.USER_COLLECTION).updateOne(
      { _id: ObjectId(userid) },
      { $set: { isActive: true } },
    ).then((response) => {
      resolve(response) 
    }) 
  }),

  getAllvendors: () => new Promise(async (resolve) => {
    const vendors = await db.get().collection(collection.VENDOR_COLLECTION).find().toArray() 
    resolve(vendors) 
  }),

  blockVendor: (vendorid) => new Promise((resolve) => {
    db.get().collection(collection.VENDOR_COLLECTION).updateOne(
      { _id: ObjectId(vendorid) },
      { $set: { isActive: false } },
    ).then((response) => {
      resolve(response) 
    }) 
  }),

  unBlockVendor: (vendorid) => new Promise((resolve) => {
    db.get().collection(collection.VENDOR_COLLECTION).updateOne(
      { _id: ObjectId(vendorid) },
      { $set: { isActive: true } },
    ).then((response) => {
      resolve(response) 
    }) 
  }),
  viewAllProducts: () => new Promise(async (resolve) => {
    const products = await db.get().collection(collection.VENDOR_COLLECTION).aggregate([
      { $unwind: '$products' },
      { $project: { products: 1, _id: 0 } },
    ]).toArray() 
    resolve(products) 
  }),
  viewOrders: () => new Promise(async (resolve) => {
    const orders = await db.get().collection(collection.USER_COLLECTION).aggregate([
      { $unwind: '$orders' },
      { $unwind: '$orders.products' },
      { $project: { orders: 1, _id: 0 } },
    ]).toArray() 
    resolve(orders) 
  }),
} 
