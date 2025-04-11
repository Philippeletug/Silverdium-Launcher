/**
 * @author Silverdium
 * @author SilverCore
 * @author Mister Papaye
 */

const fs = require('fs')

class setting {

    constructor(appdata, config) {

        this.config = config;

        this.initializePaths(appdata);

    };

    async initializePaths(appdata) {
        this.appDataPath = await appdata();
        this.isMac = process.platform === 'darwin';
        this.Json_Path = `${this.appDataPath}/${this.isMac ? this.config.dataDirectory : `.${this.config.dataDirectory}`}`;
    }    
        
    async init() {

        try {

            await this.verify_dir('/');
            await this.verify_dir('/auth');
            await this.verify_dir('/auth/setting.json');

            console.log('Initialisation de setting.json réalisée avec succès !');

        } catch (err) {

            console.error('Erreur lors de l\'initialisation de setting.json : ', err || err.message);

        }

    }
    

    async verify_dir(dir) {

        if (dir == '/auth/setting.json') {

            if (!fs.existsSync(this.Json_Path + dir)) {
                await fs.promises.writeFile(this.Json_Path + dir, JSON.stringify({
                    MinRAM: 2,
                    MaxRAM: 6,
                    Download_File: 5,
                    Close_Launcher: "close-launcher",
                    instance_selct: null,
                    account_selected: null,
                    java_config: {
                        java_path: `${this.appDataPath}/${process.platform == 'darwin' ? this.config.dataDirectory : `.${this.config.dataDirectory}`}/runtime`
                    },
                    game_config: {
                        screen_size: {
                            width: 1080,
                            height: 720
                        }
                    }
                }, null, 2));
            };
        
        }

        else {

            if (!fs.existsSync(this.Json_Path + dir)) {
                await fs.promises.mkdir(this.Json_Path + dir);
            }

        }
        
    }

    async save(type, arg1, arg2) {

        let save_setting_path = `${this.Json_Path}/auth/setting.json`;

        await this.init();

        let data = await fs.promises.readFile(save_setting_path, 'utf8');

        data = JSON.parse(data);
        
        if (type == 'RAM') {
            
            data.MinRAM = arg1 || 2;
            data.MaxRAM = arg2 || 6;

        }

        else if (type == 'DF') {

            data.Download_File = parseFloat(arg1) || 5;

        }

        else if (type == 'CL') {

            data.Close_Launcher = arg1 || "close-launcher";

        }

        else if (type == 'INSTANCE') {

            data.instance_selct = arg1 || null;

        }

        else if (type == 'SCREEN') {

            if (arg1 == 'WIDTH') {

                data.game_config.screen_size.width = arg2 || 1080;

            }

            else if (arg1 == 'HEIGHT') {

                data.game_config.screen_size.height = arg2 || 720;

            }

        }

        else if (type == 'ACCOUNT') {

            data.account_selected = arg1 || null;

        }

        else {
            console.error('Type de setting a save mal défini : ' + type);
        };

        try {
            await fs.promises.writeFile(save_setting_path, JSON.stringify(data, null, 2));
        }
        catch (err) {
            return console.error(`Une erreur est survenue lors de la sauvegarde du paramettre : "${type || 'non défini'}" avec les arguments : ${arg1 || 'non défini'} et ${arg2 || 'non défini'} : `, err || err.message);
        };

    }

    async load(arg) {

        let data;

        if (arg == 'ACCOUNT') {

            if (fs.existsSync(`${this.Json_Path}/auth/client.json`)) {
                data = await fs.promises.readFile(`${this.Json_Path}/auth/client.json`, 'utf8');
            } else {
                data = null;
            }

        } else {

            data = await fs.promises.readFile(`${this.Json_Path}/auth/setting.json`, 'utf8');

        }

        return JSON.parse(data);

    }

}

export default setting;