import React, { useEffect } from "react";
import { Stack, rem } from "@mantine/core";
import Navigation from "./components/navigation/Navigation";
import BikesPage from "./pages/bikes/BikesPage";
import StatsPage from "./pages/stats/StatsPage";
import RidesPage from "./pages/rides/RidesPage";
import DataPage from "./pages/data/DataPage";
import { Routes, Route } from "react-router-dom";
import { useRecoilState } from "recoil";
import { selectedBikeIdAtom, syncLocalStorate } from "./data/persistentAtoms";
import { notifications } from "@mantine/notifications";
import { IconAntenna, IconAntennaOff } from "@tabler/icons-react";

function useServiceWorkerNotifications() {
    function handleMessage(event) {
        if (event.data.type === "networkChanged") {
            if (event.data.isOnline) {
                notifications.show({
                    title: "Online",
                    message: `Connected to ${event.data.host}`,
                    autoClose: 5000,
                    withBorder: true,
                    icon: (
                        <IconAntenna
                            style={{ width: rem(20), height: rem(20) }}
                        />
                    ),
                });
            } else {
                notifications.show({
                    title: "Offline",
                    message: "You are currently offline",
                    autoClose: 5000,
                    withBorder: true,
                    icon: (
                        <IconAntennaOff
                            style={{ width: rem(20), height: rem(20) }}
                        />
                    ),
                });
            }
        }

        if (event.data.type === "syncFailed") {
            notifications.show({
                title: "Sync failed",
                message: `Failed to sync ${event.data.category}: ${event.data.failed} failed, ${event.data.succeeded} succeeded`,
                autoClose: 5000,
                withBorder: true,
                color: "red",
            });
        }

        if (event.data.type === "syncStarted") {
            notifications.show({
                title: "Sync started",
                message: `Syncing ${event.data.category}: ${event.data.itemCount} items`,
                autoClose: 5000,
                withBorder: true,
            });
        }

        if (event.data.type === "syncCompleted") {
            notifications.show({
                title: "Sync completed",
                message: `Synced ${event.data.category}: ${event.data.itemCount} items`,
                autoClose: 5000,
                withBorder: true,
            });
        }
    }

    useEffect(() => {
        navigator.serviceWorker.addEventListener("message", handleMessage);
        return () =>
            navigator.serviceWorker.removeEventListener(
                "message",
                handleMessage
            );
    }, []);

    function intervaler() {
        navigator.serviceWorker.ready.then((registration) => {
            registration.active.postMessage({ type: "sync" });
        });
    }

    useEffect(() => {
        const interval = setInterval(intervaler, 1000);
        return () => clearInterval(interval);
    }, []);

    return null;
}

function App() {
    syncLocalStorate();
    useServiceWorkerNotifications();

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
