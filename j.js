filterProducts: (req, res) => {

    // console.log(req.body.sort);

    let a = req.body
    let price = parseInt(a.price)
    let filter = []
    for (let i of a.brandName) {
      filter.push({ 'products.brandName': i })
    }
    userhelpers.filterProducts(filter, gender, price).then((response) => {
      // console.log(response);
      filterResult = response

      // console.log(filterResult);
      if (req.body.sort == "Sort") {
        res.json({ status: true })
      }
      if (req.body.sort == 'rating') {
        filterResult.sort((a, b) => {
          return b.products.rating - a.products.rating
        })
        res.json({ status: true })
      }
      if (req.body.sort == 'lh') {
        filterResult.sort((a, b) => {
          return a.products.price - b.products.price
        })
        res.json({ status: true })
      }
      if (req.body.sort == 'hl') {
        filterResult.sort((a, b) => {
          return b.products.price - a.products.price
        })
        res.json({ status: true })
      }
    })



  }