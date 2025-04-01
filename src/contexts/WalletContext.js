import React, { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

const BSC_NETWORK = {
  chainId: 56,
  name: 'Binance Smart Chain',
  rpcUrl: 'https://bsc-dataseed.binance.org/',
};

export function WalletProvider({ children }) {
  const [privateKey, setPrivateKey] = useState('');
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const connectWallet = async (inputPrivateKey) => {
    try {
      setLoading(true);
      
      // Validate private key format
      if (!inputPrivateKey.startsWith('0x')) {
        inputPrivateKey = '0x' + inputPrivateKey;
      }
      
      // Create provider and wallet
      const provider = new ethers.providers.JsonRpcProvider(BSC_NETWORK.rpcUrl);
      const wallet = new ethers.Wallet(inputPrivateKey, provider);
      const address = await wallet.getAddress();

      setPrivateKey(inputPrivateKey);
      setAccount(address);
      setProvider(provider);
      setSigner(wallet);
      
      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Invalid private key. Please check and try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setPrivateKey('');
    setAccount('');
    setProvider(null);
    setSigner(null);
  };

  return (
    <WalletContext.Provider
      value={{
        active: !!account,
        account,
        loading,
        provider,
        signer,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
} 