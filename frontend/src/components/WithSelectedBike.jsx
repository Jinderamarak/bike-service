import React from "react";
import { useRecoilState } from "recoil";
import { selectedBikeAtom } from "../atoms";
import { Text } from "@mantine/core";

export default function WithSelectedBike({ children }) {
    const [selectedBike, _] = useRecoilState(selectedBikeAtom);

    if (selectedBike === null) {
        return <Text ta="center">Select a bike</Text>;
    }

    return children;
}
