import React from "react";
import { useMantineTheme } from "@mantine/core";
// @ts-ignore
import classes from "./EventIndicator.module.css";

/**
 * @param {{ variant: import("./ServicingPage.jsx").EventVariant }} props
 */
export default function EventIndicator({ variant }) {
    const theme = useMantineTheme();
    const colors = {
        ok: theme.colors.green[6],
        warn: theme.colors.orange[6],
        fail: theme.colors.red[6],
    };

    return (
        <div className={classes.container}>
            <div
                className={classes.point}
                style={{ backgroundColor: colors[variant] }}
            />
            {variant !== "ok" && (
                <div
                    className={[classes.point, classes.animated].join(" ")}
                    style={{ backgroundColor: colors[variant] }}
                />
            )}
        </div>
    );
}
