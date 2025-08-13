import React, { useState } from 'react';

export const AttentionTokenWallet: React.FC = () => {
	const [balance, setBalance] = useState(1618);
	return (
		<div>
			<div>Balance: {balance} ATTN</div>
			<button onClick={() => setBalance((b) => b + 1)}>+1</button>
		</div>
	);
};