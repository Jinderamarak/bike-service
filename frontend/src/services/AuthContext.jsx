import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import ApiClient from "./ApiClient.js";

const AuthContext = createContext({
    isLoggedIn: false,
    setAuthToken: (token) => {},
    apiClient: null,
});

const authTokenStorageKey = "authToken";
const localAuthToken = localStorage.getItem(authTokenStorageKey);

export function AuthProvider({ children }) {
    const [authToken, setAuthToken] = useState(localAuthToken || null);

    const apiClient = useMemo(() => {
        const client = new ApiClient();
        client.onUnauthorized(() => setAuthToken(null));
        return client;
    }, []);

    useEffect(() => {
        apiClient.authToken = authToken;
        if (authToken) {
            localStorage.setItem(authTokenStorageKey, authToken);
        } else {
            localStorage.removeItem(authTokenStorageKey);
        }
    }, [authToken]);

    return (
        <AuthContext.Provider
            value={{ isLoggedIn: Boolean(authToken), setAuthToken, apiClient }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useApiClient() {
    return useContext(AuthContext).apiClient;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    return {
        isLoggedIn: ctx.isLoggedIn,
        setAuthToken: ctx.setAuthToken,
    };
}
