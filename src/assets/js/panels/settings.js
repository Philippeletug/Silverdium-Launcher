/**
 * @author Luuxis - master
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0
 * 
 * @author Silverdium
 * @author SilverCore
 * @author Mister Papaye
 */

import { changePanel, accountSelect, viderDossier, database, Slider, config, setStatus, popup, appdata, setBackground, Salert } from '../utils.js'
const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const confetti = require('canvas-confetti')

class Settings {
    static id = "settings";
    async init(config) {
        console.log('--------------------SETTINGS PANEL--------------------');
        console.log('loading settings panel...');
        this.config = config;
        this.db = new database();
        this.loadSetting();
        this.navBTN()
        this.accounts()
        this.ram() 
        this.javaPath()
        this.resolution()
        this.launcher()
    }

    async initSetting() {

        const appDataPath = await appdata();
        const isMac = process.platform === 'darwin';
        const Json_Path = `${appDataPath}/${isMac ? this.config.dataDirectory : `.${this.config.dataDirectory}`}/auth`;
        
        if (!fs.existsSync(Json_Path)) {
            await fs.promises.mkdir(Json_Path);
        }

        let data = {
            MaxRAM: 2,
            MinRAM: 6,
            Download_File: 5,
            Close_Launcher: "close-launcher"
        }

        if (!fs.existsSync(Json_Path + '/setting.json')) {
            await fs.promises.writeFile(`${Json_Path}/setting.json`, JSON.stringify(data))
        }

    }

    async saveSetting(type, arg1, arg2) {

        const appDataPath = await appdata();
        const isMac = process.platform === 'darwin';
        const Json_Path = `${appDataPath}/${isMac ? this.config.dataDirectory : `.${this.config.dataDirectory}`}/auth`;
        
        if (!fs.existsSync(Json_Path)) {
            await fs.promises.mkdir(Json_Path);
        }

        let data = await fs.promises.readFile(`${Json_Path}/setting.json`, 'utf8');

        data = JSON.parse(data) 

        if (type == 'RAM') {
            
            data = {
                MaxRAM: arg2,
                MinRAM: arg1,
                Download_File: data.Download_File || 5,
                Close_Launcher: data.Close_Launcher || "close-launcher"
            } 

        }

        else if (type == 'DF') {

            data = {
                MaxRAM: data.MaxRAM || null,
                MinRAM: data.MinRAM || null,
                Download_File: parseFloat(arg1),
                Close_Launcher: data.Close_Launcher || "close-launcher"
            }
 
        }

        else if (type == 'CL') {

            data = {
                MaxRAM: data.MaxRAM || null,
                MinRAM: data.MinRAM || null,
                Download_File: data.Download_File || 5,
                Close_Launcher: arg1
            }

        }

        else {
            console.error('Type de setting a save mal défini : ' + type);
        };

        await fs.promises.writeFile(`${Json_Path}/setting.json`, JSON.stringify(data))

    }
 
    async loadSetting() {

        const appDataPath = await appdata();
        const isMac = process.platform === 'darwin';
        const Json_Path = `${appDataPath}/${isMac ? this.config.dataDirectory : `.${this.config.dataDirectory}`}/auth`;
    
        const data = await fs.promises.readFile(`${Json_Path}/setting.json`, 'utf8')

        return JSON.parse(data);

    }

    navBTN() {
        console.log('loading navBTN function...');
        document.querySelector('.nav-box').addEventListener('click', e => {

            if (e.target.classList.contains('nav-settings-btn')) {
                let id = e.target.id

                let activeSettingsBTN = document.querySelector('.active-settings-BTN')
                let activeContainerSettings = document.querySelector('.active-container-settings')

                if (id == 'save') {
                    if (activeSettingsBTN) activeSettingsBTN.classList.toggle('active-settings-BTN');
                    document.querySelector('#account').classList.add('active-settings-BTN');

                    if (activeContainerSettings) activeContainerSettings.classList.toggle('active-container-settings');
                    document.querySelector(`#account-tab`).classList.add('active-container-settings');
                    return changePanel('home')
                }

                if (activeSettingsBTN) activeSettingsBTN.classList.toggle('active-settings-BTN');
                e.target.classList.add('active-settings-BTN');

                if (activeContainerSettings) activeContainerSettings.classList.toggle('active-container-settings');
                document.querySelector(`#${id}-tab`).classList.add('active-container-settings');
            }
        })
    }

