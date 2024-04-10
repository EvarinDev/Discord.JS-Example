import { SlashCommandOptions } from "./CommandBuilderOptions";

export class CommandBuilder {
  constructor(option: SlashCommandOptions) {
    this.data = option.data;
    this.run = option.run;
  }
  data;
  run;
}