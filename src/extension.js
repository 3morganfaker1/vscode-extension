// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const {
	login,
	logout,
	loginIntercept,
	getUserInfo,
	enforceRole,
	enforceLogin,
	displayQuestion,
	resetWorkspace,
	enforceState,
	setState,
	getState,
	enforceNoState,
	onSave,
	seekHelp,
	showQuestion,
	ToshowQuestion,
	getsource_describe,
	displayDebugQuestion,
	getForm,
	chatHelp
} = require('./niepan')
const {
	snapshot,
	recover
} = require('./snapshot') 
const {
	sendData,
	getData
} = require('./api')
const {
	BASE,
	BASE_URL,
	TEST
} = require('./value')
const {
	NiepanMenuProvider
} = require('./tree')
const {
	niepanLogin,
	niepanGetstate,
	niepanSubmit
} = require('./extensionFuc')
const {
	commentForm,
	debugForm,
	createExamForm,
	createTrainingForm,
	startdebugForm,
	newCommentForm
} = require("./helpForm");
const {
	chatPage
} = require("./chat");
const {
	generateForm
} = require("./form");

/** 激活函数，vscode加载入口
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// 保存监听器
	context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(() => {
		onSave(context)
	}));
	// 注册命令列表 TODO: refresh
	var menu = new NiepanMenuProvider(context)
	context.subscriptions.push(vscode.window.createTreeView('niepan.menu', {
		treeDataProvider: menu
	}));
	// context.subscriptions.push(vscode.
	// 注册命令
	context.subscriptions.push(vscode.commands.registerCommand('niepan.login', async () => {
		await niepanLogin(context);
		menu.refresh()
	}));
	// 登出命令（拦截状态）
	context.subscriptions.push(vscode.commands.registerCommand('niepan.logout', async () => {
		await logout(context);
		menu.refresh()
	}));
	// context.subscriptions.push(vscode.commands.registerCommand('niepan.logout', enforceNoState(context, async () => {
	// 	await logout(context);
	// 	menu.refresh()
	// })));
	//进入bug挑战
	context.subscriptions.push(vscode.commands.registerCommand('niepan.bug', enforceLogin(context, enforceNoState(context, async () => {
		await setState(context, "bug", {})
		menu.refresh()
	}))))
	//进入自由答题模式
	context.subscriptions.push(vscode.commands.registerCommand('niepan.freeDebug', enforceLogin(context, enforceNoState(context, async () => {
		await setState(context, "freedebug", {})
		menu.refresh()
	}))))
	//退出bug挑战
	context.subscriptions.push(vscode.commands.registerCommand('niepan.logoutbug', enforceLogin(context, enforceState(context, async () => {
		await setState(context, undefined, {})
		menu.refresh()
	}, "bug"))));
	//退出自由答题模式
	context.subscriptions.push(vscode.commands.registerCommand('niepan.logoutFreeDebug', enforceLogin(context, enforceState(context, async () => {
		await setState(context, undefined, {})
		menu.refresh()
	}, "freedebug"))));
	// 自由调试详情展示命令，拦截登录、状态checkdebug
	context.subscriptions.push(vscode.commands.registerCommand('niepan.checkDebug', enforceLogin(context, enforceState(context, async () => {
		displayDebugQuestion(context); //来源、描述、评价详情
		menu.refresh()
	}, "freedebug"))));
	//退出查看自由答题详情模式
	context.subscriptions.push(vscode.commands.registerCommand('niepan.logoutcheckDebug', enforceLogin(context, enforceState(context, async () => {
		await setState(context, "freedebug", {})
		menu.refresh()
	}, "checkdebug"))));
	// 作业问题详情展示命令，拦截登录、状态exam
	context.subscriptions.push(vscode.commands.registerCommand('niepan.displayquestion', enforceLogin(context, enforceState(context, async () => {
		displayQuestion(context); //作业问题详情
		// Question(context);//解疑问题详情
		menu.refresh()
	}, "exam"))));
	//查看自由调试结果
	context.subscriptions.push(vscode.commands.registerCommand('niepan.displayDebugResult', enforceLogin(context, enforceState(context, async () => {
		var eid = await vscode.window.showInputBox({
			prompt: '请输入代码ID',
			ignoreFocusOut: true,
			title: '请输入代码ID',
			placeHolder: '请输入代码ID'
		});
		if (!eid) {
			menu.refresh();
			return;
		}
		var check = await getData(context, BASE + 'api/free_debug/check', {
			question_id: eid
		})
		if (check.state) {
			var checkdetail = {
				description: check.data.description,
				code_from: check.data.code_from,
				comment: check.data.comment,
				question_id: check.data.question_id,
				snapshot: check.data.code,
			}
			vscode.window.showQuickPick(['此操作将下拉代码，并清空本文件下所有内容并覆盖，确认并继续', '取消'], {
				placeHolder: "确认覆盖"
			}).then(async (res) => {
				if (res == '此操作将下拉代码，并清空本文件下所有内容并覆盖，确认并继续') {
					recover(checkdetail.snapshot)
					vscode.window.showInformationMessage("代码覆盖成功")
					await setState(context, "checkdebug", checkdetail)
					menu.refresh()
				} else {
					vscode.window.showInformationMessage("代码覆盖失败");
					menu.refresh()
				}
			})
		}
	}, "freedebug"))));
	// 退出非本地答疑模式
	context.subscriptions.push(vscode.commands.registerCommand('niepan.logoutsolvequestion', enforceLogin(context, enforceState(context, async () => {
		await setState(context, undefined, {})
		menu.refresh()
	}, "exam"))));
	// 解疑问题详情展示命令，拦截登录、状态unexam
	context.subscriptions.push(vscode.commands.registerCommand('niepan.displaysolvequestion', enforceLogin(context, enforceState(context, async () => {
		ToshowQuestion(context); //作业问题详情
		// Question(context);//解疑问题详情
		menu.refresh()
	}, "unexam"))));
	// 查看状态
	context.subscriptions.push(vscode.commands.registerCommand('niepan.getstate', async () => {
		state = await getState(context);
		vscode.window.showInformationMessage(state.state);
		menu.refresh()
	}));
	// 恢复文件至初始状态
	context.subscriptions.push(vscode.commands.registerCommand('niepan.resetworkspace', enforceLogin(context, enforceState(context, async () => {
		resetWorkspace(context);
		menu.refresh()
	}, "exam"))));
	//在涅槃查看挑战记录
	context.subscriptions.push(vscode.commands.registerCommand('niepan.checkbug', enforceLogin(context, enforceState(context, async () => {
		vscode.window.showInformationMessage("跳转涅槃查看挑战记录");
		vscode.env.openExternal(BASE + 'personal/list/2')
	}, "bug"))));
	//在涅槃查看提交记录
	context.subscriptions.push(vscode.commands.registerCommand('niepan.submit', enforceLogin(context, enforceState(context, async () => {
		var state = await getState(context);
		vscode.window.showInformationMessage("跳转涅槃查看提交记录");
		if (state.stateDetail.type == 0) {
			// vscode.env.openExternal(BASE + `check?session_id=${state.stateDetail.session_id}&question_id=${state.stateDetail.question_id}`)
			vscode.env.openExternal(BASE + `submitList/${state.stateDetail.question_id}`)
		} else if (state.stateDetail.type == 1) {
			vscode.env.openExternal(BASE + `questionDetail?question_id=${state.stateDetail.question_id}&session_id=${state.stateDetail.session_id}`)
		} else if (state.stateDetail.type == 3) {
			vscode.env.openExternal(BASE + 'personal/list/0')
		} else if (state.stateDetail.type == 4){
			vscode.env.openExternal(BASE + `submitList/${state.stateDetail.question_id}`)	 
		} else {
			vscode.env.openExternal(BASE)
		}
	}))));
	//正式提交
	context.subscriptions.push(vscode.commands.registerCommand('niepan.submitRecord', enforceLogin(context, enforceState(context, async () => {
		var state = await getState(context, "exam");
		if (!state) {
			return;
		}
		var stateType = state.stateDetail.type
		var session_id = state.stateDetail.session_id;
		if (stateType == 2 || stateType == 3) {
			// var res = await sendData(context, BASE + 'api/vscode_session/end', {
			// 	session_id: session_id,
			// })
			// if (res.state) {
			// 	await setState(context, undefined, {});
			// 	vscode.window.showInformationMessage('提交成功');
			// 	menu.refresh();
			// 	return
			// } else {
			// 	vscode.window.showInformationMessage('提交失败');
			// 	menu.refresh();
			// 	return;
			// }
			//暂时去掉测试后表单
			vscode.window.showInformationMessage('表单展示中，请填写表单后点击确认按钮提交')
			var formWebview = vscode.window.createWebviewPanel('formDisplay', "调试评价", vscode.ViewColumn.Two, {
				enableScripts: true,
				retainContextWhenHidden: true //是否保留上次求助内容
			});
			formWebview.webview.html = commentForm();
			formWebview.webview.onDidReceiveMessage(
				async (message) => {
						switch (message.command) {
							case 'submit':
								// vscode.window.showInformationMessage(message.text);
								var form = JSON.parse(message.text);
								form.type = "form_submit"
								var res = await sendData(context, BASE + 'api/vscode_session/end', {
									session_id: session_id,
									comment: form.error_information
								})
								if (res.state) {
									await setState(context, undefined, {});
									vscode.window.showInformationMessage('提交成功');
									menu.refresh()
									formWebview.dispose();
									return
								} else {
									vscode.window.showInformationMessage('提交失败');
								}
								// a.dispose();
								formWebview.dispose();
								return;
						}
					},
					undefined,
					context.subscriptions
			);
		} else if (stateType == 0) {
			var res = await sendData(context, BASE + 'api/vscode_session/end', {
				session_id: session_id,
			})
			if (res.state) {
				await setState(context, undefined, {});
				vscode.window.showInformationMessage('提交成功');
				menu.refresh();
				return
			} else {
				vscode.window.showInformationMessage('提交失败');
				menu.refresh();
				return;
			}
			//暂时去掉测试后表单
			// vscode.window.showInformationMessage('表单展示中，请填写表单后点击确认按钮提交')
			// var formWebview = vscode.window.createWebviewPanel('formDisplay', "调试评价", vscode.ViewColumn.Two, {
			// 	enableScripts: true,
			// 	retainContextWhenHidden: true //是否保留上次内容
			// });
			// formWebview.webview.html = newCommentForm();
			// formWebview.webview.onDidReceiveMessage(
			// 	async (message) => {
			// 			switch (message.command) {
			// 				case 'submit':
			// 					// vscode.window.showInformationMessage(message.text);
			// 					var form = JSON.parse(message.text);
			// 					console.log(form)
			// 					form.type = "form_submit"
			// 					var res = await sendData(context, BASE + 'api/vscode_session/end', {
			// 						session_id: session_id,
			// 						comment: form
			// 					})
			// 					console.log('t', res)
			// 					if (res.state) {
			// 						await setState(context, undefined, {});
			// 						vscode.window.showInformationMessage('提交成功');
			// 						menu.refresh()
			// 						formWebview.dispose();
			// 						return
			// 					} else {
			// 						vscode.window.showInformationMessage('提交失败');
			// 					}
			// 					// a.dispose();
			// 					formWebview.dispose();
			// 					return;
			// 			}
			// 		},
			// 		undefined,
			// 		context.subscriptions
			// );
		} else {
			vscode.window.showQuickPick(['上传后将无法撤回，确认上传', '取消'], {
				placeHolder: '确认上传嘛'
			}).then(async (res) => {
				if (res == '上传后将无法撤回，确认上传') {
					var result = await sendData(context, BASE + 'api/vscode_session/end', {
						session_id: session_id
					})
					if (result.state == true) {
						await setState(context, undefined, {});
						vscode.window.showInformationMessage("提交成功")
						menu.refresh()
					} else {
						vscode.window.showInformationMessage("提交失败")
						menu.refresh()
					}
				}
				menu.refresh()
			})
			menu.refresh()
		}

	}))));
	//学生求助功能，任何状态下都可以求助
	context.subscriptions.push(vscode.commands.registerCommand('niepan.seekHelp', enforceLogin(context, async () => {
		seekHelp(context);
		menu.refresh()
	})))
	//训练模式
	context.subscriptions.push(vscode.commands.registerCommand('niepan.bugtraining', enforceLogin(context, enforceState(context, async () => {
		// vscode.window.showInformationMessage('请稍后，正在展现题目列表')
		var formWebview = vscode.window.createWebviewPanel('formDisplay', "题目列表", vscode.ViewColumn.Two, {
			enableScripts: true,
			retainContextWhenHidden: true //是否保留上次求助内容
		});
		var training = await getData(context, BASE + "api/bug/getbuglist", {
			search: '',
			sortBytime: -1,
			pageNum: 1
		})
		if (training.state) {
			// var a = [{a:'题目标题1',b:'题目描述1'},{a:'题目标题2',b:'题目描述2'}]//调试用
			formWebview.webview.html = createTrainingForm(training.data, training.page_info.total, training.state, training.page_info.page); //webview中展现图片列表,调试用
			formWebview.webview.onDidReceiveMessage(
				async (message) => {
						switch (message.command) {
							case 'download':
								var question_id = message.text
								formWebview.dispose();
								var download = await getData(context, BASE + "api/bug/getonebug", {
									question_id: question_id
								})
								if (download.state) {
									var downloadetail = {
										title: download.data.title,
										describe: download.data.describe,
										code: download.data.code,
										session_id: null,
										type: 4
									}
									vscode.window.showQuickPick(['此操作将下拉代码，并清空本文件下所有内容并覆盖，确认并继续', '取消'], {
										placeHolder: "确认覆盖"
									}).then(async (res) => {
										if (res == '此操作将下拉代码，并清空本文件下所有内容并覆盖，确认并继续') {
											var sid = await sendData(context, BASE + 'api/vscode_session/start', {
												question_id: question_id
											})
											console.log(sid)
											if (sid.state) {
												downloadetail.session_id = sid.session_id
											}
											console.log(downloadetail)
											recover(downloadetail.code)
											vscode.window.showInformationMessage("代码覆盖成功")
											await setState(context, "exam", downloadetail)
											formWebview.dispose();
											menu.refresh()
										} else {
											vscode.window.showInformationMessage("代码覆盖失败")
											menu.refresh()
										}
									})
								} else {
									vscode.window.showErrorMessage('下拉代码失败')
								}
								break;
							case 'search':
								var keyword = message.text
								var result = await getData(context, BASE + "api/bug/getbuglist", {
									search: keyword,
									sortBytime: -1,
								})
								console.log('result', result)
								if (result.state) {
									formWebview.webview.html = createTrainingForm(result.data, result.page_info.total, result.state, result.page_info.page)
								}
								break;
							case 'sort':
								var result = await getData(context, BASE + "api/bug/getbuglist", {
									search: '',
									sortBytime: -1,
								})
								if (result.state) {
									formWebview.webview.html = createTrainingForm(result.data, result.page_info.total, result.state, result.page_info.page)
								}
								break;
							case 'Sort':
								var result = await getData(context, BASE + "api/bug/getbuglist", {
									search: '',
									sortBytime: 1,
								})
								if (result.state) {
									formWebview.webview.html = createTrainingForm(result.data, result.page_info.total, result.state, result.page_info.page)
								}
								break;
							case 'checkcode':
								var question_id = message.text
								var checkcode = await getData(context, BASE + "api/bug/getonebug", {
									question_id: question_id
								})
								if (checkcode) {
									var checkcodedetail = {
										title: checkcode.data.title,
										describe: checkcode.data.describe,
										code: checkcode.data.code,
									}
									vscode.window.showQuickPick(['此操作将下拉代码，并清空本文件下所有内容并覆盖，确认并继续', '取消'], {
										placeHolder: "确认覆盖"
									}).then(async (res) => {
										if (res == '此操作将下拉代码，并清空本文件下所有内容并覆盖，确认并继续') {
											formWebview.dispose();
											recover(checkcodedetail.code)
											vscode.window.showInformationMessage("代码覆盖成功")
											menu.refresh()
										} else {
											vscode.window.showInformationMessage("代码覆盖失败")
											menu.refresh()
										}
									})
								} else {
									vscode.window.showErrorMessage('下拉代码失败')
								}
								break;
							case 'pagination':
								var pageNum = message.text
								console.log('1', pageNum)
								var result = await getData(context, BASE + "api/bug/getbuglist", {
									search: keyword,
									sortBytime: -1,
									pageNum: pageNum,
								})
								if (result.state) {
									formWebview.webview.html = createTrainingForm(result.data, result.page_info.total, result.state, result.page_info.page)
								}
								break;
						}
					},
					undefined,
					context.subscriptions
			);
		} else {
			var data = [],
				total = 0;
			formWebview.webview.html = createTrainingForm(data, total, training.state); //webview中展现图片列表,调试用
		}

	}, "bug"))));
	//我来出题
	context.subscriptions.push(vscode.commands.registerCommand('niepan.Icreateexam', enforceLogin(context, enforceState(context, async () => {
		vscode.window.showInformationMessage('请填写表单后，点击出题按钮创建题目')
		var formWebview = vscode.window.createWebviewPanel('formDisplay', "编辑题目", vscode.ViewColumn.Two, {
			enableScripts: true,
			retainContextWhenHidden: true //是否保留上次求助内容
		});
		formWebview.webview.html = createExamForm();
		formWebview.webview.onDidReceiveMessage(
			async (message) => {
				switch (message.command) {
					case 'submit':
						var describe = message.text
						var title = message.text_
						// var picaddress = message.pic
						var result = snapshot()
						await sendData(context, BASE + "api/bug/exam_question", {
							code: result,
							title: title,
							describe: describe,
							// pic:picaddress,
							type: 0 //0为创建挑战，1为创建考试
						}).then((res) => {
							console.log(res)
							if (res.state) {
								vscode.window.showInformationMessage(`挑战创建成功，题目id为${res.data}`)
								formWebview.dispose();
								return;
							} else {
								vscode.window.showErrorMessage(res.message)
								formWebview.dispose();
								return;
							}
						}).catch((e) => {
							vscode.window.showErrorMessage(e)
						})
						formWebview.dispose();
				}
				undefined,
				context.subscriptions
			}
		)
	}, "bug"))))
	//使用本地代码创建自由调试
	context.subscriptions.push(vscode.commands.registerCommand('niepan.localFreeDebug', enforceLogin(context, enforceState(context, async () => {
		vscode.window.showInformationMessage('填写表单后点击确认将开启自由调试模式')
		// await getsource_describe(context);
		var formWebview = vscode.window.createWebviewPanel('formDisplay', "代码详情", vscode.ViewColumn.Two, {
			enableScripts: true,
			retainContextWhenHidden: true //是否保留上次内容
		});
		formWebview.webview.html = debugForm();
		formWebview.webview.onDidReceiveMessage(
			async (message) => {
					switch (message.command) {
						case 'submit':
							// vscode.window.showInformationMessage(message.text);
							var form = JSON.parse(message.text);
							form.type = "form_submit"
							var result = snapshot()
							var local = await sendData(context, BASE + 'api/free_debug/local', {
								code: result,
								code_from: form.code_from,
								description: form.code_describe,
								title: form.code_title,
							});
							if (local.state) {
								var localdetail = {
									question_id: local.id,
									session_id: null,
									success: true,
									type: 3 //作业为0，解疑为1，自由调试下拉别人代码为2，本地上传代码自由调试为3,训练模式为4
								}
								var sid = await sendData(context, BASE + 'api/vscode_session/start', {
									question_id: local.id
								})
								if (sid.state) {
									localdetail.session_id = sid.session_id
									await setState(context, "local", localdetail)
									vscode.window.showInformationMessage('已开启自由调试模式，自由调试ID为' + local.id)
									menu.refresh()
									formWebview.dispose();
									return
								} else {
									vscode.window.showInformationMessage('开启自由调试模式失败')
									menu.refresh()
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
				context.subscriptions
		);

	}))))
	//使用涅槃代码库、下拉别人代码来创建自由调试
	context.subscriptions.push(vscode.commands.registerCommand('niepan.codeFreeDebug', enforceLogin(context, enforceState(context, async () => {
		var eid = await vscode.window.showInputBox({
			prompt: '请输入代码ID',
			ignoreFocusOut: true,
			title: '请输入代码ID',
			placeHolder: '请输入代码ID'
		});
		if (!eid) {
			menu.refresh();
			return;
		}
		var debug = await getData(context, BASE + 'api/free_debug/code', {
			question_id: eid
		})
		if (debug.state) {
			var debugdetail = {
				description: debug.data.description,
				code_from: debug.data.code_from,
				comment: debug.data.comment,
				question_id: debug.data._id,
				snapshot: debug.data.code,
				session_id: null,
				type: 2 //作业为0，解疑为1，自由调试下拉别人代码为2，本地上传代码自由调试为3,训练模式为4
			}
			vscode.window.showQuickPick(['此操作将下拉代码，并清空本文件下所有内容并覆盖，确认并继续', '取消'], {
				placeHolder: '确认覆盖'
			}).then(async (res) => {
				if (res == '此操作将下拉代码，并清空本文件下所有内容并覆盖，确认并继续') {
					recover(debugdetail.snapshot);
					var sid = await sendData(context, BASE + 'api/vscode_session/start', {
						question_id: debug.data._id
					})
					if (sid.state) {
						debugdetail.session_id = sid.session_id
						await setState(context, "exam", debugdetail);
						vscode.window.showInformationMessage('下拉别人代码成功')
						menu.refresh()
						return
					} else {
						if (sid.message == "there has been a started session") {
							debugdetail.session_id = sid.session_id
							await setState(context, "exam", debugdetail);
							vscode.window.showInformationMessage('恢复自由调试成功')
							menu.refresh()
						} else {
							vscode.window.showInformationMessage('下拉别人代码失败')
							menu.refresh()
							return
						}
					}
				}
			})
		} else {
			vscode.window.showInformationMessage('题目ID不存在')
			menu.refresh()
			return
		}
	}, "freedebug"))));
	//助教解疑功能
	context.subscriptions.push(vscode.commands.registerCommand('niepan.help', enforceLogin(context, enforceNoState(context, async () => {
		var eid = await vscode.window.showInputBox({
			prompt: '请输入解疑ID',
			ignoreFocusOut: true,
			title: '请输入解疑ID',
			placeHolder: '请输入解疑ID'
		});
		if (!eid) {
			menu.refresh();
			return;
		}
		//1.通过questionid查询题目
		var help = await getData(context, BASE + 'api/question/', {
			id: eid
		})
		if (help.state) {
			// vscode.window.showInformationMessage('获取解疑信息成功');
			var helpdetail = {
				title: help.data.title,
				content: help.data.describe,
				helppicture: help.data.image_url,
				snapshot: help.data.code_snapshot,
				session_id: null,
				question_id: eid,
				type: 1 //作业为0，解疑为1，自由调试下拉别人代码为2，本地上传代码自由调试为3
			}
			//先将问题代码覆盖到本地，此时未进入答题模式(session)
			vscode.window.showQuickPick(['此操作将下拉学生代码，并清空本文件下所有内容并覆盖，确认并继续', '取消'], {
				placeHolder: '确认覆盖'
			}).then(async (res) => {
				if (res == '此操作将下拉学生代码，并清空本文件下所有内容并覆盖，确认并继续') {
					recover(helpdetail.snapshot);
					var sid = await sendData(context, BASE + 'api/vscode_session/start', {
						question_id: eid
					})
					if (sid.state) {
						helpdetail.session_id = sid.session_id
						await setState(context, "exam", helpdetail);
						vscode.window.showInformationMessage('开始解答')
						menu.refresh()
						return
					} else {
						if (sid.message == "there has been a started session") {
							helpdetail.session_id = sid.session_id
							await setState(context, "exam", helpdetail);
							vscode.window.showInformationMessage('恢复解答')
							menu.refresh()
							return
						} else {
							vscode.window.showInformationMessage('恢复解答失败')
							menu.refresh()
							return
						}
					}
					menu.refresh();
					// vscode.window.showInformationMessage('覆盖成功');
					// vscode.window.showQuickPick(['进入本地答题模式', '取消'], {
					// 	placeHolder: '确认继续'
					// }).then(async (res) => {
					// 	if (res == '进入本地答题模式') {
					// 		var sid = await sendData(context, BASE + 'api/vscode_session/start', {
					// 			question_id: eid
					// 		})
					// 		if (sid.state) {
					// 			helpdetail.session_id = sid.session_id
					// 			await setState(context, "exam", helpdetail);
					// 			vscode.window.showInformationMessage('开始解答')
					// 			menu.refresh()
					// 			return
					// 		} else {
					// 			if (sid.message == "there has been a started session") {
					// 				helpdetail.session_id = sid.session_id
					// 				await setState(context, "exam", helpdetail);
					// 				vscode.window.showInformationMessage('恢复解答')
					// 				menu.refresh()
					// 				return
					// 			} else {
					// 				vscode.window.showInformationMessage('恢复解答失败')
					// 				menu.refresh()
					// 				return
					// 			}
					// 		}
					// 	} else if (res == '取消') {
					// showQuestion(helpdetail.content, helpdetail.helppicture, helpdetail.title)
					// await setState(context, "unexam", helpdetail);
					// 		menu.refresh();
					// 	}
					// })
					// menu.refresh()
				} else {
					menu.refresh();
					return
				}
			})
			//选择是否开启session进行解答
		} else {
			vscode.window.showErrorMessage('解疑id不存在')
		}
	}))))
	//创建考试
	context.subscriptions.push(vscode.commands.registerCommand('niepan.createexam', enforceLogin(context, enforceState(context, async () => {
		vscode.window.showInformationMessage('请填写表单后，点击出题按钮创建题目')
		var formWebview = vscode.window.createWebviewPanel('formDisplay', "编辑题目", vscode.ViewColumn.Two, {
			enableScripts: true,
			retainContextWhenHidden: true //是否保留上次求助内容
		});
		formWebview.webview.html = createExamForm();
		formWebview.webview.onDidReceiveMessage(
			async (message) => {
				switch (message.command) {
					case 'submit':
						var describe = message.text
						var title = message.text_
						// var picaddress = message.pic
						console.log('d', describe)
						var result = snapshot()
						sendData(context, BASE + "api/bug/exam_question", {
							code: result,
							title: title,
							describe: describe,
							// pic:picaddress,
							type: 1 //0为创建挑战，1为创建考试
						}).then((res) => {
							if (res.state) {
								vscode.window.showInformationMessage(`考试创建成功，题目id为${res.data}`)
								formWebview.dispose();
								return;
							} else {
								vscode.window.showErrorMessage(res.message)
								formWebview.dispose();
								return;
							}
						}).catch((e) => {
							vscode.window.showErrorMessage(e)
						})
				}
				undefined,
				context.subscriptions
			}
		)
	}))))
	// 开始验收
	context.subscriptions.push(vscode.commands.registerCommand('niepan.startexam', enforceLogin(context, enforceState(context, async () => {
		var eid = await vscode.window.showInputBox({
			prompt: '请输入题目ID',
			ignoreFocusOut: true,
			title: '请输入题目ID',
			placeHolder: '请输入题目ID'
		});
		if (!eid) {
			menu.refresh();
			return;
		}
		var exam = await getData(context, BASE + 'api/exam_question', {
			id: eid
		})
		if (exam.state) {
			var code = await getData(context, BASE + 'api/exam_question/code', {
				id: eid
			})
			if (!code.state) {
				vscode.window.showErrorMessage('获取代码失败,' + code.message)
				menu.refresh()
				return;
			}
			var sid = await sendData(context, BASE + 'api/vscode_session/start', {
				question_id: eid
			})
			if (sid.state) {
				var detail = {
					title: exam.data[0].title,
					content: exam.data[0].describe,
					form: code.data.forms,
					snapshot: code.data.code,
					session_id: sid.session_id,
					question_id: eid,
					type: 0 //作业为0，解疑为1，自由调试下拉别人代码为2，本地上传代码自由调试为3
				}
				vscode.window.showQuickPick(['此操作将清空本文件下所有内容并覆盖，确认并继续', '取消'], {
					placeHolder: '确认覆盖'
				}).then(async (res) => {
					if (res == '此操作将清空本文件下所有内容并覆盖，确认并继续') {
						recover(detail.snapshot);
						// 设置状态
						await setState(context, "exam", detail);
						vscode.window.showInformationMessage('开始答题')
						menu.refresh()
						return;
					} else {
						menu.refresh()
						return
					}
				})
			} else {
				if (sid.message == "there has been a started session") {
					var detail = {
						title: exam.data[0].title,
						content: exam.data[0].describe,
						snapshot: code.data.code,
						session_id: sid.session_id,
						question_id: eid,
						form: code.data.forms,
						type: 0 //作业为0，解疑为1
					}
					await setState(context, "exam", detail);
					vscode.window.showInformationMessage('恢复答题')
					menu.refresh()
					return;
				}
				vscode.window.showInformationMessage("作业开始失败," + sid.message)
				menu.refresh()
				return;
			}

			// //暂时取消排位模式前表单
			// vscode.window.showInformationMessage('填写表单后点击确认将开启排位模式')
			// var formWebview = vscode.window.createWebviewPanel('formDisplay', "测验前问卷", vscode.ViewColumn.Two, {
			// 	enableScripts: true,
			// 	retainContextWhenHidden: true //是否保留上次求助内容
			// });
			// formWebview.webview.html = startdebugForm();
			// formWebview.webview.onDidReceiveMessage(
			// 	async (message) => {
			// 			switch (message.command) {
			// 				case 'submit':
			// 					var form = JSON.parse(message.text);
			// 					form.type = "form_submit"
			// 					var sid = await sendData(context, BASE + 'api/vscode_session/start', {
			// 						question_id: eid,
			// 						startDebug: form
			// 					})
			// 					if (sid.state) {
			// 						var detail = {
			// 							title: exam.data[0].title,
			// 							content: exam.data[0].describe,
			// 							form: code.data.forms,
			// 							snapshot: code.data.code,
			// 							session_id: sid.session_id,
			// 							question_id: eid,
			// 							type: 0 //作业为0，解疑为1，自由调试下拉别人代码为2，本地上传代码自由调试为3
			// 						}
			// 						vscode.window.showQuickPick(['此操作将清空本文件下所有内容并覆盖，确认并继续', '取消'], {
			// 							placeHolder: '确认覆盖'
			// 						}).then(async (res) => {
			// 							if (res == '此操作将清空本文件下所有内容并覆盖，确认并继续') {
			// 								recover(detail.snapshot);
			// 								// 设置状态
			// 								await setState(context, "exam", detail);
			// 								vscode.window.showInformationMessage('开始答题')
			// 								formWebview.dispose();
			// 								menu.refresh()
			// 								return;
			// 							} else {
			// 								menu.refresh()
			// 								return
			// 							}
			// 						})
			// 					} else {
			// 						if (sid.message == "there has been a started session") {
			// 							var detail = {
			// 								title: exam.data[0].title,
			// 								content: exam.data[0].describe,
			// 								snapshot: code.data.code,
			// 								session_id: sid.session_id,
			// 								question_id: eid,
			// 								form: code.data.forms,
			// 								type: 0 //作业为0，解疑为1
			// 							}
			// 							await setState(context, "exam", detail);
			// 							vscode.window.showInformationMessage('恢复答题')
			// 							formWebview.dispose();
			// 							menu.refresh()
			// 							return;
			// 						}
			// 						vscode.window.showInformationMessage("作业开始失败," + sid.message)
			// 						menu.refresh()
			// 						return;
			// 					}
			// 					formWebview.dispose();
			// 					return;
			// 			}
			// 		},
			// 		undefined,
			// 		context.subscriptions
			// )
		} else {
			vscode.window.showInformationMessage("获取题目失败," + exam.message)
			menu.refresh()
			return;
		}
		menu.refresh()

	}, "bug"))));
	

	//chatgpt提问系统
	context.subscriptions.push(vscode.commands.registerCommand('niepan.chatHelp',enforceLogin(context,async()=>{
		chatHelp(context);
		menu.refresh()
		// var answerQues =''
		// var chatWebview = vscode.window.createWebviewPanel('formDisplay','chatGPT',vscode.ViewColumn.Two,{
		// 	enableScripts: true,
		// 	retainContextWhenHidden: true
		// });
		// chatWebview.webview.html = chatPage();
		// chatWebview.webview.onDidReceiveMessage(
		// 	async (message) => {
		// 		switch (message.command) {
		// 			case 'submit':
		// 				//console.log("lxc")
		// 				var user = await getUserInfo(context)
		// 				var form = JSON.parse(message.question);
		// 				form.type = "form_submit"
		// 				//console.log(user.data[0]._id)
		// 				//console.log(context)
		// 				var res = await sendData(context, BASE_URL +'api/chat',{
		// 					user_id: user.data[0]._id,
		// 					question: form,
		// 					context:{
		// 						url:"vscode插件"
		// 					},
		// 				});
		// 				//console.log(res,"res")
		// 				if(res.result&&res.result!="error") {
		// 					//console.log(res.result,"成功")
		// 					//vscode.window.showInformationMessage('提问成功');
		// 					answerQues = res.result;
		// 					chatWebview.webview.postMessage({ response: answerQues});
		// 				}else{
		// 					//console.log(res.result,"失败")
		// 					answerQues = '网络开小差了。。。';
		// 					vscode.window.showInformationMessage('提问失败');
		// 					chatWebview.webview.postMessage({ response: answerQues});
		// 				}
		// 				//chatWebview.dispose()
		// 				return
						
		// 		}
		// 	},
		// 	undefined,
        //     context.subscriptions
		// )
	})));

	vscode.window.showInformationMessage('涅槃插件加载完成');
}

// this method is called when your extension is deactivated
function deactivate() {}

// eslint-disable-next-line no-undef
module.exports = {
	activate,
	deactivate,
}