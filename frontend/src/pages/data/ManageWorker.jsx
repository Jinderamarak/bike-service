import React from "react";
import { Button, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";

export default function ManageWorker() {
    async function registerWorker() {
        notifications.show({
            message: `Registering service worker: ${""}`,
            color: "green",
        });

        try {
            const registration = await navigator.serviceWorker.register(
                "/worker.js",
                { scope: "/" }
            );

            if (registration.installing) {
                notifications.show({
                    message: "Service worker installing",
                    color: "green",
                });
            }
            if (registration.waiting) {
                notifications.show({
                    message: "Service worker waiting",
                    color: "green",
                });
            }
            if (registration.active) {
                notifications.show({
                    message: "Service worker active",
                    color: "green",
                });
            }
        } catch (error) {
            console.error(error);
            notifications.show({
                message: `Service worker registration failed: ${error}`,
                color: "red",
            });
        }
    }

    async function unregisterWorker() {
        notifications.show({
            message: "Unregistering service worker",
            color: "green",
        });

        try {
            const registration = await navigator.serviceWorker.getRegistration(
                "/"
            );

            if (registration) {
                await registration.unregister();
                notifications.show({
                    message: "Service worker unregistered",
                    color: "green",
                });
            } else {
                notifications.show({
                    message: "No service worker to unregister",
                    color: "red",
                });
            }
        } catch (error) {
            console.error(error);
            notifications.show({
                message: `Service worker unregistration failed: ${error}`,
                color: "red",
            });
        }
    }

    return (
        <Stack>
            <Button variant="filled" onClick={registerWorker}>
                Register Service Worker
            </Button>
            <Button variant="light" onClick={unregisterWorker}>
                Unregister Service Worker
            </Button>
        </Stack>
    );
}
