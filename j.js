placeOrder: (order, user, cart) => {
    return new Promise(async (resolve, reject) => {
        // console.log(true);
        // console.log(cart);
        let _id = new ObjectId()
        let orders = {}
        orders = order
        orders._id = _id
        orders.products = cart
        orders.date = new Date()

        let sum = 0, mult = 1, count = 0
        for (let i in cart) {
            sum = sum + (cart[i].price * cart[i].quantity)
            count += 1
        }


        if (order.paymentMethod == 'cashOnDelivery') {

            orders.status = 'placed'



            await db.get().collection(collection.mainCollection).updateOne(
                { _id: ObjectId(user._id) },
                { $push: { orders: orders } }
            )
            cartHelpers.emptyCart(user.id).then(() => {
                sellerHelpers.updateProductQuantity(cart, user._Id).then(() => {
                    resolve(orders.id)
                })
            })
            // console.log(true);
            // console.log(cart); 




        } else {
            orders.status = 'pending'
            await db.get().collection(collection.mainCollection).updateOne({ _id: ObjectId(user._id) },
                // {'orders._id':ObjectId(_id)}


                {
                    $push: { orders: orders }
                }
            )
            // console.log(true);
            // console.log(user._id);
            cartHelpers.emptyCart(user._id).then(() => {
                sellerHelpers.updateProductQuantity(cart, user._id).then(() => {
                    resolve(orders._id)
                })
            })
        }
    })
}