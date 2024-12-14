import * as PIXI from "pixi.js-legacy";
import { type Atlas, MapDefs } from "../../shared/defs/mapDefs";
import type { AudioManager } from "./audioManager";
import type { ConfigManager } from "./config";
import { device } from "./device";
import fullResAtlasDefs from "./fullResAtlasDefs.json";
import lowResAtlasDefs from "./lowResAtlasDefs.json";

type AtlasDef = Record<Atlas, PIXI.ISpritesheetData[]>;

const spritesheetDefs = {
    low: lowResAtlasDefs as unknown as AtlasDef,
    high: fullResAtlasDefs as unknown as AtlasDef,
};

function loadTexture(renderer: PIXI.IRenderer, url: string) {
    const tex = PIXI.Texture.from(url);
    const baseTex = tex.baseTexture;
    let loadAttempts = 0;

    if (!baseTex.valid) {
        baseTex.on("loaded", (baseTex) => {
            console.log("Loaded texture", url);
            renderer.prepare.upload(baseTex);
        });

        baseTex.on("error", (baseTex) => {
            console.log("BaseTex load error, retrying", url);
            if (loadAttempts++ <= 3) {
                setTimeout(
                    () => {
                        if (baseTex.source) {
                            baseTex.updateSourceImage("");
                            baseTex.updateSourceImage(url.substring(5, url.length));
                        }
                    },
                    (loadAttempts - 1) * 1000,
                );
            }
        });
    }
    return baseTex;
}

function loadSpritesheet(renderer: PIXI.IRenderer, data: PIXI.ISpritesheetData) {
    const baseTex = loadTexture(renderer, `assets/${data.meta.image}`);

    const sheet = new PIXI.Spritesheet(baseTex, data);
    sheet.resolution = baseTex.resolution;
    sheet.parse();

    return sheet;
}

function selectTextureRes(renderer: PIXI.IRenderer, config: ConfigManager) {
    let minDim = Math.min(window.screen.width, window.screen.height);
    let maxDim = Math.max(window.screen.width, window.screen.height);
    minDim *= window.devicePixelRatio;
    maxDim *= window.devicePixelRatio;
    const smallScreen = maxDim < 1366 && minDim < 768;
    let textureRes: "high" | "low" = config.get("highResTex") ? "high" : "low";

    if (
        smallScreen ||
        (device.mobile && !device.tablet) ||
        renderer.type == PIXI.RENDERER_TYPE.CANVAS
    ) {
        textureRes = "low";
    }
    if (renderer.type == PIXI.RENDERER_TYPE.WEBGL) {
        const s = (renderer as PIXI.Renderer).gl;
        if (s.getParameter(s.MAX_TEXTURE_SIZE) < 4096) {
            textureRes = "low";
        }
    }
    console.log(
        "TextureRes",
        textureRes,
        "screenDims",
        window.screen.width,
        window.screen.height,
    );
    return textureRes;
}

export class ResourceManager {
    atlases = {} as Record<
        Atlas,
        {
            loaded: boolean;
            spritesheets: PIXI.Spritesheet[];
        }
    >;

    loadTicker = 0;
    loaded = false;

    textureRes!: "high" | "low";
    mapName!: string;
    preloadMap!: boolean;

    constructor(
        public renderer: PIXI.IRenderer,
        public audioManager: AudioManager,
        public config: ConfigManager,
    ) {
        this.textureRes = selectTextureRes(this.renderer, this.config);
        // @ts-expect-error private field L
        renderer.prepare.limiter.maxItemsPerFrame = 1;
    }

    isAtlasLoaded(name: Atlas) {
        return this.atlases[name]?.loaded;
    }

    atlasTexturesLoaded(name: Atlas) {
        if (!this.isAtlasLoaded(name)) {
            return false;
        }

        const atlas = this.atlases[name];
        for (let i = 0; i < atlas.spritesheets.length; i++) {
            const spritesheet = atlas.spritesheets[i];
            if (!spritesheet.baseTexture.valid) {
                return false;
            }
        }

        return true;
    }

    loadAtlas(name: Atlas) {
        if (this.isAtlasLoaded(name)) {
            return;
        }

        console.log("Load atlas", name);

        this.atlases[name] = this.atlases[name] || {
            loaded: false,
            spritesheets: [],
        };

        let atlasDefs = spritesheetDefs[this.textureRes] || spritesheetDefs.low;

        // HACK: force high res for non normal mode atlases
        // until we generate the atlases for those
        if (!MapDefs.main.assets.atlases.includes(name)) {
            atlasDefs = spritesheetDefs.high;
        }

        const atlasDef = atlasDefs[name];
        for (let i = 0; i < atlasDef.length; i++) {
            const atlas = loadSpritesheet(this.renderer, atlasDef[i]);
            this.atlases[name].spritesheets.push(atlas);
        }
        this.atlases[name].loaded = true;
    }

    unloadAtlas(name: Atlas) {
        if (!this.isAtlasLoaded(name)) {
            return;
        }

        console.log("Unload atlas", name);

        const atlas = this.atlases[name];
        for (let i = 0; i < atlas.spritesheets.length; i++) {
            atlas.spritesheets[i].destroy(true);
        }
        atlas.loaded = false;
        atlas.spritesheets = [];
    }

    loadMapAssets() {
        console.log("Load all atlases");
    
        const atlasKeys = Object.keys(spritesheetDefs[this.textureRes]) as Atlas[];
        const loadedKeys = Object.keys(this.atlases) as Atlas[];
    
        for (let i = 0; i < loadedKeys.length; i++) {
            const key = loadedKeys[i];
            if (!atlasKeys.includes(key)) {
                this.unloadAtlas(key);
            }
        }
    
        for (let i = 0; i < atlasKeys.length; i++) {
            const atlas = atlasKeys[i];
            if (!this.isAtlasLoaded(atlas)) {
                console.log("Load atlas", atlas);
    
                this.atlases[atlas] = this.atlases[atlas] || {
                    loaded: false,
                    spritesheets: [],
                };
    
                const atlasDef = spritesheetDefs[this.textureRes][atlas];
                for (let j = 0; j < atlasDef.length; j++) {
                    const spritesheet = loadSpritesheet(this.renderer, atlasDef[j]);
                    this.atlases[atlas].spritesheets.push(spritesheet);
                }
                this.atlases[atlas].loaded = true;
            }
        }
    
        setTimeout(() => {
            console.log("Load audio");
            this.audioManager.preloadSounds();
        }, 0);
    
        this.loaded = true;
        console.log("Assets loaded");
    }
    

    update(dt: number) {
        // Debug
        if (!this.loaded) {
            this.loadTicker += dt;

            let loaded = !this.preloadMap;
            const keys = Object.keys(this.atlases) as Atlas[];
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (!this.atlasTexturesLoaded(key)) {
                    loaded = false;
                }
            }
            if (!this.audioManager.allLoaded()) {
                loaded = false;
            }

            if (loaded) {
                console.log("Resource load complete", this.loadTicker.toFixed(2));
                this.loaded = true;
            }
        }
    }
}
