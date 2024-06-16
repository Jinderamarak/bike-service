import React, { useEffect } from "react";
import { rem } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAntenna, IconAntennaOff } from "@tabler/icons-react";
import { atom, useRecoilState } from "recoil";

export const networkStatusAtom = atom({
    key: "networkStatus",
    default: navigator.onLine,
});

export function syncNetworkStatus() {
    const [_, setNetworkStatus] = useRecoilState(networkStatusAtom);

    function handleWorkerMessage(event) {
        if (
            event.data.type === "status" ||
            event.data.type === "networkChanged"
        ) {
            const online = event.data.isOnline;
            setNetworkStatus(online);
        }

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

    function handleOnline() {
        setNetworkStatus(true);
    }

    function handleOffline() {
        setNetworkStatus(false);
    }

    function periodicSync() {
        navigator.serviceWorker.ready.then((registration) => {
            registration.active.postMessage({ type: "sync" });
        });
    }

    async function registerEvents() {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length === 0) {
            window.addEventListener("online", handleOnline);
            window.addEventListener("offline", handleOffline);
            return () => {
                window.removeEventListener("online", handleOnline);
                window.removeEventListener("offline", handleOffline);
            };
        } else {
            const interval = setInterval(periodicSync, 1000);
            navigator.serviceWorker.addEventListener(
                "message",
                handleWorkerMessage
            );
            navigator.serviceWorker.ready.then((registration) => {
                registration.active.postMessage({ type: "status" });
            });
            return () => {
                clearInterval(interval);
                navigator.serviceWorker.removeEventListener(
                    "message",
                    handleWorkerMessage
                );
            };
        }
    }

    useEffect(() => {
        const unregisterEvents = registerEvents();
        return () => {
            unregisterEvents.then((unregister) => unregister());
        };
    }, []);
}
