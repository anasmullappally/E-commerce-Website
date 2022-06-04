var db = require('../configration/connection')
var collection = require('../configration/collection')
const bcrypt = require('bcrypt')
const { reject, promise } = require('bcrypt/promises')
const async = require('hbs/lib/async')
const { ObjectId } = require('mongodb')
const { response } = require('../app')

module.exports = {

    doLogin: (vendorData) => {
        return new Promise(async (resolve) => {
            let loginStatus = false
            let response = {}
            let vendor = await db.get().collection(collection.VENDOR_COLLECTION).findOne({ email: vendorData.email })
            if (vendor) {
                bcrypt.compare(vendorData.password, vendor.password).then((status) => {
                    if (status) {
                        response.vendor = vendor
                        response.status = true
                        resolve(response)
                    } else {
                        resolve({ status: false })
                    }
                })
            } else {
                resolve({ status: false })
            }
        })
    },
    doSignup: (vendorData) => {
        delete vendorData.cPassword
        vendorData.isActive = true
        return new Promise(async (resolve, reject) => {
            const check = await db.get().collection(collection.VENDOR_COLLECTION).findOne({ email: vendorData.email })
            if (check) {
                reject()
            } else {
                vendorData.password = await bcrypt.hash(vendorData.password, 10)
                db.get().collection(collection.VENDOR_COLLECTION).insertOne(vendorData).then((data) => {
                    resolve(data.insertedId)
                })
            }
        })
    },
    addProduct: (productDetails, vendorId) => {
        let products = {
            'category': productDetails.category
        }
        if (products.category == 'mobile') {
            products = {
                '_id': new ObjectId(),
                'mobile': true,
                'title': productDetails.title,
                'brand': productDetails.phonebrand,
                'ram': productDetails.ram,
                'rom': productDetails.rom,
                'display': productDetails.mobiledisplay,
                'processor': productDetails.mobileprocessor,
                'os': productDetails.mobileOs,
                'screenSize': productDetails.screenSize,
                'price': productDetails.price,
                'quantity': productDetails.quantity,
                'deleted': false
            }
        } else {
            products = {
                '_id': new ObjectId(),
                'laptop': true,
                'title': productDetails.title,
                'brand': productDetails.lapBrand,
                'processorBrand': productDetails.processorBrand,
                'ram': productDetails.lapRam,
                'occassion': productDetails.occassion,
                'os': productDetails.lapOs,
                'ssd': productDetails.ssdCapacity,
                'hdd': productDetails.hddCapacity,
                'screenSize': productDetails.screenSize,
                'price': productDetails.price,
                'quantity': productDetails.quantity,
                'deleted': false
            }
        }
        return new Promise(async (resolve) => {
            await db.get().collection(collection.VENDOR_COLLECTION).updateOne({ _id: ObjectId(vendorId) },
                {
                    $push: {
                        'products': products
                    }
                }, { upsert: true })
            resolve(products._id)
        })
    },
    viewProducts: (vendorData) => {
        return new Promise(async (resolve) => {
            let products = await db.get().collection(collection.VENDOR_COLLECTION).aggregate([
                { $match: { _id: ObjectId(vendorData._id) } },
                { $unwind: '$products' },
                { $project: { products: 1, _id: 0 } }
            ]).toArray()
            resolve(products)
        })
    },
    getProductDetails: (productId) => {
        return new Promise(async (resolve) => {
            let product = await db.get().collection(collection.VENDOR_COLLECTION).aggregate([
                { $unwind: '$products' },
                { $match: { 'products._id': ObjectId(productId) } },
                { $project: { products: 1, _id: 0 } }
            ]).toArray()
            resolve(product[0])
        })
    },

    deleteProduct: (productId) => {
        return new Promise(async (resolve) => {
            let data = await db.get().collection(collection.VENDOR_COLLECTION).updateOne(
                { 'products._id': ObjectId(productId) },
                { $set: { 'products.$.deleted': true } }
            )
            resolve()
        })
    },
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
                            'products.$.price': productInfo.price,
                            'products.$.quantity': productInfo.quantity,
                        }
                    }
                ).then((response) => {
                    resolve(response)
                })
            })
        } else {
            return new Promise(async (resolve) => {
                await db.get().collection(collection.VENDOR_COLLECTION).updateOne(
                    { 'products._id': ObjectId(productId) },
                    {
                        $set: {
                            'products.$.title': productInfo.title,
                            'products.$.brand': productInfo.lapBrand,
                            'products.$.screenSize': productInfo.screenSize,
                            'products.$.price': productInfo.price,
                            'products.$.quantity': productInfo.quantity,
                            'products.$.processorBrand': productInfo.processorBrand,
                            'products.$.ram': productInfo.lapRam,
                            'products.$.occassion': productInfo.occassion,
                            'products.$.os': productInfo.lapOs,
                            'products.$.ssd': productInfo.ssdCapacity,
                            'products.$.hdd': productInfo.hddCapacity,
                        }
                    }
                ).then((response) => {
                    resolve(response)

                })
            })
        }
    },
    updateQuantity: (cart) => {
        return new Promise(async (resolve) => {
            let qua
            for (i = 0; i < cart.count; i++) {
                qua = -(cart[i].quantity)
                await db.get().collection(collection.VENDOR_COLLECTION).updateOne(
                    { 'products._id': ObjectId(cart[i].productId) },
                    { $inc: { 'products.$.qauntity': qua } }
                )
                resolve()
            }
        })
    }
}
