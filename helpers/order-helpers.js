const { ObjectId } = require('mongodb');
const Razorpay = require('razorpay');
const db = require('../configration/connection');
const collection = require('../configration/collection');
const cartHelpers = require('./cart-helpers');
const vendorHelpers = require('./vendor-helpers');

const instance = new Razorpay({
  key_id: 'rzp_test_IxGlNG7u5EDEyS',
  key_secret: '31gjvvX5sb3WfbhMVwrqUqMR',
});

module.exports = {
  placeOder: (orderdetails, cart, user) => new Promise(async (resolve) => {
    const address = {};
    address.country = orderdetails.country;
    address.firstName = orderdetails.firstName;
    address.lastName = orderdetails.lastName;
    address.address1 = orderdetails.address1;
    address.addres2 = orderdetails.addres2;
    address.state = orderdetails.state;
    address.zip = orderdetails.zip;
    address.email = orderdetails.email;
    address.phone = orderdetails.phone;

    db.get().collection(collection.USER_COLLECTION).updateOne(
      { _id: ObjectId(user._id) },
      {
        $set: { address },
      },
    );

    const _id = new ObjectId();
    let orders = {};
    orders = orderdetails;
    orders.orderId = `SP${Date.now()}`;
    orders._id = _id;
    orders.products = cart;
    orders.total = cart.sum;
    orders.date = (new Date()).toLocaleDateString('en-IN');
    // orders.cancelled = false
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
      { $unwind: '$orders.products' },
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
  // cancelorder: (data) => {
  //   return new Promise((resolve) => {
  //     db.get().collection(collection.USER_COLLECTION).updateOne(
  //       { 'orders._id': ObjectId(data.orderId) },
  //       { $set: { 'orders.$.cancelled': true } },
  //     ).then((response) => {
  //       console.log(response)
  //       resolve()
  //     })
  //   })

  // },
  cancelorder: (data) => new Promise(async (resolve) => {
    const {
      orderId, productId, cartId, productQuantity,
    } = data;
    // console.log(true)
    // console.log(productId)
    await db.get().collection(collection.USER_COLLECTION).updateOne(
      { 'orders.products.cart_id': ObjectId(cartId) },
      {
        $set: { 'orders.$.products.$[i].cancelled': true },
      },
      {
        arrayFilters: [{
          'i.cart_id': ObjectId(cartId),
        }],
      },
    );
    resolve();
  }),
  // changeProductQuntity: (data) => {
  //   console.log(data)
  //   quan = parseInt(data.productQuantity)
  //   console.log(quan)
  //   return new Promise((resolve) => {
  //     db.get().collection(collection.VENDOR_COLLECTION).updateOne(
  //       { 'products._id': ObjectId(data.productId) },
  //       { $inc: { 'products.$.quantity': quan } },
  //     ).then((response) => {
  //       console.log(response)
  //       console.log(555555)
  //     })
  //   })
  // },

};
