import { useEffect, useLayoutEffect, useState } from "react";
import { WindowSize } from "../interface/windowSize";
import { EDevice } from "../enums/common.emun";

const useDevice = () => {
    const [windowSize, setWindowSize] = useState<WindowSize>({
        height: null,
        width: null,
    });

    const [device, setDevice] = useState<EDevice>(EDevice.Desktop);

    useLayoutEffect(() => {

        const setwindowSize = () => {
            console.log("in thie setwindowSize. windowSize:" + windowSize);
            setWindowSize({
                height: window.innerHeight,
                width: window.innerWidth,
            });

            const getCurrentDevice = () => {
                return window.innerWidth >= +(minDesktopWidth().replace("px",""))
                 ? EDevice.Desktop
                 : (window.innerWidth >= +(minDesktopWidth().replace("px","")) ? EDevice.Tablet : EDevice.Mobile);
             }

            setDevice(getCurrentDevice);
        };
        window.addEventListener("resize", () => setwindowSize());

        setwindowSize();

        return window.removeEventListener("resize", () => setwindowSize());
    }, []);


    return [windowSize, device];
}

export { useDevice };

export enum Size {
    SM = "576px",
    MD = "768px",
    XL = "1200px",
    XXL = "1920px"
}

export function minDesktopWidth() { return Size.XL; }
export function minTabletWidth() { return Size.MD; }