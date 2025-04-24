/**
 * @author Silverdium
 * @author SilverCore
 * @author Mister Papaye
 */

const RPC = require("discord-rpc");
const clientId = '1343884731724599347';

// Fonction pour initialiser et gérer Discord rpc
export default function initializeDiscordRPC() {
    const rpc = new RPC.Client({ transport: "ipc" });

    async function setActivity() {
        if (!rpc) return;

        rpc.setActivity({
            details: "Meilleur server Minecraft au monde",
            state: "PVP - FACTION - MODDÉ",
            startTimestamp: Date.now(),
            largeImageKey: "logo",
            largeImageText: "Silverdium",
            smallImageKey: "icon",
            smallImageText: "Icône",
            buttons: [
                { label: "Site Web", url: "https://silverdium.fr" },
                { label: "Discord", url: "https://discord.gg/tW2EQ4EsD6" }
            ],
            instance: false,
        });
    }

    rpc.on("ready", () => {
        setActivity();
    });

    rpc.login({ clientId }).catch(console.error);
}


