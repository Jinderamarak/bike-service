import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import ApiClient from "../services/ApiClient.js";

const AuthContext = createContext({
    authUserId: null,
    setSession: (session) => {},
    apiClient: null,
});

const authTokenStorageKey = "authToken";
const localAuthToken = localStorage.getItem(authTokenStorageKey);

const authUserIdStorageKey = "authUserId";
const localAuthUserId = localStorage.getItem(authUserIdStorageKey);

export function AuthProvider({ children }) {
    const [authToken, setAuthToken] = useState(localAuthToken || null);
    const [authUserId, setAuthUserId] = useState(
        localAuthUserId ? parseInt(localAuthUserId) : null
    );

    const apiClient = useMemo(() => {
        const client = new ApiClient();
        client.onUnauthorized(() => {
            setAuthToken(null);
            setAuthUserId(null);
        });

        return client;
    }, []);

    /**
     * @param {?import("../services/authService.js").SessionModel} session
     */
    function setSession(session) {
        setAuthToken(session?.token);
        setAuthUserId(session?.userId);
    }

    useEffect(() => {
        apiClient.authToken = authToken;
        if (authToken) {
            localStorage.setItem(authTokenStorageKey, authToken);
        } else {
            localStorage.removeItem(authTokenStorageKey);
        }
    }, [authToken]);

    useEffect(() => {
        if (authUserId) {
            localStorage.setItem(authUserIdStorageKey, `${authUserId}`);
        } else {
            localStorage.removeItem(authUserIdStorageKey);
        }
    }, [authUserId]);

    return (
        <AuthContext.Provider value={{ authUserId, setSession, apiClient }}>
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
        authUserId: ctx.authUserId,
        setSession: ctx.setSession,
    };
}
