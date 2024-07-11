import React, { useEffect, useState } from "react";
import useUserService from "../../services/userService.js";
import { Avatar, Menu, Skeleton, rem } from "@mantine/core";
import {
    IconLogout,
    IconManualGearbox,
    IconSettings,
} from "@tabler/icons-react";
import useAuthService from "../../services/authService.js";
import { useAuth } from "../AuthContext.jsx";
import BikeSelect from "./BikeSelect.jsx";
import { useNavigate } from "react-router-dom";

const iconStyles = {
    width: rem(14),
    height: rem(14),
};

function UserProfile() {
    const auth = useAuth();
    const userService = useUserService();
    const authService = useAuthService();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

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
        userService.current().then(setUser);
    }, []);

    return (
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
                >
                    Logout
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}

export default UserProfile;
