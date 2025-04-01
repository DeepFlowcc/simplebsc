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

function BatchSwap() {
  const { account, active, loading, connectWallet, disconnectWallet, signer } = useWallet();
  const [privateKey, setPrivateKey] = useState('');
  const [swaps, setSwaps] = useState([{ from: 'WBNB', to: 'BUSD', amount: '' }]);
  const [batchLoading, setBatchLoading] = useState(false);

  const handleConnect = async () => {
    if (privateKey) {
      const success = await connectWallet(privateKey);
      if (success) {
        setPrivateKey(''); // Clear private key from state for security
      }
    }
  };

  const addSwap = () => {
    setSwaps([...swaps, { from: 'WBNB', to: 'BUSD', amount: '' }]);
  };

  const removeSwap = (index) => {
    const newSwaps = swaps.filter((_, i) => i !== index);
    setSwaps(newSwaps);
  };

  const updateSwap = (index, field, value) => {
    const newSwaps = [...swaps];
    newSwaps[index] = { ...newSwaps[index], [field]: value };
    setSwaps(newSwaps);
  };

  const executeBatchSwap = async () => {
    if (!active || swaps.some(swap => !swap.amount)) return;

    try {
      setBatchLoading(true);
      const routerAddress = '0x10ED43C718714eb63d5aA57B78B54704E256024E';

      // Execute each swap in sequence
      for (const [index, swap] of swaps.entries()) {
        // Create token contract instance
        const fromTokenContract = new ethers.Contract(
          TOKENS[swap.from],
          ['function approve(address spender, uint256 amount) public returns (bool)'],
          signer
        );

        const amountWei = ethers.utils.parseEther(swap.amount);
        
        console.log(`Swap ${index + 1}: Approving tokens...`);
        const approveTx = await fromTokenContract.approve(routerAddress, amountWei);
        await approveTx.wait();
        console.log(`Swap ${index + 1}: Tokens approved`);

        // Create router contract instance
        const router = new ethers.Contract(
          routerAddress,
          [
            'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
          ],
          signer
        );

        const path = [TOKENS[swap.from], TOKENS[swap.to]];
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

        console.log(`Swap ${index + 1}: Executing swap...`);
        const tx = await router.swapExactTokensForTokens(
          amountWei,
          0, // Accept any amount of tokens
          path,
          account,
          deadline
        );

        console.log(`Swap ${index + 1}: Transaction sent:`, tx.hash);
        await tx.wait();
        console.log(`Swap ${index + 1}: Completed`);
      }

      alert('All swaps completed successfully!');
      
      // Clear amounts after successful batch swap
      setSwaps(swaps.map(swap => ({ ...swap, amount: '' })));
    } catch (error) {
      console.error('Batch swap failed:', error);
      alert('Batch swap failed. Please try again.');
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Batch Swap</h2>
      
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

          {swaps.map((swap, index) => (
            <div key={index} className="card" style={{ marginBottom: '1rem' }}>
              <h3>Swap {index + 1}</h3>
              
              <div className="form-group">
                <label>From Token:</label>
                <select
                  value={swap.from}
                  onChange={(e) => updateSwap(index, 'from', e.target.value)}
                >
                  {Object.keys(TOKENS).map((token) => (
                    <option key={token} value={token}>
                      {token}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>To Token:</label>
                <select
                  value={swap.to}
                  onChange={(e) => updateSwap(index, 'to', e.target.value)}
                >
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
                  value={swap.amount}
                  onChange={(e) => updateSwap(index, 'amount', e.target.value)}
                  placeholder="0.0"
                  step="0.000000000000000001"
                />
              </div>

              {swaps.length > 1 && (
                <button
                  className="button"
                  onClick={() => removeSwap(index)}
                  style={{ backgroundColor: '#ff4444' }}
                >
                  Remove Swap
                </button>
              )}
            </div>
          ))}

          <button className="button" onClick={addSwap}>
            Add Another Swap
          </button>

          <button
            className="button"
            onClick={executeBatchSwap}
            disabled={batchLoading || swaps.some(swap => !swap.amount || swap.from === swap.to)}
            style={{ marginTop: '1rem' }}
          >
            {batchLoading ? 'Executing Batch Swap...' : 'Execute Batch Swap'}
          </button>
        </div>
      )}
    </div>
  );
}

export default BatchSwap; 