    accounts() {

        console.log('loading accounts function...');
        
        document.querySelector('.accounts-list').addEventListener('click', async e => {
            let popupAccount = new popup()
            try {
                let id = e.target.id
                if (e.target.classList.contains('account')) {
                    popupAccount.openPopup({
                        title: 'Connexion',
                        content: 'Veuillez patienter...',
                        color: 'var(--color)'
                    })

                    if (id == 'add') {
                        document.querySelector('.cancel-home').style.display = 'inline'
                        return changePanel('login')
                    }

                    let account = await this.db.readData('accounts', id);
                    let configClient = await this.setInstance(account);
                    await accountSelect(account);
                    configClient.account_selected = account.ID;
                    return await this.db.updateData('configClient', configClient);
                }

                if (e.target.classList.contains("delete-profile")) {
                    popupAccount.openPopup({
                        title: 'Connexion',
                        content: 'Veuillez patienter...',
                        color: 'var(--color)'
                    })
                    await this.db.deleteData('accounts', id);
                    let deleteProfile = document.getElementById(`${id}`);
                    let accountListElement = document.querySelector('.accounts-list');
                    accountListElement.removeChild(deleteProfile);

                    if (accountListElement.children.length == 1) return changePanel('login');

                    let configClient = await this.db.readData('configClient');

                    if (configClient.account_selected == id) {
                        let allAccounts = await this.db.readAllData('accounts');
                        configClient.account_selected = allAccounts[0].ID
                        accountSelect(allAccounts[0]);
                        let newInstanceSelect = await this.setInstance(allAccounts[0]);
                        configClient.instance_selct = newInstanceSelect.instance_selct
                        return await this.db.updateData('configClient', configClient);
                    }
                }
            } catch (err) {
                console.error(err)
            } finally {
                popupAccount.closePopup();
            }
        })
    }

    async setInstance(auth) {
        console.log('loading setInstance async function...');
        let configClient = await this.db.readData('configClient')
        let instanceSelect = configClient.instance_selct
        let instancesList = await config.getInstanceList()

        for (let instance of instancesList) {
            if (instance.whitelistActive) {
                let whitelist = instance.whitelist.find(whitelist => whitelist == auth.name)
                if (whitelist !== auth.name) {
                    if (instance.name == instanceSelect) {
                        let newInstanceSelect = instancesList.find(i => i.whitelistActive == false)
                        configClient.instance_selct = newInstanceSelect.name
                        await setStatus(newInstanceSelect.status)
                    }
                }
            }
        }
        return configClient
    }

    async ram() {
        console.log('loading ram async function...');
        let setting = await this.loadSetting();
        let config = await this.db.readData('configClient');
        let totalMem = Math.trunc(os.totalmem() / 1073741824 * 10) / 10;
        // Fonction n'est pas representative
        // let freeMem = Math.trunc(os.freemem() / 1073741824 * 10) / 10;
        let freeMem = "#"

        document.getElementById("total-ram").textContent = `${totalMem} Go`;
        document.getElementById("free-ram").textContent = `${freeMem} Go`;

        let sliderDiv = document.querySelector(".memory-slider");
        sliderDiv.setAttribute("max", Math.trunc((80 * totalMem) / 100));

        let ram = config?.java_config?.java_memory ? {
            ramMin: setting.MinRAM,
            ramMax: setting.MaxRAM
        } : { ramMin: "1", ramMax: "6" };


        let slider = new Slider(".memory-slider", parseFloat(ram.ramMin), parseFloat(ram.ramMax));

        let minSpan = document.querySelector(".slider-touch-left span");
        let maxSpan = document.querySelector(".slider-touch-right span");

        minSpan.setAttribute("value", `${ram.ramMin} Go`);
        maxSpan.setAttribute("value", `${ram.ramMax} Go`);

        slider.on("change", async (min, max) => {

            let config = await this.db.readData('configClient');

            this.saveSetting('RAM', min, max);

            minSpan.setAttribute("value", `${min} Go`);
            maxSpan.setAttribute("value", `${max} Go`);

        });
    }    

