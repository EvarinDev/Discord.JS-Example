import { ChatInputCommandInteraction, Client, Collection, InteractionType, REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import { config } from "../Config";
import { CommandBuilder } from "../util/CommandBuilder";
import { ButtonBuilder } from "../util/ButtonBuilder";

export class Discord extends Client {
    #command = new Collection<string, CommandBuilder>();
    #interaction = new Collection<string, ButtonBuilder>();
    constructor() {
        super({
            intents: ["Guilds"],
            presence: {
                status: "online",
            }
        });
        this.init(config.CLIENT_TOKEN);
        this.on("ready", () => {
            console.log(`Logged in as ${this.user?.tag}`);
        });
        this.on("interactionCreate", async (interaction) => {
            if (interaction.isCommand()) {
                const command = this.#command.get(interaction.commandName);
                    if (command) {
                        command.run(this, (interaction as ChatInputCommandInteraction)).then(() => {
                            console.log(`Command ${interaction.commandName} executed successfully`);
                        }).catch((e) => {
                            console.error(e);
                        });
                    }
            } else if (interaction.isButton()) {
                const button = this.#interaction.get(interaction.customId);
                if (button) {
                    button.run(this, interaction).then(() => {
                        console.log(`Button ${interaction.customId} executed successfully`);
                    }).catch((e) => {
                        console.error(e);
                    });
                }
            }
        });
    }
    private init(token?: string) {
        if (!token) {
            throw new Error("No token provided");
        } else {
            this.login(token);
            this._registerCommand();
        }
    }
    public async _registerCommand() {
        try {
            const [CommandFile, ButtonFile] = await Promise.all([
                fs.readdirSync(path.join(__dirname, "../Commands")),
                fs.readdirSync(path.join(__dirname, "../Interactions")),
            ]);
            const commands = [];
            for (const folder of CommandFile) {
                const CommandsInFolder = fs.readdirSync(path.join(__dirname, `../Commands/${folder}`));
                for (const commandFile of CommandsInFolder) {
                    const command = await import(`../Commands/${folder}/${commandFile}`).then((c) => (c.default as CommandBuilder));
                    commands.push(command.data);
                    this.#command.set(command.data.name, command);
                    console.log(`Loaded Command: ${command.data.name}`);
                }
            }
            for (const folder of ButtonFile) {
                const ButtonInFolder = fs.readdirSync(path.join(__dirname, `../Interactions/${folder}`));
                for (const commandFile of ButtonInFolder) {
                    const data = await import(`../Interactions/${folder}/${commandFile}`).then((c) => (c.default as ButtonBuilder));
                    this.#interaction.set(data.data, data);
                    console.log(`Loaded Button: ${data.data}`);
                }
            }
            console.log(`Started refreshing application (/) commands.`);
            const rest = new REST({ version: '10' }).setToken(config.CLIENT_TOKEN);
            if (process.env.NODE_ENV == "production") {
                this.application?.commands.set([...commands.values()]);
            } else {
                if (!config.CLIENT_ID) {
                    throw new Error("No Client ID provided");
                } else if (!config.CLIENT_GUILD) {
                    throw new Error("No Client Guild provided");
                } else {
                    await Promise.all([
                        rest.put(Routes.applicationGuildCommands(config.CLIENT_ID, config.CLIENT_GUILD), { body: commands }),
                    ]);
                }
            }
            console.log(`Successfully reloaded application (/) commands.`);
        }
        catch (e) {
            console.error(e);
        }
    }
}