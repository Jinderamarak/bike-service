import React, { useEffect } from "react";
import { rem } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAntenna, IconAntennaOff } from "@tabler/icons-react";
import { atom, useRecoilState } from "recoil";
import { isWorkerAvailable, workerCall } from "../lib/WorkerCom.js";

export const networkStatusAtom = atom({
    key: "networkStatus",
    default: navigator.onLine,
});

export function useNetworkStatusSync() {
    const [_, setNetworkStatus] = useRecoilState(networkStatusAtom);

    function handleOnline() {
        setNetworkStatus(true);
    }

    function handleOffline() {
        setNetworkStatus(false);
    }

    async function periodicCheck() {
        const status = await workerCall("status", {});
        setNetworkStatus(status.isOnline);
        if (status.isOnline) {
            notifications.show({
                title: "Online",
                message: `Connected`,
                autoClose: 5000,
                withBorder: true,
                icon: (
                    <IconAntenna style={{ width: rem(20), height: rem(20) }} />
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

    async function registerEvents() {
        if (isWorkerAvailable()) {
            const interval = setInterval(periodicCheck, 5000);
            return () => {
                clearInterval(interval);
            };
        } else {
            window.addEventListener("online", handleOnline);
            window.addEventListener("offline", handleOffline);
            return () => {
                window.removeEventListener("online", handleOnline);
                window.removeEventListener("offline", handleOffline);
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
