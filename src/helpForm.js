/** 表单页面生成器
 * @param {string} config 表单配置
 */
function helpForm() {
    return `
    <html>

<head>
<!-- import Vue.js -->
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
<!-- 引入样式 -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"></link>
<!-- 引入组件库 -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>
</head>

<body>
    <div id="app">

        <el-form ref="form" :model="form" label-width="80px" :rules="rules">
  <el-form-item label="错误标题" prop="name">
    <el-input v-model="form.name"></el-input>
  </el-form-item>

  <el-form-item label="错误详情" prop="detail">
    <el-input type="textarea" v-model="form.detail"></el-input>
  </el-form-item>

  <el-upload
  class="upload-demo"
  action="https://ourspark.feel.ac.cn/api/uploadImg"
  :on-preview="handlePreview"
  :on-remove="handleRemove"
  :on-success="handleSuccess"
  :file-list="fileList"
  list-type="picture">
  <el-button size="small" type="primary">点击上传</el-button>
  <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
</el-upload>

  <el-form-item>
    <el-button type="primary" @click="onSubmit('form')">立即求助</el-button>
  </el-form-item>
</el-form>
    </div>
    <script>

        let vm = new Vue({
            el: '#app',
            data: {
                fileList:[],
                form: {
                    name: '',
                    detail: '',
                },
                rules:{
                    name:[
                        { required: true, message: '请输入错误标题', trigger: 'blur' }
                    ],
                    detail:[
                        { required: true, message: '请填写错误详情', trigger: 'blur' }
                    ]
                },
                helpImg:[]  
             },
            methods: {
                onSubmit:function(formName) {
                    this.$refs[formName].validate((valid) => {
                        if (valid) {
                            const vscode = acquireVsCodeApi();
                            vscode.postMessage({
                                command: 'submit',
                                text: JSON.stringify(this.form),
                                img : JSON.stringify(this.helpImg)
                            })
                           } else {
                             return false;
                           }
                    });
                 },
                handleRemove(file, fileList) {
                   let getLocation = file.response.data[0];
                   this.hempImg.splice(getLocation, 1)
                 },
                handlePreview(file) {
                   
                 },
                handleSuccess(response, file, fileList){
                    this.helpImg.push(file.response.data[0])
                 }
             },
        });

    </script>
    <style>
    div,span{
        font-size:15px!important;
    }
    </style>
</body>

</html>
`
}

function commentForm() {
    return `
    <html>

<head>
<!-- import Vue.js -->
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
<!-- 引入样式 -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"></link>
<!-- 引入组件库 -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>

</head>

<body>
    <div id="app">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">

    <el-form-item label="调试评价" prop="error_information">
      <el-input type="textarea" v-model="ruleForm.error_information"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm('ruleForm')">立即提交</el-button>
      <el-button @click="resetForm('ruleForm')">重置</el-button>
    </el-form-item>
  </el-form>

    </div>
    <script>

        let vm = new Vue({
            el: '#app',
            data: {
                ruleForm: {
                    error_information: ''
                },
                rules:{
                    error_information:[
                        { required: true, message: '请输入活动名称', trigger: 'blur' }
                    ]
                }
            },
            methods: {
                submitForm(formName) {
                    this.$refs[formName].validate((valid) => {
                      if (valid) {
                        const vscode = acquireVsCodeApi();
                            vscode.postMessage({
                                command: 'submit',
                                text: JSON.stringify(this.ruleForm),
                            })
                      } else {
                        return false;
                      }
                    });
                  },
                  resetForm(formName) {
                    this.$refs[formName].resetFields();
                  }
            },
        });

    </script>
    <style>
    div,span{
        font-size:10px!important;
    }
    </style>
</body>

</html>
`
}

