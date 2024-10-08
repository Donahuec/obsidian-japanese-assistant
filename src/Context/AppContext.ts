import { App } from "obsidian";
import { createContext, useContext } from "react";

export const AppContext = createContext<App | undefined>(undefined);
export const useApp = (): App | undefined => {
	return useContext(AppContext);
};
