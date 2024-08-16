import React, { useEffect, useState } from "react";
import { Stack, Button, Text } from "@mantine/core";
import { useRecoilState } from "recoil";
import { networkStatusAtom } from "../../data/useNetworkStatus.jsx";
import useStravaService from "../../services/stravaService.js";
import useStatusService from "../../services/statusService.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function Strava() {
    const [isOnline, _] = useRecoilState(networkStatusAtom);
    const [loadingRedirect, setLoadingRedirect] = useState(false);
    const queryClient = useQueryClient();
    const stravaService = useStravaService();
    const statusService = useStatusService();

    const statusQuery = useQuery({
        queryKey: ["status"],
        queryFn: statusService.get,
    });

    const linkQuery = useQuery({
        queryKey: ["stravaLink"],
        queryFn: () => stravaService.getLink().catch(() => null),
    });

    const unlinkMutation = useMutation({
        mutationFn: stravaService.unlink,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stravaLink"] });
            queryClient.invalidateQueries({ queryKey: ["stravaBikes"] });
        },
    });

    function createLink() {
        setLoadingRedirect(true);
        stravaService.getOAuthRedirect().then((response) => {
            window.location.href = response.url;
        });
    }

    if (
        statusQuery.isLoading ||
        !statusQuery.data.integrations.includes("strava")
    ) {
        return null;
    }

    if (linkQuery.data) {
        return (
            <Stack>
                <Text>Strava Account Linked</Text>
                <Text>{linkQuery.data.stravaName}</Text>
                <Button
                    variant="light"
                    color="orange"
                    loading={loadingRedirect}
                    disabled={loadingRedirect || !isOnline}
                    onClick={() => unlinkMutation.mutate()}
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
                loading={loadingRedirect}
                disabled={loadingRedirect || !isOnline}
                onClick={createLink}
            >
                Link Strava Account
            </Button>
        </Stack>
    );
}
