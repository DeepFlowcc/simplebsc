import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';

function Transactions() {
  const { account, active, loading, connectWallet, disconnectWallet, signer } = useWallet();
  const [privateKey, setPrivateKey] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [txLoading, setTxLoading] = useState(false);

  const handleConnect = async () => {
    if (privateKey) {
      const success = await connectWallet(privateKey);
      if (success) {
        setPrivateKey(''); // Clear private key from state for security
      }
    }
  };

  const sendTransaction = async () => {
    if (!active || !recipient || !amount) return;

    try {
      setTxLoading(true);

      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.utils.parseEther(amount),
      });

      console.log('Transaction sent:', tx.hash);
      await tx.wait();
      alert('Transaction successful!');
      
      // Clear form
      setRecipient('');
      setAmount('');
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    } finally {
      setTxLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>BSC Transactions</h2>
      
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
            <label>Recipient Address:</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
            />
          </div>

          <div className="form-group">
            <label>Amount (BNB):</label>
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
            onClick={sendTransaction}
            disabled={txLoading || !recipient || !amount}
          >
            {txLoading ? 'Sending...' : 'Send Transaction'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Transactions; 