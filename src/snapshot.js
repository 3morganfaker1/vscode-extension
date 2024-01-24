const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const BLACK_LIST = ["node_modules", ".git"]
const WHITELIST = [".wxml", ".js", ".wxss", ".json"]
/** 递归获取文件内容
 * @param {string} projectPathBase 路径基准
 * @param {string} projectPath 绝对路径（用来生成和workspace根目录的相对路径）
 * @param {object} output 结果
 */
function walk(projectPathBase,projectPath, output) {
    var files = fs.readdirSync(projectPath) //同步拿到文件目录下的所有文件名
    // vscode.window.showInformationMessage(`${files}`);
    files.forEach(file => {
        var tempFile = path.join(projectPath, file); //拼接为相对路径
        stats = fs.statSync(tempFile) //拿到文件信息对象
        // vscode.window.showInformationMessage(`${stats}`);
        if (stats.isDirectory()) { //判断是否为文件夹类型
            if (BLACK_LIST.includes(file)) { // 必须过滤掉node_modules和git文件夹
                // console.log(`${file} is black list`);
            } else {
                // vscode.window.showInformationMessage(`递归`);
                walk(projectPathBase,tempFile, output); //递归读取文件夹
            }
        } else {  //若不为文件夹类型
            var tempPath = path.relative(projectPathBase, tempFile)  //path.relative() 方法根据当前工作目录返回从 from 到 to 的相对路径
            var fileContent="NOT INCLUDED";
            if (WHITELIST.includes(path.extname(file))) {  //path.extname()方法返回path路径文件扩展名，如果path以 ‘.' 为结尾，将返回 ‘.'，如果无扩展名 又 不以'.'结尾，将返回空值
                fileContent=fs.readFileSync(tempFile).toString();  //fs.readFileSync()方法是fs模块的内置应用程序编程接口,用于读取文件并返回其内容
            }    
            // vscode.window.showInformationMessage(`相对路径`);
            // console.log(projectPath,tempFile,tempPath);
            // console.log(tempFile,projectPath,tempPath);
            var dir = path.dirname(tempPath);  //os.path.dirname(path)去掉文件名，返回目录
            // vscode.window.showInformationMessage(`文件夹`);
            var fileName = path.basename(tempPath);  //path.basename() 方法会返回 path 的最后一部分。 尾部的目录分隔符会被忽略
            if(fileName[0]=='.' || (dir!='.' && dir[0]=='.')){
                return;
            }
            // vscode.window.showInformationMessage(`文件名`);
            var temp = undefined;
            // console.log(dir.split(path.sep));
            dir.split(path.sep).forEach(dirName => {
                dirName=dirName.replace('.','_');
                temp = temp ? temp[dirName]?temp[dirName]:temp[dirName]={} : output[dirName]? output[dirName]:output[dirName]= {};
                // vscode.window.showInformationMessage(JSON.stringify(temp));
            })
            fileName=fileName.replace(/\./g,'*');
            // console.log(temp);
            // vscode.window.showInformationMessage(`路径`);
            temp[fileName] = fileContent;
            // vscode.window.showInformationMessage(`文件内容`);
            
        }
    });
}

/** 文件快照
 * @return {object} output 结果
 */
function snapshot() {
    var folder = vscode.workspace.workspaceFolders[0];  //vscode.workspace.workspaceFolders可以获取当前工作区所有根文件夹数组
    // vscode.window.showInformationMessage(`${folder.uri.path}`);
    // console.log(folder.uri.fsPath);
    var projectPath = path.resolve(folder.uri.fsPath);  //path.resolve() 方法会把一个路径或路径片段的序列解析为一个绝对路径
    var output = {}
    // vscode.window.showInformationMessage(folder.uri.fsPath);
    // vscode.window.showInformationMessage(projectPath)
    try{
        walk(projectPath,projectPath, output);
    }catch(e){
        vscode.window.showInformationMessage(e.name);
        vscode.window.showInformationMessage(e.message);
        vscode.window.showInformationMessage(e.stack);
    }
    return output
}
/** 从文件快照恢复项目
 * @param {object} result 快照对象
 */
function recover(result){
    var folder = vscode.workspace.workspaceFolders[0];   //vscode.workspace.workspaceFolders可以获取当前工作区所有根文件夹数组
    var projectPath = path.resolve(folder.uri.fsPath);
    var projectConfigFile=undefined;
    var appid=undefined;
    try{
        // console.log(path.join(projectPath,'project.config.json'));
        projectConfigFile=fs.readFileSync(path.join(projectPath,'project.config.json')).toString();
    }catch(e){
        
    }
    if(!projectConfigFile){
        vscode.window.showInformationMessage('请打开微信小程序项目');
        return;
    }else{
        var projectConfig=JSON.parse(projectConfigFile);
        // var projectConfig=projectConfigFile;
        if(projectConfig.appid){
            appid=projectConfig.appid;
        }else{
            vscode.window.showInformationMessage('微信小程序配置文件错误');
            return;
        }
    }
    deleteDir(projectPath);
    try{
        release(projectPath,result,appid);
    }catch(e){
        
    }
    // release(projectPath,result);
}
/** 递归恢复文件
 * @param {string} base 工作目录
 * @param {object} result 快照对象
 * @param {string} appid 小程序appid
 */
function release(base,result,appid){
    for(var key in result){
        if(result[key] instanceof Object){
            var dirName=key.replace('_','.');
            var tempBase=path.join(base,dirName);
            try{
                fs.mkdirSync(tempBase);  //fs.mkdirSync(path,[mode]) 同步方法 创建目录，path是需要创建的目录，[mode]是目录的权限
            }catch(e){
                if(e.code!='EEXIST'){
                    throw e;
                }
            }
            // fs.mkdirSync(tempBase);
            release(tempBase,result[key],appid);
        }else{
            var fileName=key.replace(/\*/g,'.');
            var fileContent=result[key];
            if(fileName=="project.config.json"){
                var tempConfig=JSON.parse(fileContent);
                console.log(tempConfig.appid,appid);
                tempConfig.appid=appid;
                fileContent=JSON.stringify(tempConfig,null,4);
            }
            var filePath=path.join(base,fileName);
            fs.writeFileSync(filePath,fileContent);  //fs.writeFileSync()方法用于将数据同步写入文件
        }
    }
}

/** 删除文件夹下内容
 * @param {string} dirPath 文件夹路径
 * @param {boolean} delSelf 是否删除自己
 */
function deleteDir(dirPath,delSelf=false) {
    if (fs.existsSync(dirPath)) {   //fs.existsSync以同步的方法检测目录是否存在
        var files = fs.readdirSync(dirPath);
        files.forEach(function (file, index) {
            var curPath=path.join(dirPath,file);
            if (fs.statSync(curPath).isDirectory()) { // recurse    fs.statSync拿到文件信息对象，stats.isDirectiory(): 如果是目录则返回true,否则返回false
                deleteDir(curPath,true);
            } else { // delete file
                fs.unlinkSync(curPath);  //fs.unlinkSync()方法用于从文件系统中同步删除文件或符号链接
            }
        });
        if(delSelf){
            fs.rmdirSync(dirPath);  //fs.rmdirSync()方法用于同步删除给定路径下的目录
        }
    }
}


module.exports = {
    snapshot,
    recover
}