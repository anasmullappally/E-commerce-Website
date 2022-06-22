const express = require('express');
const { revenue } = require('../helpers/vendor-helpers');
const vendorHelpers = require('../helpers/vendor-helpers');

const router = express.Router();

router.get('/', (req, res) => {
  if (req.session.vendor) {
    res.redirect('/vendor/dashboard')
  } else {
    res.render('vendor/login', { login: true });
  }
});
router.get('/dashboard', async (req, res) => {
  if (req.session.vendor) {
    const { vendor } = req.session;
    await vendorHelpers.revenue(vendor._id).then((income)  => {
       vendorHelpers.VendorProfileDetails(vendor._id).then((vendordetails) => {
        income.balance = vendordetails.totalErnings - vendordetails.claimed
        res.render('vendor/dashboard', { vendor, income });
      })
    })
  } else {
    res.render('vendor/login', { login: true });
  }
})

router.post('/login', (req, res) => {
  vendorHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.vendor = true;
      req.session.vendor = response.vendor;

      if (req.session.vendor.isActive == true) {
        res.redirect('/vendor');
      } else {
        req.session.blockedd = true;
        res.redirect('/vendor/login',);
      }
    } else {
      req.session.loginError = true;
      res.redirect('/vendor/login');
    }
  });
});

router.get('/login', (req, res) => {
  if (req.session.vendor) {
    if (req.session.vendor.isActive) {
      res.redirect('/vendor');
    } else {
      res.render('vendor/login', { blockedVendor: req.session.blockedd, login: true });
      req.session.blockedd = false;
    }
  } else {
    res.render('vendor/login', { loginError: req.session.loginError, login: true });
    req.session.loginError = false;
  }
});

router.get('/signup', (req, res) => {
  if (req.session.vendor) {
    res.redirect('/vendor');
  } else {
    res.render('vendor/signup', { alreadyexistv: req.session.alreadyexistv, login: true });
    req.session.alreadyexistv = false
  }
});

router.post('/signup', (req, res) => {
  vendorHelpers.doSignup(req.body).then(() => {
    res.redirect('/vendor')
  }).catch(() => {
    req.session.alreadyexistv = true;
    res.redirect('/vendor/signup');

  });
});

// router.get('/dashboard', (req, res) => {
//   if (req.session.vendor) {
//     res.render('vendor/dashboard', { vendor: true });
//   } else {
//     res.redirect('/vendor');
//   }
// });
router.post('/redeemRequest', (req, res) => {
  if (req.session.vendor) {
    let vendor = req.session.vendor
    let balance = req.body.balance
    console.log(vendor);
    vendorHelpers.redeemRequest(vendor._id, vendor.firstName, balance).then(() => {
      res.json({ requested: true })
    })
  } else {
    res.redirect('/vendor')
  }
})

router.get('/addproducts', (req, res) => {
  if (req.session.vendor) {
    res.render('vendor/addProducts', { vendor: true });
  } else {
    res.redirect('/vendor');
  }
});

router.post('/addproduct', (req, res) => {
  vendorHelpers.addProduct(req.body, req.session.vendor._id).then((id) => {
    if (req.files) {
      if (req.files.image1) {
        addImage(req.files.image1, 1, id);
      }
      if (req.files.image2) {
        addImage(req.files.image2, 2, id);
      }
      if (req.files.image3) {
        addImage(req.files.image3, 3, id);
      }
      if (req.files.image4) {
        addImage(req.files.image4, 4, id);
      }
    }
    res.render('vendor/product-added', { vendor: req.session.vendor });
  });
});

router.get('/viewproducts', (req, res) => {
  if (req.session.vendor) {
    const { vendor } = req.session;
    vendorHelpers.viewProducts(vendor).then((products) => {
      res.render('vendor/viewproducts', { vendor, products });
    });
  } else {
    res.redirect('/vendor');
  }
});

function addImage(image, n, id) {
  image.mv(`public/images/productsImages/${id}(${n})` + '.jpg');
}
router.get('/viewProduct/:id', (req, res) => {
  if (req.session.vendor) {
    const { vendor } = req.session;
    vendorHelpers.getProductDetails(req.params.id).then((product) => {
      res.render('vendor/viewproduct', { vendor, product });
    });
  } else {
    res.redirect('/vendor');
  }
});
router.get('/deleteProduct/:id', (req, res) => {
  vendorHelpers.deleteProduct(req.params.id).then(() => {
    res.redirect('/vendor/viewproducts');
  });
});

router.get('/editProduct/:id', (req, res) => {
  vendorHelpers.getProductDetails(req.params.id).then((product) => {
    res.render('vendor/editproduct', { vendor: true, product });
  });
});

router.post('/editProduct/:id', (req, res) => {
  const productId = req.params.id;
  const productInfo = req.body;

  vendorHelpers.updateProduct(productId, productInfo).then(() => {
    if (req.files) {
      if (req.files.image1) {
        addImage(req.files.image1, 1, productId);
      }
      if (req.files.image2) {
        addImage(req.files.image2, 2, productId);
      }
      if (req.files.image3) {
        addImage(req.files.image3, 3, productId);
      }
      if (req.files.image4) {
        addImage(req.files.image4, 4, productId);
      }
    }
    res.render('vendor/updateSuccess', { vendor: true });
  });
});

router.get('/profile', (req, res) => {
  if (req.session.vendor) {
    const { vendor } = req.session;
    vendorHelpers.VendorProfileDetails(vendor._id).then((profile) => {
      res.render('vendor/profile', { profile, vendor });
    });
  } else {
    res.redirect('/vendor');
  }
});
router.get('/viewOrders', (req, res) => {
  if (req.session.vendor) {
    const { vendor } = req.session;
    vendorHelpers.viewOrders(vendor._id).then((orders) => {
      res.render('vendor/orderslist', { orders, vendor });
    });
  } else {
    res.redirect('/vendor');
  }
});

router.post('/updateVendor', (req, res) => {
  if (req.session.vendor) {
    const { vendor } = req.session;
    const vendorData = req.body;
    vendorHelpers.updateVendorProfile(vendorData, vendor._id).then(() => {
      res.json({ status: true });
    });
  }
});

router.post('/shipProduct', (req, res) => {
  let cartId = req.body.cartId
  vendorHelpers.changeShippingStatus(cartId).then(() => {
    res.json({ shipped: true })
  });
})
router.post('/deliverProduct', (req, res) => {
  const cartId = req.body.cartId;
  vendorHelpers.changeDeliveredStatus(cartId).then(() => {
    res.json({ deliver: true })
  });
});

router.get('/amount/redeem/:id', (req, res) => {
  if (req.session.vendor) {
    let vendor = req.session.vendor
    let balance = req.params.id
    vendorHelpers.redeemRequest(vendor._id, vendor.firstName, balance).then(() => {
      res.redirect('/vendor/dashboard')
    })
  } else {
    res.redirect('/vendor')
  }

})

router.get('/logout', (req, res) => {
  req.session.vendor = false;
  res.redirect('/vendor');
});

module.exports = router;
