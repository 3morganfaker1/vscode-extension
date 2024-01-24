const vscode=require('vscode');
const {getState, checkLogin, checkGroup,test}=require('./niepan');
class NiepanMenuProvider{
    constructor(context){
        // this.itemList=
        this.context=context;
        this._onDidChangeTreeData=new vscode.EventEmitter();
        this.onDidChangeTreeData=this._onDidChangeTreeData.event;
    }

    
    refresh(){
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element){
        // console.log(element);
        return element
    }

    async getChildren(element){
        // console.log(element);
        var items=new Array();
        var state=await getState(this.context);
        var token=await checkLogin(this.context);
        if(token){
            items.push(new NiepanMenuItem("登出涅槃",vscode.TreeItemCollapsibleState.None,"niepan.logout"))
            if(await checkGroup(this.context,[3,4,5,6])){
                if(!state.state){
                    items.push(new NiepanMenuItem("解疑",vscode.TreeItemCollapsibleState.None,"niepan.help"))
                    items.push(new NiepanMenuItem("求助",vscode.TreeItemCollapsibleState.None,"niepan.seekHelp"))
                    items.push(new NiepanMenuItem("自由调试模式",vscode.TreeItemCollapsibleState.None,"niepan.freeDebug"))
                    items.push(new NiepanMenuItem("bug挑战",vscode.TreeItemCollapsibleState.None,"niepan.bug"))
                    items.push(new NiepanMenuItem("chat",vscode.TreeItemCollapsibleState.None,"niepan.chatHelp"))
                }else{
                    if(state.state=="exam"){
                        items.push(new NiepanMenuItem("查看问题详情",vscode.TreeItemCollapsibleState.None,"niepan.displayquestion"))
                        items.push(new NiepanMenuItem("查看提交记录",vscode.TreeItemCollapsibleState.None,"niepan.submit"))
                        items.push(new NiepanMenuItem("重置工作区",vscode.TreeItemCollapsibleState.None,"niepan.resetworkspace"))
                        items.push(new NiepanMenuItem("正式提交",vscode.TreeItemCollapsibleState.None,"niepan.submitRecord"))
                        items.push(new NiepanMenuItem("求助",vscode.TreeItemCollapsibleState.None,"niepan.seekHelp"))
                        items.push(new NiepanMenuItem("chat",vscode.TreeItemCollapsibleState.None,"niepan.chatHelp"))
                    }else if(state.state == "freedebug"){
                        items.push(new NiepanMenuItem("查看调试结果",vscode.TreeItemCollapsibleState.None,"niepan.displayDebugResult"))
                        items.push(new NiepanMenuItem("使用涅槃代码库/下拉别人代码",vscode.TreeItemCollapsibleState.None,"niepan.codeFreeDebug"))
                        items.push(new NiepanMenuItem("使用本地代码",vscode.TreeItemCollapsibleState.None,"niepan.localFreeDebug"))
                        items.push(new NiepanMenuItem("退出自由答题模式",vscode.TreeItemCollapsibleState.None,"niepan.logoutFreeDebug"))
                    }else if(state.state == "checkdebug"){
                        items.push(new NiepanMenuItem("调试结果详情",vscode.TreeItemCollapsibleState.None,"niepan.checkDebug")) 
                        items.push(new NiepanMenuItem("退出查看调试结果",vscode.TreeItemCollapsibleState.None,"niepan.logoutcheckDebug"))
                    }else if(state.state == "bug"){
                        items.push(new NiepanMenuItem("创建排位",vscode.TreeItemCollapsibleState.None,"niepan.createexam"))
                        items.push(new NiepanMenuItem("排位模式",vscode.TreeItemCollapsibleState.None,"niepan.startexam")) 
                        items.push(new NiepanMenuItem("训练模式",vscode.TreeItemCollapsibleState.None,"niepan.bugtraining"))
                        items.push(new NiepanMenuItem("挑战记录",vscode.TreeItemCollapsibleState.None,"niepan.checkbug")) 
                        items.push(new NiepanMenuItem("创建挑战",vscode.TreeItemCollapsibleState.None,"niepan.Icreateexam"))
                        items.push(new NiepanMenuItem("退出bug挑战",vscode.TreeItemCollapsibleState.None,"niepan.logoutbug"))
                    }else if(state.state == "local"){
                        items.push(new NiepanMenuItem("查看提交记录",vscode.TreeItemCollapsibleState.None,"niepan.submit"))
                        items.push(new NiepanMenuItem("重置工作区",vscode.TreeItemCollapsibleState.None,"niepan.resetworkspace"))
                        items.push(new NiepanMenuItem("正式提交",vscode.TreeItemCollapsibleState.None,"niepan.submitRecord"))
                        items.push(new NiepanMenuItem("求助",vscode.TreeItemCollapsibleState.None,"niepan.seekHelp"))
                        items.push(new NiepanMenuItem("chat",vscode.TreeItemCollapsibleState.None,"niepan.chatHelp"))
                        
                    }
                }
            }else if(await checkGroup(this.context,[1,2,7])){
                if(!state.state){
                    items.push(new NiepanMenuItem("求助",vscode.TreeItemCollapsibleState.None,"niepan.seekHelp"))
                    items.push(new NiepanMenuItem("自由调试模式",vscode.TreeItemCollapsibleState.None,"niepan.freeDebug"))
                    items.push(new NiepanMenuItem("bug挑战",vscode.TreeItemCollapsibleState.None,"niepan.bug"))
                    items.push(new NiepanMenuItem("chat",vscode.TreeItemCollapsibleState.None,"niepan.chatHelp"))
                }else{
                    if(state.state=="exam"){
                        items.push(new NiepanMenuItem("查看问题详情",vscode.TreeItemCollapsibleState.None,"niepan.displayquestion"))
                        items.push(new NiepanMenuItem("查看提交记录",vscode.TreeItemCollapsibleState.None,"niepan.submit"))
                        items.push(new NiepanMenuItem("重置工作区",vscode.TreeItemCollapsibleState.None,"niepan.resetworkspace"))
                        items.push(new NiepanMenuItem("正式提交",vscode.TreeItemCollapsibleState.None,"niepan.submitRecord"))
                        items.push(new NiepanMenuItem("求助",vscode.TreeItemCollapsibleState.None,"niepan.seekHelp"))
                        items.push(new NiepanMenuItem("chat",vscode.TreeItemCollapsibleState.None,"niepan.chatHelp"))
                    }else if(state.state == "freedebug"){
                        items.push(new NiepanMenuItem("查看调试结果",vscode.TreeItemCollapsibleState.None,"niepan.displayDebugResult"))
                        items.push(new NiepanMenuItem("使用涅槃代码库/下拉别人代码",vscode.TreeItemCollapsibleState.None,"niepan.codeFreeDebug"))
                        items.push(new NiepanMenuItem("使用本地代码",vscode.TreeItemCollapsibleState.None,"niepan.localFreeDebug"))
                        items.push(new NiepanMenuItem("退出自由答题模式",vscode.TreeItemCollapsibleState.None,"niepan.logoutFreeDebug"))
                    }else if(state.state == "checkdebug"){
                        items.push(new NiepanMenuItem("调试结果详情",vscode.TreeItemCollapsibleState.None,"niepan.checkDebug")) 
                        items.push(new NiepanMenuItem("退出查看调试结果",vscode.TreeItemCollapsibleState.None,"niepan.logoutcheckDebug"))
                    }else if(state.state == "bug"){
                        items.push(new NiepanMenuItem("排位模式",vscode.TreeItemCollapsibleState.None,"niepan.startexam")) 
                        items.push(new NiepanMenuItem("训练模式",vscode.TreeItemCollapsibleState.None,"niepan.bugtraining"))
                        items.push(new NiepanMenuItem("挑战记录",vscode.TreeItemCollapsibleState.None,"niepan.checkbug")) 
                        items.push(new NiepanMenuItem("创建挑战",vscode.TreeItemCollapsibleState.None,"niepan.Icreateexam"))
                        items.push(new NiepanMenuItem("退出bug挑战",vscode.TreeItemCollapsibleState.None,"niepan.logoutbug"))
                    }else if(state.state == "local"){
                        items.push(new NiepanMenuItem("查看提交记录",vscode.TreeItemCollapsibleState.None,"niepan.submit"))
                        items.push(new NiepanMenuItem("重置工作区",vscode.TreeItemCollapsibleState.None,"niepan.resetworkspace"))
                        items.push(new NiepanMenuItem("正式提交",vscode.TreeItemCollapsibleState.None,"niepan.submitRecord"))
                        items.push(new NiepanMenuItem("求助",vscode.TreeItemCollapsibleState.None,"niepan.seekHelp"))
                        items.push(new NiepanMenuItem("chat",vscode.TreeItemCollapsibleState.None,"niepan.chatHelp"))
                        
                    }
                }
            }
        }else{
            items.push(new NiepanMenuItem("登录涅槃",vscode.TreeItemCollapsibleState.None,"niepan.login"))
        }
        return items;

    }
}
class NiepanMenuItem extends vscode.TreeItem{
    constructor(label,state,command){
        super(label,state);
        this.command={command:command,title:label}
    }
}

exports.NiepanMenuProvider=NiepanMenuProvider;