function getWebviewContent(question, pic, title) {
    var pics = JSON.stringify(pic)
    return `
    <html>

<head>
<!-- import Vue.js -->
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
<!-- 引入样式 -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"></link>
<!-- 引入组件库 -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/form-create@1.4.4/district/province_city_area.js">
</script>
<!-- import form-create -->
<script src="https://unpkg.com/@form-create/element-ui/dist/form-create.min.js"></script>
</head>
<body>
<div id="app">
<div>
    <h1>问题题目：${title}</h1>
    </div>
    <div>
    <p>问题内容：${question}</p>
    </div>
    <div v-for="item in pics">
    <el-image :src="item" :preview-src-list="pics" :width="width"></el-image>
    </div>
    </div>
    <script>
    let vm = new Vue({
        el:"#app",
        data:{
            width:400,  
            pics:null,
        },
        mounted(){
            this.pics = JSON.parse('${pics}')
        },
        methods:{
            
        }
    })
    </script>
</body>
</html>`;
}

function getWebviewContent4(question,title) {
    var describe = JSON.stringify(question)
    return `
    <html>

<head>
<!-- import Vue.js -->
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
<!-- 引入样式 -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"></link>
<!-- 引入组件库 -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/form-create@1.4.4/district/province_city_area.js">
</script>
<!-- import form-create -->
<script src="https://unpkg.com/@form-create/element-ui/dist/form-create.min.js"></script>
</head>
<body>
<div id="app">
<div>
    <h1>问题题目：${title}</h1>
    </div>
    <div>
    <h2>问题内容：</h2>
    </div>
    <div>
    <span>{{des}}</span>
    </div>
    </div>
    <script>
    let vm = new Vue({
        el:"#app",
        data:{
            width:400,  
            pics:null,
            des:'1'
        mounted(){

        },
        methods:{
            
        }
    })
    </script>
</body>
</html>`;
}

function getDebugWebviewContent(comment, from, describe) {
    return `
    <html>

<head>
<!-- import Vue.js -->
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
<!-- 引入样式 -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"></link>
<!-- 引入组件库 -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/form-create@1.4.4/district/province_city_area.js">
</script>
<!-- import form-create -->
<script src="https://unpkg.com/@form-create/element-ui/dist/form-create.min.js"></script>
</head>
<body>
<div id="app">
<div>
    <h1>调试过程评价：${comment}</h1>
    </div>
    <div>
    <p>代码描述：${describe}</p>
    </div>
    <div>
    <p>代码来源：${from}</p>
    </div>
    </div>
    <script>
    let vm = new Vue({
        el:"#app",
        data:{
            
        },
        mounted(){
        
        },
        methods:{
            
        }
    })
    </script>
</body>
</html>`;
}

function getDebugWebviewContent2(from, describe) {
    return `
    <html>

<head>
<!-- import Vue.js -->
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
<!-- 引入样式 -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"></link>
<!-- 引入组件库 -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/form-create@1.4.4/district/province_city_area.js">
</script>
<!-- import form-create -->
<script src="https://unpkg.com/@form-create/element-ui/dist/form-create.min.js"></script>
</head>
<body>
<div id="app">
    <div>
    <p>代码描述：${describe}</p>
    </div>
    <div>
    <p>代码来源：${from}</p>
    </div>
    </div>
    <script>
    let vm = new Vue({
        el:"#app",
        data:{
            
        },
        mounted(){
        
        },
        methods:{
            
        }
    })
    </script>
</body>
</html>`;
}

