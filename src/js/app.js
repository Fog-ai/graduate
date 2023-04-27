App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
   
    return await App.initWeb3();
  },

  initWeb3: async function() {
    const ganacheHttpUrl = 'http://localhost:8545';
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);
    App.initblock();
    App.initTx();
    return App.initContract();
  },

  initblock: function() {
    web3.eth.getBlockNumber().then((blockNumber) => {
      const latestBlocksTable = document.getElementById('latestBlocks');
      latestBlocksTable.innerHTML = '';

      for (let i = 0; i < 3; i++) {
          web3.eth.getBlock(blockNumber - i).then((block) => {
              const row = latestBlocksTable.insertRow(0);
              const blockNumberCell = row.insertCell(0);
              const hashCell = row.insertCell(1);

              blockNumberCell.innerText = block.number;
              hashCell.innerText = block.hash;
          });
      }
  });
  },

  initTx: function() {
    const latestTxsTable = document.getElementById('latestTxs');
    latestTxsTable.innerHTML = '';

    web3.eth.getBlockNumber().then((latestBlockNumber) => {
        for (let i = 0; i < 3; i++) {
            const blockNumber = latestBlockNumber - i;
            web3.eth.getBlock(blockNumber).then((block) => {
                const txs = block.transactions.slice(0, 10);
                const promises = txs.map((txHash) => web3.eth.getTransaction(txHash));
                Promise.all(promises).then((txs) => {
                    txs.forEach((tx) => {
                        const row = latestTxsTable.insertRow(0);
                        const blockNumberCell = row.insertCell(0);
                        const hashCell = row.insertCell(1);

                        blockNumberCell.innerText = tx.blockNumber;
                        hashCell.innerText = tx.hash;
                    });
                });
            });
        }
    });
},


  initContract: function() {
    $.getJSON('Test.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var TestArtifact = data;
      App.contracts.Test = TruffleContract(TestArtifact);
    
      // Set the provider for our contract
      App.contracts.Test.setProvider(App.web3Provider);
   
      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });
    
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn1', App.handleAdopt);
    $(document).on('click', '.btn2', App.handleVerify);
    $(document).on('click', '.btn3', App.handleVerifytx);
  },

  markAdopted: function() {
    document.getElementById("result").style.display = "none";
    var adoptionInstance;

    App.contracts.Test.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAllStrings.call();
    }).then(function(adopters) {
      var strs= new Array();
      strs = adopters.split("|");
      if(strs.every(element => element === '')) {
        console.log("nothing!");
      }
      else {
        for(let i=0; i < strs.length; i++) {
          console.log("[" + i + "]" + strs[i]);
        }
      }     
    }).catch(function(err) {
      console.log(err.message);
    });

  },

  handleVerifytx: function(event) {
    event.preventDefault();

    var adoptionInstance;
    var verifiedText = document.getElementById("verified2").value;
    document.getElementById("verified2").value='';

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
  
    var account = accounts[0];
    App.contracts.Test.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.printTx(parseInt(verifiedText), {from: account});
    }).then(function(result) {
      console.log(result);
      if(result[0]=='') {
        document.getElementById("filename").innerText ="";

        document.getElementById("timestamp").innerHTML = "";
        document.getElementById("blocknumber").innerHTML = "";
        document.getElementById("has value").innerHTML = "";
        alert("索引越界！");
      }
      else {
        const timestampElement = document.getElementById("timestamp");
        let blocknumber = result[3].c[0];
        let hashvalue = result[0];
        const blocknumberElement = document.getElementById("blocknumber");
        const hashvalueElement = document.getElementById("has value");
        blocknumberElement.innerText = blocknumber;
        hashvalueElement.innerText = hashvalue;
        document.getElementById("filename").innerText = result[1];
        document.getElementById("timestamp").innerHTML = `${result[2]}`;
        document.getElementById("blocknumber").innerHTML = blocknumber;
        document.getElementById("has value").innerHTML = hashvalue;
      }
    }).catch(function(err) {
      console.log(err.message);
      
  });
    });
  },

  handleVerify: function(event) {
    event.preventDefault();

    var adoptionInstance;
    var verifiedText = document.getElementById("verified").value;
    document.getElementById("verified").value='';

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
  
    var account = accounts[0];
    App.contracts.Test.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.compare(verifiedText, {from: account});
    }).then(function(result) {
      if(result) {
        console.log("你已经上传过此文件");
      }
      else {
        console.log("你还没有上传过此文件");
      }
    }).catch(function(err) {
      console.log(err.message);
  });
    })
    
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var adoptionInstance;
    var hashText;
    hashText = document.getElementById('result').innerText;

  web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

  var account = accounts[0];

  App.contracts.Test.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.addString(hashText, {from: account});
    }).then(function(result) {
      if(result.logs[0].args.returnValue) {
        const timestamp = Date.now();

        const date = new Date(timestamp);
        const dateString = date.toLocaleString();

        let file = document.getElementById("file").files[0];
        
        const timestampElement = document.getElementById("timestamp");
        timestampElement.innerText = `${dateString}`;
        let blocknumber = result.receipt.blockNumber;
        let hashvalue = result.tx;
        const blocknumberElement = document.getElementById("blocknumber");
        const hashvalueElement = document.getElementById("has value");
        blocknumberElement.innerText = blocknumber;
        hashvalueElement.innerText = hashvalue;
        document.getElementById("filename").innerText = file.name;
        adoptionInstance.addTransaction(hashvalue,file.name,dateString, blocknumber, {from: account});
        document.getElementById('upload').innerText = "暂时不可上传";
        document.getElementById('upload').disabled = true;
      }
      else {
        alert("这个文件已经上传过了");
        document.getElementById('upload').innerText = "暂时不可上传";
        document.getElementById('upload').disabled = true;
        console.log("这个文件已经上传过了");
      }
    }).catch(function(err) {
      console.log(err.message);
  });
});

  }

};

$(function() {
  document.getElementById("timestamp").style.fontWeight = "bold";
  document.getElementById("timestamp").style.color = "red";
  document.getElementById("has value").style.fontWeight = "bold";
  document.getElementById("has value").style.color = "red";
  document.getElementById("blocknumber").style.fontSize = "15px";
  document.getElementById("blocknumber").style.color = "red";
  document.getElementById("blocknumber").style.fontWeight = "bold";
  
  $(window).load(function() {
    App.init();
  });
});

