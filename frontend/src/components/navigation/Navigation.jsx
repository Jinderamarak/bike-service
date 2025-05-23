import React, { useState } from "react";
import { Paper, Flex, Burger, Title } from "@mantine/core";
import NavLinks from "./NavLinks.jsx";
import UserProfile from "./UserProfile.jsx";

export default function Navigation() {
    const [open, setOpen] = useState(false);

    return (
        <Paper withBorder p="md">
            <Flex direction={{ base: "column", xs: "row" }} gap="md">
                <Flex
                    direction="row"
                    justify="space-between"
                    style={{ flexShrink: 0 }}
                >
                    <Title order={1} size="h2">
                        Bike Service
                    </Title>
                    <Burger
                        hiddenFrom="xs"
                        opened={open}
                        onClick={() => setOpen(!open)}
                    />
                </Flex>
                <NavLinks open={open} onClose={() => setOpen(false)} />
                <Flex direction="row" justify="end">
                    <UserProfile />
                </Flex>
            </Flex>
        </Paper>
    );
}