function teacherHelpForm() {
    return `
    <html>

<head>
<!-- import Vue.js -->
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
<!-- 引入样式 -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"></link>
<!-- 引入组件库 -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>

</head>

<body>
    <div id="app" >
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
    <el-form-item label="出错原因" prop="error_title">
      <el-input v-model="ruleForm.error_title"></el-input>
    </el-form-item>


    <el-form-item label="错误详情" prop="error_information">
      <el-input type="textarea" v-model="ruleForm.error_information"></el-input>
    </el-form-item>

    <el-upload
    class="upload-demo"
    action="https://ourspark.feel.ac.cn/api/uploadImg"
    :on-preview="handlePreview"
    :on-remove="handleRemove"
    :on-success="handleSuccess"
    :file-list="fileList"
    list-type="picture">
    <el-button size="small" type="primary">点击上传</el-button>
    <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
  </el-upload>

    <el-form-item>
      <el-button type="primary" @click="submitForm('ruleForm')">立即创建</el-button>
      <el-button @click="resetForm('ruleForm')">重置</el-button>
    </el-form-item>
  </el-form>
    </div>
    <script>

        let vm = new Vue({
            el: '#app',
            data: {
                fileList:[],
                helpImg:[], 
                ruleForm: {
                    error_information: '',
                    error_title: '',
                },
                rules:{
                    error_information:[
                        { required: true, message: '请输入错误题目', trigger: 'blur' }
                    ],
                    error_title:[
                        { required: true, message: '请输入错误详情', trigger: 'blur' }
                    ]
                }
            },
            methods: {
                submitForm(formName) {
                    this.$refs[formName].validate((valid) => {
                      if (valid) {
                        const vscode = acquireVsCodeApi();
                            vscode.postMessage({
                                command: 'submit',
                                text: JSON.stringify(this.ruleForm),
                                img : JSON.stringify(this.helpImg)
                            })
                      } else {
                        return false;
                      }
                    });
                },
                resetForm(formName) {
                    this.$refs[formName].resetFields();
                },
                handleRemove(file, fileList) {
                    let getLocation = file.response.data[0];
                    this.hempImg.splice(getLocation, 1)
                },
                handlePreview(file) {
                    
                },
                handleSuccess(response, file, fileList){
                     this.helpImg.push(file.response.data[0])
                }
            },
        });

    </script>
    <style>
    div,span{
        font-size:15px!important;
    }
    </style>
</body>

</html>
`
}
function startdebugForm() {
    return `
    <html>

<head>
<!-- import Vue.js -->
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
<!-- 引入样式 -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"></link>
<!-- 引入组件库 -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>

</head>

<body>
    <div id="app" >
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
    <h2>对小程序开发的了解</h2>
    <el-form-item label="" prop="error_title">
      <el-input type="textarea" v-model="ruleForm.error_title"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm('ruleForm')">立即提交</el-button>
      <el-button @click="resetForm('ruleForm')">重置</el-button>
    </el-form-item>
  </el-form>
    </div>
    <script>

        let vm = new Vue({
            el: '#app',
            data: {
                ruleForm: {
                    error_title : ''
                },
                rules:{
                    error_title:[
                        { required: true, message: '请输入活动名称', trigger: 'blur' }
                    ]
                }
            },
            methods: {
                submitForm(formName) {
                    this.$refs[formName].validate((valid) => {
                      if (valid) {
                        const vscode = acquireVsCodeApi();
                            vscode.postMessage({
                                command: 'submit',
                                text: JSON.stringify(this.ruleForm),
                            })
                      } else {
                        return false;
                      }
                    });
                  },
                  resetForm(formName) {
                    this.$refs[formName].resetFields();
                  }
            }
        });

    </script>
    <style>
    div,span{
        font-size:15px!important;
    }
    </style>
</body>

</html>
`
}
function debugForm() {
    return `
    <html>

<head>
<!-- import Vue.js -->
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
<!-- 引入样式 -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"></link>
<!-- 引入组件库 -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>

</head>

<body>
    <div id="app">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
    <el-form-item label="代码标题" prop="code_title">
      <el-input v-model="ruleForm.code_title"></el-input>
    </el-form-item>

    <el-form-item label="代码来源" prop="code_from">
      <el-input type="textarea" v-model="ruleForm.code_from"></el-input>
    </el-form-item>
    <el-form-item>

    <el-form-item label="代码描述" prop="code_describe">
      <el-input type="textarea" v-model="ruleForm.code_describe"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm('ruleForm')">立即创建</el-button>
      <el-button @click="resetForm('ruleForm')">重置</el-button>
    </el-form-item>
  </el-form>
    </div>
    <script>

        let vm = new Vue({
            el: '#app',
            data: {
                ruleForm: {
                    code_describe: '',
                    code_from: '',
                    code_title: '',
                  },
                  rules:{
                    code_title:[
                        { required: true, message: '请输入代码标题', trigger: 'blur' }
                    ],
                    code_from:[
                        { required: true, message: '请输入代码来源', trigger: 'blur' }
                    ],
                    code_describe:[
                        { required: true, message: '请输入代码描述', trigger: 'blur' }
                    ]
                  }
            },
            methods: {
                submitForm(formName) {
                    this.$refs[formName].validate((valid) => {
                      if (valid) {
                        const vscode = acquireVsCodeApi();
                            vscode.postMessage({
                                command: 'submit',
                                text: JSON.stringify(this.ruleForm),
                            })
                      } else {
                        return false;
                      }
                    });
                  },
                  resetForm(formName) {
                    this.$refs[formName].resetFields();
                  }
            },
        });
    </script>
    <style>
    div,span{
        font-size:15px!important;
    }
    </style>
</body>

</html>
`
}

