import React, { useEffect, useState } from "react";
import { Stack, Button, Text } from "@mantine/core";
import { useRecoilState } from "recoil";
import { networkStatusAtom } from "../../data/useNetworkStatus.jsx";
import useStravaService from "../../services/stravaService.js";
import useStatusService from "../../services/statusService.js";

export default function Strava() {
    const [isOnline, _] = useRecoilState(networkStatusAtom);
    const [hasStravaIntegration, setHasStravaIntegration] = useState(false);
    const [loading, setLoading] = useState(false);
    const [link, setLink] = useState(null);
    const stravaService = useStravaService();
    const statusService = useStatusService();

    function createLink() {
        setLoading(true);
        stravaService.getOAuthRedirect().then((response) => {
            window.location.href = response.url;
        });
    }

    function deleteLink() {
        setLoading(true);
        stravaService
            .unlink()
            .then(() => {
                setLink(null);
            })
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        statusService.get().then((status) => {
            setHasStravaIntegration(status.integrations.includes("strava"));
        });
    }, [isOnline]);

    useEffect(() => {
        if (hasStravaIntegration) {
            stravaService
                .getLink()
                .then(setLink)
                .catch(() => setLink(null));
        }
    }, [isOnline, hasStravaIntegration]);

    if (!hasStravaIntegration) {
        return null;
    }

    if (link) {
        return (
            <Stack>
                <Text>Strava Account Linked</Text>
                <Text>{link.stravaName}</Text>
                <Button
                    variant="light"
                    color="orange"
                    loading={loading}
                    disabled={loading || !isOnline}
                    onClick={deleteLink}
                >
                    Unlink Accounts
                </Button>
            </Stack>
        );
    }

    return (
        <Stack>
            <Button
                color="orange"
                loading={loading}
                disabled={loading || !isOnline}
                onClick={createLink}
            >
                Link Strava Account
            </Button>
        </Stack>
    );
}
