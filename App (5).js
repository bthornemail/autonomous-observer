import { jsx as _jsx } from "react/jsx-runtime";
import MarketplaceHome from './components/marketplace/MarketplaceHome';
import { RevolutionaryTheme } from './components/ui/RevolutionaryTheme';
import './App.css';
function App() {
    return (_jsx(RevolutionaryTheme, { children: _jsx("div", { className: "app", children: _jsx(MarketplaceHome, {}) }) }));
}
export default App;
