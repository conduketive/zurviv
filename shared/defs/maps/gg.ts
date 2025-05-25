import { util } from "../../utils/util";
import type { MapDef } from "../mapDefs";
import { Main } from "./baseDefs";

const mapDef = {
    mapId: 1221,
    desc: {
        name: "GG",
        icon: "img/gg_logo.png",
        buttonCss: "btn-mode-gg"
    },
    
    /* STRIP_FROM_PROD_CLIENT:END */
};

export const GG = util.mergeDeep({}, Main, mapDef) as MapDef;
