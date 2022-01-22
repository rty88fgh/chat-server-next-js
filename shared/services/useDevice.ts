import { useEffect, useState } from "react";
import { WindowSize } from "../abstract/windowSize";
import { EDevice } from "../enums/common.emun";

const DEVICE = {
    SM: 576,
    MD: 768,
    XL: 1200,
    XXL: 1920
}

const useDevice = () => {
    const [windowSize, setWindowSize] = useState<WindowSize>({
        height: null,
        width: null,
    });

    const [device, setDevice] = useState<EDevice>(EDevice.Desktop);

    useEffect(() => {

        const setwindowSize = () => {
            setWindowSize({
            height:  window.innerHeight,
            width: window.innerWidth,
            });

            const resizeDevice = window.innerWidth >= DEVICE.XL 
            ? EDevice.Desktop
            : (window.innerWidth >= DEVICE.MD ? EDevice.Tablet : EDevice.Mobile) ;

            setDevice(resizeDevice);
        };
        window.addEventListener("resize", setwindowSize);

        setwindowSize();

        return window.removeEventListener("resize", setwindowSize);
    },[]);
    

    return [windowSize, device];
}

export default useDevice;