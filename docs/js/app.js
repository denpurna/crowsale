App = {
  web3Provider: null,
  contracts: {},
  tokenAddress: '0x4093Db3B3c52cb24A2C239820bc7960575af0401',
  account: '0x0',
  loading: false,
  tokenPrice: 100000000000000,
  tokensSold: 750000,
  tokensAvailable: 7500000,

  init: function() {
   // alert("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function() {
     if (window.ethereum) {
     	window.web3 = new Web3(ethereum); try {
    // Request account access if needed
 window.ethereum.enable().then(function() {
// User has allowed account access
 	// Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account; // $.getJSON('https://denpurna.github.io/crowsale/tokenAbi.json', function(abiToken){
// $('#accountAddress').html("Your Account: " + App.account);
// var tokenInst = new web3.eth.Contract(abiToken,App.tokenAddress); tokenInst.balanceOf(App.account).call().then(function (bal) { alert(bal); })
alert('Getting contract tokens balance.....'); 
var addr = (App.account);
alert("Address: " + addr);
var contractAddr = (App.tokenAddress); 
var tknAddress = (addr).substring(2);
var contractData = ('0x70a08231000000000000000000000000' + tknAddress); 
web3.eth.call({
	to: contractAddr,
 data: contractData
}, function(err, result) {
		if (result) { 		var tokens = web3.utils.toBN(result).toString(); 
var	blnc = web3.utils.fromWei(tokens, 'ether');
console.log('Tokens Owned: ' + blnc);
$('#dapp-blnc').html("balance: " + blnc + " / "+ App.account);
} 	else { 	
alert(err);
 	}
 	});

alert('masuk sini');
         })
         
         }
        });
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
    	$('#accountAddress').html("Please connect your wallet (recomended: metamask)");
    	}
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("https://denpurna.github.io/crowsale/CrowSale.json", function(crowSale) {
      App.contracts.CrowSale = TruffleContract(crowSale);
alert(App.contracts.CrowSale); App.contracts.CrowSale.setProvider(App.web3Provider);
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
alert('ini render');
    var loader  = $('.ngelod');
    var content = $('#content');

    loader.html('<div id="preloder"><div class="loader"></div></div>');
    content.hide();
  
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