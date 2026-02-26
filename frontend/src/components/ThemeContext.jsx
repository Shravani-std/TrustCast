import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext()

export function ThemeProvider({children}){
    const [highContrast, setHighContrast] = useState(false);

    useEffect(() =>{
        const root = document.documentElement;
        if(highContrast){
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        }else{
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }

    }, [highContrast]
);

    return (
        <ThemeContext.Provider value={{highContrast, setHighContrast}}>
            {children}
        </ThemeContext.Provider>
    )
}
export const useTheme = () => useContext(ThemeContext);