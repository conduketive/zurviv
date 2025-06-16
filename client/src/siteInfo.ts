import $ from "jquery";
import { MapDefs } from "../../shared/defs/mapDefs";
import { TeamModeToString } from "../../shared/defs/types/misc";
import type { Info } from "../../shared/types/api";
import { api } from "./api";
import type { ConfigManager } from "./config";
import { device } from "./device";
import { updateSelectedGameMode } from "./gameMod";
import type { Localization } from "./ui/localization";

export class SiteInfo {
    info = {} as Info;
    loaded = false;

    constructor(
        private buttonsCreated: boolean = false,
        public config: ConfigManager,
        public localization: Localization,
    ) {
        this.config = config;
        this.localization = localization;
    }

    load() {
        const locale = this.localization.getLocale();
        const siteInfoUrl = api.resolveUrl(`/api/site_info?language=${locale}`);

        const mainSelector = $("#server-opts");
        const teamSelector = $("#team-server-opts");

        for (const region in GAME_REGIONS) {
            const data = GAME_REGIONS[region];
            const name = this.localization.translate(data.l10n);
            const elm = `<option value='${region}' data-l10n='${data.l10n}' data-label='${name}'>${name}</option>`;
            mainSelector.append(elm);
            teamSelector.append(elm);
        }

        $.ajax(siteInfoUrl).done((data: Info) => {
            this.info = data || {};
            this.loaded = true;
            this.updatePageFromInfo();
        });
    }

    getGameModeStyles() {
        const eventModes = ["GG", "gamerio"].map((t) => t.toLocaleLowerCase());
        const availableModes = [];
        const modes = this.info.modes || [];
        let dropdownContainer = document.querySelector(".dropdown-buttons-1");
        const dropdownContainerTeam = document.querySelector(".dropdown-buttons-team-1");

        if (!this.buttonsCreated) {
            for (let i = 0; i < modes.length; i++) {
                const mode = modes[i];
                if (i % 4 === 0) {
                    const formattedMapName = getFormattedMapName(mode.mapName);
                    const isEvent = eventModes.includes(mode.mapName.toLocaleLowerCase());

                    const newButton = document.createElement("a");
                    newButton.className = "btn-green btn-darken menu-option";
                    newButton.id = `btn-start-mode-${i}`;
                    newButton.textContent = formattedMapName;
                    newButton.dataset.isEventMap = isEvent.toString();

                    dropdownContainer?.appendChild(newButton);

                    const newButtonTeam = document.createElement("a");
                    newButtonTeam.className =
                        "btn-green btn-darken menu-option team-selection";
                    newButtonTeam.id = `btn-start-mode-team-${i}`;
                    newButtonTeam.textContent = formattedMapName;
                    newButtonTeam.dataset.isEventMap = isEvent.toString();

                    dropdownContainerTeam?.appendChild(newButtonTeam);
                }
            }
            this.buttonsCreated = true;
        }

        for (let i = 0; i < modes.length; i++) {
            const mode = modes[i];
            const isEvent = eventModes.includes(mode.mapName.toLocaleLowerCase());
            let button = document.getElementById(`btn-start-mode-${i}`);
            if (button) {
                button.innerHTML = getFormattedMapName(mode.mapName);
                button.dataset.isEventMap = isEvent.toString();
            }

            button = document.getElementById(`btn-start-mode-team-${i}`);
            if (button) {
                button.innerHTML = getFormattedMapName(mode.mapName);
                button.dataset.isEventMap = isEvent.toString();
            }

            const mapDef = (MapDefs[mode.mapName as keyof typeof MapDefs] || MapDefs.main)
                .desc;
            const buttonText = mapDef.buttonText
                ? mapDef.buttonText
                : TeamModeToString[mode.teamMode];
            availableModes.push({
                icon: mapDef.icon,
                buttonCss: mapDef.buttonCss,
                buttonText,
                enabled: mode.enabled,
            });
        }

        // hide inactive game modes
        updateSelectedGameMode(
            $("[data-selected-game-mode]").attr("data-selected-game-mode")!,
        );
        return availableModes;
    }

