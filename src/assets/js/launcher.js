/**
 * @author Luuxis - master
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0
 * 
 * @author Silverdium
 * @author SilverCore
 * @author Mister Papaye
 */

// import panel
import Login from './panels/login.js';
import Home from './panels/home.js';
import Settings from './panels/settings.js';

// import modules
import { logger, config, changePanel, database, popup, cmd, setBackground, SilverAuth, initializeDiscordRPC, accountSelect, addAccount, pkg, appdata, Salert, settings } from './utils.js';

// libs
const { ipcRenderer } = require('electron');
const fs = require('fs');

let noroll = false;

class Launcher {
    async init() {

        this.initLog();
        console.log('Initializing Launcher...');
        this.shortcut()
        console.log('Initializing back ground...');
        await setBackground()
        if (process.platform == 'win32') this.initFrame();
        this.config = await config.GetConfig().then(res => res).catch(err => err);
        if (await this.config.error) return this.errorConnect()
        this.db = new database();
        // await this.initConfigClient();
        this.os_info = await this.get_os_info();
        console.log('Initializing panels : (Login, Home, Settings)...');
        this.createPanels(Login, Home, Settings);
        console.log('Starting launcher...');
        this.startLauncher();
        this.maintenance();
        this.donsvp();
        this.initCmd()
        initializeDiscordRPC();

    }

    initLog() {
        document.addEventListener('keydown', e => {
            if (e.ctrlKey && e.shiftKey && e.keyCode == 73 ) {
                ipcRenderer.send('main-window-dev-tools-close');
                ipcRenderer.send('main-window-dev-tools');
            }
        })
        new logger(pkg.loggername, '#f270ff');
    }
    
    async get_os_info() {
        let info = await ipcRenderer.invoke('get-pc-info');
        return info;
    }

    async initCmd() {

        await new cmd(pkg.version, this.os_info);

        const draggableElement = document.getElementById("drag-me-contaner");
        const dragger = document.getElementById("drag-me");

        let offsetX, offsetY;

        dragger.addEventListener('mousedown', function(e) {
            offsetX = e.clientX - draggableElement.getBoundingClientRect().left;
            offsetY = e.clientY - draggableElement.getBoundingClientRect().top;

            document.addEventListener('mousemove', moveElement);
            document.addEventListener('mouseup', stopDragging);
        });

        function moveElement(e) {
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;

            draggableElement.style.left = x + 'px';
            draggableElement.style.top = y + 'px';
        }

        function stopDragging() {
            document.removeEventListener('mousemove', moveElement);
            document.removeEventListener('mouseup', stopDragging);
        }

    }

    shortcut() {
        document.addEventListener('keydown', e => {
            if (e.ctrlKey && e.keyCode == 87) {
                ipcRenderer.send('main-window-close');
            }
        })
        let keysPressed = [];
        document.addEventListener('keydown', e => {
            if ([83, 73, 76, 86, 69, 82, 83, 73, 76, 86, 69, 82].includes(e.keyCode) && !keysPressed.includes(e.keyCode)) {
                keysPressed.push(e.keyCode);
            }
        
            if (keysPressed.length === 12 && 
                keysPressed.includes(83) &&  // S
                keysPressed.includes(73) &&  // I
                keysPressed.includes(76) &&  // L
                keysPressed.includes(86) &&  // V
                keysPressed.includes(69) &&  // E
                keysPressed.includes(82) &&  // R
                keysPressed.includes(83) &&  // S
                keysPressed.includes(73) &&  // I
                keysPressed.includes(76) &&  // L
                keysPressed.includes(86) &&  // V
                keysPressed.includes(69) &&  // E
                keysPressed.includes(82)) {  // R
                if (noroll === false) {
                    window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                }
            }
        });
    }

    errorConnect() {
        new popup().openPopup({
            title: this.config.error.code,
            content: this.config.error.message,
            color: 'red',
            exit: true,
            options: true
        });
    }

    maintenance() {
        if (this.config.servmaintenance === true) {
            console.warn('Le serveur est actuellement en maintenance.');
            Salert('Silverdium Launcher', `${this.config.servmaintenance_message}`, 'info', true, false);
        } else if (this.config.servmaintenance === false) {
            console.log('maintenance false');
        } else {
            console.error('Error: config.servmaintenance is not defined.');
        }
    }

    donsvp() {
        if (Math.random() < 0.2) {
            console.log('executing donsvp alert...');
            Salert('<h1>Silverdium Launcher<h1>', `
                <h2>Vous pouvez aider Silverdium,<br>avec un €, vous pouvez déjà
                <br>bien nous aider et obtenir de nombreux avantage.</h2><br>
                    <a
                    style="
                        margin: 0 1rem;
                        padding: calc(0.1rem + 4px) calc(1.5rem + 4px);
                        border-radius: 15px;
                        background: var(--dark-color);
                        color: var(--light-color);
                        border: 2px solid var(--color);
                        cursor: pointer;
                        transition: 0.4s ease, color 0.4s ease, border-color 0.4s ease;
                    " href="https://tipeee.com/silverdium" target="_blank">Tipeee</a>
                `, 'warning', true, false);
        }
    }

