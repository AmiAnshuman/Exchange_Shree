import React, { Component } from 'react'
import Modal from 'react-modal'
import { BiChevronDownCircle } from 'react-icons/bi'
import Web3 from 'web3'
import './Home.css'
import metamask from '../metamask.svg'
import axios from 'axios';


class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: null,
      tokenNumbers: 0.0,
      bnbvalue: 0.0,
      openmodal: false,
      web3: null,
      value: false,
      coins:[],
      filtercoins:[],
      search:'',
      coinId:"BNB",
      coinImg:"https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png?1547034615",
      opencoinsmodal:false,
      bnbPriceInUSD:0,
    }

    this.handleTokenChange = this.handleTokenChange.bind(this)
  }

  componentWillMount(){

    var options = {
      method: 'GET',
      url: 'https://coinranking1.p.rapidapi.com/coin/14',
      headers: {
        'x-rapidapi-host': 'coinranking1.p.rapidapi.com',
        'x-rapidapi-key': '7f622423b6msh9fda8280cc7b978p1a66ebjsn40552a0f435f'
      }
    };
    console.log("h")
    var next = this
    axios.request(options).then(function (response) {
      next.setState({bnbPriceInUSD:response.data.data.coin.price})
      console.log(response.data.data.coin.price)
    }).catch(function (error) {
      console.error(error);
    });
    

    // axios
    //   .get(
    //     'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&sparkline=false'
    //   )
    //   .then(res => {
    //     this.setState({coins:res.data});
    //     this.setState({filtercoins:res.data});
    //     console.log(res.data);
    //   })
    //   .catch(error => console.log(error));
  }

 

  handleTokenChange = async (value) => {
    this.setState({ bnbvalue: value })
    // console.log(this.state.tokenNumbers)
    const tokenNumbers = (value *this.state.bnbPriceInUSD) / 0.0002 //do not change this conversion values as it has been fixed in contract
    this.setState({ tokenNumbers })
    console.log(this.state.tokenNumbers)
  }

  handleBNBChange = async (value) => {
    this.setState({ tokenNumbers: value })
    // console.log(this.state.tokenNumbers)
    const bnbvalue = (value * 0.0002 ) / this.state.bnbPriceInUSD //do not change this conversion values as it has been fixed in contract
    this.setState({ bnbvalue })
    console.log(this.state.bnbvalue)
  }

  handleBuyPayzus = async () => {
    var count1

    if (this.state.bnbvalue !== 0) {
      count1 = this.state.tokenNumbers.toString()
      var tokens = this.props.web3.utils.toWei(count1, 'Ether')
      console.log(tokens)
      console.log(this.state.bnbvalue)
      console.log(count1)
      this.setState({ openmodal: true })
      var next = this
      await this.props.ReferralContract.methods
        .buy_SHREE(tokens)
        .send({
          from: this.props.accounts[0],
          value: this.props.web3.utils.toWei(
            this.state.bnbvalue.toString(),
            'Ether',
          ),
        })
        .on('receipt', function (receipt) {
          console.log('hello')
          next.setState({ tokenNumbers: 0.0 })
          next.setState({ bnbvalue: 0.0 })
          next.setState({ openmodal: false })
        })
        .on('error', function (error) {
          next.setState({ tokenNumbers: 0.0 })
          next.setState({ bnbvalue: 0.0 })
          next.setState({ openmodal: false })
        })
        .on('confirmation', function (confNumber, receipt, latestBlockHash) {
          console.log(confNumber)
        })
    } else {
      return
    }
  }

  handleChange = e => {
    this.setState({search:e.target.value});
    console.log(this.state.search)
    this.setState({filtercoins:this.state.coins.filter(coin =>
      coin.name.toLowerCase().includes(this.state.search.toLowerCase())
    )});
  };

  Modalcoin(){
    this.setState({opencoinsmodal:true})
  }

  
  // componentDidUpdate = async (preProps,preState,snapshot) => {
  //   if(this.state.account!==this.props.accounts[0])
  //   {
  //     const accounts = await this.state.web3.eth.getAccounts();
  //   this.setState({account:accounts[0]})
  //   }

  // }
  render() {

    console.log(this.state.coins)
    return (
      <>
        <div className="home">
          <Modal isOpen={this.state.openmodal} className="modalstyle">
            <h4>Please wait till your transaction completes</h4>
          </Modal>
          <Modal isOpen={this.state.opencoinsmodal} className="coinsmodalstyle">
          <input
            className='coin-input'
            type='text'
            onChange={this.handleChange}
            placeholder='Search'
          />
        <ul>
        {this.state.filtercoins.map(coin => {
        return (
          <li><button><img src={coin.image} style={{margin:"0",padding:"0",height:"25px",width:"25px",marginRight:"10px"}}/>{coin.symbol}</button></li>
        );
      })}</ul>
          </Modal>

          <h2 className="pos cl1">Exchange</h2>
          <h4 className="pos cl2">Trade tokens</h4>
          <hr />

          <form className="form-align">
            <button
              className="button-align"
              onClick={(e) => {
                e.preventDefault()
                this.props.addSHREEtoMetamask()
              }}
              style={{ marginBottom: '0px' }}
            >
              Add SHREE to Metamask
            </button>
            <div className="label-align" style={{ marginTop: '10px' }}>
              <h4 className="cl1">BNB:</h4>
              <div className="input-align">
              <input
                className="border-input cl2"
                value={this.state.bnbvalue}
                onChange={(e) => {
                  this.handleTokenChange(e.target.value)
                }}
                type="text"
              />
              <button onClick={(e) => {
                  e.preventDefault();
                  //this.Modalcoin();  this is for opening a modal for different coins
                }}><img src={this.state.coinImg}/>{this.state.coinId}</button>
            </div>
            </div>
            <BiChevronDownCircle className="arrow" />
            <div className="label-align">
              <h4 className="cl1">SHREE:</h4>
              <div className="input-align">
              <input
                className="border-input cl2"
                value={this.state.tokenNumbers}
                onChange={(e) => {
                  this.handleBNBChange(e.target.value)
                }}
                type="text"
              />
              <button onClick={(e) => {
                  e.preventDefault();
                }}><img src="https://www.bscscan.com/token/images/shreelive_32.png"/>SHREE</button>
              
              </div>
            </div>
            {this.props.walletConnected ? (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  this.handleBuyPayzus()
                }}
                className="button-align"
              >
                Buy
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  this.props.handleConnectWallet()
                }}
                className="button-align"
              >
                Unlock Account
              </button>
            )}
          </form>
        </div>
      </>
    )
  }
}

export default Home
