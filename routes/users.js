const express = require('express');
const { redirect } = require('express/lib/response');
const userHelpers = require('../helpers/user-helpers');
const cartHelpers = require('../helpers/cart-helpers');
const orderhelpers = require('../helpers/order-helpers');

const router = express.Router();

let cartTotal; let orderid; let device; let
  filteredProduct; let searchkey

/* GET users listing. */
router.get('/', (req, res) => {
  if (req.session.user) {
    const { user } = req.session;

    cartHelpers.getCartCount(user._id).then((count) => {
      req.session.user.cartCount = count;
    });
    res.render('user/home', { user });
  } else {
    res.render('user/home');
  }
});

// router.get ('/shop/:device',(req,res)=>{
//   // console.log(req.params.device);
//   let device=req.params.device
//   userHelpers.getBrands(device).then((devices)=>{
//     res.redirect('/shop')
//   })
// })

router.get('/login', (req, res) => {
  if (req.session.user) {
    if (req.session.user.isActive) {
      res.redirect('/');
    } else {
      res.render('user/login', { blockedUser: req.session.blocked });
      req.session.blocked = false;
    }
  } else {
    res.render('user/login', { loginErr: req.session.loginErr });
    req.session.loginErr = false;
  }
});

router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = true;
      req.session.user = response.user;
      if (req.session.user.isActive == true) {
        res.redirect('/');
      } else {
        req.session.blocked = true;
        res.redirect('/login');
      }
    } else {
      req.session.loginErr = true;
      res.redirect('/login');
    }
  });
});

router.get('/signup', (req, res) => {
  if (req.session.user) {
    res.redirect('/');
  } else {
    res.render('user/signup', { alreadyexist: req.session.alreadyexist });
  }
});

router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then(() => {
    res.render('user/login');
  }).catch(() => {
    req.session.alreadyexist = true;
    res.redirect('/signup');
  });
});
router.get('/shop', (req, res) => {
  if (req.session.user) {
    user = req.session.user;
    userHelpers.getAllBrands(device).then((brands) => {
      res.render('user/shop', { products: filteredProduct, brands, device, user });
    });
  } else {
    userHelpers.getAllBrands(device).then((brands) => {
      res.render('user/shop', { products: filteredProduct, brands, device });
    });
  }
});
router.get('/shop/:device', (req, res) => {
  device = req.params.device;
  // if (req.session.user) {
  // const { user } = req.session;
  userHelpers.viewAllProducts(device).then((response) => {
    filteredProduct = response;
    res.redirect('/shop');
  });
  // } else {
  //   userHelpers.viewAllProducts(device).then((response) => {
  //     // userHelpers.getAllBrands(device).then((brands) => {
  //       filteredProduct = response
  //       console.log(filteredProduct);
  //       // console.log(584787);
  //       // res.render('user/shop', { products: filteredProduct, brands, device });
  //     // })
  //       res.redirect('/shop')
  //   });
  // }
});

router.get('/shop/view/:id', (req, res) => {
  if (req.session.user) {
    const { user } = req.session;
    userHelpers.viewSingleProduct(req.params.id).then((product) => {
      res.render('user/singProductView', { product, user });
    });
  } else {
    userHelpers.viewSingleProduct(req.params.id).then((product) => {
      res.render('user/singProductView', { product });
    });
  }
});

router.post('/addtowishlist', (req, res) => {
  if (req.session.user) {
    const { user } = req.session;
    userHelpers.addTowishlist(req.body, user._id).then((status) => {
      if (status) {
        res.json({ added: true });
      } else {
        res.json({ exist: true });
      }
    });
  } else {
    res.json({ login: true });
  }
});

router.get('/wishlist', (req, res) => {
  if (req.session.user) {
    const { user } = req.session;
    userHelpers.viewWishlist(user).then((wishlist) => {
      res.render('user/wishlist', { user, wishlist });
    });
  } else {

  }
});

