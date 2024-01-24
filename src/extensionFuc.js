const vscode = require('vscode');
const {login,logout, loginIntercept,getUserInfo, enforceRole,enforceLogin,displayQuestion,resetWorkspace, enforceState,setState,getState, enforceNoState,onSave}=require('./niepan')
const {NiepanMenuProvider}=require('./tree')
//注册命令
async function niepanLogin(context){
    let menu=new NiepanMenuProvider(context)
    try{
        await login(context);
		}catch(e){
			vscode.window.showInformationMessage(e.message);
			vscode.window.showInformationMessage(e.stack);
		}
        // menu.refresh()
}
//验收模块





module.exports = {
    niepanLogin,
}