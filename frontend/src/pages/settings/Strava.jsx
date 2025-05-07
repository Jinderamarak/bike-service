import React, { useEffect, useState } from "react";
import { Stack, Button, Text } from "@mantine/core";
import { useRecoilState } from "recoil";
import { networkStatusAtom } from "../../data/useNetworkStatus.jsx";
import useStravaService from "../../services/stravaService.js";
import useStatusService from "../../services/statusService.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, useForm } from "@mantine/form";
import { DateTimePicker } from "@mantine/dates";

export default function Strava() {
    const [isOnline, _] = useRecoilState(networkStatusAtom);
    const [loadingRedirect, setLoadingRedirect] = useState(false);
    const queryClient = useQueryClient();
    const stravaService = useStravaService();
    const statusService = useStatusService();

    const linkForm = useForm({
        mode: "controlled",
        initialValues: {
            lastSync: new Date()
        },
    });

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

    const updateMutation = useMutation({
        mutationFn: (values) => stravaService.updateLink({ lastSync: values.lastSync.toISOString().slice(0, -1) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stravaLink"] });
        },
    });

    function createLink() {
        setLoadingRedirect(true);
        stravaService.getOAuthRedirect().then((response) => {
            window.location.href = response.url;
        });
    }

    useEffect(() => {
        linkForm.setValues({
            lastSync: linkQuery.data?.lastSync ? new Date(linkQuery.data.lastSync + "Z") : new Date(),
        });
    }, [linkQuery.data])

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
                <Form form={linkForm} onSubmit={updateMutation.mutate}>
                    <DateTimePicker
                        withAsterisk
                        label="Last Sync"
                        key={linkForm.key("lastSync")}
                        {...linkForm.getInputProps("lastSync")}
                        disabled={updateMutation.isPending}
                    />
                    <Button
                        variant="filled"
                        type="submit"
                        loading={updateMutation.isPending}
                    >
                        Update
                    </Button>
                </Form>
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
