import React from "react";
import { createTheme, MantineProvider } from "@mantine/core";
import { useRecoilState } from "recoil";
import { selectedBikeColorAtom } from "./data/persistentAtoms.js";

export default function AppTheme({ children }) {
    const [color, _] = useRecoilState(selectedBikeColorAtom);

    const theme = createTheme({
        autoContrast: true,
        primaryColor: color ? "bikeColor" : "blue",
        colors: {
            // @ts-ignore
            bikeColor: Array(10).fill(color),
        },
    });

    return (
        <MantineProvider defaultColorScheme="dark" theme={theme}>
            {children}
        </MantineProvider>
    );
}
