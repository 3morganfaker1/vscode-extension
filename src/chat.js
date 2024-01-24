
/** 表单页面生成器
 * @param {string} config 表单配置
 */
function chatPage(){
    return `
    <html>
<head>
<!-- import Vue.js -->
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
<!-- 引入样式 -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"></link>
<!-- 引入组件库 -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>
<!-- 引入extension变量 -->

</head>

<body>
<div id="app">
<div class="chatAppBody" >
      <div class="chatBox">
        <div v-for="item in items" :key="item">
            <div class="chatRow chatRowMe">
            <div >
                <div class="Myname">user</div>
                <div class="chatContent" :style="{ maxWidth: dialogMeMaxWidth + '%' }">{{item}}</div>
            </div>
                <el-avatar class="chatAvatar" :marginTop="'5px'" :size="30">user</el-avatar>
            </div>
            <div class="chatRow">
              <el-avatar :marginTop="'5px'" class="chatAvatar"   :size="30" src="https://api.iowen.cn/favicon/openai.com.png"></el-avatar>
              <div class="chatMsgContent">
                <div class="chatUsername">chatgpt</div>
                <div class="chatContent" :style="{ maxWidth: dialogMaxWidth + '%' }">{{ answersQues[items.indexOf(item)] }}</div>
              </div>
            </div>
        </div>
        
      </div>


      <div class="chatBottom">
      <el-form ref="form" :model="form" label-width="80px">
        <div class="chatArea">
          <textarea class="chatAreaInput" v-model="form.message"></textarea>
          <el-button :disabled="isDisabled" class="sendButton" type="primary" size="middle" icon="el-icon-edit"  @click="sendQuestion">发送</el-button>
        </div>
      </el-form>
      </div>
  </div>
  </div>
  <script>
  let vm = new Vue( {
    el: '#app',

    data:{
        form: {
          message:'',
        },
        myQuestion:'',
        myQuestions:[],
        items:[],
        answers:[],
        answersQues:[],
        answer:'',
        vscode: null,
        isDisabled: false,
        dialogMaxWidth: 90,
        dialogMeMaxWidth: 90,
        user:'',
        userName:'',
        userAnswer:{
          user_name:'',
          answerQues:'',
        },
    },

    methods: {
      onSubmit:function(formName){
        //console.log(this.form.message)
        this.$refs[formName].validate((valid) => {
                        if (valid) {
                            //const vscode = acquireVsCodeApi();
                            this.vscode.postMessage({
                                command: 'submit',
                                //user_id: JSON.stringify(this.user_name),
                                question: JSON.stringify(this.form.message),
                            })
                            window.addEventListener('message', event => {
                              // 处理接收到的消息
                              this.answers.pop()
                              this.answer=event.data.response
                              this.answers.push(this.answer)
                              this.isDisabled=!this.isDisabled
                            }, { once: true });
                            this.form.message = ''

                           } else {
                             return false;
                           }
                    });
                    
      },
      sendQuestion(){
        this.isDisabled=!this.isDisabled
        this.myQuestion =this.form.message;
        this.myQuestions.push(this.myQuestion)
        this.answer="..."
        this.answers.push(this.answer)
        //console.log(this.answers,"1")
        this.onSubmit('form')
      },
      // answerQuestion() {
      //   //console.log("收到回答",this.answer)
      //   //this.answers.push(this.answer)
      //   console.log(this.answers)
      //   //this.answer = ''
      // }
    },
    mounted() {
      this.vscode=acquireVsCodeApi(),
      this.items=this.myQuestions;
      this.answersQues=this.answers;
    }

  });
</script>
<style>
  .chatAppBody{
        display: flex;
        flex-direction: column;
        height: 100vh;
        background-color: #f1f5f8;
        
    }
    .chatBox{
        flex: 1;
        length: 70%;
    }
    .chatBottom{
        background: #fff;
    }
    .chatRow{
        display: flex;
        margin: 5px 0px;
        
    }
    .chatRow .chatAvatar{
      margin-left: 5px;
      margin-right: 5px;
      flex-shrink: 0;
      margin-top: 0px;
    } 
    
    .chatUsername {
        font-size: 12px;
        white-space: nowrap;
        color: #999;
        margin-bottom: 2px;
    }

    .Myname {
      font-size: 12px;
      white-space: nowrap;
      color: #999;
      margin-bottom: 2px;
  }
    .chatContent{

        border-radius: 0px 10px 10px 10px;
        padding: 10px;
        color: #070707;
        background-color: rgb(255,255,255);
        box-shadow: 0 5px 30px rgb(50 50 93 / 8%), 0 1px 3px rgb(0 0 0 / 5%);
        font-size: 14px;
        word-break: break-all;
        line-height: 21px;
    }
    .chatRowMe{
        display: flex ; 
        justify-content: flex-end;
    }
    .Myname {
        display: flex ; 
        justify-content: flex-end
    }
    .chatRowMe .chatAvatar{
        margin-left: 5px;
        flex-shrink: 0;
        margin-Top: 0px;
    }
    .chatRowMe .chatContent{
        border-radius: 10px 0px 10px 10px;
        padding: 10px;
        background-color: rgb(255,255,255);
        box-shadow: 0 5px 30px rgb(50 50 93 / 8%), 0 1px 3px rgb(0 0 0 / 5%);
        font-size: 14px;
        word-break: break-all;
        line-height: 21px;
        float:right;
    }
    .chatRow .chatArea{
        margin: 0px 10px;
        margin-bottom: 10px;
        display: flex;
        padding: 6px 5px;
        align-items: center;
        flex:1;
        box-shadow: 0 5px 30px rgb(50 50 93 / 8%), 0 1px 3px rgb(0 0 0 / 5%);
        border-radius: 10px;
        background: #fff;
    }
    .chatArea .iconfont{
        color: #070707;
        font-size: 14px;
        margin: 0px 5px;
        cursor: pointer;
    }
    .chatArea .iconfont:hover{
        color: #409eff;
    }
    .chatArea .chatAreaInput{
        border-radius: 10px;
        border: none;
        flex: 1;
        outline: none;
        resize: none;
        box-sizing: border-box;
        color: #505050;
        min-height: 35px;
        font-size: 25px;
        height: 1.2em;
        width: 85%;
    }
    .sendButton{
        float:right;
    }

</style>
</body>



    </html>`
}

module.exports ={
    chatPage,
}