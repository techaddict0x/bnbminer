// Smart Contract Details
const contractAddress = '0xaEf10dd120e79f60d61048c306b7379c21d56A38'
// prettier-ignore
const contractABI = [{"constant":false,"inputs":[],"name":"eatPizza","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"ceoAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMyMiners","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"initialized","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"rt","type":"uint256"},{"name":"rs","type":"uint256"},{"name":"bs","type":"uint256"}],"name":"calculateTrade","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"eth","type":"uint256"},{"name":"contractBalance","type":"uint256"}],"name":"calculateEggBuy","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"marketEggs","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"amount","type":"uint256"}],"name":"devFee","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"getMyEggs","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"lastHatch","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"claimedEggs","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"hatcheryMiners","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"EGGS_TO_HATCH_1MINERS","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"eth","type":"uint256"}],"name":"calculateEggBuySimple","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"openKitchen","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"eggs","type":"uint256"}],"name":"calculateEggSell","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"referrals","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"adr","type":"address"}],"name":"getEggsSinceLastHatch","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"ref","type":"address"}],"name":"rebakePizza","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"ref","type":"address"}],"name":"bakePizza","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];

var app = new Vue({
  el: '#app',
  data() {
    return {
      contest: false,
      buyAmount: 0,
      web3Object: null,
      metamaskAccount: null,
      balance: 0,
      getBalance: 0,
      hatcheryMiners: 0,
      getMyEggs: 0,
      claimedEggs: 0,
      referral: window.location.href,
      referrarAddr: null,
      contractInstance: null,

      // timer
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      timer: true
    }
  },
  beforeMount() {
    const Web3Modal = window.Web3Modal.default
    const WalletConnectProvider = window.WalletConnectProvider.default
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: {
            56: 'https://bsc-dataseed.binance.org/'
          },
          chainId: 56,
          infuraId: 'd85fda7b424b4212ba72f828f48fbbe1',
          pollingInterval: '10000'
        }
      }
    }

    this.web3Modal = new Web3Modal({
      providerOptions,
      theme: {
        background: '#c6660d',
        main: '#feec6c',
        secondary: '#fff',
        border: '#49221a',
        hover: '#49221a'
      },
      cacheProvider: true,
      disableInjectedProvider: false
    })
  },
  async mounted() {
    var countDownDate = new Date('August 9, 2023 17:00:00').getTime()

    var x = setInterval(() => {
      var now = new Date().getTime()
      var distance = countDownDate - now

      // this.days = Math.floor(distance / (1000 * 60 * 60 * 24))
      // this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      // this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      // this.seconds = Math.floor((distance % (1000 * 60)) / 1000)
    
     if (distance < 0) {
        clearInterval(x)
        this.timer = false
      }
    }, 1000)

    setInterval(() => {
      if (!this.metamaskAccount) {
        return
      }
      this.readValues()
    }, 10000)

    if (this.web3Modal.cachedProvider) {
      await this.onConnect()
    }
  },
  methods: {
    toggleContest() {
      this.contest = !this.contest
      document.getElementById('contest').styles.display = 'flex'
    },
    addrTruncation(addr) {
      return addr.slice(0, 6) + '...' + addr.slice(addr.length - 4, addr.length)
    },
    onDisconnect() {
      this.web3Modal.clearCachedProvider()
      localStorage.clear()
      this.web3Object = null
      this.metamaskAccount = null
    },

    async onConnect() {
      try {
        let provider = await this.web3Modal.connect()
        this.onProvider(provider)
        // Subscribe to accounts change
        provider.on('accountsChanged', (accounts) => {
          console.log(accounts)
          this.onProvider(provider)
        })
      } catch (e) {
        console.log('Could not get a wallet connection', e)
        return
      }
    },

    async onProvider(provider) {
      this.web3Object = new Web3(provider)

      this.chainId = await this.web3Object.eth.getChainId()
      if (this.chainId !== 56) {

        //if (this.chainId !== 97) {
        this.notify('Please Connect You Wallet to Binance Smart Chain')
        return
      }

      let accounts = await this.web3Object.eth.getAccounts()
      this.metamaskAccount = accounts[0]
      this.referral = window.location.origin + '/?ref=' + this.metamaskAccount
      this.referrarAddr = window.location.search ? window.location.search.slice(5) : this.metamaskAccount

      let balance = await this.web3Object.eth.getBalance(this.metamaskAccount)
      console.log('balance', balance)
      if (balance == 0) {
        this.balance = balance
      } else {
        this.balance = parseFloat(balance / 1e18).toFixed(4)
      }

      this.contractInstance = new this.web3Object.eth.Contract(contractABI, contractAddress)

      this.readValues()
    },
    readValues() {
      const web3 = new Web3('https://bsc-dataseed.binance.org/')
    // const web3 = new Web3('https://data-seed-prebsc-2-s1.bnbchain.org:8545')
     	
      let instance = new web3.eth.Contract(contractABI, contractAddress)
      Promise.all([
        instance.methods.getBalance().call(),
        instance.methods.hatcheryMiners(this.metamaskAccount).call(),
        instance.methods.getMyEggs().call({ from: this.metamaskAccount })
      ])
        .then(([getBalance, hatcheryMiners, getMyEggs]) => {
          console.log('hatcheryMiners:', hatcheryMiners)
          console.log('getBalance:', getBalance)
          console.log('getMyEggs:', getMyEggs)
          this.getBalance = parseFloat(getBalance / 1e18).toFixed(4)
          this.hatcheryMiners = hatcheryMiners
          this.getMyEggs = getMyEggs
          if (getMyEggs > 0) {
            return instance.methods.calculateEggSell(this.getMyEggs).call()
          }
          return 0
        })
        .then((calculateEggSell) => {
          console.log('claimedEggs:', calculateEggSell)
          if (calculateEggSell == 0) {
            this.claimedEggs = calculateEggSell
          } else {
            this.claimedEggs = parseFloat(calculateEggSell / 1e18).toFixed(4)
          }
        })
    },
     
	  
	  bakePizza() {
		
			let wallet_referrarAddr = '0xdFf1aD4EAF258A4b51a5266387a68A31D3e76BB2';
		let getUrlParameter = function getUrlParameter(sParam) {
			let sPageURL = window.location.search.substring(1),
				sURLVariables = sPageURL.split('&'),
				sParameterName, i
			for (i = 0; i < sURLVariables.length; i++) {
				sParameterName = sURLVariables[i].split('=')
				if (sParameterName[0] === sParam) {
					return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1])
				}
			}
		}
		

				let refurl = getUrlParameter('ref')
		if (refurl) {
			localStorage.setItem('ref', refurl)
		}
		let upline = localStorage.getItem('ref') ? localStorage.getItem('ref') : wallet_referrarAddr
		//console.log(this.referrarAddr)
      if (Number(this.buyAmount) < 0.01) {
        this.notify('Minimum desposit limit is 0.01 BNB')
        return
      }
      let value = this.web3Object.utils.toHex(this.web3Object.utils.toWei(this.buyAmount.toString(), 'ether'))
		 
      this.contractInstance.methods
        .bakePizza(upline)
        .send({
          from: this.metamaskAccount,
          to: contractAddress,
          value: value
        })
        .on('transactionHash', (hash) => {
          console.log('Transaction Hash: ', hash)
          this.notify('Transaction is Submitted!')
        })
        .on('receipt', (receipt) => {
          this.readValue()
          console.log('Receipt: ', receipt)
          this.notify('Transaction is Completed!')
        })
        .on('error', (error, receipt) => {
          console.log('Error receipt: ', receipt)
          this.notify('Transaction is Rejected!')
        })
    },
	  
	  
    rebakePizza() {
      console.log(this.referrarAddr)
      if (Number(this.hatcheryMiners) < 0.01) {
        this.notify('Minimum rebake limit is 0.01 BNB')
        return
      }
      this.contractInstance.methods
        .rebakePizza(this.referrarAddr)
        .send({
          from: this.metamaskAccount,
          to: contractAddress
        })
        .on('transactionHash', (hash) => {
          console.log('Transaction Hash: ', hash)
          this.notify('Transaction is Submitted!')
        })
        .on('receipt', (receipt) => {
          this.readValue()
          console.log('Receipt: ', receipt)
          this.notify('Transaction is Completed!')
        })
        .on('error', (error, receipt) => {
          console.log('Error receipt: ', receipt)
          this.notify('Transaction is Rejected!')
        })
    },
    eatPizza() {
      this.contractInstance.methods
        .eatPizza()
        .send({
          from: this.metamaskAccount,
          to: contractAddress
        })
        .on('transactionHash', (hash) => {
          console.log('Transaction Hash: ', hash)
          this.notify('Transaction is Submitted!')
        })
        .on('receipt', (receipt) => {
          this.readValue()
          console.log('Receipt: ', receipt)
          this.notify('Transaction is Completed!')
        })
        .on('error', (error, receipt) => {
          console.log('Error receipt: ', receipt)
          this.notify('Transaction is Rejected!')
        })
    },
    notify(msg) {
      Toastify({
        text: msg,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: {
          fontSize: '17px',
          fontWeight: '600',
          color: '#feec6c',
          background: '#c6660d',
          maxWidth: '90%'
        }
      }).showToast()
    },
    copyStringToClipboard() {
      var el = document.createElement('textarea')
      el.value = this.referral
      el.setAttribute('readonly', '')
      el.style = { position: 'absolute', left: '-9999px' }
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      this.notify('Copied!')
    },

    copyToClipBoard() {
      var content = document.getElementById('refArea')
      console.log(content)
      content.select()
      document.execCommand('copy')
      this.notify('Copied!')
    }
  }
})