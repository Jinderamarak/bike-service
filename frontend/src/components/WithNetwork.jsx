import React from "react";
import { useRecoilState } from "recoil";
import { Text } from "@mantine/core";
import { networkStatusAtom } from "../data/useNetworkStatus";

export default function WithNetwork({ children }) {
    const [online, _] = useRecoilState(networkStatusAtom);

    if (!online) {
        return <Text ta="center">Unavailable while offline</Text>;
    }

    return children;
}
