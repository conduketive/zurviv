import { type MapDef, MapDefs } from "../../../shared/defs/mapDefs";
import { MapObjectDefs } from "../../../shared/defs/mapObjectDefs";
import type {
    BuildingDef,
    ObstacleDef,
    StructureDef,
} from "../../../shared/defs/mapObjectsTyping";
import { GameConfig, TeamMode } from "../../../shared/gameConfig";
import * as net from "../../../shared/net/net";
import { MsgStream, MsgType } from "../../../shared/net/net";
import { ObjectType } from "../../../shared/net/objectSerializeFns";
import { type AABB, type Collider, coldet } from "../../../shared/utils/coldet";
import { collider } from "../../../shared/utils/collider";
import { mapHelpers } from "../../../shared/utils/mapHelpers";
import { math } from "../../../shared/utils/math";
import type { River } from "../../../shared/utils/river";
import { type MapRiverData, generateTerrain } from "../../../shared/utils/terrainGen";
import { assert, util } from "../../../shared/utils/util";
import { type Vec2, v2 } from "../../../shared/utils/v2";
import { Config } from "../config";
import type { Game } from "./game";
import type { Group } from "./group";
import { Building } from "./objects/building";
import { Obstacle } from "./objects/obstacle";
import type { Player } from "./objects/player";
import { Structure } from "./objects/structure";
import { RiverCreator } from "./riverCreator";
import type { Team } from "./team";

//
// Helpers
//

interface GroundBunkerColliders {
    ground: Collider[];
    bunker: Collider[];
    gridBound: AABB;
}

const cachedColliders: Record<string, GroundBunkerColliders> = {};

function computeColliders(type: string): GroundBunkerColliders {
    const def = MapObjectDefs[type];

    const colliders = {
        ground: [] as Collider[],
        bunker: [] as Collider[],
        gridBound: collider.createAabb(v2.create(0, 0), v2.create(1, 1)),
    };

    if (def === undefined) return colliders;

    switch (def.type) {
        case "obstacle": {
            colliders.ground.push(def.collision);
            break;
        }
        case "structure": {
            if (def.mapObstacleBounds) {
                colliders.ground.push(...def.mapObstacleBounds);
            }

            for (let i = 0; i < def.layers.length; i++) {
                const layer = def.layers[i];
                const layerColliders = getColliders(layer.type);
                const colliderLayer = i === 0 ? "ground" : "bunker";
                const rot = math.oriToRad(layer.ori);

                for (let j = 0; j < layerColliders.ground.length; j++) {
                    const coll = collider.transform(
                        layerColliders.ground[j],
                        layer.pos,
                        rot,
                        1,
                    );
                    colliders[colliderLayer].push(coll);
                }
                for (let j = 0; j < layerColliders.bunker.length; j++) {
                    const coll = collider.transform(
                        layerColliders.bunker[j],
                        layer.pos,
                        rot,
                        1,
                    );
                    colliders[colliderLayer].push(coll);
                }
            }

            if (def.bridgeLandBounds) {
                for (let i = 0; i < def.bridgeLandBounds.length; i++) {
                    colliders.ground.push(def.bridgeLandBounds[i]);
                }
            }
            if (def.bridgeWaterBounds) {
                for (let i = 0; i < def.bridgeWaterBounds.length; i++) {
                    colliders.ground.push(def.bridgeWaterBounds[i]);
                }
            }

            break;
        }
        case "building": {
            if (def.mapObstacleBounds) {
                colliders.ground.push(...def.mapObstacleBounds);
            }

            for (const object of def.mapObjects ?? []) {
                const type =
                    typeof object.type === "string" ? object.type : object.type?.()!;

                const objColliders = getColliders(type);
                const rot = math.oriToRad(object.ori);
                for (let j = 0; j < objColliders.ground.length; j++) {
                    const coll = collider.transform(
                        objColliders.ground[j],
                        object.pos,
                        rot,
                        1,
                    );
                    colliders.ground.push(coll);
                }
                for (let j = 0; j < objColliders.bunker.length; j++) {
                    const coll = collider.transform(
                        objColliders.bunker[j],
                        object.pos,
                        rot,
                        1,
                    );
                    colliders.bunker.push(coll);
                }
            }

            if (def.mapGroundPatches) {
                for (let i = 0; i < def.mapGroundPatches.length; i++) {
                    colliders.ground.push(def.mapGroundPatches[i].bound);
                }
            }

            for (let i = 0; i < def.floor.surfaces.length; i++) {
                const collisions = def.floor.surfaces[i].collision;
                for (let j = 0; j < collisions.length; j++) {
                    colliders.ground.push(collisions[j]);
                }
            }
            for (let i = 0; i < def.ceiling.zoomRegions.length; i++) {
                const region = def.ceiling.zoomRegions[i];
                if (region.zoomIn) {
                    colliders.ground.push(region.zoomIn);
                }
                if (region.zoomOut) {
                    colliders.ground.push(region.zoomOut);
                }
            }

            if (def.bridgeLandBounds) {
                for (let i = 0; i < def.bridgeLandBounds.length; i++) {
                    colliders.ground.push(def.bridgeLandBounds[i]);
                }
            }
            if (def.bridgeWaterBounds) {
                for (let i = 0; i < def.bridgeWaterBounds.length; i++) {
                    colliders.ground.push(def.bridgeWaterBounds[i]);
                }
            }

            break;
        }
        case "loot_spawner": {
            colliders.ground.push(collider.createCircle(v2.create(0.0, 0.0), 3.0));
            break;
        }
    }

    let aabbs: AABB[] = [];
    for (let i = 0; i < colliders.bunker.length; i++) {
        aabbs.push(collider.toAabb(colliders.bunker[i]));
    }
    for (let i = 0; i < colliders.ground.length; i++) {
        aabbs.push(collider.toAabb(colliders.ground[i]));
    }

    const bound = coldet.boundingAabb(aabbs);
    colliders.gridBound = collider.createAabb(bound.min, bound.max);

    return colliders;
}

export function getColliders(type: string) {
    if (cachedColliders[type]) {
        return cachedColliders[type];
    }
    const colliders = computeColliders(type);
    cachedColliders[type] = colliders;
    return colliders;
}

function transformColliders(
    colls: GroundBunkerColliders,
    pos: Vec2,
    rot: number,
    type: string,
) {
    let scale = 1;
    if (type === "building" || type === "structure") {
        scale = 1.5;
    }

    const newColls: GroundBunkerColliders = {
        ground: [],
        bunker: [],
        gridBound: collider.transform(colls.gridBound, pos, rot, scale) as AABB,
    };

    for (let i = 0; i < colls.ground.length; i++) {
        newColls.ground.push(collider.transform(colls.ground[i], pos, rot, scale));
    }
    for (let i = 0; i < colls.bunker.length; i++) {
        newColls.bunker.push(collider.transform(colls.bunker[i], pos, rot, scale));
    }

    return newColls;
}