router.post('/removeWishlist', (req, res) => {
  if (req.session.user) {
    userHelpers.deleteProductWishlist(req.body).then(() => {
      res.json({ status: true });
    });
  }
});

// router.get('/addtocart/:id', (req, res) => {
//   if (req.session.user) {
//     const { user } = req.session;
//     cartHelpers.addToCart(req.params.id, user._id).then(() => {
//       cartHelpers.getCartCount(user._id).then((count) => {
//         req.session.user.cartCount = count;
//         res.redirect('/cart');
//       });
//     });
//   } else {
//     res.redirect('/login');
//   }
// });

router.get('/shop/:id/addtoCart', (req, res) => {
  if (req.session.user) {
    const { user } = req.session;
    cartHelpers.addToCart(req.params.id, user._id).then(() => {
      cartHelpers.getCartCount(user._id).then((count) => {
        req.session.user.cartCount = count;
        res.redirect(`/shop/view/${req.params.id}`);
      });
    });
  } else {
    res.redirect('/login');
  }
});

router.get('/cart', (req, res) => {
  if (req.session.user) {
    const { user } = req.session;
    cartHelpers.viewCarts(user).then((cart) => {
      if (cart.length != 0) {
        cartHelpers.getTotal(user._id).then((cartAll) => {
          cartTotal = cartAll;
          res.render('user/cart', { cart, cartTotal, user });
        });
      } else {
        res.render('user/cart', { user });
      }
    });
  } else {
    res.redirect('/');
  }
});
router.post('/changeProductQuantity', (req, res) => {
  cartHelpers.ChangeQuantity(req.body, req.session.user._id).then(() => {
    res.json({ status: true });
  });
});
router.post('/deleteproduct', (req, res) => {
  if (req.session.user) {
    const { user } = req.session;
    cartHelpers.deleteProduct(req.body).then((response) => {
      cartHelpers.getCartCount(user._id).then((count) => {
        req.session.user.cartCount = count;
        res.json({ status: true });
      });
    });
  }
});

router.get('/cart/checkout', (req, res) => {
  if (req.session.user) {
    const { user } = req.session;
    userHelpers.getAddress(user._id).then((userdetails) => {
      res.render('user/checkout', { user, cartTotal, userdetails });
    });
  } else {
    redirect('/');
  }
});

router.post('/place-order', (req, res) => {
  const orderdetails = req.body;
  const { user } = req.session;
  orderhelpers.placeOder(orderdetails, cartTotal, user).then((orderId) => {
    orderid = orderId;
    console.log(orderid);
    console.log(true);
    console.log(orderId);
    if (orderdetails.paymentmethod == 'COD') {
      res.json({ codSuccess: true });
    } else {
      orderhelpers.generateRazorpay(orderId, cartTotal).then((response) => {
        res.json(response);
      });
    }
  });
});

router.get('/cart/orderplaced', (req, res) => {
  if (req.session.user) {
    orderhelpers.viewSingleOrder(orderid).then((orderDetails) => {
      res.render('user/orderDetails', { orderDetails: orderDetails.orders, user: req.session.user });
    });
  } else {
    redirect('/');
  }
});

router.get('/orders', (req, res) => {
  if (req.session.user) {
    const userId = req.session.user._id;
    orderhelpers.viewOrders(userId).then((orders) => {
      orders.sort((a, b) => a.orders.date1 - b.orders.date1);
      res.render('user/orderslist', { user: req.session.user, orders });
    });
  } else {
    res.redirect('/login');
  }
});

router.post('/varifyPayment', (req, res) => {
  orderhelpers.varifyPayment(req.body).then(() => {
    orderhelpers.changeOrderstatus(req.body['order[receipt]']).then(() => {
      res.json({ status: true });
    });
  }).catch(() => {
    res.json({ status: 'payment failed' });
  });
});

router.get('/vieworder/:id', (req, res) => {
  const orderId = req.params.id;
  orderhelpers.viewSingleOrder(orderId).then((orderDetails) => {
    console.log(orderDetails)

    res.render('user/orderDetails', { orderDetails: orderDetails.orders, user: req.session.user });
  });
});

