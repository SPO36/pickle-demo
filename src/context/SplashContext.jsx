// context/SplashContext.js
import { createContext, useContext, useState } from 'react';

const SplashContext = createContext();

export const useSplash = () => {
  const context = useContext(SplashContext);
  if (!context) {
    throw new Error('useSplash must be used within a SplashProvider');
  }
  return context;
};

export const SplashProvider = ({ children }) => {
  const [hasShownSplash, setHasShownSplash] = useState(false);

  return (
    <SplashContext.Provider value={{ hasShownSplash, setHasShownSplash }}>
      {children}
    </SplashContext.Provider>
  );
};
