function addtowishlist(productId) {
    $.ajax({
        url: '/addtowishlist',
        data: {
            productId: productId
        },
        method: 'post',
        success: (response) => {
            if (response.added) {
                Swal.fire({
                    icon: 'success',
                    title: 'Item Added to Wishlist',
                    showConfirmButton: false,
                    timer: 1000
                }
                )
            } else if (response.exist) {
                Swal.fire({
                    icon: 'warning',
                    text: 'Already Exist in Your Wishlist',
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Login Please!',
                    footer: '<a href="/login">Want to Login?</a>'
                })
            }

        }
    })
}

function addtoCart(productId) {
    $.ajax({

        url: '/addtoCart',
        data: {
            productId: productId
        },
        method: 'post',
        success: (response) => {
            if (response.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Item Added to cart',
                    showConfirmButton: false,
                    timer: 1000
                }).then(() => {
                    $('#cart').load(location.href + " #cart");
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Login Please!',
                    footer: '<a href="/login">Want to Login?</a>'
                })
            }
        }
    })
}
function changeQuantity(cartId, count) {
    $.ajax({
        url: '/changeProductQuantity',
        data: {
            cart: cartId,
            count: count
        },
        method: 'post',
        success: (response) => {
            if (response) {
                //    window.location.reload()
                $('#cartTotal').load(location.href + " #cartTotal");
            }
        }
    })
}

function deleteproduct(cartId) {
    $.ajax({
        url: '/deleteproduct',
        data: {
            cart: cartId
        },
        method: 'post',
        success: (response) => {
            if (response) {
                $('#cartItem').load(location.href + " #cartItem");
                $('#cart').load(location.href + " #cart");
                $('#cartTotal').load(location.href + " #cartTotal");
            }
        }
    })
}
function cancelOrder(orderId, productId, cartId, productQuantity) {
    $.ajax({
        url: '/cancelOrder',
        data: {
            orderId: orderId,
            productId: productId,
            cartId: cartId,
            productQuantity: productQuantity
        },
        method: 'post',
        success: (response) => {
            if (response) {
                $('#productStatus').load(location.href + " #productStatus");

            }
        }
    })
}
function deletewishlistitem(wishlistId) {
    $.ajax({
        url: '/removeWishlist',
        data: {
            wishlist: wishlistId
        },
        method: 'post',
        success: (response) => {
            if (response) {
                Swal.fire(
                    'Removed SUCCESSFULLY!',
                    'Item Removed from Wishlist',
                    'success'
                ).then(() => {
                    // window.location.reload(wishlist)
                    $('#wishlist').load(location.href + " #wishlist");
                })
            }

        }
    })
}



