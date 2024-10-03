import JPAssistPlugin from 'main';
import { App } from 'obsidian';
import { createContext, useContext } from 'react';

export const AppContext = createContext<App | undefined>(undefined);
export const useApp = (): App | undefined => {
    return useContext(AppContext);
};

export const PluginContext = createContext<JPAssistPlugin | undefined>(
    undefined
);
export const usePlugin = (): JPAssistPlugin | undefined => {
    return useContext(PluginContext);
};
