redeemRequest: (req, res) => {
    const { sellerId, balance } = req.query
    sellerName = req.session.seller.username
    sellerhelpers.redeemRequest(sellerId, balance, sellerName).then(() => {
        res.redirect('/sellers/dashboard')
    })
    redeemRequest: (sellerId, balance, sellerName) => {
        return new Promise(async (resolve, reject) => {
            let redeem = {
                requestId: new ObjectId(),
                requestTime: new Date(),
                sellerId: ObjectId(sellerId),
                amount: Number(balance),
                sellerName: sellerName,
                paymentStatus: false

            }
            await db.get().collection(collection.mainCollection).updateOne(
                { role: "admin" },
                { $push: { redeemRequests: redeem } }
            )
            await db.get().collection(collection.mainCollection).updateOne(
                { _id: ObjectId(sellerId) },
                { $set: { redeemRequest: true } }
            )
            resolve()
        })
    },