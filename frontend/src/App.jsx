import React from "react";
import { Stack } from "@mantine/core";
import Navigation from "./components/navigation/Navigation.jsx";
import BikesPage from "./pages/bikes/BikesPage.jsx";
import StatsPage from "./pages/stats/StatsPage.jsx";
import RidesPage from "./pages/rides/RidesPage.jsx";
import DataPage from "./pages/data/DataPage.jsx";
import { Routes, Route } from "react-router-dom";
import { syncLocalStorate as syncLocalStorage } from "./data/persistentAtoms.js";
import { syncNetworkStatus } from "./data/useNetworkStatus.jsx";

function App() {
    syncLocalStorage();
    syncNetworkStatus();

    return (
        <Stack p="md" gap="md">
            <Navigation />
            <Routes>
                <Route index element={<RidesPage />} />
                <Route path="/bikes" element={<BikesPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/data" element={<DataPage />} />
            </Routes>
        </Stack>
    );
}

export default App;
