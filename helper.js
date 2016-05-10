var Appbase = require('appbase-js');
var appbaseCredentials = require('./appbase_credentials.json')
var amazonCredentials = require('./amazon_credentials.json')

var util = require('util'),
  OperationHelper = require('apac').OperationHelper;


/*
    This is function which just gives details about products and call callback along with the details.
*/
module.exports.getProductDetails = function(productId, callback) {
  var opHelper = new OperationHelper({
    awsId: amazonCredentials.awsId,
    awsSecret: amazonCredentials.awsSecret,
    assocId: amazonCredentials.assocId
  });
  var data
  opHelper.execute('ItemLookup', {
    'IdType': 'ASIN',
    'ItemId': productId,
    'ResponseGroup': 'Medium'
  }).then(function(response) {
    var data = response.result.ItemLookupResponse.Items.Item;
    if (data != undefined)
      callback(data);
  }).catch(function(err) {
    console.error("Something went wrong! ", err);
  });
}

/*
  Function for indexing the product detail into appbase databse.
*/
module.exports.indexProduct = function(productId) {
  this.getProductDetails(productId, function(data) {
    var price = data.productBaseInfo.productAttributes.sellingPrice.amount;
    var name = data.productBaseInfo.productAttributes.productBrand
    var appbaseRef = new Appbase(appbaseCredentials);
    appbaseRef.index({
      type: appbaseCredentials.type,
      id: productId,
      body: {
        'price': price,
        'productId': productId,
        'name': name
      }
    }).on('data', function(response) {
      console.log(response);
    }).on('error', function(error) {
      console.log(error);
    });
  });
}
