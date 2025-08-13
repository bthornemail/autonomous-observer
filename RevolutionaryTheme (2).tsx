import React, { createContext, useContext, ReactNode, useEffect } from 'react';

const PHI = (1 + Math.sqrt(5)) / 2;

interface RevolutionaryThemeContext {
  colors: {
    revolutionary: string;
    cooperative: string;
    mutual: string;
    democratic: string;
    sacred: string;
    anarchist: string;
  };
  typography: {
    revolutionary: string;
    cooperative: string;
    body: string;
  };
  spacing: {
    phi: number;
    golden: number;
    revolutionary: number;
  };
  animations: {
    revolutionary: string;
    cooperative: string;
    mutual: string;
  };
}

const ThemeContext = createContext<RevolutionaryThemeContext | null>(null);

const revolutionaryTheme: RevolutionaryThemeContext = {
  colors: {
    revolutionary: '#FF4444', // Revolutionary red
    cooperative: '#FFD700', // Cooperative gold
    mutual: '#00AA44', // Mutual aid green
    democratic: '#4444FF', // Democratic blue
    sacred: '#FF8C00', // Sacred geometry orange
    anarchist: '#000000', // Anarchist black
  },
  typography: {
    revolutionary: 'bold 2rem "Liberation Sans", sans-serif',
    cooperative: 'bold 1.5rem "Liberation Sans", sans-serif', 
    body: '1rem "Liberation Sans", Arial, sans-serif',
  },
  spacing: {
    phi: PHI,
    golden: PHI * 16, // 25.89px
    revolutionary: PHI * PHI * 16, // 41.89px
  },
  animations: {
    revolutionary: 'revolutionary-pulse 3s infinite ease-in-out',
    cooperative: 'cooperative-glow 2s infinite alternate',
    mutual: 'mutual-flow 4s infinite linear',
  }
};

interface RevolutionaryThemeProps {
  children: ReactNode;
}

export const RevolutionaryTheme: React.FC<RevolutionaryThemeProps> = ({ children }) => {
  // Inject revolutionary CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--revolutionary-red', revolutionaryTheme.colors.revolutionary);
    root.style.setProperty('--cooperative-gold', revolutionaryTheme.colors.cooperative);
    root.style.setProperty('--mutual-green', revolutionaryTheme.colors.mutual);
    root.style.setProperty('--democratic-blue', revolutionaryTheme.colors.democratic);
    root.style.setProperty('--sacred-orange', revolutionaryTheme.colors.sacred);
    root.style.setProperty('--anarchist-black', revolutionaryTheme.colors.anarchist);
    root.style.setProperty('--golden-ratio', PHI.toString());
    root.style.setProperty('--revolutionary-spacing', revolutionaryTheme.spacing.revolutionary + 'px');
  }, []);

  return (
    <ThemeContext.Provider value={revolutionaryTheme}>
      <div className="revolutionary-theme">
        {children}
        <style>{`
          .revolutionary-theme {
            --revolutionary-red: #FF4444;
            --cooperative-gold: #FFD700;
            --mutual-green: #00AA44;
            --democratic-blue: #4444FF;
            --sacred-orange: #FF8C00;
            --anarchist-black: #000000;
            --golden-ratio: 1.618;
            --revolutionary-spacing: 41.89px;
            
            font-family: "Liberation Sans", Arial, sans-serif;
            background: radial-gradient(circle, #001122 0%, #000000 100%);
            color: white;
            min-height: 100vh;
          }
          
          @keyframes revolutionary-pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
          }
          
          @keyframes cooperative-glow {
            from { box-shadow: 0 0 10px var(--cooperative-gold); }
            to { box-shadow: 0 0 30px var(--cooperative-gold); }
          }
          
          @keyframes mutual-flow {
            from { background-position: 0% 50%; }
            to { background-position: 100% 50%; }
          }
          
          .marketplace-home {
            padding: var(--revolutionary-spacing);
          }
          
          .revolutionary-header {
            text-align: center;
            margin-bottom: calc(var(--revolutionary-spacing) * 2);
          }
          
          .revolutionary-header h1 {
            font-size: calc(1rem * var(--golden-ratio) * var(--golden-ratio));
            color: var(--cooperative-gold);
            text-shadow: 0 0 20px var(--cooperative-gold);
            animation: var(--revolutionary, revolutionary-pulse);
          }
          
          .marketplace-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: var(--revolutionary-spacing);
            margin-bottom: calc(var(--revolutionary-spacing) * 2);
          }
          
          .stat-card {
            background: rgba(255, 215, 0, 0.1);
            border: 2px solid var(--cooperative-gold);
            border-radius: calc(var(--revolutionary-spacing) / 2);
            padding: var(--revolutionary-spacing);
            text-align: center;
            animation: var(--cooperative, cooperative-glow);
          }
          
          .stat-number {
            font-size: calc(1rem * var(--golden-ratio) * 2);
            font-weight: bold;
            color: var(--cooperative-gold);
          }
          
          .revolutionary-principles {
            background: rgba(255, 68, 68, 0.1);
            border: 2px solid var(--revolutionary-red);
            border-radius: calc(var(--revolutionary-spacing) / 2);
            padding: var(--revolutionary-spacing);
          }
          
          .revolutionary-principles ul {
            list-style: none;
            padding: 0;
          }
          
          .revolutionary-principles li {
            padding: calc(var(--revolutionary-spacing) / 4);
            margin: calc(var(--revolutionary-spacing) / 4) 0;
            background: rgba(255, 215, 0, 0.1);
            border-left: 4px solid var(--cooperative-gold);
          }
    `}</style>
      </div>
  </ThemeContext.Provider>
  );
};

export const useRevolutionaryTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useRevolutionaryTheme must be used within RevolutionaryTheme');
  }
  return context;
};