function checkCollision(
    collsA: GroundBunkerColliders,
    collsB: Collider[],
    layer: number,
) {
    const collLayer = layer === 0 ? "ground" : "bunker";
    const layerColls = collsA[collLayer];

    for (let i = 0; i < layerColls.length; i++) {
        const collA = layerColls[i];
        for (let j = 0; j < collsB.length; j++) {
            const collB = collsB[j];
            if (coldet.test(collA, collB)) return true;
        }
    }
    return false;
}

export class GameMap {
    game: Game;

    width: number;
    height: number;

    scale: "large" | "small";

    center: Vec2;

    msg = new net.MapMsg();
    mapStream = new MsgStream(new ArrayBuffer(1 << 15));
    seed = util.randomInt(0, 2 ** 31);

    bounds: AABB;

    objectCount: Record<string, number> = {};
    incrementCount(type: string) {
        if (!this.objectCount[type]) {
            this.objectCount[type] = 1;
        } else {
            this.objectCount[type]++;
        }
    }

    grassInset: number;
    shoreInset: number;

    terrain!: ReturnType<typeof generateTerrain>;

    mapDef: MapDef;

    riverDescs: MapRiverData[] = [];

    riverMasks: Array<{ pos: Vec2; rad: number }>;

    placeSpawns: string[];
    placesToSpawn: Vec2[];
    playerSpawnPositions: Vec2[] = [];

    factionMode: boolean;
    perkMode: boolean;
    turkeyMode: boolean;
    woodsMode: boolean;
    desertMode: boolean;
    potatoMode: boolean;
    sniperMode: boolean;

    /** 0 for horizontal split, 1 for vertical split*/
    factionModeSplitOri: 0 | 1 = 0;

    lakes: Array<{
        river: MapRiverData;
        center: Vec2;
    }> = [];

    obstacles: Obstacle[] = [];
    buildings: Building[] = [];
    buildingsWithEmitters: Building[] = [];
    structures: Structure[] = [];
    bridges: Structure[] = [];

    constructor(game: Game) {
        this.game = game;

        const mapDef = (this.mapDef = util.cloneDeep(
            MapDefs[game.config.mapName],
        ) as MapDef);

        assert(mapDef, `Invalid map name: ${game.config.mapName}`);

        const scale = (this.scale = game.teamMode > TeamMode.Duo ? "large" : "small");

        const mapConfig = mapDef.mapGen.map;
        this.width = mapConfig.baseWidth * mapConfig.scale[scale] + mapConfig.extension;
        this.height = mapConfig.baseHeight * mapConfig.scale[scale] + mapConfig.extension;

        this.bounds = collider.createAabb(
            v2.create(0, 0),
            v2.create(this.width, this.height),
        );

        this.msg.mapName = game.config.mapName;
        this.msg.seed = this.seed;
        this.msg.width = this.width;
        this.msg.height = this.height;
        this.msg.rivers = this.riverDescs;
        this.center = v2.create(this.width / 2, this.height / 2);
        this.grassInset = this.msg.grassInset = mapConfig.grassInset;
        this.shoreInset = this.msg.shoreInset = mapConfig.shoreInset;

        this.factionMode = !!this.mapDef.gameMode.factionMode;
        this.perkMode = !!this.mapDef.gameMode.perkMode;
        this.turkeyMode = !!this.mapDef.gameMode.turkeyMode;
        this.woodsMode = !!this.mapDef.gameMode.woodsMode;
        this.desertMode = !!this.mapDef.gameMode.desertMode;
        this.potatoMode = !!this.mapDef.gameMode.potatoMode;
        this.sniperMode = !!this.mapDef.gameMode.sniperMode;

        if (this.factionMode) {
            this.factionModeSplitOri = util.randomInt(0, 1) as 0 | 1;
        }

        this.placeSpawns = [...this.mapDef.mapGen.customSpawnRules.placeSpawns];
        this.msg.places = [...this.mapDef.mapGen.places];

        this.placesToSpawn = this.mapDef.mapGen.places.map((place) => {
            return v2.create(
                place.pos.x * this.width,
                // places Y axis is inverted lol
                Math.abs(place.pos.y - 1) * this.height,
            );
        });

        this.riverMasks = this.mapDef.mapGen.map.rivers.masks.map((mask) => {
            return {
                pos: v2.create(mask.pos.x * this.width, mask.pos.y * this.height),
                rad: mask.rad,
            };
        });
    }

    init() {
        this.generateTerrain();

        this.terrain = generateTerrain(
            this.width,
            this.height,
            this.shoreInset,
            this.grassInset,
            this.riverDescs,
            this.seed,
        );

        this.generateObjects();

        this.mapStream.serializeMsg(MsgType.Map, this.msg);
    }

    update() {
        for (let i = 0; i < this.buildingsWithEmitters.length; i++) {
            const building = this.buildingsWithEmitters[i];

            const oldOccupiedState = building.occupied;

            building.occupied = false;

            const livingPlayers = this.game.playerBarn.livingPlayers;
            const players =
                livingPlayers.length < 20
                    ? livingPlayers
                    : this.game.grid.intersectCollider(building.emitterBounds);

            for (let i = 0; i < players.length; i++) {
                const player = players[i];
                if (player.__type !== ObjectType.Player) continue;
                if (player.dead) continue;
                if (!util.sameLayer(player.layer, building.layer)) continue;
                for (let j = 0; j < building.zoomRegions.length; j++) {
                    const region = building.zoomRegions[j];

                    if (!region.zoomIn) continue;
                    if (
                        coldet.testCircleAabb(
                            player.pos,
                            player.rad,
                            region.zoomIn.min,
                            region.zoomIn.max,
                        )
                    ) {
                        building.occupied = true;
                        break;
                    }
                }
                if (building.occupied) {
                    break;
                }
            }

            if (building.occupied !== oldOccupiedState) {
                building.setPartDirty();
            }
        }
    }

    randomPointOnMapEdge(randomGenerator?: (min?: number, max?: number) => number): Vec2 {
        if (!randomGenerator) {
            randomGenerator = (min = 0, max = 1) => Math.random() * (max - min) + min;
        }
        const side = util.randomInt(0, 3) as 0 | 1 | 2 | 3;
        switch (side) {
            case 0:
                return v2.create(this.width, randomGenerator(0, this.height));
            case 1:
                return v2.create(randomGenerator(0, this.width), this.height);
            case 2:
                return v2.create(0, randomGenerator(0, this.height));
            case 3:
                return v2.create(randomGenerator(0, this.width), 0);
        }
    }

