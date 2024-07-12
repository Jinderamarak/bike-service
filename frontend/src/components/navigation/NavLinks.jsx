import React, { useMemo } from "react";
import { Button, Collapse, Flex, useMatches } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";

function linkVariant(current, target) {
    if (current === target) return "filled";
    return "default";
}

export default function NavLinks({ open, onClose }) {
    const navigate = useNavigate();
    const location = useLocation();
    const alwaysOpen = useMatches({
        base: false,
        xs: true,
    });

    function goToRides() {
        navigate("/");
        onClose();
    }

    function goToStats() {
        navigate("/stats");
        onClose();
    }

    const currentPage = useMemo(() => {
        if (location.pathname === "/") return "rides";
        if (location.pathname === "/stats") return "stats";
        if (location.pathname === "/data") return "data";
        return null;
    }, [location]);

    return (
        <Collapse in={open || alwaysOpen} style={{ flexGrow: 1 }}>
            <Flex
                direction={{ base: "column", xs: "row" }}
                wrap="nowrap"
                gap="md"
                justify="center"
            >
                <Button
                    onClick={goToRides}
                    variant={linkVariant(currentPage, "rides")}
                >
                    Rides
                </Button>
                <Button
                    onClick={goToStats}
                    variant={linkVariant(currentPage, "stats")}
                >
                    Stats
                </Button>
            </Flex>
        </Collapse>
    );
}
