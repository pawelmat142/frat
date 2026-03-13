import { Theme, Themes } from "@shared/interfaces/SettingsI";
import React, { createContext, useContext, useEffect, useState } from "react";


interface ThemeContextValue {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const getPreferredTheme = (): Theme => {
        const saved = localStorage.getItem("theme");
        if (saved === Themes.LIGHT || saved === Themes.DARK) return saved;
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? Themes.DARK : Themes.LIGHT;
    };

    const [theme, setTheme] = useState<Theme>(getPreferredTheme());

    useEffect(() => {
        // Remove all theme classes
        Object.values(Themes).forEach((themeClass) => {
            document.documentElement.classList.remove(themeClass);
        });

        // Add the current theme class
        document.documentElement.classList.add(theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};