    generateTerrain(): void {
        const mapConfig = this.mapDef.mapGen.map;

        const randomGenerator = util.seededRand(this.seed);

        //
        // Generate lakes
        //
        for (const lake of mapConfig.rivers.lakes) {
            const points: Vec2[] = [];

            const center = v2.add(
                v2.mulElems(v2.create(this.width, this.height), lake.spawnBound.pos),
                util.randomPointInCircle(lake.spawnBound.rad),
            );

            let len = lake.outerRad - lake.innerRad;
            const startLen = len;

            for (let i = 0; i < Math.PI * 2; i += randomGenerator(0.2, 0.3)) {
                const dir = v2.create(Math.sin(i), Math.cos(i));
                len += randomGenerator(-8, 8);
                len = math.clamp(len, startLen - 10, startLen + 10);

                points.push(v2.add(center, v2.mul(dir, len)));
            }

            points.push(v2.copy(points[0]));

            const river = {
                width: (lake.outerRad - lake.innerRad) / 2,
                points,
                looped: true,
            };

            this.riverDescs.push(river);

            this.lakes.push({
                river,
                center,
            });
        }

        //
        // Generate rivers
        //

        const riverCreator = new RiverCreator(this, randomGenerator);
        const widths = util.weightedRandom(mapConfig.rivers.weights).widths;
        for (let i = 0; i < widths.length; i++) {
            //in factions mode, we always assume the first width in widths is the main faction river
            const isFactionRiver = this.factionMode && i == 0;

            let riverPoints: Vec2[];
            do {
                riverPoints = riverCreator.create(isFactionRiver);
            } while (riverPoints.length < 2);

            this.riverDescs.push({
                width: widths[i],
                points: riverPoints,
                looped: false,
            });
        }
    }

    /** only called inside generateObjects, separates logic into function to simplify control flow */
    private generateBridges(mapDef: MapDef): void {
        //factions mode always had one extra large bridge on each side of the river town's extra large bridge.
        if (this.factionMode && this.buildings.find((b) => b.type == "river_town_01")) {
            this.genBridge(
                mapDef.mapGen.bridgeTypes.xlarge,
                this.terrain.rivers[0],
                0.25,
            );
            this.genBridge(
                mapDef.mapGen.bridgeTypes.xlarge,
                this.terrain.rivers[0],
                0.75,
            );
            return;
        }

        // generate 0-3 bridges on random rivers for normal modes

        type BridgeSize = "medium" | "large" | "xlarge";
        function getBridgeSize(river: River): BridgeSize | null {
            const riverWidth = river.waterWidth;
            if (riverWidth < 9 && riverWidth > 4) {
                return "medium";
            } else if (riverWidth < 20 && riverWidth > 8) {
                return "large";
            } else if (riverWidth > 20) {
                return "xlarge";
            }

            return null;
        }

        // maximum amount of a specific bridge that can spawn
        const maxBridges: Record<BridgeSize, number> = {
            medium: 3,
            large: 2,
            xlarge: 0,
        };

        const nBridges = util.randomInt(0, 3);
        if (nBridges == 0) return;

        let riversToPick = this.terrain.rivers.filter((river) => {
            // looped river is a lake, no bridges on lakes
            if (river.looped) return false;

            // can't pick a river that has a bridge which can't spawn
            const bridgeSize = getBridgeSize(river);
            return bridgeSize && maxBridges[bridgeSize] != 0;
        });
        if (riversToPick.length == 0) return;

        const bridgesGenerated: Record<BridgeSize, number> = {
            medium: 0,
            large: 0,
            xlarge: 0,
        };

        for (let i = 0; i < nBridges; i++) {
            const r = util.randomInt(0, riversToPick.length - 1);
            const randomRiver = riversToPick[r];
            const bridgeSize = getBridgeSize(randomRiver);
            if (!bridgeSize) continue;

            const bridgeType = mapDef.mapGen.bridgeTypes[bridgeSize];
            if (!bridgeType) continue;

            let attempts = 0;
            while (attempts++ < 50) {
                if (this.genBridge(bridgeType, randomRiver)) {
                    bridgesGenerated[bridgeSize]++;
                    // if you can't spawn any more of a specific bridge size, can't pick any rivers associated with that bridgeSize
                    if (bridgesGenerated[bridgeSize] >= maxBridges[bridgeSize]) {
                        riversToPick = riversToPick.filter(
                            (river) => getBridgeSize(river) != bridgeSize,
                        );
                        if (riversToPick.length == 0) return;
                    }
                    break;
                }
            }
        }
    }

    generateObjects(): void {
        const mapDef = this.mapDef;

        for (const customSpawnRule of mapDef.mapGen.customSpawnRules.locationSpawns) {
            let pos: Vec2 | undefined;
            let ori: number | undefined;

            const center = v2.create(
                customSpawnRule.pos.x * this.width,
                customSpawnRule.pos.y * this.height,
            );

            let attempts = 0;
            while (attempts++ < GameMap.MaxSpawnAttempts) {
                ori = this.getOriAndScale(customSpawnRule.type).ori;
                pos = v2.add(util.randomPointInCircle(customSpawnRule.rad), center);

                if (!this.canSpawn(customSpawnRule.type, pos, ori)) continue;
                this.genAuto(customSpawnRule.type, pos);
                break;
            }
        }

        // @NOTE: see comment on defs/maps/baseDefs.ts about single item arrays
        const fixedSpawns = mapDef.mapGen.fixedSpawns[0];
        const importantSpawns = mapDef.mapGen.importantSpawns;
        const types = Object.keys(fixedSpawns)
            .sort((a, b) => {
                const boundsA = collider.toAabb(mapHelpers.getBoundingCollider(a));
                const boundsB = collider.toAabb(mapHelpers.getBoundingCollider(b));

                const widthA = boundsA.max.x - boundsA.min.x;
                const heightA = boundsA.max.y - boundsA.min.y;
                const sizeA = widthA + heightA / 2;

                const widthB = boundsB.max.x - boundsB.min.x;
                const heightB = boundsB.max.y - boundsB.min.y;
                const sizeB = widthB + heightB / 2;

                return sizeA > sizeB ? -1 : 1;
            })
            .sort((a, b) => {
                const includesA = importantSpawns.includes(a);
                const includesB = importantSpawns.includes(b);

                if (includesA && includesB) return 0;
                if (includesA) return -1;
                if (includesB) return 1;

                return 1;
            });

        //buildings that contain bridges such as ocean/river shacks and river town
        const bridgeTypes = [];
        for (let i = 0; i < types.length; i++) {
            const type = types[i];
            const def = MapObjectDefs[type];
            if (def.terrain?.bridge) {
                bridgeTypes.push(type);
                types.splice(i, 1);
                i--;
            }
        }

        for (let i = 0; i < bridgeTypes.length; i++) {
            const type = bridgeTypes[i];
            let count = fixedSpawns[type];
            if (typeof count !== "number") {
                if ("small" in count) {
                    count = count[this.scale];
                } else {
                    count = Math.random() < count.odds ? 1 : 0;
                }
            }
            if ((this.objectCount[type] ?? 0) < count) {
                this.genFromMapDef(type, count);
            }
        }

        if (this.riverDescs.length) {
            //
            // Generate bridges
            //
            this.generateBridges(mapDef);

            //
            // Generate river cabins
            //
            for (const type in mapDef.mapGen.riverCabins) {
                const count = mapDef.mapGen.riverCabins[type];
                for (let i = 0; i < count; i++) {
                    this.genRiverCabin(type);
                }
            }

            //
            // Generate river rocks and bushes
            //
            const riverObjs = {
                stone_03: 3,
                bush_04: 1.2,
            };
            for (const type in riverObjs) {
                for (const river of this.terrain.rivers) {
                    const amount = math.min(
                        river.waterWidth * riverObjs[type as keyof typeof riverObjs],
                        30,
                    );

                    for (let i = 0; i < amount; i++) {
                        this.genOnRiver(type, river);
                    }
                }
            }
        }

        for (let i = 0; i < types.length; i++) {
            const type = types[i];
            let count = fixedSpawns[type];
            if (typeof count !== "number") {
                if ("small" in count) {
                    count = count[this.scale];
                } else {
                    count = Math.random() < count.odds ? 1 : 0;
                }
            }
            if ((this.objectCount[type] ?? 0) < count) {
                this.genFromMapDef(type, count);
            }
        }

        const randomSpawns = mapDef.mapGen.randomSpawns[0];
        if (randomSpawns) {
            const spawns = [...randomSpawns.spawns];
            for (let i = 0; i < randomSpawns.choose; i++) {
                const idx = util.randomInt(0, spawns.length - 1);
                const spawn = spawns.splice(idx, 1)[0];
                this.genFromMapDef(spawn, 1);
            }
        }

        const densitySpawns = mapDef.mapGen.densitySpawns[0];
        for (const type in densitySpawns) {
            // TODO: figure out density spawn amount algorithm
            const count = Math.round(densitySpawns[type] * 1.35);
            this.genFromMapDef(type, count);
        }
    }

