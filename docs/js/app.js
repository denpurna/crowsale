App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 100000000000000,
  tokensSold: 0,
  tokensAvailable: 7500000,

  init: function() {
    alert("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function() {
    if (window.ethereum) { web3 = new Web3(window.ethereum); try { window.ethereum.enable().then(function() { 
    // User has allowed account access to DApp... 
    alert('sukses konak');
    }); } catch(e) { 
    // User has denied account access to DApp...
    alert('gagal konak');
    } } 
    // Legacy DApp Browsers 
    else if (window.web3) { web3 = new Web3(web3.currentProvider); } 
    // Non-DApp Browsers 
    else { alert('You have to install MetaMask !'); }
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("CrowSale.json", function(crowSale) {
      App.contracts.CrowSale = TruffleContract(crowSale);
      App.contracts.CrowSale.setProvider(App.web3Provider);
      App.contracts.CrowSale.deployed().then(function(crowSale) {
        alert("Crow Sale Address:", crowSale.address);
      });
    }).done(function() {
      $.getJSON("Crow.json", function(crow) {
        App.contracts.Crow = TruffleContract(crow);
        App.contracts.Crow.setProvider(App.web3Provider);
        App.contracts.Crow.deployed().then(function(crow) {
          console.log("Crow Address:", crow.address);
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
        console.log("event triggered", event);
        App.render();
      })
    })
  },

  render: function() {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader  = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#accountAddress').html("Your Account: " + account);
      }
    })

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
        loader.hide();
        content.show();
      })
    });
  },

  buyTokens: function() {
    $('#content').hide();
    $('#loader').show();
    var numberOfTokens = $('#numberOfTokens').val();
    App.contracts.CrowSale.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000 // Gas limit
      });
    }).then(function(result) {
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
    });
  }
}

$(function() {
  $(window).load(function() {
    App.init();
  })
});