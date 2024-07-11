import React, { Fragment } from "react";
import Navigation from "./components/navigation/Navigation.jsx";
import BikesPage from "./pages/bikes/BikesPage.jsx";
import StatsPage from "./pages/stats/StatsPage.jsx";
import RidesPage from "./pages/rides/RidesPage.jsx";
import DataPage from "./pages/data/DataPage.jsx";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "./components/AuthContext.jsx";

function AppAuth() {
    const auth = useAuth();
    const navigate = useNavigate();

    if (!auth.authUserId) {
        navigate("/login");
        return null;
    }

    return (
        <Fragment>
            <Navigation />
            <Routes>
                <Route index element={<RidesPage />} />
                <Route path="/bikes" element={<BikesPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/data" element={<DataPage />} />
            </Routes>
        </Fragment>
    );
}

export default AppAuth;
