import React, { createContext, useContext, ReactNode } from 'react';

interface VoiceCommandSuccessContextType {
  onVoiceCommandSuccess: () => void;
}

const VoiceCommandSuccessContext = createContext<VoiceCommandSuccessContextType | undefined>(undefined);

interface VoiceCommandSuccessProviderProps {
  children: ReactNode;
  onSuccess: () => void;
}

export function VoiceCommandSuccessProvider({ children, onSuccess }: VoiceCommandSuccessProviderProps) {
  const contextValue: VoiceCommandSuccessContextType = {
    onVoiceCommandSuccess: onSuccess,
  };

  return (
    <VoiceCommandSuccessContext.Provider value={contextValue}>
      {children}
    </VoiceCommandSuccessContext.Provider>
  );
}

export function useVoiceCommandSuccess() {
  const context = useContext(VoiceCommandSuccessContext);
  if (context === undefined) {
    throw new Error('useVoiceCommandSuccess must be used within a VoiceCommandSuccessProvider');
  }
  return context;
}