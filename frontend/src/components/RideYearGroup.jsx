import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { selectedBikeIdAtom } from "../data/persistentAtoms.js";
import { Button } from "@mantine/core";
import useRideService from "../services/rideService.js";

export default function RideYearGroup({ year, onYearSelected }) {
    const [selectedBike, _] = useRecoilState(selectedBikeIdAtom);
    const [years, setYears] = useState([year]);
    const rideService = useRideService(selectedBike);

    useEffect(() => {
        if (selectedBike === null) return;

        rideService.getActiveYears().then((data) => {
            data.sort((a, b) => b - a);
            setYears(data);
        });
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
