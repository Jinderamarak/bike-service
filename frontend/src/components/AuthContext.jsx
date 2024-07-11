import React, { createContext, useContext, useMemo, useState } from "react";
import ApiClient from "../services/ApiClient.js";
import { useRecoilState } from "recoil";
import { selectedBikeIdAtom } from "../data/persistentAtoms.js";

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
    const [_, setSelectedBikeId] = useRecoilState(selectedBikeIdAtom);
    const [authUserId, setAuthUserId] = useState(
        localAuthUserId ? parseInt(localAuthUserId) : null
    );

    const apiClient = useMemo(() => {
        const client = new ApiClient(localAuthToken);
        client.onUnauthorized(() => {
            setAuthUserId(null);
        });

        return client;
    }, []);

    /**
     * @param {?import("../services/authService.js").SessionModel} session
     */
    function setSession(session) {
        apiClient.authToken = session?.token;
        setAuthUserId(session?.userId);
        setSelectedBikeId(null);

        if (session) {
            localStorage.setItem(authTokenStorageKey, session.token);
            localStorage.setItem(authUserIdStorageKey, `${session.userId}`);
        } else {
            localStorage.removeItem(authTokenStorageKey);
            localStorage.removeItem(authUserIdStorageKey);
        }
    }

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
