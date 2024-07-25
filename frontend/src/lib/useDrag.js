import { useWindowEvent } from "@mantine/hooks";
import { useRef } from "react";

/**
 * @param {(x, y) => any} start
 * @param {(x, y) => any} move
 * @param {(x, y) => any} end
 */
export default function useDrag(start, move, end) {
    const draggingRef = useRef(false);
    const ref = useRef(null);

    /** @param {MouseEvent} event */
    function mouseDown(event) {
        if (ref.current.contains(event.target)) {
            draggingRef.current = true;
            start(event.clientX, event.clientY);
        }
    }

    /** @param {MouseEvent} event */
    function mouseMove(event) {
        if (draggingRef.current) {
            move(event.clientX, event.clientY);
        }
    }

    /** @param {MouseEvent} event */
    function mouseUp(event) {
        if (draggingRef.current) {
            draggingRef.current = false;
            end(event.clientX, event.clientY);
        }
    }

    useWindowEvent("mousedown", mouseDown);
    useWindowEvent("mousemove", mouseMove);
    useWindowEvent("mouseup", mouseUp);

    return ref;
}
