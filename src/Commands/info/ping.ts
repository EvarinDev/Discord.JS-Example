import { CommandBuilder } from "../../util/CommandBuilder";

export default new CommandBuilder({
    data: {
        name: "ping",
        description: "Ping!",
    },
    async run(client, interaction) {
        interaction.reply("Pong!");
    },
})