function createExamForm() {
    // var config='[{"type":"input","field":"error_title","title":"代码来源","info":"从哪获取到这份代码","props":{"type":"textarea","placeholder":"请输入代码来源","rows":2},"_fc_drag_tag":"input","hidden":false,"display":true,"validate":[{"type":"string","trigger":"change","mode":"required","message":"代码来源不能为空","required":true}]},{"type":"input","field":"error_information","title":"代码描述","info":"具体的代码描述，可以自己总结哟","props":{"type":"textarea","placeholder":"请输入具体的代码描述","rows":8},"_fc_drag_tag":"input","hidden":false,"display":true,"validate":[{"type":"string","trigger":"change","mode":"required","message":"代码描述不能为空","required":true}]}]'
    return `
    <html>

<head>
<!-- import Vue.js -->
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
<script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
<script src="https://cdn.quilljs.com/1.3.6/quill.min.js"></script>
<!-- 引入样式 -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"></link>
<link href="https://cdn.quilljs.com/1.3.6/quill.core.css" rel="stylesheet">
<link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
<link href="https://cdn.quilljs.com/1.3.6/quill.bubble.css" rel="stylesheet">
<!-- 引入组件库 -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/form-create@1.4.4/district/province_city_area.js">
</script>
<!-- import form-create -->
<script src="https://unpkg.com/@form-create/element-ui/dist/form-create.min.js"></script>
<!-- import axios and Vue source -->
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vue-resource@1.5.1"></script>
</head>
<body>
<div id="form-container" class="container">
  <form>
    <div class="row">
      <div class="col-xs-8">
        <div class="form-group">
          <label for="display_name">题目标题</label>
          <input class="form-control" name="display_name" type="text" >
        </div>
      </div>
    </div>
    <div class="row form-group">
      <label for="about" style="margin-bottom:30px">题目描述</label>
      <input name="about" type="hidden">
      <div id="editor">
      </div>
    </div>
    <div class="row">
      <button class="btn btn-primary" type="submit">出题</button>
    </div>
  </form>
</div>
    <script>

    var quill = new Quill('#editor', {
        modules: {
          toolbar: [
            ['bold', 'italic'],
            ['link', 'blockquote', 'code-block','image'],
            [{ list: 'ordered' }, { list: 'bullet' }]
          ]
        },
        placeholder: 'Compose an epic...',
        theme: 'snow'
      });

      var form = document.querySelector('form');

      form.onsubmit = function() {
        var about = document.querySelector('input[name=about]');
        var title = document.querySelector('input[name=display_name]');
        about.value = JSON.stringify(quill.getContents());
        const vscode = acquireVsCodeApi();
        vscode.postMessage({
            command: 'submit',
            text: about.value,
            text_:title.value,
        })
        // No back end to actually submit to!
        alert('Open the console to see the submit data!')
        return false;
      };
    </script>
    <style>
    #form-container {
        width: 600px;
      }
      .upload-demo{
          margin-top:20px
      }
      .row {
        margin-top: 15px;
      }
      .row.form-group {
        padding-left: 15px;
        padding-right: 15px;
      }
      .btn {
        margin-left: 15px;
      }
      
      .change-link {
        background-color: #000;
        border-bottom-left-radius: 6px;
        border-bottom-right-radius: 6px;
        bottom: 0;
        color: #fff;
        opacity: 0.8;
        padding: 4px;
        position: absolute;
        text-align: center;
        width: 150px;
      }
      .change-link:hover {
        color: #fff;
        text-decoration: none;
      }
      
      img {
        width: 150px;
      }
      
      #editor {
        height: 350px;
      }
    </style>
</body>

</html>
`
}