    genFromMapDef(type: string, count: number): void {
        for (let i = 0; i < count; i++) {
            const def = MapObjectDefs[type];

            if (def.terrain?.waterEdge) {
                this.genOnWaterEdge(type);
            } else if (def.terrain?.river) {
                this.genOnRiver(type);
            } else if (def.terrain?.bridge) {
                this.genBridge(type);
            } else if (def.terrain?.lakeCenter) {
                this.genOnLakeCenter(type);
            } else if (def.terrain?.grass) {
                this.genOnGrass(type);
            } else if (def.terrain?.beach) {
                this.genOnBeach(type);
            } else {
                this.genOnGrass(type);
            }
        }
    }

    genAuto(
        type: string,
        pos: Vec2,
        layer = 0,
        ori?: number,
        scale?: number,
        parentId?: number,
        puzzlePiece?: string,
        ignoreMapSpawnReplacement?: boolean,
    ) {
        const def = MapObjectDefs[type];

        const spawnReplacements = this.mapDef.mapGen.spawnReplacements[0];
        if (spawnReplacements[type] && !ignoreMapSpawnReplacement)
            type = spawnReplacements[type];

        this.clampToMapBounds(pos);

        switch (def.type) {
            case "obstacle":
                return this.genObstacle(
                    type,
                    pos,
                    layer,
                    ori,
                    scale,
                    parentId,
                    puzzlePiece,
                );
            case "building":
                return this.genBuilding(type, pos, layer, ori, parentId);
            case "structure":
                return this.genStructure(type, pos, layer, ori);
            case "decal": {
                const decal = this.game.decalBarn.addDecal(type, pos, layer, ori, scale);
                return decal;
            }
            case "loot_spawner":
                for (const tier of def.loot) {
                    const items = this.game.lootBarn.getLootTable(tier.tier!);

                    for (const item of items) {
                        this.game.lootBarn.addLoot(
                            item.name,
                            pos,
                            layer,
                            item.count,
                            undefined,
                            0,
                        );
                    }
                }
                break;
        }
    }

    static collidableTypes = [
        ObjectType.Obstacle,
        ObjectType.Building,
        ObjectType.Structure,
    ];

    /**
     * Checks if a map object can spawn at a given position, orientation and scale
     */
    canSpawn(type: string, pos: Vec2, ori: number, scale = 1): boolean {
        const def = MapObjectDefs[type];

        const rot = math.oriToRad(ori);

        const collsA = transformColliders(getColliders(type), pos, rot, def.type);

        const objs = this.game.grid.intersectCollider(collsA.gridBound);

        for (let i = 0; i < objs.length; i++) {
            if (!GameMap.collidableTypes.includes(objs[i].__type)) continue;

            const obj = objs[i] as Obstacle | Building | Structure;
            if (checkCollision(collsA, obj.mapObstacleBounds, obj.layer)) {
                return false;
            }
        }

        // checks for bridges and other river structures like crossing bunker
        if ((def.type === "structure" || def.type === "building") && def.terrain.bridge) {
            for (let i = 0; i < this.bridges.length; i++) {
                const otherBridge = this.bridges[i];
                const thisBounds = mapHelpers.getBridgeOverlapCollider(type, pos, rot, 1);
                const thatBounds = mapHelpers.getBridgeOverlapCollider(
                    otherBridge.type,
                    otherBridge.pos,
                    otherBridge.rot,
                    1,
                );
                if (
                    coldet.testAabbAabb(
                        thisBounds.min,
                        thisBounds.max,
                        thatBounds.min,
                        thatBounds.max,
                    )
                ) {
                    return false;
                }
            }

            // bridge land bounds are AABBs that should always be on land and never on water
            if (def.bridgeLandBounds) {
                for (let i = 0; i < def.bridgeLandBounds.length; i++) {
                    const bound = collider.transform(
                        def.bridgeLandBounds[i],
                        pos,
                        rot,
                        1,
                    ) as AABB;

                    // check all 4 corners of the AABB
                    const points = collider.getPoints(bound);

                    for (let j = 0; j < points.length; j++) {
                        if (this.isOnWater(points[j], 0)) {
                            return false;
                        }
                    }
                }
            }

            // and water bounds should always be inside water
            if (def.bridgeWaterBounds) {
                for (let i = 0; i < def.bridgeWaterBounds.length; i++) {
                    const bound = collider.transform(
                        def.bridgeWaterBounds[i],
                        pos,
                        rot,
                        1,
                    ) as AABB;

                    // check all 4 corners of the AABB
                    const points = collider.getPoints(bound);

                    for (let j = 0; j < points.length; j++) {
                        if (!this.isOnWater(points[j], 0)) return false;
                    }
                }
            }
        }

        if (!def.terrain?.river && !def.terrain?.bridge) {
            const boundCollider = collider.transform(
                mapHelpers.getBoundingCollider(type),
                pos,
                rot,
                scale,
            );

            const aabb = collider.toAabb(boundCollider);
            for (let i = 0; i < this.terrain.rivers.length; i++) {
                const river = this.terrain.rivers[i];

                if (!coldet.test(boundCollider, river.aabb)) continue;

                if (
                    !def.terrain?.riverShore &&
                    (math.pointInsidePolygon(pos, river.shorePoly) ||
                        coldet.testAabbPolygon(aabb.min, aabb.max, river.shorePoly))
                ) {
                    return false;
                }

                if (math.pointInsidePolygon(pos, river.waterPoly)) {
                    return false;
                }

                if (coldet.testAabbPolygon(aabb.min, aabb.max, river.waterPoly)) {
                    return false;
                }
            }
        }

        if (def.terrain?.river) {
            const inset = this.shoreInset / 2;
            const mapBound = collider.createAabb(
                v2.create(inset, inset),
                v2.create(this.width - inset, this.height - inset),
            );
            if (!coldet.testPointAabb(pos, mapBound.min, mapBound.max)) {
                return false;
            }
        }

        return true;
    }

