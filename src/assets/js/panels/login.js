/**
 * @author Luuxis - master
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0
 * 
 * @author Silverdium
 * @author SilverCore
 * @author Mister Papaye
 */

const { AZauth, Mojang } = require('silver-mc-java-core');
const { ipcRenderer, session } = require('electron');
const fs = require('fs');
const path = require('path');

import { popup, database, changePanel, accountSelect, SilverAuth, appdata, addAccount, config, setStatus, pkg, Dbot } from '../utils.js';
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

        const appDataPath = await appdata();
        const isMac = process.platform === 'darwin';
        const cleint_json_path = `${appDataPath}/${isMac ? this.config.dataDirectory : `.${this.config.dataDirectory}`}/auth/client.json`;


        if (fs.existsSync(cleint_json_path)) {
                
            const client = require(cleint_json_path);

            let SilverAuthVerify = await SilverAuth.verify(client.token);

            if (SilverAuthVerify.valid) {

                const SaccountData = {
                    valid: SilverAuthVerify.valid,
                    token: SilverAuthVerify.token,
                    data: SilverAuthVerify.data.usr_info,
                    sub: SilverAuthVerify.data.sub
                };

                await fs.promises.writeFile(cleint_json_path, JSON.stringify(SaccountData, null, 2));

                document.querySelector('.play-btn').style.display = 'block';
                document.querySelector('.play-instance').style.display = 'block';
                document.querySelector('.play-elements').style.display = 'block';
                PopupLogin.closePopup();
                await addAccount(SaccountData);
                await accountSelect(SaccountData);
                await changePanel('home'); 

            }

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

            let SILVERAuthConnect = await SilverAuth.login(AZauthEmail.value, AZauthPassword.value);
            let SilverAuthConnect = SILVERAuthConnect.data;

            console.log(SilverAuthConnect)

            if (SilverAuthConnect.error) {
                PopupLogin.closePopup();
                PopupLogin.openPopup({ 
                    title: 'Erreur',
                    content: SilverAuthConnect.message || SilverAuthConnect.message.silver,
                    options: true
                });
                return;
            } else if (!SilverAuthConnect.error) {

                const appDataPath = await appdata();
                const isMac = process.platform === 'darwin';
                const Json_Path = `${appDataPath}/${isMac ? this.config.dataDirectory : `.${this.config.dataDirectory}`}/auth`;

                const verify = await SilverAuth.verify(SilverAuthConnect.token);

                if (verify.error) {
                    PopupLogin.openPopup({ 
                        title: 'Erreur',
                        content: verify.message || verify.message.silver,
                        options: true
                    });
                }

                const SaccountData = {
                    valid: verify.valid,
                    token: verify.token,
                    data: verify.data.usr_info,
                    sub: verify.data.sub
                };

                if (!fs.existsSync(Json_Path)) {
                    await fs.promises.mkdir(Json_Path);
                }
                await fs.promises.writeFile(`${Json_Path}/client.json`, JSON.stringify(SaccountData, null, 2));
                
                this.saveData(SaccountData)
                
                document.querySelector('.play-btn').style.display = 'block';
                document.querySelector('.play-instance').style.display = 'block';
                document.querySelector('.play-elements').style.display = 'block';
                PopupLogin.closePopup();

            }
        });
    }

    
    async saveData(connectionData) {

        await addAccount(connectionData);
        await accountSelect(connectionData);
        await changePanel('home'); 

    }

}
export default Login;