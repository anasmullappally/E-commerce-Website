const { response } = require('express')
const express = require('express')
const session = require('express-session')
const async = require('hbs/lib/async')
const userHelpers = require('../helpers/user-helpers')
const cartHelpers = require('../helpers/cart-helpers')
const orderhelpers = require('../helpers/order--helpers')
const { redirect } = require('express/lib/response')
const router = express.Router()
let cartTotal, orderid

/* GET users listing. */
router.get('/', (req, res) => {
  if (req.session.user) {
    const { user } = req.session
    cartHelpers.getCartCount(user._id).then((count) => {
      req.session.user.cartCount = count
    })
    res.render('user/home', { user })
  } else {
    res.render('user/home')
  }
})

router.get('/login', (req, res) => {
  if (req.session.user) {
    if (req.session.user.isActive) {
      res.redirect('/')
    } else {
      res.render('user/login', { blockedUser: req.session.blocked })
      req.session.blocked = false
    }
  } else {
    res.render('user/login', { loginErr: req.session.loginErr })
    req.session.loginErr = false
  }
})

router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = true
      req.session.user = response.user
      if (req.session.user.isActive == true) {
        res.redirect('/')
      } else {
        req.session.blocked = true
        res.redirect('/login')
      }
    } else {
      req.session.loginErr = true
      res.redirect('/login')
    }
  })
})

router.get('/signup', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {
    res.render('user/signup', { alreadyexist: req.session.alreadyexist })
  }
})

router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    res.render('user/login')
  }).catch(() => {
    req.session.alreadyexist = true
    res.redirect('/signup')
  })
})

router.get('/shop', (req, res) => {
  if (req.session.user) {
    const { user } = req.session
    userHelpers.viewAllProducts().then((products) => {
      res.render('user/shop', { products, user })
    })
  } else {
    userHelpers.viewAllProducts().then((products) => {
      res.render('user/shop', { products })
    })
  }
})

router.get('/shop/:id', (req, res) => {
  if (req.session.user) {
    const { user } = req.session
    userHelpers.viewSingleProduct(req.params.id).then((product) => {
      res.render('user/singProductView', { product, user })
    })
  } else {
    userHelpers.viewSingleProduct(req.params.id).then((product) => {
      res.render('user/singProductView', { product })
    })
  }
})

router.get('/shop/:id/addtoCart', (req, res) => {
  if (req.session.user) {
    const { user } = req.session
    cartHelpers.addToCart(req.params.id, user._id).then((response) => {
      console.log(8547700);
      console.log(response);
      res.redirect(`/shop/${req.params.id}`)
    })
  } else {

  }
})

router.get('/cart', (req, res) => {
  if (req.session.user) {
    const { user } = req.session
    cartHelpers.viewCarts(user).then((cart) => {
      if (cart.length != 0) {
        cartHelpers.getTotal(user._id).then((cartAll) => {
          cartTotal = cartAll
          res.render('user/cart', { cart, cartTotal, user })
        })
      } else {
        res.render('user/cart', { user })
      }
    })
  } else {
    res.redirect('/')
  }
})
router.post('/changeProductQuantity', (req, res) => {
  cartHelpers.ChangeQuantity(req.body, req.session.user._id).then(() => {
    res.json({ status: true })
  })
})
router.post('/deleteproduct', (req, res) => {
  cartHelpers.deleteProduct(req.body).then((response) => {
    res.json({ status: true })
  })
})

router.get('/cart/checkout', (req, res) => {
  if (req.session.user) {
    const { user } = req.session
    res.render('user/checkout', { user, cartTotal })
  } else {
    redirect('/')
  }
})
router.post('/place-order', (req, res) => {
  let orderdetails = req.body
  user = req.session.user
  orderhelpers.placeOder(orderdetails, cartTotal, user).then((orderId) => {
    orderid = orderId
    if (orderdetails.paymentmethod == 'COD') {
      res.json({ codSuccess: true })
    } else {
      orderhelpers.generateRazorpay(orderId, cartTotal).then((response) => {

        res.json(response)
      })

    }
  })
})
router.get('/cart/orderplaced', (req, res) => {
  if (req.session.user) {
    orderhelpers.viewSingleOrder(orderid).then((orderDetails) => {
      console.log(orderDetails);
      res.render('user/orderDetails', { orderDetails: orderDetails.orders, user: req.session.user })
    })


  } else {
    redirect('/')
  }
})

router.get('/orders', (req, res) => {
  if (req.session.user) {
    let userId = req.session.user._id
    orderhelpers.viewOrders(userId).then((orders) => {
      console.log(orders);
      res.render('user/orderslist', { user: req.session.user, orders })
    })
  } else {
    res.redirect('/login')
  }
})

router.post('/varifyPayment', (req, res) => {
  orderhelpers.varifyPayment(req.body).then(() => {
    orderhelpers.changeOrderstatus(req.body['order[receipt]']).then(() => {
      res.json({ status: true })
    })
  }).catch((err) => {
    res.json({ status: 'payment failed' })
  })
})

router.get('/vieworder/:id', (req, res) => {
  let orderId = req.params.id
  orderhelpers.viewSingleOrder(orderId).then((orderDetails) => {
    res.render('user/orderDetails', { orderDetails: orderDetails.orders, user: req.session.user })
  })
})

router.get('/logout', (req, res) => {
  req.session.user = false
  res.redirect('/')
})


module.exports = router 
