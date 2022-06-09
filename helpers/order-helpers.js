const { ObjectId } = require('mongodb');
const async = require('hbs/lib/async');
const { reject } = require('bcrypt/promises');
const Razorpay = require('razorpay');
const db = require('../configration/connection');
const collection = require('../configration/collection');
const cartHelpers = require('./cart-helpers');
const vendorHelpers = require('./vendor-helpers');
const { options } = require('../app');

const instance = new Razorpay({
  key_id: 'rzp_test_IxGlNG7u5EDEyS',
  key_secret: '31gjvvX5sb3WfbhMVwrqUqMR',
});

module.exports = {
  placeOder: (orderdetails, cart, user) => new Promise(async (resolve) => {
    const _id = new ObjectId();
    let orders = {};
    orders = orderdetails;
    orders.orderId= 'SP'+Date.now()
    orders._id = _id;
    orders.products = cart;
    orders.total = cart.sum;
    orders.date = (new Date()).toLocaleDateString('en-IN');
    if (orderdetails.paymentmethod == 'COD') {
      orders.status = 'placed';

      await db.get().collection(collection.USER_COLLECTION).updateOne(
        { _id: ObjectId(user._id) },
        { $push: { orders } },
      );
      cartHelpers.emptycart(user._id).then(() => {
        vendorHelpers.updateQuantity(cart).then(() => {
          resolve(orders._id);
        });
      });
    } else {
      orders.status = 'pending';
      await db.get().collection(collection.USER_COLLECTION).updateOne(
        { _id: ObjectId(user._id) },
        { $push: { orders } },
      );
      cartHelpers.emptycart(user._id).then(() => {
        vendorHelpers.updateQuantity(cart).then(() => {
          resolve(orders._id);
        });
      });
    }
  }),
  viewOrders: (userId) => new Promise(async (resolve) => {
    const orders = await db.get().collection(collection.USER_COLLECTION).aggregate([
      { $match: { _id: ObjectId(userId) } },
      { $unwind: '$orders' },
      { $project: { orders: 1, _id: 0 } },
    ]).toArray();
    resolve(orders);
  }),
  generateRazorpay: (orderId, cart) => new Promise(async (resolve) => {
    const options = {
      amount: cart.sum * 100,
      currency: 'INR',
      receipt: `${orderId}`,
    };
    instance.orders.create(options, (err, order) => {
      if (err) {
        console.log(err);
      } else {
        resolve(order);
      }
    });
  }),
  varifyPayment: (paymentDetails) => new Promise((resolve, reject) => {
    const crypto = require('crypto');
    let hmac = crypto.createHmac('sha256', '31gjvvX5sb3WfbhMVwrqUqMR');
    hmac.update(`${paymentDetails['payment[razorpay_order_id]']}|${paymentDetails['payment[razorpay_payment_id]']}`);
    hmac = hmac.digest('hex');
    if (hmac == paymentDetails['payment[razorpay_signature]']) {
      resolve();
    } else {
      reject();
    }
  }),
  changeOrderstatus: (ordersId) => new Promise((resolve) => {
    db.get().collection(collection.USER_COLLECTION).updateOne(
      { 'orders._id': ObjectId(ordersId) },
      { $set: { 'orders.$.status': 'placed' } },
    ).then(() => {
      resolve();
    });
  }),
  viewSingleOrder: (orderId) => new Promise(async (resolve) => {
    const orderdetail = await db.get().collection(collection.USER_COLLECTION).aggregate([
      { $match: { 'orders._id': ObjectId(orderId) } },
      { $unwind: '$orders' },
      { $match: { 'orders._id': ObjectId(orderId) } },

      { $project: { orders: 1, _id: 0 } },
    ]).toArray();
    resolve(orderdetail[0]);
  }),

};
