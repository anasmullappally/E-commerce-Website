const { reject, promise } = require('bcrypt/promises')
const async = require('hbs/lib/async')
const { ObjectId } = require('mongodb')
const db = require('../configration/connection')
const collection = require('../configration/collection')
const vendorHelpers = require('./vendor-helpers')

module.exports = {
  addToCart: (productId, userId) => new Promise(async (resolve) => {
    const check = await db.get().collection(collection.USER_COLLECTION).aggregate([
      { $unwind: '$cart' },
      { $match: { $and: [{ _id: ObjectId(userId) }, { 'cart.productId': ObjectId(productId) }] } },
    ]).toArray()

    if (check[0]) {
      const product = await db.get().collection(collection.USER_COLLECTION).aggregate([
        { $match: { _id: ObjectId(userId) } },
        { $unwind: '$cart' },
        { $project: { cart: 1, _id: 0 } }
      ]).toArray()
      console.log(product);
      for (const oneCart of product) {
        if (oneCart.cart.productId) {
          oneCart.cart.quantity = oneCart.cart.quantity + 1
          await db.get().collection(collection.USER_COLLECTION).updateOne(
            { 'cart.cart_id': oneCart.cart.cart_id },
            {
              $set: {
                "cart.$.quantity": oneCart.cart.quantity,
                'cart.$.cartTotal': oneCart.cart.quantity * oneCart.cart.price
              }
            }
          )
          resolve()
        }
      }
      // await db.get().collection(collection.USER_COLLECTION).updateOne(
      //   { _id: ObjectId(userId), 'cart.productId': ObjectId(productId) },
      //   { $inc: { 'cart.$.quantity': 1 } },
      // ).then(() => {
      //   resolve()
      // })
    } else {
      await vendorHelpers.getProductDetails(productId).then(async (response) => {
        const productDetails = response.products
        const cartTotal = productDetails.price * 1
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
                vendorID: productDetails.vendorId,
                quantity: 1,
                cartTotal
              },
            },
          },
        ).then((response) => {
          resolve(response)
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

  ChangeQuantity: (products, userId) => new Promise(async (resolve) => {
    const product = await db.get().collection(collection.USER_COLLECTION).aggregate([
      { $match: { _id: ObjectId(userId) } },
      { $unwind: '$cart' },
      { $project: { cart: 1, _id: 0 } }
    ]).toArray()
    console.log(product);
    for (const oneCart of product) {
      if (oneCart.cart.productId) {
       oneCart.cart.quantity = oneCart.cart.quantity + Number(products.count) 
        await db.get().collection(collection.USER_COLLECTION).updateOne(
          { 'cart.cart_id': ObjectId(products.cart) },
          {
            $set: {
              "cart.$.quantity": oneCart.cart.quantity,
              'cart.$.cartTotal': oneCart.cart.quantity * oneCart.cart.price
            }
          }
        )
        resolve()
      }
    }
    // console.log(product);
    // await db.get().collection(collection.USER_COLLECTION).updateOne(
    //   {
    //     _id: ObjectId(userId),
    //     'cart.cart_id': ObjectId(product.cart),
    //   },
    //   { $inc: { 'cart.$.quantity': product.count * 1 } },
    // ).then((response) => {
    //   resolve(response)
    // })

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

  emptycart: (userId) => new Promise(async (resolve) => {
    await db.get().collection(collection.USER_COLLECTION).updateOne(
      { _id: ObjectId(userId) },
      { $unset: { cart: '' } },
    )
    resolve()
  }),
} 
