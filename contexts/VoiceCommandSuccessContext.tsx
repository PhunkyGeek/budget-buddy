import React, { createContext, useContext, useCallback, ReactNode } from 'react';

interface VoiceCommandSuccessContextType {
  onVoiceCommandSuccess: (callback: () => void) => () => void; // Register a callback
  triggerSuccess: () => void; // Trigger all registered callbacks
}

const VoiceCommandSuccessContext = createContext<VoiceCommandSuccessContextType | undefined>(undefined);

interface VoiceCommandSuccessProviderProps {
  children: ReactNode;
  onSuccess?: () => void; // Optional initial success handler
}

export function VoiceCommandSuccessProvider({ children, onSuccess }: VoiceCommandSuccessProviderProps) {
  const callbacks = new Set<() => void>();

  const handleVoiceCommandSuccess = useCallback((callback: () => void) => {
    callbacks.add(callback);
    return () => callbacks.delete(callback); // Return unsubscribe function
  }, []);

  const triggerSuccess = useCallback(() => {
    if (onSuccess) onSuccess();
    callbacks.forEach(callback => callback());
  }, [onSuccess, callbacks]);

  const contextValue: VoiceCommandSuccessContextType = {
    onVoiceCommandSuccess: handleVoiceCommandSuccess,
    triggerSuccess,
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

export default VoiceCommandSuccessProvider;