    async javaPath() {
        console.log('loading javaPath async function...');
        try {
            let javaPathText = document.querySelector(".java-path-txt")
            javaPathText.textContent = `${await appdata()}/${process.platform == 'darwin' ? this.config.dataDirectory : `.${this.config.dataDirectory}`}/runtime`;
    
            let configClient = await this.db.readData('configClient');
            let javaPath = configClient?.java_config?.java_path || 'Utiliser la version de java livré avec le launcher';
            let javaPathInputTxt = document.querySelector(".java-path-input-text");
            let javaPathInputFile = document.querySelector(".java-path-input-file");
            javaPathInputTxt.value = javaPath;
    
            document.querySelector(".java-path-set").addEventListener("click", async () => {
                confetti({
                    particleCount: 100,
                    spread: 80,
                    origin: { x: 0.5, y: 0.8 }
                }); 
                javaPathInputFile.value = '';
                javaPathInputFile.click();
    
                javaPathInputFile.addEventListener("change", async () => {
                    let file = javaPathInputFile.files[0]?.path;
                    if (!file) return;
    
                    if (file.replace(".exe", "").endsWith("java") || file.replace(".exe", "").endsWith("javaw")) {
                        configClient = await this.db.readData('configClient');
                        javaPathInputTxt.value = file;
                        configClient.java_config.java_path = file;
                        await this.db.updateData('configClient', configClient);
                    } else {
                        Salert('Silverdium Launcher', "<h3>Le nom du fichier doit être java(.exe) ou javaw(.exe)</h3>", 'info', true, false);
                    }
                }, { once: true });
            });
    
            document.querySelector(".java-path-reset").addEventListener("click", async () => {
                confetti({
                    particleCount: 100,
                    spread: 80,
                    origin: { x: 0.5, y: 0.8 }
                }); 
                configClient = await this.db.readData('configClient');
                javaPathInputTxt.value = 'Utiliser la version de java livré avec le launcher';
                configClient.java_config.java_path = null;
                await this.db.updateData('configClient', configClient);
            });
        } catch (err) {
            console.error("Erreur lors de l'éxécution de javaPath.", err);
            console.log(`[VAR]: javaPathText.textContent : "${javaPathText.textContent}"`);
        }
    }
    

    async resolution() {
        console.log('loading resolution async function...');
        let configClient = await this.db.readData('configClient')
        let resolution = configClient?.game_config?.screen_size || { width: 1920, height: 1080 };

        let width = document.querySelector(".width-size");
        let height = document.querySelector(".height-size");
        let resolutionReset = document.querySelector(".size-reset");

        width.value = resolution.width;
        height.value = resolution.height;

        width.addEventListener("change", async () => {
            confetti({
                particleCount: 100,
                spread: 80,
                origin: { x: 0.5, y: 0.8 }
            }); 
            let configClient = await this.db.readData('configClient')
            configClient.game_config.screen_size.width = width.value;
            await this.db.updateData('configClient', configClient);
        })

        height.addEventListener("change", async () => {
            confetti({
                particleCount: 100,
                spread: 80,
                origin: { x: 0.5, y: 0.8 }
            }); 
            let configClient = await this.db.readData('configClient')
            configClient.game_config.screen_size.height = height.value;
            await this.db.updateData('configClient', configClient);
        })

        resolutionReset.addEventListener("click", async () => {
            confetti({
                particleCount: 100,
                spread: 80,
                origin: { x: 0.5, y: 0.8 }
            }); 
            let configClient = await this.db.readData('configClient')
            configClient.game_config.screen_size = { width: '1080', height: '720' };
            width.value = '1080';
            height.value = '720';
            await this.db.updateData('configClient', configClient);
        })
    }

