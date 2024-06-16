import { useRecoilState } from "recoil";
import { networkStatusAtom } from "../data/useNetworkStatus";

export function WhenOnline({ children }) {
    const [online, _] = useRecoilState(networkStatusAtom);

    if (!online) {
        return null;
    }

    return children;
}

export function WhenOffline({ children }) {
    const [online, _] = useRecoilState(networkStatusAtom);

    if (online) {
        return null;
    }

    return children;
}
