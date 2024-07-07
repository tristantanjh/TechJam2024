import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const LoadingMessageContext = createContext();

export const LoadingMessageProvider = ({ children }) => {
    const [newQueryReceived, setNewQueryReceived] = useState(false);
    const [newQueryReceivedCopilot, setNewQueryReceivedCopilot] = useState(false);

    const value = useMemo(
        () => ({
            newQueryReceived,
            setNewQueryReceived,
            newQueryReceivedCopilot,
            setNewQueryReceivedCopilot,
        }),
        [newQueryReceived, newQueryReceivedCopilot]
    );

    return (
        <LoadingMessageContext.Provider value={value}>
            {children}
        </LoadingMessageContext.Provider>
    );
}

export const useLoadingMessage = () => {
    const context = useContext(LoadingMessageContext);
    if (!context) {
        throw new Error("useLoadingMessage must be used within a LoadingMessageProvider");
    }
    return context;
};


