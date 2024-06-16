import React from "react";
import { Stack } from "@mantine/core";
import Navigation from "./components/navigation/Navigation";
import BikesPage from "./pages/bikes/BikesPage";
import StatsPage from "./pages/stats/StatsPage";
import RidesPage from "./pages/rides/RidesPage";
import DataPage from "./pages/data/DataPage";
import { Routes, Route } from "react-router-dom";
import { syncLocalStorate as syncLocalStorage } from "./data/persistentAtoms";
import { syncNetworkStatus } from "./data/useNetworkStatus";

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