router.get('/profile', (req, res) => {
  if (req.session.user) {
    const { user } = req.session;
    userHelpers.profileDetails(user._id).then((profile) => {
      res.render('user/profile', { profile, user });
    });
  } else {
    res.redirect('/login');
  }
});

router.get('/contact', (req, res) => {
  if (req.session.user) {
    const { user } = req.session;
    res.render('user/contact', { user });
  } else {
    res.render('user/contact');
  }
});

router.get('/about', (req, res) => {
  if (req.session.user) {
    const { user } = req.session;
    res.render('user/about', { user });
  } else {
    res.render('user/about');
  }
});

router.post('/updateUser', (req, res) => {
  const data = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phoneNum: req.body.phoneNum,
  };
  const userId = req.session.user._id;
  userHelpers.updateProfile(data, userId).then(() => {
    res.json({ status: true });
  });
});

router.post('/products/filter', (req, res) => {
  const deatil = req.body;
  const price = parseInt(deatil.price);
  const filter = [];
  for (const i of deatil.brandName) {
    filter.push({ 'products.brand': i });
  }
  userHelpers.filterProducts(filter, device, price).then((response) => {
    filteredProduct = response;
    // res.json({ status: true })
    if (req.body.sort == 'Sort') {
      res.json({ status: true });
    }
    if (req.body.sort == 'lh') {
      filteredProduct.sort((a, b) => a.products.price - b.products.price);
      res.json({ status: true });
    }
    if (req.body.sort == 'hl') {
      filteredProduct.sort((a, b) => b.products.price - a.products.price);
      res.json({ status: true });
    }
  });
});

router.post('/cancelOrder', (req, res) => {
  const data = req.body;
  orderhelpers.cancelorder(data).then((response) => {

    res.json(response)
    // orderhelpers.changeProductQuntity(data).then(() => {
    //     console.log(true);
    // })
  });
});
router.get('/searchResult', (req, res) => {
  if (req.session.user) {
    let user = req.session.user
    userHelpers.getAllBrands1().then((brands) => {
      res.render('user/searchResult', { products: filteredProduct, brands, device, user });
    })
  } else {
    userHelpers.getAllBrands1().then((brands) => {
      res.render('user/searchResult', { products: filteredProduct, brands, device });
    })
  }

})
router.post('/searchproducts', (req, res) => {
  if (req.body.search) {
    searchkey = req.body.search
    userHelpers.search(searchkey).then((searchResult) => {
      filteredProduct = searchResult
      res.redirect('/searchResult')
    })
  } else {
    const deatil = req.body;
    const price = parseInt(deatil.price);
    const filter = [];
    for (const i of deatil.brandName) {
      filter.push({ 'products.brand': i });
    }
    userHelpers.filterProducts(filter, gender, price, searchkey).then((response) => {
      filteredProduct = response
      if (req.body.sort == 'Sort') {
        res.json({ status: true });
      }
      if (req.body.sort == 'lh') {
        filteredProduct.sort((a, b) => a.products.price - b.products.price);
        res.json({ status: true });
      }
      if (req.body.sort == 'hl') {
        filteredProduct.sort((a, b) => b.products.price - a.products.price);
        res.json({ status: true });
      }
    })
  }
});

router.post('/review/:id', (req, res) => {
  // console.log(req.params.id);
  // console.log(req.body);
});
router.post('/addtoCart', (req, res) => {
  if (req.session.user) {
    let productId = req.body.productId
    const { user } = req.session;
    cartHelpers.addToCart(productId, user._id).then(() => {
      cartHelpers.getCartCount(user._id).then((count) => {
        req.session.user.cartCount = count;
        res.json({ status: true })
      });
    });
  } else {
    res.json({ status: false })
  }
})
router.get('/logout', (req, res) => {
  req.session.user = false;
  res.redirect('/');
});

module.exports = router;