    async launcher() {
        console.log('loading launcher async function...');
        let configClient = await this.db.readData('configClient');
        let setting = await this.loadSetting();

        let maxDownloadFiles = setting?.Download_File || 5;
        let maxDownloadFilesInput = document.querySelector(".max-files");
        let maxDownloadFilesReset = document.querySelector(".max-files-reset");
        let restorbtn = document.querySelector(".restor");
        let codeconfbtn = document.querySelector(".codeconf");
        let opencmdbtn = document.querySelector(".opencmd");
        let uninstbtn = document.querySelector(".uninst");
        maxDownloadFilesInput.value = maxDownloadFiles;

        opencmdbtn.addEventListener("click", async () => {
            const event = new KeyboardEvent('keydown', {
                key: 'F12',
                keyCode: 123, // touche F12
                which: 123
            });
            document.dispatchEvent(event);            
        })

        codeconfbtn.addEventListener("click", async () => {
            console.log('Affichage du code de confirmation');
            Salert('Silverdium Launcher', `<h3>Code de confirmation :<br>${this.config.codeconf}</h3>`, 'info', true, false);
        });

        restorbtn.addEventListener("click", async () => {
            console.log("Lancement de la restoration de l'instance...");
            try {
                const appDataPath = await appdata();
                const isMac = process.platform === 'darwin';
                const dataDirectory = `${appDataPath}/${isMac ? this.config.dataDirectory : `.${this.config.dataDirectory}`}`;
                const instancesFolder = `${dataDirectory}/instances/`;
                console.log(`Restoring path: ${instancesFolder}`);
                if (fs.existsSync(instancesFolder)) {
                    fs.readdirSync(instancesFolder).forEach(file => {
                        const filePath = path.join(instancesFolder, file);
        
                        if (fs.lstatSync(filePath).isDirectory()) {
                            viderDossier(filePath);
                            console.log(`Réstoration effectuer de l'instance : ${instancesFolder}`);
                            console.log(`Restoration de l'instance effectué avec succes (c'est qui succes?)`);
                            Salert('Silverdium Launcher', `<h3>Restoration de l'instance<br>effectué avec succes<br>(c'est qui succes?)</h3>`, 'success', true, false);
                        } else {
                            fs.unlinkSync(filePath);
                        }
                    });
                } else {
                    Salert('Silverdium Launcher', `<h3>Aucune instance télécharger, donc aucune instance suprimer !</h3><h4>Cela peut arriver si tu n'a jamais lancer le jeux !</h4>`, 'error', true, false);
                    console.warn(`Le dossier ${instancesFolder} n'existe pas.`);
                }
            } catch (error) {
                Salert('Silverdium Launcher', `<h3>Une erreur est survenue :</h3><br>${error}<br>${error.stacl}`, 'error', true, false);
                console.error("Une erreur s'est produite pendant la restauration :", error);
                console.error(error.stack);
            }
        });
        
        // Fonction non terminer
// uninstbtn.addEventListener("click", async () => {
//     console.warn('!! [UNINST]: Chargement de la procédure de désinstallation... !!');
//     console.warn('!! [UNINST]: Demande de confirmation... !!');

//     // Demander confirmation à l'utilisateur
//     const uninstConfirm = confirm('Êtes-vous sûr de désinstaller \nce magnifique launcher de Silverdium ?');
//     if (uninstConfirm) {
//         console.warn('!! [UNINST]: Demande de confirmation ACCEPTEE !!');
//         console.warn('!! [UNINST]: Lancement de la procédure de désinstallation... !!');
//         alert('[UNINS]: \nLancement de la procédure de désinstallation...');

//         const config = {
//             dataDirectory: (await ipcRenderer.invoke('appData').then(path => path))
//         };

//         await createFile(config);
//     } else {
//         console.warn('!! [UNINST]: Demande de confirmation DECLINEE !!');
//         console.warn('!! [UNINST]: Arrêt de la procédure de désinstallation... !!');
//         alert('[UNINS]: \nProcédure de désinstallation arrêtée.');
//     }
// });


        maxDownloadFilesInput.addEventListener("change", async () => {
            await this.saveSetting('DF', maxDownloadFilesInput.value);
        })

        maxDownloadFilesReset.addEventListener("click", async () => {
            await this.saveSetting('DF', 5);
        })

        // fonction désactivé en front
        // let themeBox = document.querySelector(".theme-box");
        // let theme = configClient?.launcher_config?.theme || "auto";

        // if (theme == "auto") {
        //     document.querySelector('.theme-btn-auto').classList.add('active-theme');
        // } else if (theme == "dark") {
        //     document.querySelector('.theme-btn-sombre').classList.add('active-theme');
        // } else if (theme == "light") {
        //     document.querySelector('.theme-btn-clair').classList.add('active-theme');
        // }

        themeBox.addEventListener("click", async e => {
            if (e.target.classList.contains('theme-btn')) {
                let activeTheme = document.querySelector('.active-theme');
                if (e.target.classList.contains('active-theme')) return
                activeTheme?.classList.remove('active-theme');

                if (e.target.classList.contains('theme-btn-auto')) {
                    setBackground();
                    theme = "auto";
                    e.target.classList.add('active-theme');
                } else if (e.target.classList.contains('theme-btn-sombre')) {
                    setBackground(true);
                    theme = "dark";
                    e.target.classList.add('active-theme');
                } else if (e.target.classList.contains('theme-btn-clair')) {
                    setBackground(false);
                    theme = "light";
                    e.target.classList.add('active-theme');
                }

                let configClient = await this.db.readData('configClient')
                configClient.launcher_config.theme = theme;
                await this.db.updateData('configClient', configClient);
            }
        })

        let closeBox = document.querySelector(".close-box");
        let closeLauncher = setting?.Close_Launcher || "close-launcher";

        if (closeLauncher == "close-launcher") {
            document.querySelector('.close-launcher').classList.add('active-close');
        } else if (closeLauncher == "close-all") {
            document.querySelector('.close-all').classList.add('active-close');
        } else if (closeLauncher == "close-none") {
            document.querySelector('.close-none').classList.add('active-close');
        }

        closeBox.addEventListener("click", async e => {
            if (e.target.classList.contains('close-btn')) {
                let activeClose = document.querySelector('.active-close');
                if (e.target.classList.contains('active-close')) return
                activeClose?.classList.toggle('active-close');

                if (e.target.classList.contains('close-launcher')) {
                    e.target.classList.toggle('active-close');
                    await this.saveSetting('CL', "close-launcher");
                } else if (e.target.classList.contains('close-all')) {
                    e.target.classList.toggle('active-close');
                    await this.saveSetting('CL', "close-all");
                } else if (e.target.classList.contains('close-none')) {
                    e.target.classList.toggle('active-close');
                    await this.saveSetting('CL', "close-none");
                }
            }
        })
    }
}
export default Settings;