import {
    ApplicationCommandData,
    ChatInputCommandInteraction,
} from "discord.js";
import { Discord } from "../Client/Discord";

export class CommandBuilder {
  constructor(option: SlashCommandOptions) {
    this.data = option.data;
    this.run = option.run;
  }
  data;
  run;
}

export type SlashCommandOptions = {
    data: ApplicationCommandData;
    run: (
        client: Discord,
        interaction: ChatInputCommandInteraction,
    ) => Promise<void | any>;
};