import React, { useEffect } from "react";

export default function useData(x) {
    useEffect(() => {
        console.log("useData hooked", x);
        return () => {
            console.log("useData unhooked", x);
        };
    }, []);

    return {};
}
