import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';

// Common token addresses on BSC
const TOKENS = {
  WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
  USDT: '0x55d398326f99059fF775485246999027B3197955',
  CAKE: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
};

function PancakeSwap() {
  const { account, active, loading, connectWallet, disconnectWallet, signer } = useWallet();
  const [privateKey, setPrivateKey] = useState('');
  const [fromToken, setFromToken] = useState('WBNB');
  const [toToken, setToToken] = useState('BUSD');
  const [amount, setAmount] = useState('');
  const [swapLoading, setSwapLoading] = useState(false);

  const handleConnect = async () => {
    if (privateKey) {
      const success = await connectWallet(privateKey);
      if (success) {
        setPrivateKey(''); // Clear private key from state for security
      }
    }
  };

  const swapTokens = async () => {
    if (!active || !amount) return;

    try {
      setSwapLoading(true);

      // Create token instances
      const fromTokenContract = new ethers.Contract(
        TOKENS[fromToken],
        ['function approve(address spender, uint256 amount) public returns (bool)'],
        signer
      );

      // Approve tokens for PancakeSwap router
      const routerAddress = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
      const amountWei = ethers.utils.parseEther(amount);
      
      console.log('Approving tokens...');
      const approveTx = await fromTokenContract.approve(routerAddress, amountWei);
      await approveTx.wait();
      console.log('Tokens approved');

      // Create swap transaction
      const router = new ethers.Contract(
        routerAddress,
        [
          'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
        ],
        signer
      );

      const path = [TOKENS[fromToken], TOKENS[toToken]];
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

      console.log('Executing swap...');
      const tx = await router.swapExactTokensForTokens(
        amountWei,
        0, // Accept any amount of tokens
        path,
        account,
        deadline
      );

      console.log('Swap transaction sent:', tx.hash);
      await tx.wait();
      console.log('Swap completed');
      alert('Swap successful!');
      
      // Clear form
      setAmount('');
    } catch (error) {
      console.error('Swap failed:', error);
      alert('Swap failed. Please try again.');
    } finally {
      setSwapLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>PancakeSwap</h2>
      
      {!active ? (
        <div>
          <div className="form-group">
            <label>Private Key:</label>
            <input
              type="password"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="Enter your private key"
              style={{ fontFamily: 'monospace' }}
            />
            <p className="help-text" style={{ color: 'red', fontSize: '0.8em' }}>
              Warning: Never share your private key with anyone!
            </p>
          </div>
          <button 
            className="button" 
            onClick={handleConnect}
            disabled={loading || !privateKey}
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      ) : (
        <div>
          <div className="wallet-info">
            <p>Connected Account: {account}</p>
            <button className="button" onClick={disconnectWallet}>
              Disconnect
            </button>
          </div>

          <div className="form-group">
            <label>From Token:</label>
            <select value={fromToken} onChange={(e) => setFromToken(e.target.value)}>
              {Object.keys(TOKENS).map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>To Token:</label>
            <select value={toToken} onChange={(e) => setToToken(e.target.value)}>
              {Object.keys(TOKENS).map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Amount:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              step="0.000000000000000001"
            />
          </div>

          <button
            className="button"
            onClick={swapTokens}
            disabled={swapLoading || !amount || fromToken === toToken}
          >
            {swapLoading ? 'Swapping...' : 'Swap Tokens'}
          </button>
        </div>
      )}
    </div>
  );
}

export default PancakeSwap; 