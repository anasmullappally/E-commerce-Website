var db = require('../configration/connection')
var collection = require('../configration/collection')
const bcrypt = require('bcrypt')
const { promise, reject } = require('bcrypt/promises')
const async = require('hbs/lib/async')
const { ObjectId } = require('mongodb')


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
            resolve(product)
        })
    }

}