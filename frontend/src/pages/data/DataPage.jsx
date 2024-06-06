import React from "react";
import { Container, Flex } from "@mantine/core";
import ImportExport from "./ImportExport";
import ManageWorker from "./ManageWorker";
import Versions from "./Versions";

export default function DataPage() {
    return (
        <Container size="lg" style={{ style: "100%" }} p={0}>
            <Flex direction="row" wrap="wrap" gap="md">
                <ImportExport />
                <ManageWorker />
                <Versions />
            </Flex>
        </Container>
    );
}
