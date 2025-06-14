/**
 * @author Luuxis - master
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0
 * 
 * @author Silverdium
 * @author SilverCore
 * @author Mister Papaye
 */

const { ipcRenderer, shell } = require('electron');
const pkg = require('../package.json');
const os = require('os');
import { config, popups, settings } from './utils.js';
const nodeFetch = require("node-fetch");


class Splash {

    constructor() {

        console.log('Chargement de update window');

            this.splash = document.querySelector(".splash");
            this.splashMessage = document.querySelector(".splash-message");
            this.splashAuthor = document.querySelector(".splash-author");
            this.message = document.querySelector(".message");
            this.progress = document.querySelector(".progress");

            document.body.className = 'dark global';
            if (process.platform == 'win32') ipcRenderer.send('update-window-progress-load')
            this.startAnimation()


    }

    async startAnimation() {

        let splaches = popups;
    
        let splash = splaches[Math.floor(Math.random() * splaches.length)];
        this.splashMessage.innerHTML = splash;
        this.splashAuthor.style.display = "none";
    
        await sleep(100);
        document.querySelector("#splash").style.display = "block";
        await sleep(500);
        this.splash.classList.add("opacity");
        await sleep(500);
        this.splash.classList.add("translate");
        this.splashMessage.classList.add("opacity");
        this.message.classList.add("opacity");
        await sleep(1000);

        await settings.init();

        this.checkUpdate();
    }
    

    async checkUpdate() {
        this.setStatus(`Recherche de mise à jour...`);

        ipcRenderer.invoke('update-app').then().catch(err => {
            return this.shutdown(`erreur lors de la recherche de mise à jour :<br>${err.message}`);
        });

        ipcRenderer.on('updateAvailable', () => {
            this.setStatus(`Mise à jour disponible !`);
            if (os.platform() == 'win32') {
                this.toggleProgress();
                ipcRenderer.send('start-update');
            }
            else return this.dowloadUpdate();
        })

        ipcRenderer.on('error', (event, err) => {
            if (err) return this.shutdown(`${err.message}`);
        })

        ipcRenderer.on('download-progress', (event, progress) => {
            ipcRenderer.send('update-window-progress', { progress: progress.transferred, size: progress.total })
            this.setProgress(progress.transferred, progress.total);
        })

        ipcRenderer.on('update-not-available', () => {
            console.error("Mise à jour non disponible (yesss !!)");
            this.maintenanceCheck();
        })
    }

    getLatestReleaseForOS(os, preferredFormat, asset) {
        return asset.filter(asset => {
            const name = asset.name.toLowerCase();
            const isOSMatch = name.includes(os);
            const isFormatMatch = name.endsWith(preferredFormat);
            return isOSMatch && isFormatMatch;
        }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    }

    async downloadUpdate() {
        if (!pkg || !pkg.repository || !pkg.repository.url) {
            throw new Error("Repository URL manquant dans le fichier pkg");
        }
    
        const repoURL = pkg.repository.url.replace("git+", "").replace(".git", "").replace("https://github.com/", "").split("/");
        const githubAPIRepoURL = `https://api.github.com/repos/${repoURL[0]}/${repoURL[1]}`;
    
        const githubAPIRepo = await nodeFetch(githubAPIRepoURL)
            .then(res => res.ok ? res.json() : Promise.reject(new Error(`Erreur API: ${res.statusText}`)))
            .catch(err => { throw new Error(`Erreur de connexion à GitHub : ${err.message}`); });
    
        if (!githubAPIRepo || !githubAPIRepo.releases_url) {
            throw new Error("URL des releases manquante dans les données du dépôt");
        }
    
        const releases_url = await nodeFetch(githubAPIRepo.releases_url.replace("{/id}", ''))
            .then(res => res.ok ? res.json() : Promise.reject(new Error(`Erreur API: ${res.statusText}`)))
            .catch(err => { throw new Error(`Erreur de connexion aux releases GitHub : ${err.message}`); });
    
        if (!releases_url || releases_url.length === 0) {
            throw new Error("Aucune release disponible pour ce dépôt.");
        }
    
        const latestRelease = releases_url[0].assets;
        let latest;
    
        if (os.platform() == 'darwin') latest = this.getLatestReleaseForOS('mac', '.dmg', latestRelease);
        else if (os.platform() == 'linux') latest = this.getLatestReleaseForOS('linux', '.appimage', latestRelease);
    
        if (!latest || !latest.browser_download_url) {
            throw new Error("Lien de téléchargement introuvable pour la dernière release.");
        }
    
        this.setStatus(`Mise à jour disponible ! (yess !)<br><div class="download-update">Télécharger</div>`);
        document.querySelector(".download-update").addEventListener("click", () => {
            shell.openExternal(latest.browser_download_url);
            return this.shutdown("Téléchargement en cours... <br><h4>(10 p'tit mega sa use, sa use... 10 p'tit giga sa use, sa use...)</h4> ");
        });
    }
    


    async maintenanceCheck() {
        config.GetConfig().then(res => {
            if (res.maintenance) return this.shutdown(res.maintenance_message);
            this.startLauncher();
        }).catch(e => {
            console.error(e);
            return this.shutdown("Aucune connexion aux API détectée,<br>veuillez réessayer ultérieurement.");
        })
    }

    startLauncher() {
        this.setStatus(`Démarrage du launcher... (yes !)`);
        ipcRenderer.send('main-window-open');
        ipcRenderer.send('update-window-close');
    }

    shutdown(text) {
        this.setStatus(`${text}<br>Arrêt dans 10s`);
        let i = 9;
        setInterval(() => {
            this.setStatus(`${text}<br>Arrêt dans ${i--}s`);
            if (i < 0) ipcRenderer.send('update-window-close');
        }, 1000);
    }

    setStatus(text) {
        this.message.innerHTML = text;
    }

    toggleProgress() {
        if (this.progress.classList.toggle("show")) this.setProgress(0, 1);
    }

    setProgress(value, max) {
        this.progress.value = value;
        this.progress.max = max;
    }
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.keyCode == 73 || e.keyCode == 123) {
        ipcRenderer.send("update-window-dev-tools");
    }
})


new Splash();