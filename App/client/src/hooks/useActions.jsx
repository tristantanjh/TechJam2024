import React, { useState, createContext, useContext, useMemo } from 'react'

const ActionsContext = createContext();

export const ActionsProvider = ({children}) => {
    const [dbInfo, setDBInfo] = useState([])
    const [actions, setActions] = useState([])

    const value = useMemo(() => ({
        dbInfo,
        setDBInfo,
        actions,
        setActions
    }), [dbInfo, actions])

    return <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>
}

export const useActions = () => {
    const context = useContext(ActionsContext);
    if (!context) {
        throw new Error("useActions must be used within a ActionsProvider");
    }
    return context;
}