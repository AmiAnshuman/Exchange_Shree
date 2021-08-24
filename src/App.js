import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './pages/Home';
// import Reports from './pages/Reports';
import Products from './pages/Products';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { Link } from 'react-router-dom';
import { SidebarData } from './components/SidebarData';
// import './components/Navbar.css';
import { IconContext } from 'react-icons';
import Web3 from "web3";
import Abi from "./ContractAbi/BNBtoSHREE.json";
import token from "./Artboard 1-1.png";
import axios from 'axios';


export default class App extends Component {
  
  constructor(props){
    super(props);

    this.state = {
        web3: null,
        accounts: [""], 
        MultiSender: null, 
        loaded:false, 
        walletConnected: false,
        netId:null,
        sidebar:false,
        bnbPriceInUSD:0
    }
    this.handleConnectWallet = this.handleConnectWallet.bind(this);
    this.addSHREEtoMetamask=this.addSHREEtoMetamask.bind(this);
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
}

showSidebar = () => {this.setState({sidebar:!this.state.sidebar});}





handleConnectWallet = async () => {
      
    const {ethereum } = window;

    if(!ethereum){
      throw new Error("Web3 not found");
    }


    const web3 = new Web3(ethereum);
    await ethereum.enable();
    console.log(web3);

    var next=this;

    window.ethereum.on('accountsChanged', function (accounts) {
      next.setState({accounts})
    });
    const netId=await web3.eth.net.getId();
    console.log(netId);
    if(netId===97){
    this.setState({netId})

   const accounts = await web3.eth.getAccounts();
   console.log(accounts)
    
     this.setState({web3,accounts, loaded:true, walletConnected:true });

     

    const ReferralContract = new web3.eth.Contract(
      Abi,
      "0xd06BD4E70984e2779E09a30c066c92A2E63C4435" //Address of the BUYSHREE contract
    );

    this.setState({ ReferralContract});
    }
    else{
      window.alert("Please connect to BSC Mainnet");
      this.setState({loaded:false, walletConnected:false });
    }
   }

   
disconnect =()=> {
  this.setState({walletConnected:false});
    this.setState({accounts:[""]});
  }

  addSHREEtoMetamask=()=>{

    const {ethereum } = window;

    ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: '0x2BF21fAD0Adc7182213C5933221E8cA1491009E9',//Address of the SHREE token
          symbol: 'SHREE',
          decimals: 18,
          image: "https://bscscan.com/token/images/shreelive_32.png",
        },
      },
    })
      .then((success) => {
        if (success) {
          console.log('FOO successfully added to wallet!')
        } else {
          throw new Error('Something went wrong.')
        }
      })
      .catch(console.error);

  }




   truncate(str) {
    return str.length > 10
      ? str.substring(0, 6) + '...' + str.substring(38, 42)
      : str
  }

  render(){

    

    return(
    <>
    
      <Router>
      
      <IconContext.Provider value={{ color: '#fff' }}>
        <div className='navbar'>
          <Link to='#' className='menu-bars'>
            <FaIcons.FaBars onClick={this.showSidebar} />
          </Link>
          <img src={token} style={{width:'60px',height:'60px'}}/>
          {this.state.walletConnected? <button onClick={this.disconnect} className="button-btn">Disconnect Wallet</button>:<button onClick={this.handleConnectWallet} className="button-btn">Connect Wallet</button>}
          {this.state.walletConnected? <button className="button-btn" style={{right:'13rem',color:'#1b4088'}}>{this.truncate(this.state.accounts[0])}</button>:null}
          {/* <button className="button-btn" style={{right:'22.5rem',color:'#1b4088'}}>1 BNB:{this.state.bnbPriceInUSD}USD</button> */}
        
        </div>
        
        <nav className={this.state.sidebar ? 'nav-menu active' : 'nav-menu'}>
          <ul className='nav-menu-items' onClick={this.showSidebar}>
            <li className='navbar-toggle'>
              <Link to='#' className='menu-bars'>
                <AiIcons.AiOutlineClose />
              </Link>
            </li>
            {SidebarData.map((item, index) => {
              return (
                <li key={index} className={item.cName}>
                  <Link to={item.path}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          
        </nav>
      </IconContext.Provider>
        <Switch>
          
          <Route path='/' exact render={(props) => <Home 
              accounts={this.state.accounts}
               web3 = {this.state.web3} 
               ReferralContract={this.state.ReferralContract}
               walletConnected = {this.state.walletConnected}
               addSHREEtoMetamask = {this.addSHREEtoMetamask}
               handleConnectWallet = {this.handleConnectWallet} {...props} />}/>
          <Route path='/reports' component={Products} />
          <Route path='/products' component={Products} />
          <Route path='/messages' component={Products} />
          <Route path='/support' component={Products} />
        </Switch>
      </Router>
    </>
    );
  }
}


