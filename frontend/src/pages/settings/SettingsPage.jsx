import React from "react";
import { Container, Flex } from "@mantine/core";
import ImportExport from "./ImportExport.jsx";
import ManageWorker from "./ManageWorker.jsx";
import Versions from "./Versions.jsx";
import Hostnames from "./Hostnames.jsx";
import User from "./User.jsx";

export default function SettingsPage() {
    return (
        <Container size="lg" style={{ style: "100%" }} p={0}>
            <Flex direction="row" wrap="wrap" gap="md">
                <ImportExport />
                <ManageWorker />
                <Versions />
                <Hostnames />
                <User />
            </Flex>
        </Container>
    );
}