function createTrainingForm(questionlist,total,state,currentPage) {
    var state_ = !state
    var pics = JSON.stringify(questionlist)
    var total = JSON.stringify(total)
    var currentPage = JSON.stringify(currentPage)
    return `
    <html>

<head>
<!-- import Vue.js -->
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
<!-- 引入样式 -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"></link>
<!-- 引入组件库 -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/form-create@1.4.4/district/province_city_area.js">
</script>
<!-- import form-create -->
<script src="https://unpkg.com/@form-create/element-ui/dist/form-create.min.js"></script>
<!-- import axios -->
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
</head>
<body>
<div id="app">
<el-card class="box-card">
  <div slot="header" class="clearfix">
    <span style="font-size:25px">题目列表</span>
  </div>

  <div style="margin-bottom:6px"  v-if="${state}">
  <el-row :gutter="20">
  <el-col :span="8"><div class="grid-content bg-purple">
  <el-input  v-model="input" placeholder="请输入内容"></el-input></div></el-col>
  <el-col :span="8"><div class="grid-content bg-purple-light">
  <el-button @click="search">搜索</el-button></div></el-col>
  <el-col :span="8"><div class="grid-content bg-purple-light">
  <el-button @click="sort">时间升序</el-button>
  <el-button @click="Sort">时间降序</el-button>
  </div></el-col>
</el-row>
  </div>
  <el-empty v-if="${state_}" description="暂无题目"></el-empty>
  <div v-for="(item , index) in pics"  class="text item">
     {{item.title}}
    <el-button  @click="check(item.describe)" style="float: right; padding: 3px 0" type="text">查看题目描述</el-button>

    <el-button  @click="download(item._id)" style="float: right; padding: 3px 0;margin-left:0px" type="text">进行训练|</el-button>
    <el-dialog
  title="题目描述"
  :visible.sync="dialogVisible"
  width="60%">
  <span v-html="describe"></span>
  <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
  </span>
</el-dialog>
  </div>
  <el-pagination
    v-if="${state}"
    layout="prev, pager, next"
    :total="${total}"
    :current-page="${currentPage}"
    @current-change="pagination">
  </el-pagination>
</el-card>
    </div>
    <script>
    const vscode = acquireVsCodeApi()
    let vm = new Vue({
        el:"#app",
        data:{
            width:400,  
            pics:null,
            dialogVisible: false,
            describe:'',
            input: '',
        },
        mounted(){
            this.pics = ${pics}
        },
        methods:{
            pagination:function(data){
                vscode.postMessage({
                    command: 'pagination',
                    text:data
                  }) 
            },
            sort:function(){
                vscode.postMessage({
                command: 'sort',
              })
            },
            Sort:function(){
                vscode.postMessage({
                command: 'Sort',
              })
            },
            search:function(){
                vscode.postMessage({
                command: 'search',
                text:this.input
              })
            },
            // checkcode:function(data){
            //     vscode.postMessage({
            //     command: 'checkcode',
            //     text:data
            //   })
              
            // },
            check:function(data){
                this.describe = data
                this.dialogVisible = true
            },
            download:function(data){
                vscode.postMessage({
                command: 'download',
                text:data
              })
            },  
        }
    })
    </script>
    <style>
    .text {
        font-size: 15px;
      }
    
      .item {
        margin-bottom: 18px;
      }
    
      .clearfix:before,
      .clearfix:after {
        display: table;
        content: "";
      }
      .clearfix:after {
        clear: both
      }
    
      .box-card {
        width: 100%;
      }
    </style>
</body>
</html>`;
}

