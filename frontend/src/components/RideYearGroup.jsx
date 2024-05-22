import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { selectedBikeAtom } from "../atoms";
import { Button } from "@mantine/core";

export default function RideYearGroup({ year, onYearSelected }) {
    const [selectedBike, _] = useRecoilState(selectedBikeAtom);
    const [years, setYears] = useState([year]);

    useEffect(() => {
        if (selectedBike === null) return;

        let controller = new AbortController();
        fetch(`/api/bikes/${selectedBike}/rides/years`, {
            signal: controller.signal,
        })
            .then((response) => response.json())
            .then((data) => setYears(data))
            .catch((err) => console.warn(err));

        return () => controller.abort();
    });

    return (
        <Button.Group>
            {years.map((y) => (
                <Button
                    key={y}
                    variant={y === year ? "filled" : "light"}
                    onClick={() => onYearSelected(y)}
                >
                    {y}
                </Button>
            ))}
        </Button.Group>
    );
}
