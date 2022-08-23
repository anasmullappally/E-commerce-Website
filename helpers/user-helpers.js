/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable no-async-promise-executor */
/* eslint-disable indent */
/* eslint-disable no-param-reassign */
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const collection = require('../configration/collection');
const db = require('../configration/connection');
const vendorHelpers = require('./vendor-helpers');

module.exports = {
  doSignup: (userData) => {
    delete userData.cPassword;
    userData.isActive = true;
    return new Promise(async (resolve, reject) => {
      const check = await db.get().collection(collection.USER_COLLECTION)
      .findOne({ email: userData.email });
      if (check) {
        reject();
      } else {
        userData.password = await bcrypt.hash(userData.password, 10);
        db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
          resolve(data.insertedId);
        });
      }
    });
  },
  userCheck: (data) => new Promise(async (resolve, reject) => {
      const check = await db.get().collection(collection.USER_COLLECTION)
      .findOne({
        $or: [{ pNumber: data.pNumber }, { email: data.email }],
      });
      if (check) {
        reject();
      } else {
        resolve();
      }
    }),
  doLogin: (userData) => new Promise(async (resolve) => {
    const response = {};
    const user = await db.get().collection(collection.USER_COLLECTION)
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
  viewAllProducts: (device) => new Promise(async (resolve) => {
    const products = await db.get().collection(collection.VENDOR_COLLECTION).aggregate([
      { $unwind: '$products' },
      { $match: { 'products.category': device } },
      { $project: { products: 1, _id: 0 } },
    ]).toArray();
    resolve(products);
  }),
  viewSingleProduct: (productId) => new Promise(async (resolve) => {
    const product = await db.get().collection(collection.VENDOR_COLLECTION).aggregate([
      { $unwind: '$products' },
      { $match: { 'products._id': ObjectId(productId) } },
      { $project: { products: 1, _id: 0 } },
    ]).toArray();
    resolve(product[0]);
  }),
  profileDetails: (userId) => new Promise(async (resolve) => {
    const profile = await db.get().collection(collection.USER_COLLECTION).find(
      { _id: ObjectId(userId) },
      { _id: 1, orders: 0 },
    ).toArray();
    resolve(profile);
  }),
  addTowishlist: (product, userId) => {
    const productid = product.productId;
    return new Promise(async (resolve) => {
      const check = await db.get().collection(collection.USER_COLLECTION).aggregate([
        { $unwind: '$wishlist' },
        {
          $match: {
            $and: [{ _id: ObjectId(userId) },
              { 'wishlist.productId': ObjectId(productid) }],
          },
        },
      ]).toArray();

      if (check[0]) {
        resolve();
      } else {
        await vendorHelpers.getProductDetails(productid).then(async (response) => {
          const productDetails = response.products;
          const wishlist_id = new ObjectId();
          await db.get().collection(collection.USER_COLLECTION).updateOne(
            { _id: ObjectId(userId) },
            {
              $push: {
                wishlist: {
                  wishlist_id: ObjectId(wishlist_id),
                  productId: ObjectId(productid),
                  title: productDetails.title,
                  price: productDetails.price,
                },
              },
            },
          ).then(() => {
            resolve({ status: true });
          });
        });
      }
    });
  },

  viewWishlist: (userData) => new Promise(async (resolve) => {
    const wishlist = await db.get().collection(collection.USER_COLLECTION).aggregate([
      { $match: { _id: ObjectId(userData._id) } },
      { $unwind: '$wishlist' },
      { $project: { wishlist: 1, _id: 0 } },
    ]).toArray();
    resolve(wishlist);
  }),

  deleteProductWishlist: (product) => new Promise(async (resolve) => {
    await db.get().collection(collection.USER_COLLECTION).updateOne(
      {
        'wishlist.wishlist_id': ObjectId(product.wishlist),
      },
      { $pull: { wishlist: { wishlist_id: ObjectId(product.wishlist) } } },
    ).then((response) => {
      resolve(response);
    });
  }),

  updateProfile: (data, userId) => new Promise(async (resolve) => {
    await db.get().collection(collection.USER_COLLECTION).updateOne(
      { _id: ObjectId(userId) },
      {
        $set: {
          fName: data.firstName,
          lName: data.lastName,
          pNumber: data.phoneNum,
          email: data.email,
        },
      },
    ).then((response) => {
      resolve(response);
    });
  }),

  getProductsbyCategory: (device) => new Promise(async (resolve) => {
    const product = await db.get().collection(collection.VENDOR_COLLECTION).aggregate([
      { $unwind: '$products' },
      { $match: { 'products.category': device } },
      { $project: { products: 1, _id: 0 } },
    ]).toArray();
    // console.log(product)
    resolve(product);
  }),
  getAllBrands: (device) => new Promise(async (resolve) => {
    const brands = await db.get().collection(collection.VENDOR_COLLECTION).aggregate([
      { $unwind: '$products' },
      { $match: { 'products.category': device } },
      { $group: { _id: { brand: '$products.brand' } } },
    ]).toArray();
    resolve(brands);
  }),
  getAllBrands1: () => new Promise(async (resolve) => {
    const brands = await db.get().collection(collection.VENDOR_COLLECTION).aggregate([
      { $unwind: '$products' },
      { $group: { _id: { brand: '$products.brand' } } },
    ]).toArray();
    resolve(brands);
  }),

  filterProducts: (filter, device, price, search) => new Promise(async (resolve) => {
    let resultProducts;
    if (!search) {
      if (filter.length > 1) {
        resultProducts = await db.get().collection(collection.VENDOR_COLLECTION).aggregate([
          { $unwind: '$products' },
          { $match: { 'products.category': device } },
          { $match: { 'products.price': { $lt: price } } },
          { $match: { $or: filter } },
          { $project: { _id: 0, products: 1 } },
        ]).toArray();
        resolve(resultProducts);
      } else {
        resultProducts = await db.get().collection(collection.VENDOR_COLLECTION).aggregate([
          { $unwind: '$products' },
          { $match: { 'products.category': device } },
          { $match: { 'products.price': { $lt: price } } },
          { $project: { _id: 0, products: 1 } },
        ]).toArray();
        resolve(resultProducts);
      }
    } else if (filter.length > 1) {
      resultProducts = await db.get().collection(collection.VENDOR_COLLECTION).aggregate([
        {
          $project: {
            _id: 0,
            products: {
              $filter: {
                input: '$products',
                as: 'products',
                cond: {
                  $or: [
                    {
                      $regexMatch: {
                        input: '$$products.brand',
                        regex: search,
                        options: 'i',
                      },
                    },
                    {
                      $regexMatch: {
                        input: '$$products.title',
                        regex: search,
                        options: 'i',
                      },
                    },
                    {
                      $regexMatch: {
                        input: '$$products.category',
                        regex: search,
                        options: 'i',
                      },
                    },

                  ],
                },
              },
            },
          },
        },
        {
          $unwind: '$products',
        },
        {
          $match: { $or: filter },
        },
        {
          $match: { 'products.price': { $lt: price } },
        },
      ]).toArray();

      resolve(resultProducts);
    } else {
      resultProducts = await db.get().collection(collection.VENDOR_COLLECTION)
        .aggregate([
          {
            $project: {
              _id: 0,
              products: {
                $filter: {
                  input: '$products',
                  as: 'products',
                  cond: {
                    $or: [
                      {
                        $regexMatch: {
                          input: '$$products.brandName',
                          regex: search,
                          options: 'i',
                        },
                      },
                      {
                        $regexMatch: {
                          input: '$$products.title',
                          regex: search,
                          options: 'i',
                        },
                      },
                      {
                        $regexMatch: {
                          input: '$$products.category',
                          regex: search,
                          options: 'i',
                        },
                      },

                    ],
                  },
                },
              },
            },
          },

          {
            $unwind: '$products',
          },
          {
            $match: { 'products.price': { $lt: price } },
          },

        ]).toArray();
      resolve(resultProducts);
    }
  }),
  getAddress: (userId) => new Promise(async (resolve) => {
    const address = await db.get().collection(collection.USER_COLLECTION).find(
      { _id: ObjectId(userId) },
      { _id: 1, orders: 0 },
    ).toArray();
    resolve(address[0]);
  }),
  search: (text) => new Promise(async (resolve) => {
    const searchResult = await db.get().collection(collection.VENDOR_COLLECTION).aggregate([
      {
        $project: {
          _id: 0,
          products: {
            $filter: {
              input: '$products',
              as: 'product',
              cond: {
                $or: [
                  {
                    $regexMatch: {
                      input: '$$product.brand',
                      regex: text,
                      options: 'i',
                    },
                  },
                  {
                    $regexMatch: {
                      input: '$$product.title',
                      regex: text,
                      options: 'i',
                    },
                  },
                  {
                    $regexMatch: {
                      input: '$$product.category',
                      regex: text,
                      options: 'i',
                    },
                  },

                ],
              },
            },
          },
        },
      },
      {
        $unwind: '$products',
      },
    ]).toArray();
    resolve(searchResult);
  }),

};