function getWebviewContent5(questionlist,total) {
    var pics = JSON.stringify(questionlist)
    console.log(questionlist)
    var total = JSON.stringify(total)
    return `
    <html>

<head>
<!-- import Vue.js -->
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
<!-- 引入样式 -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"></link>
<!-- 引入组件库 -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/form-create@1.4.4/district/province_city_area.js">
</script>
<!-- import form-create -->
<script src="https://unpkg.com/@form-create/element-ui/dist/form-create.min.js"></script>
<!-- import axios -->
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
</head>
<body>
<div id="app">
<el-card class="box-card">
  <div slot="header" class="clearfix">
    <span style="font-size:25px">问题题目:${total}</span>
  </div>

  <div>
  <span v-html="pics_"></span>
  </div>

</el-card>
    </div>
    <script>
    const vscode = acquireVsCodeApi()
    let vm = new Vue({
        el:"#app",
        data:{
            width:400,  
            pics_:'',
            dialogVisible: false,
            describe:'',
            input: '',
            test:false
        },
        mounted(){
           this.pics_ = '${pics}'
        },
 
    })
    </script>
    <style>
    .text {
        font-size: 15px;
      }
    
      .item {
        margin-bottom: 18px;
      }
    
      .clearfix:before,
      .clearfix:after {
        display: table;
        content: "";
      }
      .clearfix:after {
        clear: both
      }
    
      .box-card {
        width: 100%;
      }
    </style>
</body>
</html>`;
}
function newCommentForm(){
    var config='[{"type": "select","field": "effect_satisfactory","title": "最终效果满意度","info": "若满分为10分，我给自己最终呈现的小程序打分是？","effect": {"fetch": ""},"props": {"multiple": false,"placeholder": "最终效果打分","filterable": false},"options": [{"value": "1","label": "1分"}, {"value": "2","label": "2分"}, {"value": "3","label": "3分"}, {"value": "4","label": "4分"}, {"value": "5","label": "5分"}, {"value": "6","label": "6分"}, {"value": "7","label": "7分" }, {"value": "8","label": "8分"}, {"value": "9","label": "9分"}, {"value": "10","label": "10分"}],"_fc_drag_tag": "select","hidden": false,"display": true,"validate": [{"message": "打分不能为空","required": true}]}, {"type": "select","field": "doc_saticfactory","title": "文档链接帮助度","info": "若满分为5分,从文档带给我的帮助度方面,我给代码中提供的文档链接打分是？","effect": {"fetch": ""},"props": {"multiple": false,"placeholder": "文档帮助度打分","filterable": false},"options": [{"value": "1","label": "1分"}, {"value": "2","label": "2分"}, {"value": "3","label": "3分"},{"value": "4","label": "4分"},{"value": "5","label": "5分"}],"_fc_drag_tag": "select","hidden": false, "display": true,"validate": [{"message": "打分不能为空","required": true}]},{"type": "input","field": "tools","title": "调试工具使用度","info": "调试过程中,你是否有意识地使用了view组件或console方法帮助自己调试？","props": {"placeholder": "调试过程中,你是否有意识地使用了view组件或console方法帮助自己调试？","type": "textarea","rows": 3},"_fc_drag_tag": "select","hidden": false,"display": true,"validate": [{"message": "不能为空","required": true,"type": "string","trigger": "change","mode": "required"}]}, {"type": "input","field": "big_problem","title": "调试过程困难度","info": "你认为【这次】调试过程中遇到的最大的困难是？","props": {"type": "textarea","placeholder": "你认为调试过程中遇到的最大的困难是？写一下你的心路历程吧~","rows": 8},"_fc_drag_tag": "input","hidden": false,"display": true,"validate": [{"type": "string","trigger": "change","mode": "required","message": "困难信息不能为空","required": true}]}, {"type": "input","field": "suggestion","title": "插件好评与建议","info": "你对涅槃插件有何使用建议？","props": {"type": "textarea","rows": 5,"placeholder": "你对涅槃插件有何使用建议？"},"_fc_drag_tag": "input","hidden": false,"display":true,"validate":[{"type": "string","trigger": "change","mode": "required","message": "使用建议不能为空","required": true}]}]'
    return `
    <html>

<head>
<!-- import Vue.js -->
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
<!-- 引入样式 -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"></link>
<!-- 引入组件库 -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/form-create@1.4.4/district/province_city_area.js">
</script>
<!-- import form-create -->
<script src="https://unpkg.com/@form-create/element-ui/dist/form-create.min.js"></script>
</head>

<body>
    <div id="app" style="width:500px;font-size:25px!important;margin-left:-20px">
        <form-create v-model="fApi" :rule="rule" :option="option" @goods-name-change="change" />
    </div>
    <script>
        var maker = formCreate.maker;

        let vm = new Vue({
            el: '#app',
            data: {
                formData: {},
                rule: mock(),
                fApi: {},
                option: {
                    //显示表单重置按钮
                    resetBtn: true,
                    //表单提交事件
                    onSubmit: function (formData) {
                        const vscode = acquireVsCodeApi();
                        vscode.postMessage({
                            command: 'submit',
                            text: JSON.stringify(formData)
                        })
                        // alert(JSON.stringify(formData));
                        //按钮进入提交状态
                        vm.fApi.btn.loading();
                        //重置按钮禁用
                        vm.fApi.resetBtn.disabled();
                        //按钮进入可点击状态
                        vm.fApi.btn.loading(false);
                       
                    },
                    mounted: () => {
                    }
                }
            },
            watch: {
                'formData.address': {
                    handler: function (n) {
                        console.log(n);
                    },
                    deep: true
                }
            },
            methods: {
                change: function (...arg) {
                    console.log(arg);
                }
            },
            mounted: function () {
                console.log(this.fApi.formData());
                //动态添加表单元素
                //$f.append($r, 'pic');
            }
        });

        function mock() {
            var data='${config}'
            return JSON.parse(data);
        }

        // $r = maker.upload('产品主图', 'logo', 'http://img1.touxiang.cn/uploads/20131030/30-075657_191.jpg').props({
        //     "action": "",
        //     "maxLength": 1,
        //     "multiple": false,
        //     "max": 0,
        //     "type": "select",
        //     "uploadType": "image",
        //     "name": "file",
        //     "onSuccess": function () {
        //         return 'http://img1.touxiang.cn/uploads/20131030/30-075657_191.jpg';
        //     }
        // }).validate({
        //     required: true,
        //     type: 'array',
        //     min: 1,
        //     message: '请上传1张图片',
        //     trigger: 'change'
        // });
    </script>
    <style>
    div,span{
        font-size:10px!important;
    }
    </style>
</body>

</html>
`
}



module.exports = {
    helpForm,
    getWebviewContent,
    teacherHelpForm,
    debugForm,
    getDebugWebviewContent,
    commentForm,
    getDebugWebviewContent2,
    createExamForm,
    createTrainingForm,
    getWebviewContent4,
    getWebviewContent5,
    startdebugForm,
    newCommentForm
}