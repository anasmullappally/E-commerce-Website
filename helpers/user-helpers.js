var db = require('../configration/connection')
var collection = require('../configration/collection')
const bcrypt = require('bcrypt')
const { promise, reject } = require('bcrypt/promises')
const async = require('hbs/lib/async')
const { ObjectId } = require('mongodb')
const vendorHelpers = require('../helpers/vendor-helpers')


module.exports = {
    doSignup: (userData) => {
        delete userData.cPassword
        userData.isActive = true
        return new Promise(async (resolve, reject) => {
            const check = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (check) {
                reject()
            } else {
                userData.password = await bcrypt.hash(userData.password, 10)
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                    resolve(data.insertedId)
                })
            }
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
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
        })
    },
    viewAllProducts: () => {
        return new Promise(async (resolve) => {
            let products = await db.get().collection(collection.VENDOR_COLLECTION).aggregate([
                { $unwind: '$products' },
                { $project: { products: 1, _id: 0 } }
            ]).toArray()
            resolve(products)
        })
    },
    viewSingleProduct: (productId) => {
        return new Promise(async (resolve) => {
            let product = await db.get().collection(collection.VENDOR_COLLECTION).aggregate([
                { $unwind: '$products' },
                { $match: { 'products._id': ObjectId(productId) } },
                { $project: { products: 1, _id: 0 } }
            ]).toArray()
            resolve(product[0])
        })
    },
    profileDetails: (userId) => {
        return new Promise(async (resolve) => {
            let profile = await db.get().collection(collection.USER_COLLECTION).find(
                { _id: ObjectId(userId) },
                { _id: 1, orders: 0 }
            ).toArray()
            console.log(profile);
            resolve(profile)
        })
    },
    addTowishlist: (product, userId) => {
        productid = product.productId
        return new Promise(async (resolve) => {

            let check = await db.get().collection(collection.USER_COLLECTION).aggregate([
                { $unwind: '$cart' },
                {
                    $match: {
                        $and: [{ _id: ObjectId(userId) },
                        { 'wishlist.productId': ObjectId(productid) }]
                    }
                },
            ]).toArray()

            if (check[0]) {
                resolve()
            } else {
                await vendorHelpers.getProductDetails(productid).then(async (response) => {
                    const productDetails = response.products
                    const wishlist_id = new ObjectId()
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
                    ).then((response) => {
                        resolve(response)
                    })
                })
            }
        })
    },
    viewWishlist: (userData) => new Promise(async (resolve) => {
        const wishlist = await db.get().collection(collection.USER_COLLECTION).aggregate([
            { $match: { _id: ObjectId(userData._id) } },
            { $unwind: '$wishlist' },
            { $project: { wishlist: 1, _id: 0 } },
        ]).toArray()
        resolve(wishlist)
    }),
    deleteProductWishlist: (product) => new Promise(async (resolve) => {
        await db.get().collection(collection.USER_COLLECTION).updateOne(
            {
                'wishlist.wishlist_id': ObjectId(product.wishlist),
            },
            { $pull: { wishlist: { wishlist_id: ObjectId(product.wishlist) } } },
        ).then((response) => {
            resolve(response)
        })
    }),
    updateProfile: (data, userId) => {
        return new Promise(async (resolve) => {
            await db.get().collection(collection.USER_COLLECTION).updateOne(
                { _id: ObjectId(userId) },
                {
                    $set: {
                        fName: data.firstName,
                        lName: data.lastName,
                        pNumber: data.phoneNum,
                        email: data.email

                    }
                }
            ).then((response)=>{
                console.log(response);
            })

        })
    }


}