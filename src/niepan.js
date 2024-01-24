const vscode = require('vscode');

const {
    BASE,
    BASE_URL
} = require("./value")
const {
    generateForm
} = require("./form");
const {
    helpForm,
    getWebviewContent,
    getDebugWebviewContent,
    teacherHelpForm,
    getDebugWebviewContent2,
    debugForm,
    commentForm,
    getWebviewContent4,
    getWebviewContent5
} = require("./helpForm");
const {
    getData,
    sendData
} = require('./api');
const {
    recover,
    snapshot
} = require('./snapshot');
const {
    head
} = require('request');
const {
    chatPage
} = require('./chat');


/** 获取用户输入token
 * 会递归获取确保有输入
 * @return {string} token token值
 */
async function getToken() {
    var token = await vscode.window.showInputBox({
        prompt: '请输入token',
        ignoreFocusOut: true,
        title: '输入token',
        placeHolder: '请输入token'
    });
    if (!token) {
        return await getToken();
    }
    return token;
}
/** 登录涅槃
 * @param {vscode.ExtensionContext} ctx 
 * @param {boolean} relogin  是否为重新登录（jwt过期）
 */
async function login(ctx, relogin = false) {
    var token = await checkLogin(ctx);
    if (token && !relogin) {
        vscode.window.showErrorMessage('已经登录');
    } else {
        vscode.env.openExternal(vscode.Uri.parse("https://oauth.feel.ac.cn/oauth/?redirect_uri=https%3A%2F%2Fourspark.feel.ac.cn%2Fapi%2Fauth%2Fvscode_auth&appid=niepan"));
        var token = await getToken();
        try {
            await ctx.globalState.update('niepan.token', token);
            var user = await getUserInfo(ctx);
            await ctx.globalState.update("niepan.userDetail", JSON.stringify(user.data[0]))
            vscode.window.showInformationMessage("欢迎你，" + user.data[0].real_name);
        } catch (err) {
            await ctx.globalState.update('niepan.token', undefined);
            vscode.window.showInformationMessage("登录失败, " + err.message);
        }
    }
}
/** 检查是否登录（本地）
 * @param {vscode.ExtensionContext} ctx 
 * @return {[string,boolean]} token token值或false
 */
async function checkLogin(ctx) {
    // var token=await ctx.secrets.get('niepan');
    var token = await ctx.globalState.get('niepan.token', false);
    if (token) {
        return token;
    } else {
        return false;
    }
}
/** 检查group（本地）
 * @param {vscode.ExtensionContext} ctx 
 * @param {array} allowList 允许的group列表
 * @return {[string,boolean]} token token值或false
 */
async function checkGroup(ctx, allowList) {
    // var token=await ctx.secrets.get('niepan');
    var user = await ctx.globalState.get('niepan.userDetail', false);
    if (user) {
        user = JSON.parse(user);
        return allowList.includes(user.user_group);
    } else {
        return false;
    }
}
/** 联网获取用户信息
 * @param {vscode.ExtensionContext} ctx 
 * @return {object} 涅槃上用户信息接口
 */
async function getUserInfo(ctx) {
    var res = await getData(ctx, BASE + 'api/user/', {})
    return res;
}
/** 本地获取用户信息
 * @param {vscode.ExtensionContext} ctx 
 * @return {object} 涅槃上用户信息接口
 */
async function getUserInfoLocal(ctx) {
    var res = await ctx.globalState.get('niepan.userDetail', false);
    if (res) {
        return JSON.parse(res);
    }
    return res;
}

/** 登录拦截器
 * @deprecated
 * @param {vscode.ExtensionContext} ctx 
 * @return {string} token
 */
async function loginIntercept(ctx) {
    var token = await checkLogin(ctx);
    while (!token) {
        vscode.window.showInformationMessage('请先登录');
        await login(ctx);
        token = await checkLogin(ctx);
    }
    return token;
}
/** 身份拦截器
 * @param {vscode.ExtensionContext} ctx 
 * @param {Function} func 调用函数
 * @param {Array} roles 允许的身份列表
 */
function enforceRole(ctx, func, roles) {
    return async () => {
        if (await checkGroup(ctx, roles)) {
            func(ctx)
        } else {
            vscode.window.showInformationMessage("该身份不能使用此功能")
        }
    }
}
/** 登出
 * @param {vscode.ExtensionContext} ctx 
 */
