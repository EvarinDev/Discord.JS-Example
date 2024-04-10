import {
    ApplicationCommandData,
    ChatInputCommandInteraction,
} from "discord.js";
import { Discord } from "../Client/Discord";

export type SlashCommandOptions = {
    data: ApplicationCommandData;
    run: (
        client: Discord,
        interaction: ChatInputCommandInteraction,
    ) => Promise<void | any>;
};