import React from "react";
import { Stack, Anchor, FileInput, Button } from "@mantine/core";

export default function ImportExport() {
    return (
        <Stack>
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
        </Stack>
    );
}
