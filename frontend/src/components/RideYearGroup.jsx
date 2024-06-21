import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { selectedBikeIdAtom } from "../data/persistentAtoms";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";

export default function RideYearGroup({ year, onYearSelected }) {
    const [selectedBike, _] = useRecoilState(selectedBikeIdAtom);
    const [years, setYears] = useState([year]);

    useEffect(() => {
        if (selectedBike === null) return;

        const controller = new AbortController();
        fetch(`/api/bikes/${selectedBike}/rides/years`, {
            signal: controller.signal,
        })
            .then((response) => response.json())
            .then((data) => {
                data.sort((a, b) => b - a);
                setYears(data);
            })
            .catch((err) => {
                if (err.name === "AbortError") return;
                console.error(err);
                notifications.show({
                    title: "Failed to fetch ride years",
                    message: err.message,
                    color: "red",
                    withBorder: true,
                });
            });

        return () => controller.abort();
    }, [selectedBike]);

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
