import {
    ButtonInteraction,
    ChatInputCommandInteraction,
} from "discord.js";
import { Discord } from "../Client/Discord";

export class ButtonBuilder {
  constructor(option: SlashCommandOptions) {
    this.data = option.data;
    this.run = option.run;
  }
  data;
  run;
}

export type SlashCommandOptions = {
    data: string;
    run: (
        client: Discord,
        interaction: ButtonInteraction,
    ) => Promise<void | any>;
};