module.exports = {
  test: function(test, site) {
    if ((test === "Limfociti" || test === "Monociti" || test === "Neutrofili")) {
      return false;
    } else {
      return true;
    }    
  }
};

