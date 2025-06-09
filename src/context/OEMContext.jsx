import { createContext, useContext, useState } from 'react';

const OEMContext = createContext();

export function OEMProvider({ children }) {
  const [showOEMOnly, setShowOEMOnly] = useState(true);
  const [oemToggles, setOemToggles] = useState({
    Hyundai: true,
    RKM: true,
  });

  return (
    <OEMContext.Provider
      value={{
        showOEMOnly,
        setShowOEMOnly,
        oemToggles,
        setOemToggles,
      }}
    >
      {children}
    </OEMContext.Provider>
  );
}

export function useOEM() {
  return useContext(OEMContext);
}