async function logout(ctx) {
    vscode.window.showInformationMessage('退出登录');
    await ctx.globalState.update('niepan.token', undefined);
    await ctx.globalState.update('niepan.userDetail', undefined);
    // await setState(ctx,undefined,{})
    // await ctx.secrets.delete('niepan');
}
/** 获取exam信息
 * @deprecated
 * @todo 发请求
 * @param {vscode.ExtensionContext} ctx 
 * @return {object} exam信息
 */
async function getExam(ctx) {
    // TODO:exam获取
    var res = await getData(ctx, BASE + 'api/exam/', {})
    return res;
}
/** 获取当前状态
 * @param {vscode.ExtensionContext} ctx 
 * @return {object} 当前状态信息包含状态和状态详情
 */
async function getState(ctx) {
    var state = await ctx.workspaceState.get('state', {
        state: undefined,
        stateDetail: {}
    });
    return state;
}
/** 设置状态
 * @param {vscode.ExtensionContext} ctx 
 * @param {string} state 状态
 * @param {object} stateDetail 状态详情
 * @return {object} 当前状态信息包含状态和状态详情
 */
async function setState(ctx, state, detail) {
    var state = await ctx.workspaceState.update('state', {
        state: state,
        stateDetail: detail
    });
}
/** 无状态拦截器，确保无状态
 * @param {vscode.ExtensionContext} ctx 
 * @param {function} func 调用函数
 */
function enforceNoState(ctx, func) {
    return () => {
        getState(ctx).then((state) => {
            if (state.state) {
                vscode.window.showInformationMessage('请先结束当前会话');
                return;
            } else {
                func(ctx);
                return;
            }
        })
    }
}

/** 状态拦截器，确保有状态
 * @param {vscode.ExtensionContext} ctx 
 * @param {[string,undefined]} state_to_compare 状态值
 * @param {function} func 调用函数
 */
function enforceState(ctx, func, state_to_compare = undefined) {
    return () => {
        getState(ctx).then((state) => {
            if (state_to_compare) {
                if (state.state != state_to_compare && state_to_compare != "*") {
                    if (state.state == "unexam") {
                        // console.log('h',state)
                        // vscode.window.showInformationMessage('当前会话模式不支持该功能');
                        // return;
                        func(ctx)
                    } else if(state.state == "freedebug"){
                        func(ctx)
                    }else if(state.state == "checkdebug"){
                        func(ctx)
                    }else {
                        vscode.window.showInformationMessage('请先开始会话！');
                        return;
                    }
                } else {
                    func(ctx);
                }

            } else {
                if (!state.state) {
                    vscode.window.showInformationMessage('请先开始会话！！');
                    return;
                } else {
                    func(ctx);
                }
            }
        })
    }
}

/** 复原工作区
 * @todo 记录复原操作
 * @param {vscode.ExtensionContext} ctx 
 */
async function resetWorkspace(ctx) {
    var state = await getState(ctx, "exam")
    if (!state) {
        return;
    }
    vscode.window.showQuickPick(['确定', '取消'], {
        placeHolder: '确定要重置工作区吗？'
    }).then(async (res) => {
        if (res == '确定') {
            await sendData(ctx, BASE + 'api/vscode', {
                snapshot: snapshot(),
                error: {
                    type: "reset"
                },
                session_id: state.stateDetail.session_id
            })
            recover(state.stateDetail.snapshot);
        }
    })
}

/** 解疑/验收模式中打开表单页面
 * @param {vscode.ExtensionContext} ctx 
 */
