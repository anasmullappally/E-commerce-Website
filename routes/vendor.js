const express = require('express');
const vendorHelpers = require('../helpers/vendor-helpers');

const router = express.Router();

router.get('/', (req, res) => {
  if (req.session.logged) {
    const { vendor } = req.session;
    res.render('vendor/dashboard', { vendor });
  } else {
    res.render('vendor/login', { vendor: true });
  }
});

router.post('/login', (req, res) => {
  vendorHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.logged = true;
      req.session.vendor = response.vendor;

      if (req.session.vendor.isActive == true) {
        res.redirect('/vendor');
      } else {
        req.session.blockedd = true;
        res.redirect('vendor/login');
      }
    } else {
      req.session.loginError = true;
      res.redirect('/vendor');
    }
  });
});

router.get('/login', (req, res) => {
  if (req.session.logged) {
    if (req.session.vendor.isActive) {
      res.redirect('/vendor');
    } else {
      res.render('vendor/login', { blockedVendor: req.session.blockedd });
      req.session.blockedd = false;
    }
  } else {
    res.render('vendor/login', { loginError: req.session.loginError, vendor: true });
    req.session.loginError = false;
  }
});

router.get('/signup', (req, res) => {
  if (req.session.logged) {
    res.redirect('/vendor');
  } else {
    res.render('vendor/signup', { alreadyexistv: req.session.alreadyexistv, vendor: true });
  }
});

router.post('/signup', (req, res) => {
  vendorHelpers.doSignup(req.body).then(() => {
    res.render('vendor/login', { vendor: true });
  }).catch(() => {
    req.session.alreadyexistv = true;
    res.render('vendor/signup', { vendor: true });
  });
});

router.get('/dashboard', (req, res) => {
  if (req.session.logged) {
    res.render('vendor/dashboard', { vendor: true });
  } else {
    res.redirect('/vendor');
  }
});

router.get('/addproducts', (req, res) => {
  if (req.session.logged) {
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
  if (req.session.logged) {
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
  if (req.session.logged) {
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

router.get('/orders/ship/:id', (req, res) => {
  const cartId = req.params.id;
  vendorHelpers.changeShippingStatus(cartId).then(() => {
    res.redirect('/vendor/viewOrders');
  });
});
router.get('/orders/deliver/:id', (req, res) => {
  const cartId = req.params.id;
  vendorHelpers.changeDeliveredStatus(cartId).then(() => {
    res.redirect('/vendor/viewOrders');
  });
});

router.get('/logout', (req, res) => {
  req.session.logged = false;
  res.redirect('/vendor');
});

module.exports = router;
