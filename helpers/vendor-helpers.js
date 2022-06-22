const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const collection = require('../configration/collection');
const db = require('../configration/connection');

module.exports = {

  doLogin: (vendorData) => new Promise(async (resolve) => {
    const loginStatus = false;
    const response = {};
    const vendor = await db.get().collection(collection.VENDOR_COLLECTION).findOne({ email: vendorData.email });
    if (vendor) {
      bcrypt.compare(vendorData.password, vendor.password).then((status) => {
        if (status) {
          response.vendor = vendor;
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
  doSignup: (vendorData) => {
    delete vendorData.cPassword;
    vendorData.isActive = true;
    vendorData.totalErnings = 0;
    vendorData.claimed = 0
    return new Promise(async (resolve, reject) => {
      const check = await db.get().collection(collection.VENDOR_COLLECTION).findOne({ email: vendorData.email });
      if (check) {
        reject();
      } else {
        vendorData.password = await bcrypt.hash(vendorData.password, 10);
        db.get().collection(collection.VENDOR_COLLECTION).insertOne(vendorData).then((data) => {
          resolve(data.insertedId);
        });
      }
    });
  },
  addProduct: (productDetails, vendorId) => {
    let products = {
      category: productDetails.category,
    };
    if (products.category == 'mobile') {
      products = {
        vendorId: ObjectId(vendorId),
        _id: new ObjectId(),
        mobile: true,
        category: 'mobile',
        title: productDetails.title,
        brand: productDetails.phonebrand,
        ram: productDetails.ram,
        rom: productDetails.rom,
        display: productDetails.mobiledisplay,
        processor: productDetails.mobileprocessor,
        os: productDetails.mobileOs,
        screenSize: productDetails.screenSize,
        price: Number(productDetails.price),
        quantity: Number(productDetails.quantity),
        deleted: false,
      };
    } else {
      products = {
        vendorId: ObjectId(vendorId),
        _id: new ObjectId(),
        laptop: true,
        category: 'laptop',
        title: productDetails.title,
        brand: productDetails.lapBrand,
        processorBrand: productDetails.processorBrand,
        ram: productDetails.lapRam,
        occassion: productDetails.occassion,
        os: productDetails.lapOs,
        ssd: productDetails.ssdCapacity,
        hdd: productDetails.hddCapacity,
        screenSize: productDetails.screenSize,
        price: Number(productDetails.price),
        quantity: Number(productDetails.quantity),
        deleted: false,
      };
    }
    return new Promise(async (resolve) => {
      await db.get().collection(collection.VENDOR_COLLECTION).updateOne(
        { _id: ObjectId(vendorId) },
        {
          $push: {
            products,
          },
        },
        { upsert: true },
      );
      resolve(products._id);
    });
  },
  viewProducts: (vendorData) => new Promise(async (resolve) => {
    const products = await db.get().collection(collection.VENDOR_COLLECTION).aggregate([
      { $match: { _id: ObjectId(vendorData._id) } },
      { $unwind: '$products' },
      { $project: { products: 1, _id: 0 } },
    ]).toArray();
    resolve(products);
  }),
  getProductDetails: (productId) => new Promise(async (resolve) => {
    const product = await db.get().collection(collection.VENDOR_COLLECTION).aggregate([
      { $unwind: '$products' },
      { $match: { 'products._id': ObjectId(productId) } },
      { $project: { products: 1, _id: 0 } },
    ]).toArray();
    resolve(product[0]);
  }),

  deleteProduct: (productId) => new Promise(async (resolve) => {
    const data = await db.get().collection(collection.VENDOR_COLLECTION).updateOne(
      { 'products._id': ObjectId(productId) },
      { $set: { 'products.$.deleted': true } },
    );
    resolve(data);
  }),
  updateProduct: (productId, productInfo) => {
    if (productInfo.category == 'mobile') {
      return new Promise(async (resolve) => {
        await db.get().collection(collection.VENDOR_COLLECTION).updateOne(
          { 'products._id': ObjectId(productId) },
          {
            $set: {
              'products.$.title': productInfo.title,
              'products.$.brand': productInfo.phonebrand,
              'products.$.ram': productInfo.ram,
              'products.$.rom': productInfo.rom,
              'products.$.display': productInfo.mobiledisplay,
              'products.$.processor': productInfo.mobileprocessor,
              'products.$.os': productInfo.mobileOs,
              'products.$.screenSize': productInfo.screenSize,
              'products.$.price': Number(productInfo.price),
              'products.$.quantity': Number(productInfo.quantity),
            },
          },
        ).then((response) => {
          resolve(response);
        });
      });
    }
    return new Promise(async (resolve) => {
      await db.get().collection(collection.VENDOR_COLLECTION).updateOne(
        { 'products._id': ObjectId(productId) },
        {
          $set: {
            'products.$.title': productInfo.title,
            'products.$.brand': productInfo.lapBrand,
            'products.$.screenSize': productInfo.screenSize,
            'products.$.price': Number(productInfo.price),
            'products.$.quantity': Number(productInfo.quantity),
            'products.$.processorBrand': productInfo.processorBrand,
            'products.$.ram': productInfo.lapRam,
            'products.$.occassion': productInfo.occassion,
            'products.$.os': productInfo.lapOs,
            'products.$.ssd': productInfo.ssdCapacity,
            'products.$.hdd': productInfo.hddCapacity,
          },
        },
      ).then((response) => {
        resolve(response);
      });
    });
  },
  updateQuantity: (cart) => new Promise(async (resolve) => {
    let qua;
    for (let i = 0; i < cart.count; i++) {
      qua = -(cart[i].quantity);
      await db.get().collection(collection.VENDOR_COLLECTION).updateOne(
        { 'products._id': ObjectId(cart[i].productId) },
        { $inc: { 'products.$.quantity': qua } },
      );
      resolve();
    }
  }),
  VendorProfileDetails: (vendorId) => new Promise(async (resolve) => {
    const vendor = await db.get().collection(collection.VENDOR_COLLECTION).findOne(
      { _id: ObjectId(vendorId) },
      { _id: 1, products: 0 },
    )
    resolve(vendor);
  }),
  updateVendorProfile: (data, vendorId) => new Promise(async (resolve) => {
    await db.get().collection(collection.VENDOR_COLLECTION).updateOne(
      { _id: ObjectId(vendorId) },
      {
        $set: {
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNum,
          email: data.email,
          country: data.country,
          state: data.state,
        },
      },
    ).then((response) => {
      resolve(response);
    });
  }),
  viewOrders: (vendorId) => new Promise(async (resolve) => {
    const orders = await db.get().collection(collection.USER_COLLECTION).aggregate([
      { $unwind: '$orders' },
      { $unwind: '$orders.products' },
      { $match: { 'orders.products.vendorID': ObjectId(vendorId) } },
      { $project: { orders: 1, _id: 0 } },

    ]).toArray();
    // console.log(orders)
    resolve(orders);
  }),
  changeShippingStatus: (cartId) => new Promise(async (resolve) => {
    await db.get().collection(collection.USER_COLLECTION).updateOne(
      { 'orders.products.cart_id': ObjectId(cartId) },
      {
        $set: { 'orders.$.products.$[i].shipped': true },
      },
      {
        arrayFilters: [{
          'i.cart_id': ObjectId(cartId),
        }],
      },
    );
    resolve();
  }),
  changeDeliveredStatus: (cartId) => new Promise(async (resolve) => {
    await db.get().collection(collection.USER_COLLECTION).updateOne(
      { 'orders.products.cart_id': ObjectId(cartId) },
      {
        $set: { 'orders.$.products.$[i].delivered': true },
      },
      {
        arrayFilters: [{
          'i.cart_id': ObjectId(cartId),
        }],
      },
    );
    resolve();
  }),
  revenue: (vendorId) => {
    return new Promise(async (resolve) => {
      let result = await db.get().collection(collection.USER_COLLECTION).aggregate([
        { $unwind: '$orders' },
        { $unwind: '$orders.products' },
        { $match: { 'orders.products.delivered': true } },
        { $match: { 'orders.products.vendorID': ObjectId(vendorId), 'orders.status': 'placed' } },
        { $project: { 'orders.products': 1, _id: 0 } }

      ]).toArray()
      let response = {}
      let netRevenue = 0, totalQuantity = 0
      for (let i of result) {
        netRevenue += i.orders.products.price
        totalQuantity += i.orders.products.quantity
      }
      netRevenue = netRevenue * 0.9
      response.netRevenue = netRevenue
      response.totalQuantity = totalQuantity
      await db.get().collection(collection.VENDOR_COLLECTION).updateOne({ _id: ObjectId(vendorId) }, { $set: { totalErnings: netRevenue } })
      resolve(response)
    })
  },
  redeemRequest: (vendorId, vendorName ,balance) => {
    return new Promise(async (resolve) => {
        let redeem = {
            requestId: new ObjectId(),
            requestTime:  (new Date()).toLocaleDateString('en-IN'),
            vendorId: ObjectId(vendorId),
            amount: Number(balance),
            vendorName: vendorName,
            paymentStatus: false
        }
        await db.get().collection(collection.ADMIN_COLLECTION).updateOne(
            { role: "admin" },
            { $push: { redeemRequests: redeem } }
        )
        await db.get().collection(collection.VENDOR_COLLECTION).updateOne(
            { _id: ObjectId(vendorId) },
            { $set: { redeemRequest: true } }
        )
        resolve()
    })
},

};
