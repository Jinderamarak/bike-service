import React from "react";
import {
    Anchor,
    Button,
    Container,
    FileInput,
    Flex,
    Stack,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

export default function Data() {
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
        <Container size="lg" style={{ style: "100%" }} p={0}>
            <Flex
                direction={{ base: "column", xs: "row" }}
                wrap="nowrap"
                gap="md"
            >
                <Anchor href="/api/data/export" download>
                    Export Rides
                </Anchor>
                <form
                    method="POST"
                    action="/api/data/import"
                    encType="multipart/form-data"
                >
                    <FileInput
                        label="File"
                        withAsterisk
                        accept="text/csv"
                        name="rides-file"
                        id="rides-file"
                    />
                    <Button variant="filled" type="submit">
                        Import Rides
                    </Button>
                </form>
                <Stack>
                    <Button variant="filled" onClick={registerWorker}>
                        Register Service Worker
                    </Button>
                    <Button variant="light" onClick={unregisterWorker}>
                        Unregister Service Worker
                    </Button>
                </Stack>
            </Flex>
        </Container>
    );
}