async function getForm(ctx) {
    var state = await getState(ctx);
    if (!state) {
        return;
    }
    //判断一下detail中的type是否为0作业,1解疑
    if(state.stateDetail.type == 0){
        var form = state.stateDetail.form;  //已通过elementui写死，因此不需要在generateForm中传form
        var formWebview = vscode.window.createWebviewPanel('formDisplay', "表单详情", vscode.ViewColumn.Two, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        formWebview.webview.html = generateForm();
        var a = formWebview.onDidDispose(() => {
            sendData(ctx, BASE + 'api/vscode', {
                snapshot: snapshot(),
                error: {
                    type: "auto_save_close_form"
                },
                session_id: state.stateDetail.session_id
            })
        })
        formWebview.webview.onDidReceiveMessage(
            async (message) => {
                    switch (message.command) {
                        case 'submit':
                            // vscode.window.showInformationMessage(message.text);
                            var form = JSON.parse(message.text);
                            form.type = "form_submit"
                            var result = snapshot()
                            var res = await sendData(ctx, BASE + 'api/vscode', {
                                snapshot: result,
                                error: form,
                                session_id: state.stateDetail.session_id
                            });
                            if (res.state) {
                                vscode.window.showInformationMessage('提交表单成功');
                            } else {
                                vscode.window.showInformationMessage('提交表单失败,' + res.message);
                                if (res.message == "insert vscode history error, message: There is no session or session has been ended, please start download the code again to start a new session") {
                                    setState(ctx, undefined, {});
                                    vscode.window.showInformationMessage('会话已结束，请重新开始会话');
                                }
                            }
                            a.dispose();
                            formWebview.dispose();
                            return;
                    }
                },
                undefined,
                ctx.subscriptions
        );
    }else if(state.stateDetail.type == 1){
        // var form = state.stateDetail.form;
        var formWebview = vscode.window.createWebviewPanel('formDisplay', "表单详情", vscode.ViewColumn.Two, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        formWebview.webview.html = teacherHelpForm();
        var a = formWebview.onDidDispose(() => {
            sendData(ctx, BASE + 'api/vscode', {
                snapshot: snapshot(),
                error: {
                    type: "auto_save_close_form"
                },
                session_id: state.stateDetail.session_id
            })
        })
        formWebview.webview.onDidReceiveMessage(
            async (message) => {
                    switch (message.command) {
                        case 'submit':
                            // vscode.window.showInformationMessage(message.text);
                            var form = JSON.parse(message.text);
                            var img = JSON.parse(message.img)
                            form.type = "form_submit"
                            var result = snapshot()
                            var res = await sendData(ctx, BASE + 'api/vscode', {
                                snapshot: result,
                                error: form,
                                img:img,
                                session_id: state.stateDetail.session_id
                            });
                            if (res.state) {
                                vscode.window.showInformationMessage('提交表单成功');
                            } else {
                                vscode.window.showInformationMessage('提交表单失败,' + res.message);
                                if (res.message == "insert vscode history error, message: There is no session or session has been ended, please start download the code again to start a new session") {
                                    setState(ctx, undefined, {});
                                    vscode.window.showInformationMessage('会话已结束，请重新开始会话');
                                }
                            }
                            a.dispose();
                            formWebview.dispose();
                            return;
                    }
                },
                undefined,
                ctx.subscriptions
        );
    }
}

/** 保存监听
 * @todo 发请求
 * @param {vscode.ExtensionContext} ctx 
 */
async function onSave(ctx) {
    var state = await getState(ctx)
    if (!state.state) {
        return;
    }
    //一律显示表单
    var res = await vscode.window.showQuickPick(['确定', '取消'], {
        title: "是否上传修改记录？",
        placeHolder: "是否上传修改记录？"
    })
    switch (state.state) {
        case "exam":
            if (res == '确定') {
                getForm(ctx);   
            } else {
                sendData(ctx, BASE + 'api/vscode', {
                    snapshot: snapshot(),
                    error: {
                        type: "auto_save"
                    },
                    session_id: state.stateDetail.session_id
                })
            }
            break;
        case "local":
                sendData(ctx, BASE + 'api/vscode', {
                    snapshot: snapshot(),
                    error: {
                        type: "auto_save"
                    },
                    session_id: state.stateDetail.session_id
                })
            break;    
        default:
            if (res == '确定') {
                vscode.window.showInformationMessage('尚不支持');
            } else {
                return;
            }
            break;

    }
    //根据后端内容判断是否需要表单
    // if (state.stateDetail.form == '{}') {
    //     sendData(ctx, BASE + 'api/vscode', {
    //         snapshot: snapshot(),
    //         error: {
    //             type: "auto_save"
    //         },
    //         session_id: state.stateDetail.session_id
    //     })
    //     return;
    // }else{
    //     var res = await vscode.window.showQuickPick(['确定', '取消'], {
    //         title: "是否上传修改记录？",
    //         placeHolder: "是否上传修改记录？"
    //     })
    //     switch (state.state) {
    //         case "exam":
    //             if (res == '确定') {
    //                 getForm(ctx);   
    //             } else {
    //                 sendData(ctx, BASE + 'api/vscode', {
    //                     snapshot: snapshot(),
    //                     error: {
    //                         type: "auto_save"
    //                     },
    //                     session_id: state.stateDetail.session_id
    //                 })
    //             }
    //             break;
    //         default:
    //             if (res == '确定') {
    //                 vscode.window.showInformationMessage('尚不支持');
    //             } else {
    //                 return;
    //             }
    //             break;
    
    //     }
    // }
}
//本地自由调试上传来源与描述
async function getsource_describe(ctx){
    var formWebview = vscode.window.createWebviewPanel('formDisplay', "问题详情", vscode.ViewColumn.Two, {
        enableScripts: true,
        retainContextWhenHidden: true//是否保留上次求助内容
    });
    formWebview.webview.html = debugForm();
    //当webview被关闭时触发
    // var a=formWebview.onDidDispose(()=>{
    //     sendData(ctx, BASE + 'api/question', {snapshot:snapshot(),related_type:2,related_id:code_id})
    // })
    //点击webview内提交触发
    formWebview.webview.onDidReceiveMessage(
        async (message) => {
                switch (message.command) {
                    case 'submit':
                        // vscode.window.showInformationMessage(message.text);
                        var form = JSON.parse(message.text);
                        form.type = "form_submit"
                        var result = snapshot()
                        var local = await sendData(ctx, BASE + 'api/free_debug/local', {
                            code:result,
                            code_from:form.error_title,
                            descrition:form.error_information
                        });
                        if (local.state) {
                            var localdetail = {
                                question_id : local.id,
                                session_id : null,
                                success:true,
                                type : 3 //作业为0，解疑为1，自由调试下拉别人代码为2，本地上传代码自由调试为3
                            }
                            var sid = await sendData(ctx, BASE + 'api/vscode_session/start', {
                                question_id: local.id
                            })
                            if (sid.state) {
                                local.session_id = sid.session_id
                                await setState(ctx, "exam", localdetail)
                                var b = await getState(ctx,"exam")
                                vscode.window.showInformationMessage('已开启自由调试模式，自由调试ID为'+local.id)
                                // menu.refresh()
                                formWebview.dispose();
                                return
                            } else {
                                vscode.window.showInformationMessage('开启自由调试模式失败')
                                // menu.refresh()
                                return
                            }
                        } else {
                            vscode.window.showInformationMessage('创建失败,' + local.message);
                        }

                        // a.dispose();
                        formWebview.dispose();
                        return;
                }
            },
            undefined,
            ctx.subscriptions
    );

}
//求助,打开表单点击确认后提交问题详情和截图
async function seekHelp(ctx) {
    vscode.window.showInformationMessage('正在展现表单，请稍后')
    var formWebview = vscode.window.createWebviewPanel('formDisplay', "问题详情", vscode.ViewColumn.Two, {
        enableScripts: true,
        retainContextWhenHidden: true//是否保留上次求助内容
    });
    formWebview.webview.html = helpForm();
    //当webview被关闭时触发
    // var a=formWebview.onDidDispose(()=>{
    //     sendData(ctx, BASE + 'api/question', {snapshot:snapshot(),related_type:2,related_id:code_id})
    // })
    //点击webview内提交触发
    formWebview.webview.onDidReceiveMessage(
        async (message) => {
                switch (message.command) {
                    case 'submit':
                        // vscode.window.showInformationMessage(message.text);
                        var form = JSON.parse(message.text);
                        var helpImg = JSON.parse(message.img)
                        form.type = "form_submit"
                        var result = snapshot()
                        var res = await sendData(ctx, BASE + 'api/question', {
                            related_id: 'code_id',
                            related_type: 2,
                            code_snapshot: result,
                            title: form.name,
                            describe: form.detail,
                            image_url: helpImg
                        });
                        if (res.state) {
                            vscode.window.showInformationMessage('求助成功,求助id为'+ res.data._id);
                        } else {
                            vscode.window.showInformationMessage('求助失败,' + res.message);
                        }
                        // a.dispose();
                        formWebview.dispose();
                        return;
                }
            },
            undefined,
            ctx.subscriptions
    );
}
//通过点击查看自由调试详情-来源、描述、评价
async function displayDebugQuestion(ctx){
    var state = await getState(ctx,"checkdebug")
    await showDebugQuestion(state.stateDetail.comment, state.stateDetail.code_from, state.stateDetail.description)
}
//显示自由调试详情
async function showDebugQuestion(comment, from, describe) {
    var quesitonWebview = vscode.window.createWebviewPanel('questionDisplay', "自由调试题目详情", vscode.ViewColumn.Two,{
        enableScripts:true
    });
    quesitonWebview.webview.html = getDebugWebviewContent(comment, from, describe);
}
//通过点击显示查看解疑问题
async function ToshowQuestion(ctx){
    var state = await getState(ctx,"unexam")
    await showQuestion(state.stateDetail.content, state.stateDetail.helppicture, state.stateDetail.title)
}
//显示解疑题目详情
async function showQuestion(question, pic, title) {
    var quesitonWebview = vscode.window.createWebviewPanel('questionDisplay', "问题详情", vscode.ViewColumn.Two,{
        enableScripts:true
    });
    quesitonWebview.webview.html = getWebviewContent(question, pic, title);
}


/** 显示题目详情
 * @param {vscode.ExtensionContext} ctx 
 */
async function displayQuestion(ctx) {
    var state = await getState(ctx, "exam")
    if (!state) {
        return;
    }else {
        //作业为0，解疑为1，自由调试下拉别人代码为2，本地上传代码自由调试为3,训练模式为4
        if (state.stateDetail.type == 0) {
            var question = state.stateDetail.content;
            var quesitonWebview = vscode.window.createWebviewPanel('questionDisplay', "问题详情", vscode.ViewColumn.Two);
            quesitonWebview.webview.html = question
        } else if(state.stateDetail.type == 2){
            var comment = state.stateDetail.comment;
            var code_from = state.stateDetail.code_from;
            var describtion = state.stateDetail.description;
            var quesitonWebview = vscode.window.createWebviewPanel('questionDisplay', "问题详情", vscode.ViewColumn.Two);
            quesitonWebview.webview.html = getDebugWebviewContent2(code_from, describtion);
        }else if(state.stateDetail.type == 1){
            var question = state.stateDetail.content;
            var pic = state.stateDetail.helppicture;
            var title = state.stateDetail.title
            var quesitonWebview = vscode.window.createWebviewPanel('questionDisplay', "问题详情", vscode.ViewColumn.Two);
            quesitonWebview.webview.html = getWebviewContent(question, pic, title);
        }else if(state.stateDetail.type == 4){
            var question = state.stateDetail.describe;
            var title = state.stateDetail.title
            var quesitonWebview = vscode.window.createWebviewPanel('questionDisplay', "问题详情", vscode.ViewColumn.Two,{
                enableScripts: true,
            });
            quesitonWebview.webview.html = getWebviewContent5(question,title);
        }
    }
}

//chat页面
async function chatHelp(ctx){
    vscode.window.showInformationMessage('正在展现表单，请稍后')
    var chatWebview = vscode.window.createWebviewPanel('formDisplay','chatGPT',vscode.ViewColumn.Two,{
        enableScripts: true,
        retainContextWhenHidden: true
    });
    var answerQues =''
    var user_name = ''
    var usersAnswer = new Object();
		chatWebview.webview.html = chatPage();
		chatWebview.webview.onDidReceiveMessage(
			async (message) => {
				switch (message.command) {
					case 'submit':
						//console.log("lxc")
						var user = await getUserInfo(ctx)
						var form = JSON.parse(message.question);
						form.type = "form_submit"
						//console.log(context)
						var res = await sendData(ctx, BASE_URL +'api/chat',{
							user_id: user.data[0]._id,
							question: form,
							context:{
								url:"vscode插件"
							},
						});
						//console.log(res,"res")
						if(res.result&&res.result!="error") {
							//console.log(res.result,"成功")
							//vscode.window.showInformationMessage('提问成功');
                            //user_name=user.data[0].real_name
							answerQues = res.result;
                            
                            // console.log(userName)
                            // console.log(usersAnswer)
							chatWebview.webview.postMessage({ response: answerQues});
						}else{
							//console.log(res.result,"失败")
                            //userName=user.data[0].real_name
                            // user_name='user'
							answerQues = '网络开小差了。。';
                            // usersAnswer.user_name=user_name
                            // usersAnswer.answerQues=answerQues
                            // console.log(userName)
                            //console.log(usersAnswer)
							vscode.window.showInformationMessage('提问失败');
							chatWebview.webview.postMessage({ response: answerQues});
						}
						//chatWebview.dispose()
						return
						
				}
			},
			undefined,
            ctx.subscriptions
		)
    
}

/** 登录拦截器，确保已登录
 * @param {vscode.ExtensionContext} ctx 
 * @param {function} func 调用函数
 */
function enforceLogin(ctx, func) {
    return async () => {
        var token = await checkLogin(ctx);
        while (!token) {
            vscode.window.showInformationMessage('请先登录');
            await login(ctx);
            token = await checkLogin(ctx);
        }
        func(ctx);
    }
}






module.exports = {
    login,
    checkLogin,
    logout,
    loginIntercept,
    getUserInfo,
    getExam,
    setState,
    enforceState,
    resetWorkspace,
    onSave,
    displayQuestion,
    enforceLogin,
    getState,
    enforceNoState,
    enforceRole,
    checkGroup,
    seekHelp,
    showQuestion,
    ToshowQuestion,
    getsource_describe,
    displayDebugQuestion,
    getForm,
    chatHelp
}