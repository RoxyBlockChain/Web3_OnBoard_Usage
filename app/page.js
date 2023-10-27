"use client"
import React, {useEffect, useState} from "react";
import { init, useConnectWallet, useWallets } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import { useSetChain } from "@web3-onboard/react";
import { ethers } from "ethers"

import Image from 'next/image';
import styles from './page.module.css';


export const injected = injectedModule();

const infurakey = '';
//initiallze onboard

init({
  wallets: [injected],
  chains: [{
    id: '0x1',
    token: 'ETH',
    label: 'Ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/${infuraKey}',
  },
  {
    id: '0x4',
    token: 'rETH',
    label: 'Rinkeby',
    rpcUrl: 'https://rinkeby.infura.io/v3/${infuraKey}',
  },
  ]
})

let provider

export default function Home() {
  const [{wallet , connecting }, connect , disconnect] = useConnectWallet();
  const connectedWallets = useWallets();
  const [{ chains, connectedChain, settingChain} , setChain] = useSetChain();
  const [ toAddress, setToAddress ] = useState('');

     // chains the list of chains that web3-onboard was initialized with
     // connectedChain the current chain the user's wallet is connected to
     // settingChain boolean indicating if the chain is in the process of being set
     // setChain function to call to initiate user to switch chains in their wallet


     // we use the setChain hook to make ssure that the user is on Rinkbey test Network "0x4"
     // chain id defined as hex encoded string or number.
     // We need to create a provider variable and set that variabe if its not yet been set by
      // Once the wallet hook exist by usring React's hook useEffect.
      
    useEffect( () => {
      if(!wallet?.provider){
        provider = null
      }else{
        provider = new ethers.providers.Web3Provider(wallet.provider, 'any');
      }
    }, [wallet]);

    // we need 2 function to transact with newy created provider
    // readyToTransact() ensure that wallet is connected and we are on proper chain

    const readyToTransact = async () => {
      if(!wallet){
        const walletSelected = await connect()
        if(!walletSelected) return false
      }

      if( connectedChain && connectedChain.id === '0x4'){
      // trigger user to switch chain to rinkeby test net
      await setChain({ chainId: '0x4'})
      }
      return true
    }

    // sendTransaction() ensure we have receipt address, create a signer and send Tx

    const sendTransaction = async () => {
      if(!toAddress){
        alert('An Ethereum address to send Eth to is required.')
        return
      }
        const signer = provider.setUncheckSigner()
        await signer.sendTransaction({
          to: toAddress,
          value: 10000000,
        })
    }

    // finay we need to have a state variabe to set toAddress and text to show to user
    // and a button to Send Transaction.

    useEffect(() => {
    if (!useConnectWallet.length || !wallet) return
    console.log(`connectedWallets :`, connectedWallets);
    console.log(`prime wallet`, wallet);
  },[connectedWallets, wallet]);

  return (
    <div> 
      <button
      disabled={connecting}
      onClick={ () => { wallet ? (disconnect({label: wallet.label})) : connect()}}
      >
       {connecting ? 'connecting' : wallet ? 'disconnect' : 'connect'}
      </button>
        { wallet && (
        <button
        onClick={()=> {
          connect()
        }}
        > 
          Connect Another wallet
        </button>
      )}

      { wallet && (
        <div>
          <label> Send 0.0001 rEth on Rinkeby test Network</label>
          <input
          type="text" 
          value="{toAddress}"
          placeholder="Address"
          onChange={e => setToAddress(e.target.value)}
          />
          <button
          onClick={async () => {
            const ready =  await readyToTransact()
            if(!ready) return
            sendTransaction
          }} 
          >
            Send
          </button>
        </div>
      )
      }
    </div>
  )
}
