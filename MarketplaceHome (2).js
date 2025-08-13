import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
// Sacred Geometry Engine implementation - will be integrated with existing ULP systems
const SacredGeometryEngine = {
    calculateGoldenRatio: () => (1 + Math.sqrt(5)) / 2
};
import { P2PSearch } from './P2PSearch';
import { CooperativeProfile } from './CooperativeProfile';
import { AttentionTokenWallet } from '../economics/AttentionTokenWallet';
const MarketplaceHome = () => {
    const [stats, setStats] = useState({
        totalCooperatives: 0,
        activeMutualAid: 0,
        attentionTokensCirculating: 0,
        democraticDecisions: 0
    });
    const [currentPhase, setCurrentPhase] = useState('Genesis');
    useEffect(() => {
        // Initialize marketplace with sacred geometry principles
        const phi = SacredGeometryEngine.calculateGoldenRatio();
        // Simulate revolutionary marketplace growth
        setStats({
            totalCooperatives: Math.floor(phi * 100),
            activeMutualAid: Math.floor(phi * 50),
            attentionTokensCirculating: Math.floor(phi * 1000),
            democraticDecisions: Math.floor(phi * 25)
        });
        // Determine revolutionary phase based on activity
        if (stats.totalCooperatives > 300)
            setCurrentPhase('Full Revolution');
        else if (stats.totalCooperatives > 200)
            setCurrentPhase('Mass Adoption');
        else if (stats.totalCooperatives > 100)
            setCurrentPhase('Growing Movement');
        else
            setCurrentPhase('Revolutionary Genesis');
    }, []);
    return (_jsxs("div", { className: "marketplace-home", children: [_jsxs("header", { className: "revolutionary-header", children: [_jsx("h1", { children: "\uD83C\uDFEA Anarcho-Syndicalist Marketplace" }), _jsx("p", { children: "Decentralized P2P Commerce \u2022 Worker Ownership \u2022 Cooperative Economics" }), _jsx("div", { className: "revolution-phase", children: _jsxs("span", { className: "phase-indicator", children: ["\uD83D\uDCC8 Revolutionary Phase: ", currentPhase] }) })] }), _jsxs("div", { className: "marketplace-stats", children: [_jsxs("div", { className: "stat-card cooperative-count", children: [_jsx("h3", { children: "\uD83E\uDD1D Worker Cooperatives" }), _jsx("div", { className: "stat-number", children: stats.totalCooperatives }), _jsx("p", { children: "Democratic workplaces united in solidarity" })] }), _jsxs("div", { className: "stat-card mutual-aid", children: [_jsx("h3", { children: "\uD83D\uDD17 Active Mutual Aid" }), _jsx("div", { className: "stat-number", children: stats.activeMutualAid }), _jsx("p", { children: "Communities supporting each other" })] }), _jsxs("div", { className: "stat-card attention-tokens", children: [_jsx("h3", { children: "\u26A1 Attention Tokens" }), _jsx("div", { className: "stat-number", children: stats.attentionTokensCirculating }), _jsx("p", { children: "Knowledge-backed value in circulation" })] }), _jsxs("div", { className: "stat-card democratic-decisions", children: [_jsx("h3", { children: "\uD83D\uDDF3\uFE0F Democratic Decisions" }), _jsx("div", { className: "stat-number", children: stats.democraticDecisions }), _jsx("p", { children: "Community choices made collectively" })] })] }), _jsx("div", { className: "marketplace-features", children: _jsxs("div", { className: "feature-grid", children: [_jsxs("div", { className: "feature-card", children: [_jsx("h4", { children: "\uD83D\uDD0D Revolutionary Search" }), _jsx(P2PSearch, {})] }), _jsxs("div", { className: "feature-card", children: [_jsx("h4", { children: "\uD83D\uDCB0 Attention Token Wallet" }), _jsx(AttentionTokenWallet, {})] }), _jsxs("div", { className: "feature-card", children: [_jsx("h4", { children: "\uD83C\uDFDB\uFE0F Cooperative Directory" }), _jsx(CooperativeProfile, {})] })] }) }), _jsxs("div", { className: "revolutionary-principles", children: [_jsx("h3", { children: "\uD83D\uDEA9 Revolutionary Principles" }), _jsxs("ul", { children: [_jsx("li", { children: "\u270A Worker ownership and democratic control" }), _jsx("li", { children: "\uD83C\uDF31 Surplus value returns to creators" }), _jsx("li", { children: "\uD83D\uDEE1\uFE0F Anti-exploitation safeguards" }), _jsx("li", { children: "\uD83C\uDF0D Ecological sustainability prioritized" }), _jsx("li", { children: "\uD83D\uDCDA Knowledge commons over IP monopolies" }), _jsx("li", { children: "\uD83E\uDD1D Resource abundance through cooperation" })] })] })] }));
};
export default MarketplaceHome;
