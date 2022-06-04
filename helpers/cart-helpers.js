const { reject, promise } = require('bcrypt/promises')
const async = require('hbs/lib/async')
const { ObjectId } = require('mongodb')
const db = require('../configration/connection')
const collection = require('../configration/collection')
const vendorHelpers = require('./vendor-helpers')

module.exports = {
  addToCart: (productId, userId) => new Promise(async (resolve) => {
    let check = await db.get().collection(collection.USER_COLLECTION).aggregate([
      { $unwind: '$cart' },
      { $match: { $and: [{ _id: ObjectId(userId) }, { 'cart.productId': ObjectId(productId) }] } },
    ]).toArray()

    if (check[0]) {
      await db.get().collection(collection.USER_COLLECTION).updateOne(
        { _id: ObjectId(userId), 'cart.productId': ObjectId(productId) },
        { $inc: { 'cart.$.quantity': 1 } },
      ).then(() => {
        resolve()
      })
    } else {
        await vendorHelpers.getProductDetails(productId).then(async (response) => {
          const productDetails = response.products
          const cart_id = new ObjectId()
          await db.get().collection(collection.USER_COLLECTION).updateOne(
            { _id: ObjectId(userId) },
            {
              $push: {
                cart: {
                  cart_id: ObjectId(cart_id),
                  productId: ObjectId(productId),
                  title: productDetails.title,
                  price: productDetails.price,
                  quantity: 1,
                },
              },
            },
          ).then((response) => {
            resolve(response)
            console.log(response);
          })
        })
    }
  }),

  viewCarts: (userData) => new Promise(async (resolve) => {
    const cart = await db.get().collection(collection.USER_COLLECTION).aggregate([
      { $match: { _id: ObjectId(userData._id) } },
      { $unwind: '$cart' },
      { $project: { cart: 1, _id: 0 } },
    ]).toArray()
    resolve(cart)
  }),

  getCartCount: (userId) => new Promise(async (resolve) => {
    let count = 0
    const cart = await db.get().collection(collection.USER_COLLECTION).aggregate([
      { $match: { _id: ObjectId(userId) } },
      { $unwind: '$cart' },
    ]).toArray()
    if (cart) {
      count = cart.length
      resolve(count)
    } else {
      count = 0
      resolve(count)
    }
  }),

  getTotal: (userId) => new Promise(async (resolve) => {
    const total = await db.get().collection(collection.USER_COLLECTION).aggregate([
      { $match: { _id: ObjectId(userId) } },
    ]).toArray()
    const { cart } = total[0]
    let sum = 0
    let count = 0

    for (const i in cart) {
      sum += (cart[i].price * cart[i].quantity)
      count += 1
    }
    cart.sum = sum
    cart.count = count
    resolve(cart)
  }),

  ChangeQuantity: (product, userId) => new Promise(async (resolve) => {
    // let user = await db.get().collection(collection.USER_COLLECTION).findOne(
    //         { "cart.cart_id": ObjectId(product.cart) })
    await db.get().collection(collection.USER_COLLECTION).updateOne(
      {
        _id: ObjectId(userId),
        'cart.cart_id': ObjectId(product.cart),
      },
      { $inc: { 'cart.$.quantity': product.count * 1 } },
    ).then((response) => {
      resolve(response)
    })
  }),

  deleteProduct: (product) => new Promise(async (resolve) => {
    await db.get().collection(collection.USER_COLLECTION).updateOne(
      {
        'cart.cart_id': ObjectId(product.cart),
      },
      { $pull: { cart: { cart_id: ObjectId(product.cart) } } },
    ).then((response) => {
      resolve(response)
    })
  }),

  emptycart: (userId) => new Promise(async (resolve, reject) => {
    await db.get().collection(collection.USER_COLLECTION).updateOne(
      { _id: ObjectId(userId) },
      { $unset: { cart: '' } },
    )
    resolve()
  }),
}   
