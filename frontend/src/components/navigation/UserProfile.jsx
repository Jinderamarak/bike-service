import React, { useEffect, useState } from "react";
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
    const [user, setUser] = useState(null);
    const [hasStrava, setHasStrava] = useState(false);
    const [syncing, setSyncing] = useState(false);

    function sync() {
        setSyncing(true);
        const id = notifications.show({
            loading: true,
            title: "Syncing with Strava",
            message: "This may take a few seconds",
            autoClose: false,
            withCloseButton: false,
            withBorder: true,
            color: "orange",
        });

        stravaService
            .sync()
            .then(() =>
                notifications.update({
                    id,
                    loading: false,
                    title: "Syncing with Strava",
                    message: "Sync complete",
                    autoClose: 3000,
                    withCloseButton: true,
                    withBorder: true,
                    color: "orange",
                    icon: <IconBrandStrava style={iconStyles} />,
                })
            )
            .catch(() =>
                notifications.update({
                    id,
                    loading: false,
                    title: "Syncing with Strava",
                    message: "Sync failed",
                    autoClose: 3000,
                    withCloseButton: true,
                    withBorder: true,
                    color: "red",
                    icon: <IconBrandStrava style={iconStyles} />,
                })
            )
            .finally(() => setSyncing(false));
    }

    function manageBikes() {
        navigate("/bikes");
    }

    function settings() {
        navigate("/settings");
    }

    function logout() {
        authService.logout().finally(() => auth.setSession(null));
    }

    useEffect(() => {
        if (isOnline) {
            userService.current().then(setUser);
            stravaService
                .getLink()
                .then(() => setHasStrava(true))
                .catch(() => setHasStrava(false));
        }
    }, [isOnline]);

    return (
        <>
            <Menu position="bottom-end">
                <Menu.Target>
                    <Skeleton
                        visible={user === null}
                        style={{ width: "fit-content" }}
                    >
                        <Avatar
                            name={user?.username ?? ""}
                            color="initials"
                            style={{ cursor: "pointer" }}
                        />
                    </Skeleton>
                </Menu.Target>
                <Menu.Dropdown>
                    <BikeSelect />
                    {hasStrava && (
                        <Menu.Item
                            onClick={sync}
                            disabled={syncing}
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
