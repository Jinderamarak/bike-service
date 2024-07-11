import React, { useEffect, useState } from "react";
import { Stack, Transition } from "@mantine/core";
import Navigation from "./components/navigation/Navigation.jsx";
import BikesPage from "./pages/bikes/BikesPage.jsx";
import StatsPage from "./pages/stats/StatsPage.jsx";
import RidesPage from "./pages/rides/RidesPage.jsx";
import DataPage from "./pages/data/DataPage.jsx";
import { Routes, Route, BrowserRouter } from "react-router-dom";

function App() {
    const [transition, setTransition] = useState(false);

    useEffect(() => {
        setTransition(true);
    }, []);

    return (
        <BrowserRouter>
            <Transition mounted={transition} transition="fade">
                {(styles) => (
                    <Stack p="md" gap="md" style={{ ...styles }}>
                        <Navigation />
                        <Routes>
                            <Route index element={<RidesPage />} />
                            <Route path="/bikes" element={<BikesPage />} />
                            <Route path="/stats" element={<StatsPage />} />
                            <Route path="/data" element={<DataPage />} />
                        </Routes>
                    </Stack>
                )}
            </Transition>
        </BrowserRouter>
    );
}

export default App;
