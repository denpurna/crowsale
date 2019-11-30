App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 100000000000000,
  tokensSold: 750000,
  tokensAvailable: 7500000,
  tarara:'$.getJSON("https://denpurna.github.io/crowsale/CrowSale.json")',
  init: function() {
    $('.jsonnya').html(tarara);
    return App.initWeb3();
  },

  initWeb3: function() {
     if (window.ethereum) {
     	window.web3 = new Web3(ethereum); try {
    // Request account access if needed
 window.ethereum.enable().then(function() {
// User has allowed account access
    
    
      });
    } catch(e) {
// User has denied account access to
    alert('gagal konak');
    }
   }
    // Legacy DApp Browsers 
    else if (window.web3) {
    	window.web3 = new Web3(web3.currentProvider); 
    alert('sukses konak');
    }
    // Non-DApp Browsers 
    else {
    alert('You have to install MetaMask !'); }
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("https://denpurna.github.io/crowsale/CrowSale.json", function(crowSale) {
      App.contracts.CrowSale = TruffleContract(crowSale);
      App.contracts.CrowSale.setProvider(App.web3Provider);
      App.contracts.CrowSale.deployed().then(function(crowSale) {
        alert("Crow Sale Address:", crowSale.address);
      });
    }).done(function() {
      $.getJSON("https://denpurna.github.io/crowsale/Crow.json", function(crow) {
        App.contracts.Crow = TruffleContract(crow);
        App.contracts.Crow.setProvider(App.web3Provider);
        App.contracts.Crow.deployed().then(function(crow) {
          alert("Crow Address:", crow.address);
        });

        App.listenForEvents();
        return App.render();
      });
    })
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.CrowSale.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        alert("event triggered", event);
        App.render();
      })
    })
  },

  render: function() {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader  = $('.ngelod').html('<div id="preloder"><div class="loader"></div></div>');
    var content = $('#content');

    loader.show();
    content.hide();

 	// Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#accountAddress').html("Your Account: " + account);
        }
        else{
      	$('#accountAddress').html("Please connect your wallet (recomended: metamask)");
            }
        });
    
    // Load token sale contract
    App.contracts.CrowSale.deployed().then(function(instance) {
      crowSaleInstance = instance;
      return crowSaleInstance();
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
      return crowSaleInstance.tokensSold();
    }).then(function(tokensSold) {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);

      var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');

      // Load token contract
      App.contracts.Crow.deployed().then(function(instance) {
        crowInstance = instance;
        return crowInstance.balanceOf(App.account);
      }).then(function(balance) {
        $('.dapp-balance').html(balance.toNumber());
        App.loading = false;
        loader.html('');
      })
    });
  },

  buyTokens: function() {
    $('.ngelod').html('<div id="preloder"><div class="loader"></div></div>');
    var numberOfTokens = $('#numberOfTokens').val();
    App.contracts.CrowSale.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000 // Gas limit
      });
    }).then(function(result) {
      alert("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
   //   $('.ngelod').fadeOut();
    });
  }
}

$(function() {
  $(window).load(function() {
    App.init();
  })
});