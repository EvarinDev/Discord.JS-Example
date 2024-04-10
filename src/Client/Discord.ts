import { Client, Collection, REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import { config } from "../Config";

export class Discord extends Client {
    public _Command = new Collection<string, any>();
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
            if (!interaction.isCommand()) return;
            const command = this._Command.get(interaction.commandName);
            if (!command) return;
            try {
                await command.run(this, interaction);
            } catch (e) {
                console.error(e);
                await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
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
            const [slashFiles] = await Promise.all([
                fs.readdirSync(path.join(__dirname, "../Commands")),
            ]);
            const commands = [];
            for (const folder of slashFiles) {
                const commandsInFolder = fs.readdirSync(path.join(__dirname, `../Commands/${folder}`));
                for (const commandFile of commandsInFolder) {
                    const command = await import(`../Commands/${folder}/${commandFile}`).then((c) => c.default);
                    commands.push(command.data);
                    this._Command.set(command.data.name, command);
                    console.log(`Loaded Command: ${command.data.name}`);
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