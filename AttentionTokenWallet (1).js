import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
export const AttentionTokenWallet = () => {
    const [balance, setBalance] = useState(1618);
    return (_jsxs("div", { children: [_jsxs("div", { children: ["Balance: ", balance, " ATTN"] }), _jsx("button", { onClick: () => setBalance((b) => b + 1), children: "+1" })] }));
};
