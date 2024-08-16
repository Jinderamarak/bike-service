import React, { useEffect, useRef, useState } from "react";
import useUserService from "../../services/userService.js";
import { Avatar, Menu, Skeleton, rem } from "@mantine/core";
import {
    IconLogout,
    IconManualGearbox,
    IconSettings,
    IconBrandStrava,
} from "@tabler/icons-react";
import useAuthService from "../../services/authService.js";
import { useAuth } from "../AuthContext.jsx";
import BikeSelect from "./BikeSelect.jsx";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { networkStatusAtom } from "../../data/useNetworkStatus.jsx";
import useStravaService from "../../services/stravaService.js";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const iconStyles = {
    width: rem(14),
    height: rem(14),
};

export default function UserProfile() {
    const auth = useAuth();
    const userService = useUserService();
    const authService = useAuthService();
    const stravaService = useStravaService();
    const navigate = useNavigate();
    const [isOnline, _] = useRecoilState(networkStatusAtom);

    const queryClient = useQueryClient();
    const syncNotification = useRef(null);
    const syncMutation = useMutation({
        mutationFn: stravaService.sync,
        onMutate: () => {
            syncNotification.current = notifications.show({
                loading: true,
                title: "Syncing with Strava",
                message: "This may take a few seconds",
                autoClose: false,
                withCloseButton: false,
                withBorder: true,
                color: "orange",
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rides"] });
            notifications.update({
                id: syncNotification.current,
                loading: false,
                title: "Syncing with Strava",
                message: "Sync complete",
                autoClose: 3000,
                withCloseButton: true,
                withBorder: true,
                color: "orange",
                icon: <IconBrandStrava style={iconStyles} />,
            });
        },
        onError: () => {
            notifications.update({
                id: syncNotification.current,
                loading: false,
                title: "Syncing with Strava",
                message: "Sync failed",
                autoClose: 3000,
                withCloseButton: true,
                withBorder: true,
                color: "red",
                icon: <IconBrandStrava style={iconStyles} />,
            });
        },
    });
    const userQuery = useQuery({
        queryKey: ["user"],
        queryFn: userService.current,
        enabled: isOnline,
    });
    const stravaQuery = useQuery({
        queryKey: ["stravaLink"],
        queryFn: () =>
            stravaService
                .getLink()
                .then(() => true)
                .catch(() => false),
        enabled: isOnline,
    });

    function manageBikes() {
        navigate("/bikes");
    }

    function settings() {
        navigate("/settings");
    }

    function logout() {
        authService.logout().finally(() => auth.setSession(null));
    }

    return (
        <>
            <Menu position="bottom-end">
                <Menu.Target>
                    <Skeleton
                        visible={userQuery.isLoading}
                        style={{ width: "fit-content" }}
                    >
                        <Avatar
                            name={userQuery.data?.username ?? ""}
                            color="initials"
                            style={{ cursor: "pointer" }}
                        />
                    </Skeleton>
                </Menu.Target>
                <Menu.Dropdown>
                    <BikeSelect />
                    {stravaQuery.data && (
                        <Menu.Item
                            onClick={() => syncMutation.mutate()}
                            disabled={syncMutation.isPending}
                            leftSection={<IconBrandStrava style={iconStyles} />}
                        >
                            Sync with Strava
                        </Menu.Item>
                    )}
                    <Menu.Item
                        onClick={manageBikes}
                        leftSection={<IconManualGearbox style={iconStyles} />}
                    >
                        Manage Bikes
                    </Menu.Item>
                    <Menu.Item
                        onClick={settings}
                        leftSection={<IconSettings style={iconStyles} />}
                    >
                        Settings
                    </Menu.Item>
                    <Menu.Item
                        onClick={logout}
                        leftSection={<IconLogout style={iconStyles} />}
                        disabled={!isOnline}
                    >
                        Logout
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </>
    );
}