    getOriAndScale(type: string): { ori: number; scale: number } {
        let ori = 0;
        let scale = 1;

        const def = MapObjectDefs[type];
        if (def.type === "building" || def.type === "structure") {
            if ("oris" in def) {
                ori = def.oris![util.randomInt(0, def.oris!.length - 1)];
            } else {
                if (this.factionMode && type == "river_town_01") {
                    ori = this.factionModeSplitOri;
                } else {
                    ori = def.ori ?? util.randomInt(0, 3);
                }
            }
        } else if (def.type === "obstacle") {
            scale = util.random(def.scale.createMin, def.scale.createMax);
        }

        return { ori, scale };
    }

    static MaxSpawnAttempts = 1000;

    genOnWaterEdge(type: string): void {
        const def = MapObjectDefs[type] as BuildingDef | StructureDef;
        // safety check + makes ts shut up about it being possibly undefined
        const waterEdge = def.terrain.waterEdge;
        if (!waterEdge) return;

        const aabb = collider.toAabb(mapHelpers.getBoundingCollider(type));
        // const width = aabb.max.x - aabb.min.x;
        const height = aabb.max.y - aabb.min.y;

        let ori: number;
        let pos: Vec2 | undefined;

        let attempts = 0;
        let collided = true;

        const edgeRot = Math.atan2(waterEdge.dir.y, waterEdge.dir.x);

        while (attempts++ < GameMap.MaxSpawnAttempts && collided) {
            collided = false;

            let side: number;
            if (this.factionMode && "teamId" in def && def.teamId) {
                //this formula does the same thing but isn't readable: ((this.factionModeSplitOri ^ 1) + 2) - ((def.teamId - 1) * 2);
                switch (this.factionModeSplitOri) {
                    case 0:
                        side = def.teamId == 1 ? 3 : 1; //3 is bottom for red team and 1 is top for blue team
                        break;
                    case 1:
                        side = def.teamId == 1 ? 2 : 0; //2 is left for red team and 0 is right for blue team
                        break;
                }
            } else {
                side = util.randomInt(0, 3);
            }

            const rot = math.oriToRad(side);

            ori = math.radToOri(rot - edgeRot);

            let dist = util.random(waterEdge.distMin, waterEdge.distMax);

            // TODO: figure out how to use distance values from definitions

            if (type.includes("hut")) {
                dist -= 16;
            } else if (type === "warehouse_complex_01") {
                dist -= this.shoreInset - 6.5;
            } else if (type === "warehouse_complex_02") {
                dist -= this.shoreInset - 6.5;
            } else if (type === "bunker_structure_04") {
                dist -= 24;
            }

            const min = v2.create(this.shoreInset + dist, this.shoreInset + height);
            const max = v2.create(min.x, this.height - this.shoreInset - height);

            // generate a position and rotate it based on the orientation and map center
            const tempPos = {
                x: util.random(min.x, max.x),
                y: util.random(min.y, max.y),
            };
            const offset = v2.sub(this.center, tempPos);
            pos = v2.add(this.center, v2.rotate(offset, rot));

            if (!this.canSpawn(type, pos, ori!, 1)) {
                collided = true;
            }
        }

        if (pos && attempts < GameMap.MaxSpawnAttempts) {
            this.genAuto(type, pos, 0, ori!, 1);
        }
    }

    genOnGrass(type: string) {
        const bounds = collider.toAabb(mapHelpers.getBoundingCollider(type));

        let { ori, scale } = this.getOriAndScale(type);

        let width = bounds.max.x - bounds.min.x;
        let height = bounds.max.y - bounds.min.y;

        const def = MapObjectDefs[type];
        if (!def.terrain?.beach) {
            width += this.grassInset;
            height += this.grassInset;
        }

        let getPos = () => {
            const spawnMin = v2.create(this.shoreInset + width, this.shoreInset + height);
            const spawnMax = v2.create(
                this.width - this.shoreInset - width,
                this.height - this.shoreInset - height,
            );

            const spawnAabb = collider.createAabb(spawnMin, spawnMax);

            if (this.factionMode) {
                //obstacles, buildings, and structures that need to spawn on either team's side
                //doesn't matter which team, just as long as theyre grouped with the team specific buildings
                const edgeObjects = [
                    "warehouse_01f",
                    "house_red_01",
                    "house_red_02",
                    "barn_01",
                ];

                //obstacles, buildings, and structures that need to spawn away from the sides and closer to the center river
                const centerObjects = [
                    "greenhouse_01",
                    "bunker_structure_03", //storm bunker
                ];

                const divisions = 10;
                let divisionIdx: number;
                if ("teamId" in def && def.teamId) {
                    const teamId = def.teamId;
                    //picks either of the furthest divisions from the center
                    divisionIdx = (teamId - 1) * (divisions - 1);
                } else if (edgeObjects.includes(type)) {
                    const teamId = util.randomInt(1, 2);
                    //picks either of the furthest divisions from the center
                    divisionIdx = (teamId - 1) * (divisions - 1);
                } else if (centerObjects.includes(type)) {
                    //picks any "non-furthest" division
                    divisionIdx = util.randomInt(1, divisions - 2);
                } else {
                    return util.randomPointInAabb(spawnAabb);
                }

                const rad = math.oriToRad(this.factionModeSplitOri ^ 1);
                const vec = math.rad2Direction(rad);
                return util.randomPointInAabb(
                    coldet.divideAabb(spawnAabb, vec, divisions)[divisionIdx],
                );
            }
            return util.randomPointInAabb(spawnAabb);
        };

        let attempts = 0;

        let place: Vec2 | undefined = undefined;
        if (this.placesToSpawn.length && this.placeSpawns.includes(type)) {
            getPos = () => {
                place =
                    this.placesToSpawn[
                        Math.floor(Math.random() * this.placeSpawns.length)
                    ];
                return math.v2Clamp(
                    v2.add(
                        place,
                        v2.mulElems(
                            v2.mul(v2.randomUnit(), 0.5),
                            v2.create(width + attempts * 2, height + attempts * 2),
                        ),
                    ),
                    v2.create(this.shoreInset + width, this.shoreInset + height),
                    v2.create(
                        this.width - this.shoreInset - width,
                        this.height - this.shoreInset - height,
                    ),
                );
            };
        }

        let pos: Vec2 | undefined;
        let collided = true;

        while (attempts++ < GameMap.MaxSpawnAttempts && collided) {
            collided = false;

            ori = this.getOriAndScale(type).ori;
            pos = getPos();

            if (collided) continue;

            if (!this.canSpawn(type, pos, ori, scale)) {
                collided = true;
            }
        }

        if (pos && attempts < GameMap.MaxSpawnAttempts) {
            this.genAuto(type, pos, 0, ori, scale);

            if (place) {
                this.placesToSpawn.splice(this.placesToSpawn.indexOf(place), 1);
                this.placeSpawns.splice(this.placeSpawns.indexOf(type), 1);
            }
        } else {
            this.game.logger.warn("Failed to generate building", type, "on grass");
        }
    }

