import React, { useEffect, useRef } from "react";
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
    const previous = useRef(false);

    function showNotification(isOnline) {
        if (previous.current === isOnline) {
            return;
        }

        previous.current = isOnline;
        if (isOnline) {
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

    function handleOnline() {
        setNetworkStatus(true);
        showNotification(true);
    }

    function handleOffline() {
        setNetworkStatus(false);
        showNotification(false);
    }

    async function periodicCheck() {
        const status = await workerCall("status", {});
        setNetworkStatus(status.isOnline);
        showNotification(status.isOnline);
    }

    async function registerEvents() {
        if (isWorkerAvailable()) {
            const interval = setInterval(periodicCheck, 5000);
            return () => {
                clearInterval(interval);
            };
        }

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }

    useEffect(() => {
        const unregisterEvents = registerEvents();
        return () => {
            unregisterEvents.then((unregister) => unregister());
        };
    }, []);
}
