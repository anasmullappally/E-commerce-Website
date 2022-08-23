/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable no-async-promise-executor */
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const collection = require('../configration/collection');
const db = require('../configration/connection');

module.exports = {

  doLogin: (userData) => new Promise(async (resolve) => {
    // const loginStatus = false
    const response = {};
    const user = await db.get().collection(collection.ADMIN_COLLECTION)
      .findOne({ email: userData.email });
    if (user) {
      bcrypt.compare(userData.password, user.password).then((status) => {
        if (status) {
          response.user = user;
          response.status = true;
          resolve(response);
        } else {
          resolve({ status: false });
        }
      });
    } else {
      resolve({ status: false });
    }
  }),

  getAllusers: () => new Promise(async (resolve) => {
    const users = await db.get().collection(collection.USER_COLLECTION).find().toArray();
    resolve(users);
  }),

  block: (userid) => new Promise((resolve) => {
    db.get().collection(collection.USER_COLLECTION).updateOne(
      { _id: ObjectId(userid) },
      { $set: { isActive: false } },
    ).then((response) => {
      resolve(response);
    });
  }),

  unBlock: (userid) => new Promise((resolve) => {
    db.get().collection(collection.USER_COLLECTION).updateOne(
      { _id: ObjectId(userid) },
      { $set: { isActive: true } },
    ).then((response) => {
      resolve(response);
    });
  }),

  getAllvendors: () => new Promise(async (resolve) => {
    const vendors = await db.get().collection(collection.VENDOR_COLLECTION).find().toArray();
    resolve(vendors);
  }),

  blockVendor: (vendorid) => new Promise((resolve) => {
    db.get().collection(collection.VENDOR_COLLECTION).updateOne(
      { _id: ObjectId(vendorid) },
      { $set: { isActive: false } },
    ).then((response) => {
      resolve(response);
    });
  }),

  unBlockVendor: (vendorid) => new Promise((resolve) => {
    db.get().collection(collection.VENDOR_COLLECTION).updateOne(
      { _id: ObjectId(vendorid) },
      { $set: { isActive: true } },
    ).then((response) => {
      resolve(response);
    });
  }),
  viewAllProducts: () => new Promise(async (resolve) => {
    const products = await db.get().collection(collection.VENDOR_COLLECTION).aggregate([
      { $unwind: '$products' },
      { $project: { products: 1, _id: 0 } },
    ]).toArray();
    resolve(products);
  }),
  viewOrders: () => new Promise(async (resolve) => {
    const orders = await db.get().collection(collection.USER_COLLECTION).aggregate([
      { $unwind: '$orders' },
      { $unwind: '$orders.products' },
      { $project: { orders: 1, _id: 0 } },
    ]).toArray();
    resolve(orders);
  }),
  redeemRequests: () => new Promise(async (resolve) => {
    const admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ role: 'admin' });
    const { redeemRequests } = admin;
    let count = 0;
    for (const i of redeemRequests) {
      if (!i.paymentStatus) {
        count++;
      }
    }
    const response = {
      redeemRequests,
      count,
    };
    resolve(response);
  }),
  vendorPayment: (vendorId, amount, requestId) => new Promise(async (resolve) => {
    const paymentId = new ObjectId();
    const paidOn = new Date();
    await db.get().collection(collection.ADMIN_COLLECTION).updateOne(
      { 'redeemRequests.requestId': ObjectId(requestId) },
      { $set: { 'redeemRequests.$.paymentStatus': true, 'redeemRequests.$.paymentId': paymentId, 'redeemRequests.$.paidOn': paidOn } },
    );
    await db.get().collection(collection.VENDOR_COLLECTION).updateOne(
      { _id: ObjectId(vendorId), redeemRequest: true },
      {
        $set: { redeemRequest: false },
        $inc: { claimed: Number(amount) },
      },
    );
    resolve();
  }),
  viewVendor: (vendorId) => new Promise((resolve) => {
    const vendor = db.get().collection(collection.VENDOR_COLLECTION)
      .findOne({ _id: ObjectId(vendorId) });
    resolve(vendor);
  }),
  totalRevenue: () => new Promise(async (resolve) => {
    const result = await db.get().collection(collection.USER_COLLECTION).aggregate([
      { $unwind: '$orders' },
      { $unwind: '$orders.products' },
      { $match: { 'orders.products.delivered': true } },
      { $match: { 'orders.status': 'placed' } },
      { $project: { 'orders.products': 1, _id: 0 } },

    ]).toArray();
    const response = {};
    let netRevenue = 0; let
      totalQuantity = 0;
    for (const i of result) {
      netRevenue += i.orders.products.price;
      totalQuantity += i.orders.products.quantity;
    }
    // netRevenue = netRevenue * 0.9
    response.netRevenue = netRevenue;
    response.totalQuantity = totalQuantity;
    resolve(response);
  }),
};