    updatePageFromInfo() {
        if (this.loaded) {
            const getGameModeStyles = this.getGameModeStyles();
            for (let i = 0; i < getGameModeStyles.length; i++) {
                const style = getGameModeStyles[i];
                const selector = `index-play-${style.buttonText}`;
                let btn = $(`#btn-start-mode-${i}`);
                if (style.icon || style.buttonCss) {
                    if (i == 0) {
                        btn.addClass("btn-custom-mode-no-indent");
                    } else {
                        btn.addClass("btn-custom-mode-main");
                    }
                    btn.addClass(style.buttonCss);
                    btn.css({
                        "background-image": `url(${style.icon})`,
                    });
                }
                btn = $(`#btn-start-mode-team-${i}`);
                if (style.icon || style.buttonCss) {
                    if (i == 0) {
                        btn.addClass("btn-custom-mode-no-indent");
                    } else {
                        btn.addClass("btn-custom-mode-main");
                    }
                    btn.addClass(style.buttonCss);
                    btn.css({
                        "background-image": `url(${style.icon})`,
                    });
                }
                const l = $(`#btn-team-queue-mode-${i}`);
                if (l.length) {
                    const c = `index-${style.buttonText}`;
                    l.data("l10n", c);
                    l.html(this.localization.translate(c));
                    if (style.icon) {
                        l.addClass("btn-custom-mode-select");
                        l.css({
                            "background-image": `url(${style.icon})`,
                        });
                    }
                }

                btn.toggle(style.enabled);
            }
            const supportsTeam = this.info.modes.some((s) => s.enabled && s.teamMode > 1);
            $("#btn-join-team, #btn-create-team").toggle(supportsTeam);

            // Region pops
            const pops = this.info.pops;
            if (pops) {
                const regions = Object.keys(pops);

                for (let i = 0; i < regions.length; i++) {
                    const region = regions[i];
                    const data = pops[region];
                    const sel = $("#server-opts").children(`option[value="${region}"]`);
                    const players = this.localization.translate("index-players");
                    sel.text(`${sel.data("label")} [${data.playerCount} ${players}]`);
                }
            }
            let hasTwitchStreamers = false;
            const featuredStreamersElem = $("#featured-streamers");
            const streamerList = $(".streamer-list");
            if (!device.mobile && this.info.twitch) {
                streamerList.empty();
                for (let i = 0; i < this.info.twitch.length; i++) {
                    const streamer = this.info.twitch[i];
                    const template = $("#featured-streamer-template").clone();
                    template
                        .attr("class", "featured-streamer streamer-tooltip")
                        .attr("id", "");
                    const link = template.find("a");
                    const text = this.localization.translate(
                        streamer.viewers == 1 ? "index-viewer" : "index-viewers",
                    );
                    link.html(
                        `${streamer.name} <span>${streamer.viewers} ${text}</span>`,
                    );
                    link.css("background-image", `url(${streamer.img})`);
                    link.attr("href", streamer.url);
                    streamerList.append(template);
                    hasTwitchStreamers = true;
                }
            }
            featuredStreamersElem.css(
                "visibility",
                hasTwitchStreamers ? "visible" : "hidden",
            );

            const featuredYoutuberElem = $("#featured-youtuber");
            const displayYoutuber = this.info.youtube;
            if (displayYoutuber) {
                $(".btn-youtuber")
                    .attr("href", this.info.youtube.link)
                    .html(this.info.youtube.name);
            }
            featuredYoutuberElem.css("display", displayYoutuber ? "block" : "none");
        }
    }
}

export function getFormattedMapName(mapName: string) {
    const mapNameParts = mapName.split("_");
    const formattedMapName =
        mapNameParts.length > 1
            ? mapNameParts[1].charAt(0).toUpperCase() + mapNameParts[1].slice(1)
            : mapName.substring(0, 1).toUpperCase() + mapName.substring(1);
    return formattedMapName;
}