    genOnBeach(type: string) {
        const aabb = collider.toAabb(mapHelpers.getBoundingCollider(type));
        const width = aabb.max.x - aabb.min.x;
        const height = aabb.max.y - aabb.min.y;
        const { ori, scale } = this.getOriAndScale(type);

        let pos: Vec2 | undefined;

        let attempts = 0;
        let collided = true;

        while (attempts++ < GameMap.MaxSpawnAttempts && collided) {
            collided = false;

            const side = util.randomInt(0, 3);
            const rot = math.oriToRad(side);

            const min = v2.create(
                this.shoreInset + width,
                this.shoreInset + width + this.grassInset,
            );
            const max = v2.create(min.x, this.height - this.shoreInset - height);

            // generate a position and rotate it based on the orientation and map center
            const tempPos = {
                x: util.random(min.x, max.x),
                y: util.random(min.y, max.y),
            };
            const offset = v2.sub(this.center, tempPos);
            pos = v2.add(this.center, v2.rotate(offset, rot));

            if (!this.canSpawn(type, pos, ori, 1)) {
                collided = true;
            }
        }

        if (pos && attempts < GameMap.MaxSpawnAttempts) {
            this.genAuto(type, pos, 0, ori, scale);
        }
    }

    /**
     * progress is a normalized number from 0-1 describing where on the river the bridge should generate
     *
     * 0 would be at the start, 1 would be at the end, 0.5 would be in the middle, etc
     */
    genBridge(type: string, river?: River, progress?: number): boolean {
        if (this.terrain.rivers.length == 0) {
            return false;
        }
        let { ori, scale } = this.getOriAndScale(type);

        const def = MapObjectDefs[type];

        let rivers = this.terrain.rivers;
        if (type === "bunker_structure_05") {
            rivers = rivers.filter((r) => r.waterWidth > 8);
            if (!rivers.length) return false;
        }

        const getPosAndOri = () => {
            const oriAndScale = this.getOriAndScale(type);
            ori = oriAndScale.ori;
            scale = oriAndScale.scale;

            let t: number;
            if (progress) {
                //hack until i can find a better solution
                //sometimes the position exactly at "progress" is invalid so "canSpawn()" will always fail
                //we avoid this by adding a tiny bit of random variation to the position so it'll eventually find a valid one
                t = util.random(progress - 0.08, progress + 0.08);
                t = math.clamp(t, 0, 1);
            } else if (type == "river_town_01") {
                t = util.random(0.45, 0.55); //0.5 is middle, just need to vary it a little
            } else {
                t = util.random(0, 1);
            }

            let finalRiver: River;
            if (type == "river_town_01") {
                finalRiver = rivers[0];
            } else {
                finalRiver = river ?? rivers[util.randomInt(0, rivers.length - 1)];
            }

            let pos = finalRiver.spline.getPos(t);

            if (def.terrain?.nearbyRiver) {
                const otherSide = Math.random() < 0.5;

                const offset = finalRiver.waterWidth * 2 * (otherSide ? -1 : 1);
                let norm = finalRiver.spline.getNormal(t);
                v2.set(pos, v2.add(pos, v2.mul(norm, offset)));

                const finalT = finalRiver.spline.getClosestTtoPoint(pos);
                const finalNorm = finalRiver.spline.getNormal(finalT);

                const riverOri =
                    (math.radToOri(Math.atan2(finalNorm.y, finalNorm.x)) +
                        (otherSide ? 2 : 0)) %
                    4;
                ori = (def.terrain.nearbyRiver.facingOri + riverOri) % 4;
            } else {
                const norm = finalRiver.spline.getNormal(t);
                ori = math.radToOri(Math.atan2(norm.y, norm.x));
            }
            if (type === "bunker_structure_05") {
                ori %= 2;
            }
            if (type == "river_town_01") {
                // we flip the orientation because river town has red on left and blue on right by default
                // the faction mode ori that gets us a left/right split vs top/bottom split is 1
                // so of course we need to flip this value and vice versa for the other case
                ori = this.factionModeSplitOri ^ 1;
            }

            return { pos, ori };
        };

        let attempts = 0;
        while (attempts++ < GameMap.MaxSpawnAttempts) {
            const { pos, ori } = getPosAndOri();

            if (!this.canSpawn(type, pos, ori, scale)) {
                continue;
            }

            const obj = this.genAuto(type, pos, 0, ori, scale);
            if (obj?.__type === ObjectType.Structure) {
                this.bridges.push(obj);
            }
            return true;
        }
        return false;
    }

    genOnRiver(type: string, river?: River) {
        let rivers = this.terrain.rivers;
        if (!rivers.length) return;
        river = river ?? rivers[util.randomInt(0, rivers.length - 1)];
        const t = util.random(0, 1);
        const offset = util.random(0, river.waterWidth);
        const pos = v2.add(river.spline.getPos(t), v2.mul(v2.randomUnit(), offset));
        if (this.canSpawn(type, pos, 0)) {
            this.genAuto(type, pos, 0);
        }
    }

    genRiverCabin(type: string) {
        const inset = this.grassInset + this.shoreInset;
        const mapBound = collider.createAabb(
            v2.create(inset, inset),
            v2.create(this.width - inset, this.height - inset),
        );

        const def = MapObjectDefs[type] as BuildingDef;

        const bound = mapHelpers.getBoundingCollider(type) as AABB;
        const height = bound.max.y - bound.min.y / 2;

        let river =
            this.terrain.rivers[util.randomInt(0, this.terrain.rivers.length - 1)];
        const getPosAndOri = () => {
            const t = util.random(0.1, 0.9);
            river =
                this.terrain.rivers[util.randomInt(0, this.terrain.rivers.length - 1)];
            let pos = river.spline.getPos(t);

            const otherSide = Math.random() < 0.5;

            const offset = (river.waterWidth + height) * (otherSide ? -1 : 1);
            let norm = river.spline.getNormal(t);
            v2.set(pos, v2.add(pos, v2.mul(norm, offset)));

            const finalT = river.spline.getClosestTtoPoint(pos);
            const finalNorm = river.spline.getNormal(finalT);

            const riverOri =
                (math.radToOri(Math.atan2(finalNorm.y, finalNorm.x)) +
                    (otherSide ? 2 : 0)) %
                4;
            const ori = (def.terrain.nearbyRiver!.facingOri + riverOri) % 4;

            return { pos, ori, otherSide };
        };

        let attempts = 0;

        while (attempts++ < GameMap.MaxSpawnAttempts) {
            const { pos, ori, otherSide } = getPosAndOri();
            const bounds = collider.transform(bound, pos, math.oriToRad(ori), 1) as AABB;
            if (
                !coldet.aabbInsideAabb(bounds.min, bounds.max, mapBound.min, mapBound.max)
            ) {
                continue;
            }

            if (!this.canSpawn(type, pos, ori, 1)) {
                continue;
            }

            this.genAuto(type, pos, 0, ori);
            this.genCabinDock(river, pos, ori, otherSide);
            break;
        }
    }

