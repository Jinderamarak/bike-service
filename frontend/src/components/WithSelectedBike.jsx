import React from "react";
import { useRecoilState } from "recoil";
import { selectedBikeIdAtom } from "../data/persistentAtoms.js";
import { Text } from "@mantine/core";

export default function WithSelectedBike({ children }) {
    const [selectedBike, _] = useRecoilState(selectedBikeIdAtom);

    if (selectedBike === null) {
        return <Text ta="center">Select a bike</Text>;
    }

    return children;
}