    initFrame() {
        console.log('Initializing Frame...')
        document.querySelector('.frame').classList.toggle('hide')
        document.querySelector('.dragbar').classList.toggle('hide')

        document.querySelector('.launcher-version').innerHTML = 'V' + pkg.version;

        document.querySelector('#minimize').addEventListener('click', () => {
            ipcRenderer.send('main-window-minimize');
        });

        let maximized = false;
        let maximize = document.querySelector('#maximize')
        maximize.addEventListener('click', () => {
            if (maximized) ipcRenderer.send('main-window-maximize')
            else ipcRenderer.send('main-window-maximize');
            maximized = !maximized
            maximize.classList.toggle('icon-maximize')
            maximize.classList.toggle('icon-restore-down')
        });

        document.querySelector('#close').addEventListener('click', () => {
            ipcRenderer.send('main-window-close');
        })
    }

    // async initConfigClient() {
    //  
    //     console.log('Initializing Config Client...')
        // let configClient = await this.db.readData('configClient')
        // const totalMem = Math.trunc(os.totalmem() / 1073741824 * 10) / 10;
        // const maxmem = totalMem / 2;


        // if (!configClient) {
        //     await this.db.createData('configClient', {
        //         account_selected: null,
        //         instance_selct: null,
        //         java_config: {
        //             java_path: null,
        //             java_memory: {
        //                 min: 2,
        //                 max: maxmem
        //             }
        //         },
        //         game_config: {
        //             screen_size: {
        //                 width: 1080,
        //                 height: 720
        //             }
        //         },
        //         launcher_config: {
        //             download_multi: 5,
        //             theme: 'dark',
        //             closeLauncher: 'close-launcher',
        //             intelEnabledMac: true
        //         }
        //     })
        // }
    // }

    createPanels(...panels) {
        let panelsElem = document.querySelector('.panels')
        for (let panel of panels) {
            console.log(`Initializing ${panel.name} Panel...`);
            console.log(`${panel.name} loading and initializing end !`);
            let div = document.createElement('div');
            div.classList.add('panel', panel.id)
            div.innerHTML = fs.readFileSync(`${__dirname}/panels/${panel.id}.html`, 'utf8');
            panelsElem.appendChild(div);
            new panel().init(this.config);
        }
    }    

    async startLauncher() {
    
        const accounts = await settings.load('ACCOUNT');
        const appDataPath = await appdata();
        const isMac = process.platform === 'darwin';
        const clientJsonPath = `${appDataPath}/${isMac ? this.config.dataDirectory : `.${this.config.dataDirectory}`}/auth/client.json`;
        const popupRefresh = new popup();
    
        if (accounts?.valid) {
            const account = accounts;
    
            popupRefresh.openPopup({
                title: 'Connexion',
                content: `Refresh account Type: SilverAuth | Username: ${account.data?.name}`,
                color: 'var(--color)',
                background: false
            });
    
            try {
                const refresh_accounts = await SilverAuth.verify(account.token);
    
                if (refresh_accounts.valid) {
                    console.log(`[Account] : Username: ${account.data?.name}  UUID: ${account.data?.dataplus?.UUID}`);
    
                    const SaccountData = {
                        valid: refresh_accounts.valid,
                        token: refresh_accounts.token,
                        data: refresh_accounts.data.usr_info,
                        sub: refresh_accounts.data.sub
                    };
    
                    await fs.promises.writeFile(clientJsonPath, JSON.stringify(SaccountData, null, 2));
    
                    // Affichage des éléments de jeu
                    document.querySelector('.play-btn').style.display = 'block';
                    document.querySelector('.play-instance').style.display = 'block';
                    document.querySelector('.play-elements').style.display = 'block';
    
                    popupRefresh.closePopup();
    
                    await addAccount(SaccountData);
                    await accountSelect(SaccountData);
                    await settings.save('ACCOUNT', SaccountData.data.UUID)
                    await changePanel('home');
                    return;
                } else if (refresh_accounts.error) {
                    console.error(`[Account] ${account.data?.name}: ${refresh_accounts.message}`);
                }
    
            } catch (error) {
                console.error('Erreur lors de la vérification du compte :', error);
            }
    
            popupRefresh.closePopup();
            changePanel("home");
    
        } else {
            popupRefresh.closePopup();
            changePanel('login');
        }
    }
    
}

new Launcher().init();