    genCabinDock(river: River, pos: Vec2, ori: number, otherSide: boolean) {
        const type = "dock_01";
        let attempts = 0;

        while (attempts < GameMap.MaxSpawnAttempts) {
            attempts++;
            const t = river.spline.getClosestTtoPoint(pos) + util.random(-0.02, 0.02);
            const riverPos = river.spline.getPos(t);
            const riverNorm = river.spline.getNormal(t);

            const offset = river.waterWidth * (otherSide ? -1 : 1);
            const dockPos = v2.add(riverPos, v2.mul(riverNorm, offset));

            if (this.canSpawn(type, dockPos, ori)) {
                this.genAuto(type, dockPos, 0, ori);
                break;
            }
        }
    }

    genOnLakeCenter(type: string) {
        const lake = this.lakes[util.randomInt(0, this.lakes.length - 1)];
        const pos = lake.center;

        this.genAuto(type, pos, 0, 0);
    }

    genObstacle(
        type: string,
        pos: Vec2,
        layer = 0,
        ori?: number,
        scale?: number,
        buildingId?: number,
        puzzlePiece?: string,
    ): Obstacle {
        const def = MapObjectDefs[type] as ObstacleDef;

        scale = scale ?? util.random(def.scale.createMin, def.scale.createMax);

        const obstacle = new Obstacle(
            this.game,
            pos,
            type,
            layer,
            ori,
            scale,
            buildingId,
            puzzlePiece,
        );
        this.game.objectRegister.register(obstacle);
        this.obstacles.push(obstacle);

        if (def.map?.display && layer === 0) this.msg.objects.push(obstacle);
        this.incrementCount(type);

        return obstacle;
    }

    genOutfitObstacle(type: string, player: Player) {
        const def = MapObjectDefs[type] as ObstacleDef;

        const obstacle = new Obstacle(
            this.game,
            player.pos,
            type,
            player.layer,
            0,
            def.scale.createMax,
            undefined,
            undefined,
            true,
        );
        obstacle.skinPlayerId = player.__id;
        this.game.objectRegister.register(obstacle);
        this.obstacles.push(obstacle);
        return obstacle;
    }

    genBuilding(
        type: string,
        pos: Vec2,
        layer = 0,
        ori?: number,
        parentId?: number,
    ): Building {
        const def = MapObjectDefs[type] as BuildingDef;

        ori = ori ?? def.ori ?? util.randomInt(0, 3);

        const building = new Building(this.game, type, pos, ori, layer, parentId);
        this.game.objectRegister.register(building);
        this.buildings.push(building);
        if (building.hasOccupiedEmitters) {
            this.buildingsWithEmitters.push(building);
        }

        if (def.map?.display && layer === 0) this.msg.objects.push(building);

        for (const mapObject of def.mapObjects ?? []) {
            let partType = mapObject.type;

            if (typeof partType !== "string") {
                partType = partType?.();
            }
            if (!partType) continue;

            let partOri: number;
            if (mapObject.inheritOri === false) partOri = mapObject.ori;
            else partOri = (mapObject.ori + ori) % 4;

            const partPos = math.addAdjust(pos, mapObject.pos, ori);

            const obj = this.genAuto(
                partType,
                partPos,
                layer,
                partOri,
                mapObject.scale,
                building.__id,
                mapObject.puzzlePiece,
                mapObject.ignoreMapSpawnReplacement,
            );

            if (obj) building.childObjects.push(obj);
        }

        for (const patch of def.mapGroundPatches ?? []) {
            this.msg.groundPatches.push({
                min: math.addAdjust(pos, patch.bound.min, ori),
                max: math.addAdjust(pos, patch.bound.max, ori),
                color: patch.color,
                roughness: patch.roughness ?? 0,
                offsetDist: patch.offsetDist ?? 0,
                order: patch.order ?? 0,
                useAsMapShape: patch.useAsMapShape ?? true,
            });
        }

        this.incrementCount(type);
        return building;
    }

    genStructure(type: string, pos: Vec2, layer = 0, ori?: number): Structure {
        const def = MapObjectDefs[type] as StructureDef;

        ori = ori ?? def.ori ?? util.randomInt(0, 3);

        const structure = new Structure(this.game, type, pos, layer, ori);
        this.game.objectRegister.register(structure);
        this.structures.push(structure);

        layer = 0;
        for (const layerDef of def.layers) {
            const building = this.genBuilding(
                layerDef.type,
                math.addAdjust(pos, layerDef.pos, ori),
                layer,
                (layerDef.ori + ori) % 4,
                structure.__id,
            );
            layer++;
            structure.layerObjIds.push(building.__id);
        }

        this.incrementCount(type);
        return structure;
    }

    getSpawnPos(group?: Group, team?: Team): Vec2 {
        if (Config.debug.spawnMode === "fixed") {
            return v2.copy(Config.debug.spawnPos ?? this.center);
        }

        let getPos: () => Vec2;

        if (!group?.players[0]) {
            const spawnMin = v2.create(this.shoreInset, this.shoreInset);
            const spawnMax = v2.create(
                this.width - this.shoreInset,
                this.height - this.shoreInset,
            );
            let spawnAabb: { min: Vec2; max: Vec2 } = collider.createAabb(
                spawnMin,
                spawnMax,
            );

            if (this.factionMode && team) {
                const rad = math.oriToRad(this.factionModeSplitOri ^ 1);
                const vec = v2.create(Math.cos(rad), Math.sin(rad));
                const idx = team.teamId - 1;

                //farthest fifth from the center of the team's half. 1/5 * 1/2 = 1/10 hence the 10 divisions
                const divisions = 10;
                spawnAabb = coldet.divideAabb(spawnAabb, vec, divisions)[
                    idx * (divisions - 1)
                ];
            }

            getPos = () => {
                return util.randomPointInAabb(spawnAabb);
            };
        } else {
            const rad = GameConfig.player.teammateSpawnRadius;
            const pos = group.players[0].pos;
            getPos = () => {
                return v2.add(pos, util.randomPointInCircle(rad));
            };
        }
        return this.getRandomSpawnPos(getPos);
    }

