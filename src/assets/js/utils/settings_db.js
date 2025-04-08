/**
 * @author Silverdium
 * @author SilverCore
 * @author Mister Papaye
 */

const fs = require('fs')

class setting {

    constructor(appdata, config) {
        this.appdata = appdata;
        this.config = config;
    };
        
    async init() {

        const appDataPath = await this.appdata();
        const isMac = process.platform === 'darwin';
        const Json_Path = `${appDataPath}/${isMac ? this.config.dataDirectory : `.${this.config.dataDirectory}`}/auth`;
        
        if (!fs.existsSync(Json_Path)) {
            await fs.promises.mkdir(Json_Path);
        }


        if (!fs.existsSync(Json_Path + '/setting.json')) {
            await fs.promises.writeFile(`${Json_Path}/setting.json`, JSON.stringify({
                MinRAM: 2,
                MaxRAM: 6,
                Download_File: 5,
                Close_Launcher: "close-launcher",
                instance_selct: null,
                account_selected: null,
                game_config: {
                    screen_size: {
                        width: 1080,
                        height: 720
                    }
                }
            }, null, 2));
        };

    }

    async save(type, arg1, arg2) {

        const appDataPath = await this.appdata();
        const isMac = process.platform === 'darwin';
        const Json_Path = `${appDataPath}/${isMac ? this.config.dataDirectory : `.${this.config.dataDirectory}`}/auth`;
        
        if (!fs.existsSync(Json_Path)) {
            await fs.promises.mkdir(Json_Path);
        }

        let data = await fs.promises.readFile(`${Json_Path}/setting.json`, 'utf8');

        data = JSON.parse(data) 

        if (type == 'RAM') {
            
            data = {
                MinRAM: arg1,
                MaxRAM: arg2,
                Download_File: data.Download_File || 5,
                Close_Launcher: data.Close_Launcher || "close-launcher",
                instance_selct: data.instance_selct,
                account_selected: data.account_selected || null,
                game_config: {
                    screen_size: {
                        width: data.game_config.screen_size.width || 1080,
                        height: data.game_config.screen_size.height || 720
                    }
                }
            } 

        }

        else if (type == 'DF') {

            data = {
                MinRAM: data.MinRAM || null,
                MaxRAM: data.MaxRAM || null,
                Download_File: parseFloat(arg1),
                Close_Launcher: data.Close_Launcher || "close-launcher",
                instance_selct: data.instance_selct,
                account_selected: data.account_selected || null,
                game_config: {
                    screen_size: {
                        width: data.game_config.screen_size.width || 1080,
                        height: data.game_config.screen_size.height || 720
                    }
                }
            }

        }

        else if (type == 'CL') {

            data = {
                MinRAM: data.MinRAM || null,
                MaxRAM: data.MaxRAM || null,
                Download_File: data.Download_File || 5,
                Close_Launcher: arg1,
                instance_selct: datainstance_selct,
                account_selected: data.account_selected || null,
                game_config: {
                    screen_size: {
                        width: data.game_config.screen_size.width || 1080,
                        height: data.game_config.screen_size.height || 720
                    }
                }
            }

        }

        else if (type == 'INSTANCE') {

            data = {
                MinRAM: data.MinRAM || null,
                MaxRAM: data.MaxRAM || null,
                Download_File: data.Download_File || 5,
                Close_Launcher: data.Close_Launcher,
                instance_selct: arg1,
                account_selected: data.account_selected || null,
                game_config: {
                    screen_size: {
                        width: data.game_config.screen_size.width || 1080,
                        height: data.game_config.screen_size.height || 720
                    }
                }
            };

        }

        else if (type == 'ACCOUNT') {

            data = { 
                MinRAM: data.MinRAM || null,
                MaxRAM: data.MaxRAM || null,
                Download_File: data.Download_File || 5,
                Close_Launcher: data.Close_Launcher,
                instance_selct: data.instance_selct,
                account_selected: arg1 || null,
                game_config: {
                    screen_size: {
                        width: data.game_config.screen_size.width || 1080,
                        height: data.game_config.screen_size.height || 720
                    }
                }
            }

        }

        else {
            console.error('Type de setting a save mal défini : ' + type);
        };

        await fs.promises.writeFile(`${Json_Path}/setting.json`, JSON.stringify(data, null, 2));

    }

    async load(arg) {

        const appDataPath = await this.appdata();
        const isMac = process.platform === 'darwin';
        const Json_Path = `${appDataPath}/${isMac ? this.config.dataDirectory : `.${this.config.dataDirectory}`}/auth`;

        let data;

        if (arg == 'ACCOUNT') {

            if (fs.existsSync(`${Json_Path}/client.json`)) {
                data = await fs.promises.readFile(`${Json_Path}/client.json`, 'utf8');
            } else {
                data = null;
            }

        } else {

            data = await fs.promises.readFile(`${Json_Path}/setting.json`, 'utf8');

        }

        return JSON.parse(data);

    }

}

export default setting;