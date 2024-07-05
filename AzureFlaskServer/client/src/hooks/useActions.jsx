import React, { useState, createContext, useContext, useMemo } from 'react'

const ActionsContext = createContext();

export const ActionsProvider = ({children}) => {
    const [dbInfo, setDBInfo] = useState([])

    const value = useMemo(() => ({
        dbInfo,
        setDBInfo
    }), [dbInfo])

    return <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>
}

export const useActions = () => {
    const context = useContext(ActionsContext);
    if (!context) {
        throw new Error("useActions must be used within a ActionsProvider");
    }
    return context;
}