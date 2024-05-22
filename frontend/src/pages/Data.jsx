import React from "react";
import { Anchor, Button, Container, FileInput, Flex } from "@mantine/core";

export default function Data() {
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
            </Flex>
        </Container>
    );
}
