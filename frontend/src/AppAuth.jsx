import React, { Fragment, useEffect } from "react";
import Navigation from "./components/navigation/Navigation.jsx";
import BikesPage from "./pages/bikes/BikesPage.jsx";
import StatsPage from "./pages/stats/StatsPage.jsx";
import RidesPage from "./pages/rides/RidesPage.jsx";
import SettingsPage from "./pages/settings/SettingsPage.jsx";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "./components/AuthContext.jsx";

export default function AppAuth() {
    const auth = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.authUserId) {
            navigate("/login");
        }
    }, [auth]);

    if (!auth.authUserId) {
        return null;
    }

    return (
        <Fragment>
            <Navigation />
            <Routes>
                <Route index element={<RidesPage />} />
                <Route path="/bikes" element={<BikesPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Routes>
        </Fragment>
    );
}
