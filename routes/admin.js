const express = require('express')
const router = express.Router()
const adminHelper = require('../helpers/admin-helpers')
const userHelpers = require('../helpers/user-helpers')



/* GET home page. */
router.get('/', (req, res, next) => {
  if (req.session.admin) {
    const { admin } = req.session
    res.render('admin/dashboard', { admin })
  } else {
    res.render('admin/login', { admin: true })
  }
})

router.post('/login', (req, res) => {
  adminHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = true
      res.render('admin/dashboard', { admin: true })
    } else {
      req.session.loginerror = true
      res.redirect('/admin')
    }
  })
})

router.get('/users', (req, res) => {
  if (req.session.admin) {
    adminHelper.getAllusers().then((users) => {
      res.render('admin/userManage', { admin: true, users })
    })
  } else {
    res.redirect('/admin')
  }
})

router.get('/vendors', (req, res) => {
  if (req.session.admin) {
    adminHelper.getAllvendors().then((vendors) => {
      res.render('admin/vendormanage', { admin: true, vendors })
    })
  } else {
    res.redirect('/admin')
  }
})

router.get('/block/:id', (req, res) => {
  const userid = req.params.id
  adminHelper.block(userid).then((response) => {
    res.redirect('/admin/users')
  })
})

router.get('/unblock/:id', (req, res) => {
  const userid = req.params.id
  adminHelper.unBlock(userid).then((response) => {
    res.redirect('/admin/users')
  })
})

router.get('/vblock/:id', (req, res) => {
  const vendorid = req.params.id
  adminHelper.blockVendor(vendorid).then((response) => {
    res.redirect('/admin/vendors')
  })
})

router.get('/vunblock/:id', (req, res) => {
  const vendorid = req.params.id
  adminHelper.unBlockVendor(vendorid).then((response) => {
    res.redirect('/admin/vendors')
  })
})
router.get('/viewProducts', (req, res) => {
  if (req.session.admin) {
    userHelpers.viewAllProducts().then((products) => {
      console.log(products);
      res.render('admin/viewproducts', { admin: true, products })
    })

  }
})
router.get('/logout', (req, res) => {
  req.session.admin = false
  res.redirect('/admin')
})

module.exports = router 