    getRandomSpawnPos(getPos: () => Vec2, group?: Group, team?: Team): Vec2 {
        let attempts = 0;
        let collided = true;

        const circle = collider.createCircle(getPos(), GameConfig.player.radius);

        while (attempts++ < 500 && collided) {
            collided = false;
            v2.set(circle.pos, getPos());

            if (this.game.gas.isOutSideSafeZone(circle.pos)) {
                collided = true;
                continue;
            }

            if (this.isOnWater(circle.pos, 0)) {
                collided = true;
                continue;
            }

            const objs = this.game.grid.intersectCollider(circle);

            for (let i = 0; i < objs.length; i++) {
                const obj = objs[i];
                if (obj.layer !== 0) continue;
                if (
                    obj.__type === ObjectType.Obstacle &&
                    coldet.test(obj.collider, circle)
                ) {
                    collided = true;
                    break;
                }

                if (
                    obj.__type === ObjectType.Building ||
                    obj.__type === ObjectType.Structure
                ) {
                    for (const bound of obj.mapObstacleBounds) {
                        if (coldet.test(bound, circle)) {
                            collided = true;
                            break;
                        }
                    }
                    if (collided) break;
                }
            }

            for (let i = 0; i < this.game.playerBarn.livingPlayers.length; i++) {
                const player = this.game.playerBarn.livingPlayers[i];
                if (group && player.groupId === group.groupId) continue;
                if (team && player.teamId === team.teamId) continue;

                if (v2.distance(player.pos, circle.pos) < GameConfig.player.minSpawnRad) {
                    collided = true;
                    break;
                }
                //prevent players from spawning in already spawned areas
                for (const spawnPos of this.playerSpawnPositions) {
                    // {{ edit_2 }}
                    if (
                        v2.distance(spawnPos, circle.pos) <
                        GameConfig.player.minPosSpawnRad
                    ) {
                        collided = true;
                        break;
                    }
                }
            }

            if (!collided) {
                this.playerSpawnPositions.push(circle.pos); // {{ edit_3 }}
            }

            // prevent players from spawning bellow airdrops or grenades

            for (let i = 0; i < this.game.airdropBarn.airdrops.length; i++) {
                const airdrop = this.game.airdropBarn.airdrops[i];
                if (v2.distance(airdrop.pos, circle.pos) < 8) {
                    collided = true;
                    break;
                }
            }

            for (let i = 0; i < this.game.projectileBarn.projectiles.length; i++) {
                const projectile = this.game.projectileBarn.projectiles[i];
                if (projectile.layer !== 0) continue;
                const player = this.game.objectRegister.getById(projectile.playerId);
                if (player?.__type !== ObjectType.Player) continue;
                if (group && player.groupId === group.groupId) continue;
                if (team && player.teamId === team.teamId) continue;

                if (v2.distance(projectile.pos, circle.pos) < 16) {
                    collided = true;
                    break;
                }
            }
        }

        return circle.pos;
    }

    clampToMapBounds(pos: Vec2, rad = 0) {
        v2.set(
            pos,
            math.v2Clamp(
                pos,
                v2.create(rad, rad),
                v2.create(this.width - rad, this.height - rad),
            ),
        );
    }

    getGroundSurface(pos: Vec2, layer: number) {
        const groundSurface = (type: string, river?: River) => {
            return { type, river };
        };

        const objs = this.game.grid.intersectPos(pos);

        // Check decals
        for (let i = 0; i < objs.length; i++) {
            const decal = objs[i];
            if (decal.__type !== ObjectType.Decal) continue;
            if (!decal.surface) {
                continue;
            }

            if (
                util.sameLayer(decal.layer, layer) &&
                collider.intersectCircle(decal.collider!, pos, 0.0001)
            ) {
                return groundSurface(decal.surface);
            }
        }

        // Check buildings
        let surface = null;
        let zIdx = 0;
        const onStairs = layer & 0x2;

        for (let i = 0; i < objs.length; i++) {
            const building = objs[i];
            if (building.__type !== ObjectType.Building) continue;
            if (building.zIdx < zIdx) {
                continue;
            }
            // Prioritize layer0 building surfaces when on stairs
            if (
                (building.layer !== layer && !onStairs) ||
                (building.layer === 1 && onStairs)
            ) {
                continue;
            }
            for (let j = 0; j < building.surfaces.length; j++) {
                const s = building.surfaces[j];
                for (let k = 0; k < s.colliders.length; k++) {
                    const res = collider.intersectCircle(s.colliders[k], pos, 0.0001);
                    if (res) {
                        zIdx = building.zIdx;
                        surface = s;
                        break;
                    }
                }
            }
        }

        if (surface) {
            return groundSurface(surface.type);
        }

        // Check rivers
        let onRiverShore = false;
        if (layer !== 1) {
            const { rivers } = this.terrain;
            for (let i = 0; i < rivers.length; i++) {
                const river = rivers[i];
                if (
                    coldet.testPointAabb(pos, river.aabb.min, river.aabb.max) &&
                    math.pointInsidePolygon(pos, river.shorePoly)
                ) {
                    onRiverShore = true;
                    if (math.pointInsidePolygon(pos, river.waterPoly)) {
                        return groundSurface("water", river);
                    }
                }
            }
        }

        // Check terrain
        if (math.pointInsidePolygon(pos, this.terrain.grass)) {
            // Use a stone step sound if we're in the main-spring def
            return groundSurface(
                onRiverShore ? this.mapDef.biome.sound.riverShore : "grass",
            );
        }
        if (math.pointInsidePolygon(pos, this.terrain.shore)) {
            return groundSurface("sand");
        }
        return groundSurface("water");
    }

    // like getGroundSurface but optimized for water
    isOnWater(pos: Vec2, layer: number) {
        const objs = this.game.grid.intersectPos(pos);

        // Check decals
        for (let i = 0; i < objs.length; i++) {
            const decal = objs[i];
            if (decal.__type !== ObjectType.Decal) continue;
            if (!decal.surface) {
                continue;
            }

            if (
                util.sameLayer(decal.layer, layer) &&
                collider.intersectCircle(decal.collider!, pos, 0.0001)
            ) {
                return decal.surface === "water";
            }
        }

        // Check buildings
        let surface = null;
        let zIdx = 0;
        const onStairs = layer & 0x2;

        for (let i = 0; i < objs.length; i++) {
            const building = objs[i];
            if (building.__type !== ObjectType.Building) continue;
            if (building.zIdx < zIdx) {
                continue;
            }
            // Prioritize layer0 building surfaces when on stairs
            if (
                (building.layer !== layer && !onStairs) ||
                (building.layer === 1 && onStairs)
            ) {
                continue;
            }
            for (let j = 0; j < building.surfaces.length; j++) {
                const s = building.surfaces[j];
                for (let k = 0; k < s.colliders.length; k++) {
                    const res = collider.intersectCircle(s.colliders[k], pos, 0.0001);
                    if (res) {
                        zIdx = building.zIdx;
                        surface = s;
                        break;
                    }
                }
            }
        }

        if (surface) {
            return surface.type === "water";
        }

        // Check rivers
        if (layer !== 1) {
            const { rivers } = this.terrain;
            for (let i = 0; i < rivers.length; i++) {
                const river = rivers[i];
                if (
                    coldet.testPointAabb(pos, river.aabb.min, river.aabb.max) &&
                    math.pointInsidePolygon(pos, river.waterPoly)
                ) {
                    return true;
                }
            }
        }

        if (math.pointInsidePolygon(pos, this.terrain.shore)) {
            return false;
        }

        return true;
    }
}
