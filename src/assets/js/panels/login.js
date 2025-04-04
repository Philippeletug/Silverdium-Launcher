/**
 * @author Luuxis - master
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0
 * 
 * @author Silverdium
 * @author SilverCore
 * @author Mister Papaye
 */

const { AZauth, Mojang } = require('silver-mc-java-core');
const { ipcRenderer } = require('electron');

import { popup, database, changePanel, accountSelect, SilverAuth, addAccount, config, setStatus, pkg, Dbot } from '../utils.js';
import silverauth from '../utils/silverauth.js';
 
class Login {
    static id = "login"; 
    async init(config) {
        console.log('--------------------LOGIN PANEL--------------------');
        this.config = config;
        this.db = new database();

        if (typeof this.config.online == 'boolean') {
            this.config.online ? this.getMicrosoft() : this.getCrack()
        } else if (typeof this.config.online == 'string') {
            if (this.config.online.match(/^(http|https):\/\/[^ "]+$/)) {
                this.getAZauth();
            }
        }
        
        document.querySelector('.cancel-home').addEventListener('click', () => {
            document.querySelector('.cancel-home').style.display = 'none'
            changePanel('settings')
        })
        console.log('Loading Dbot class drom ../dbot.js');
        const dbot = new Dbot;
    }

    async getMicrosoft() {
        console.log('Initializing Microsoft login...');
        let popupLogin = new popup();
        let loginHome = document.querySelector('.login-home');
        let microsoftBtn = document.querySelector('.connect-home');
        loginHome.style.display = 'block';

        microsoftBtn.addEventListener("click", () => {
            popupLogin.openPopup({
                title: 'Connexion',
                content: 'Veuillez patienter...',
                color: 'var(--color)'
            });

            ipcRenderer.invoke('Microsoft-window', this.config.client_id).then(async account_connect => {
                if (account_connect == 'cancel' || !account_connect) {
                    popupLogin.closePopup();
                    return;
                } else {
                    await this.saveData(account_connect)
                    popupLogin.closePopup();
                }

            }).catch(err => {
                popupLogin.openPopup({
                    title: 'Erreur',
                    content: err,
                    options: true
                });
            });
        })
    }

    async getCrack() {
        console.log('Initializing offline login...');
        let typeconte = 'Offline';
        let popupLogin = new popup();
        let loginOffline = document.querySelector('.login-offline');

        let emailOffline = document.querySelector('.email-offline');
        let connectOffline = document.querySelector('.connect-offline');
        loginOffline.style.display = 'block';

        connectOffline.addEventListener('click', async () => {
            if (emailOffline.value.length < 3) {
                popupLogin.openPopup({
                    title: 'Erreur',
                    content: 'Votre pseudo doit faire au moins 3 caractères. \n(pas 1, pas -13. peut être 2? non toujours pas.) ',
                    options: true
                });
                return;
            }

            if (emailOffline.value.match(/ /g)) {
                popupLogin.openPopup({
                    title: 'Erreur',
                    content: 'Votre pseudo ne doit pas contenir d\'espaces.',
                    options: true
                });
                return;
            }

            let MojangConnect = await Mojang.login(emailOffline.value);

            if (MojangConnect.error) {
                popupLogin.openPopup({
                    title: 'Erreur',
                    content: MojangConnect.message,
                    options: true
                });
                return;
            }
            await this.saveData(MojangConnect)
            popupLogin.closePopup();
        });
    }
    


    async getAZauth() { // silverauth
        console.log('Initializing SilverAuth login...');
        let typeconte = 'AZauth';
        let AZauthClient = new AZauth(this.config.online);
        let PopupLogin = new popup();
        let loginAZauth = document.querySelector('.login-AZauth');
        let loginAZauthA2F = document.querySelector('.login-AZauth-A2F');

        let AZauthEmail = document.querySelector('.email-AZauth');
        let AZauthPassword = document.querySelector('.password-AZauth');
        let AZauthA2F = document.querySelector('.A2F-AZauth');
        let connectAZauthA2F = document.querySelector('.connect-AZauth-A2F');
        let AZauthConnectBTN = document.querySelector('.connect-AZauth');
        let AZauthCancelA2F = document.querySelector('.cancel-AZauth-A2F');
        let registered = document.querySelector('.register-AZauth');

        let SilverAuthVerify = await SilverAuth.verify();

        if (SilverAuthVerify.valid) {
            document.querySelector('.play-btn').style.display = 'block';
            document.querySelector('.play-instance').style.display = 'block';
            document.querySelector('.play-elements').style.display = 'block';
            PopupLogin.closePopup();
            await changePanel('home'); 
        }

        registered.addEventListener('click', async () => {
            SilverAuth.register();
        })

        loginAZauth.style.display = 'block';

        AZauthConnectBTN.addEventListener('click', async () => {
            document.getElementById('redirect').style.display = 'none';
            PopupLogin.openPopup({
                title: 'Connexion en cours...', 
                content: 'Veuillez patienter...',
                color: 'var(--color)'
            });

            if (AZauthEmail.value == '' || AZauthPassword.value == '') {
                return PopupLogin.openPopup({
                    title: 'Erreur',
                    content: 'Veuillez remplir tous les champs.',
                    options: true
                });
            }


            if (this.config.PASS.value) {
                if (AZauthEmail.value == this.config.PASS.email || AZauthPassword.value == this.config.PASS.mdp) {
                    console.log('Connection développeurs')
                    PopupLogin.closePopup();
                    changePanel('home');
                    document.querySelector('.play-btn').style.display = 'none';
                    document.querySelector('.play-instance').style.display = 'none';
                    document.querySelector('.play-elements').style.display = 'none';
                    return;
                } 
            }

            let SilverAuthConnect = await SilverAuth.login(AZauthEmail.value, AZauthPassword.value);
            console.log(SilverAuthConnect)
            if (SilverAuthConnect.error) {
                PopupLogin.openPopup({ 
                    title: 'Erreur',
                    content: SilverAuthConnect.message.silver,
                    options: true
                });
                return;
            } else if (SilverAuthConnect.success) {
                document.querySelector('.play-btn').style.display = 'block';
                document.querySelector('.play-instance').style.display = 'block';
                document.querySelector('.play-elements').style.display = 'block';
                PopupLogin.closePopup();
                await changePanel('home'); 
            }
        });
    }

    
    async saveData(connectionData) {
        let configClient = await this.db.readData('configClient');
        let account = await this.db.createData('accounts', connectionData);
        let instanceSelect = configClient.instance_select;
        let instancesList = await config.getInstanceList();
        configClient.account_selected = account.ID;
    
        for (let instance of instancesList) {
            if (instance.whitelistActive) {
                let whitelist = instance.whitelist.find(whitelist => whitelist === account.name);
                if (!whitelist) { 
                    if (instance.name === instanceSelect) {
                        let newInstanceSelect = instancesList.find(i => !i.whitelistActive);
                        if (newInstanceSelect) {  // Vérification que newInstanceSelect n'est pas undefined
                            configClient.instance_select = newInstanceSelect.name;
                            await setStatus(newInstanceSelect.status); 
                        }
                    }
                }
            }
        }
    
        await this.db.updateData('configClient', configClient);
        await addAccount(account);
        await accountSelect(account);
        await changePanel('home'); 
    }

}
export default Login;