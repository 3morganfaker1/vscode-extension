
const rp = require('request-promise');
const request = require('request');
const vscode = require('vscode');
const https = require('https');
const {BASE}=require('./value');
const { checkLogin } = require('./niepan');
const agent = new https.Agent({
    rejectUnauthorized: false,
});
/** 
* POST请求
* @param {vscode.ExtensionContext} ctx context
* @param {string} url 请求地址 
* @param {object} data 请求参数
* @return {object} 返回body
*/
async function sendData(ctx,url, data) {
    // var token = 0;
    var token = await ctx.globalState.get('niepan.token', false);
    const j = request.jar();
    const cookie = request.cookie(`token=${token}`);
    j.setCookie(cookie, BASE);
    try {
        var resp = await rp({
            method: 'POST',
            json: true,
            body: data,
            url: url,
            jar: j,
            agentOptions: {
                rejectUnauthorized: false
            }
        })
        if(resp instanceof Object){
            return resp;
        }else{
            return JSON.parse(resp);
        }
    } catch (e) {
        if (e.response && e.response.statusCode == 401) {
            // vscode.window.showInformationMessage('登录已过期，请重新登录');
            await vscode.commands.executeCommand('niepan.logout');
            await vscode.commands.executeCommand('niepan.login');
            // return {
            //     state:false,
            //     message:"登录已过期，请重新登录"
            // }
        }else if(e.response && e.response.statusCode == 404){
            return {
                state:false,
                message:e.response.body.message
            }
        }
         else {
            // vscode.window.showInformationMessage('网络错误');
            return {
                state:false,
                message:"网络错误"
            }
        }
    }
}
/** 
* Get请求
* @param {vscode.ExtensionContext} ctx context
* @param {string} url 请求地址 
* @param {object} data 请求参数
* @return {object} 返回body
*/
async function getData(ctx,url, data) {
    // var token = 0;
    var token = await ctx.globalState.get('niepan.token', false);
    const j = request.jar();
    const cookie = request.cookie(`token=${token}`);
    j.setCookie(cookie, BASE);
    try {
        var resp = await rp({
            qs: data,
            method: 'GET',
            url: url,
            jar: j,
            agentOptions: {
                rejectUnauthorized: false
            }
        })
        if(resp instanceof Object){
            return resp;
        }else{
            return JSON.parse(resp);
        }
    } catch (e) {
        if (e.response.statusCode == 401) {
            // await vscode.commands.executeCommand('niepan.enforceSubmitRecord')
            // state = false
            await vscode.commands.executeCommand('niepan.logout');
            await vscode.commands.executeCommand('niepan.login');
            // return { 
            //     state:false,
            //     message:"登录已过期，请重新登录"
            // }
        } else {
            // vscode.window.showInformationMessage('网络错误');
            return {
                state:false,
                message:"网络错误"
            }
        }
    }
}

module.exports = {
    sendData,
    getData
}