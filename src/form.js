/** 表单页面生成器
 * @param {string} config 表单配置
 */
function generateForm(){
    // var config='[{"type":"select","field":"experience_method","title":"实验方法","info":"有关系统探索学习法的实验方法","effect":{"fetch":""},"props":{"multiple":true,"placeholder":"请选择实验方法","filterable":false},"options":[{"value":"1","label":"拆解组合"},{"value":"2","label":"近似对比"},{"value":"3","label":"主动试错"}],"_fc_drag_tag":"select","hidden":false,"display":true,"validate":[{"type":"array","trigger":"change","mode":"required","message":"实验方法不能为空","required":true}]},{"type":"select","field":"error_type","title":"错误类型","info":"发现错误的类型，可以选择或自己创建","effect":{"fetch":""},"props":{"allowCreate":true,"placeholder":"请选择或输入错误类型","multiple":true,"filterable":true,"defaultFirstOption":true},"options":[{"value":"1","label":"语法错误"},{"value":"2","label":"样式错误"},{"value":"3","label":"逻辑错误"}],"_fc_drag_tag":"select","hidden":false,"display":true,"validate":[{"type":"array","trigger":"change","mode":"required","message":"错误类型不能为空","required":true}]},{"type":"input","field":"row_num","title":"所在行数","info":"错误代码出现的行数","props":{"type":"number","placeholder":"请输入所在行数"},"_fc_drag_tag":"input","hidden":false,"display":true,"validate":[{"type":"string","trigger":"change","mode":"required","message":"所在行数不能为空","required":true}]},{"type":"select","field":"code_type","title":"代码类型","info":"出现错误的代码类型","effect":{"fetch":""},"props":{"multiple":true,"placeholder":"请选择出现错误的代码类型"},"options":[{"value":"1","label":"JavaScript文件"},{"value":"2","label":"WXML文件"},{"value":"3","label":"WXSS文件"}],"_fc_drag_tag":"select","hidden":false,"display":true,"validate":[{"type":"array","trigger":"change","mode":"required","message":"代码类型不能为空","required":true}]},{"type":"input","field":"error_information","title":"错误信息","info":"具体的错误信息，可以复制控制台输出的错误信息或自己总结","props":{"type":"textarea","placeholder":"请输入具体的错误信息","rows":8},"_fc_drag_tag":"input","hidden":false,"display":true,"validate":[{"type":"string","trigger":"change","mode":"required","message":"错误信息不能为空","required":true}]},{"type":"input","field":"slove_route","title":"解题思路","info":"你是如何发现这个错误的？写一下你的心路历程吧~","props":{"type":"textarea","rows":5,"placeholder":"请输入解题思路"},"_fc_drag_tag":"input","hidden":false,"display":true,"validate":[{"type":"string","trigger":"change","mode":"required","message":"解题思路不能为空","required":true}]},{"type":"upload","field":"error_image","title":"错误截图","info":"如描述不清楚，可以上传错误截图","props":{"action":"https://www.ourspark.org/api/uploadImg","onSuccess":"[[FORM-CREATE-PREFIX-function(e,t){t.url=e.data[0]}-FORM-CREATE-SUFFIX]]","withCredentials":true},"_fc_drag_tag":"upload","hidden":false,"display":true}]'
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
    <h2>您是否在调试？</h2>
    <el-form-item label="" style="margin-right:80px" prop="isTiaoShi">
      <el-radio-group v-model="form.isTiaoShi">
        <el-radio label="是" value="1"></el-radio>
        <el-radio label="否" value="2"></el-radio>
      </el-radio-group>
    </el-form-item>
    <h2>本次的编译结果与您的预期是否相同？</h2>
    <el-form-item label="" style="margin-right:80px !important" prop="isMeetExpectation">
      <el-radio-group v-model="form.isMeetExpectation">
        <el-radio label="是" value="1"></el-radio>
        <el-radio label="否" value="2"></el-radio>
      </el-radio-group>
    </el-form-item>
    <h2>您认为目前（这一步调试想要解决）的错误是哪类文件引起的？</h2>
    <el-form-item label="" prop="thinkBugFilePosition">
      <el-radio-group v-model="form.thinkBugFilePosition">
        <el-radio label="js" value="1"></el-radio>
        <el-radio label="wxml" value="2"></el-radio>
        <el-radio label="wxss" value="3"></el-radio>
        <el-radio label="json" value="4"></el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="onSubmit('form')">立即提交</el-button>
      <el-button>取消</el-button>
    </el-form-item>
  </el-form>
    </div>
    <script>
        

        let vm = new Vue({
            el: '#app',
            data: {
                form: {
                    isMeetExpectation:'',
                    thinkBugFilePosition:'',
                    isTiaoShi:''
                },
                rules:{
                    thinkBugFilePosition:[
                        { required: true, message: '请选择错误文件', trigger: 'change' }
                    ],
                    isMeetExpectation:[
                        { required: true, message: '请选择是否符合预期结果', trigger: 'change' }
                    ],
                    isTiaoShi:[
                        { required: true, message: '请选择是否在调试', trigger: 'change' }
                    ],
                }
            },
            methods: {
                onSubmit:function(formName) {
                    this.$refs[formName].validate((valid) => {
                        if (valid) {
                          const vscode = acquireVsCodeApi();
                          vscode.postMessage({
                              command: 'submit',
                              text: JSON.stringify(this.form)
                          })
                        } else {
                          return false;
                        }
                    });
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

function newCommentForm(config){
    // var config='[{"type":"select","field":"experience_method","title":"实验方法","info":"有关系统探索学习法的实验方法","effect":{"fetch":""},"props":{"multiple":true,"placeholder":"请选择实验方法","filterable":false},"options":[{"value":"1","label":"拆解组合"},{"value":"2","label":"近似对比"},{"value":"3","label":"主动试错"}],"_fc_drag_tag":"select","hidden":false,"display":true,"validate":[{"type":"array","trigger":"change","mode":"required","message":"实验方法不能为空","required":true}]},{"type":"select","field":"error_type","title":"错误类型","info":"发现错误的类型，可以选择或自己创建","effect":{"fetch":""},"props":{"allowCreate":true,"placeholder":"请选择或输入错误类型","multiple":true,"filterable":true,"defaultFirstOption":true},"options":[{"value":"1","label":"语法错误"},{"value":"2","label":"样式错误"},{"value":"3","label":"逻辑错误"}],"_fc_drag_tag":"select","hidden":false,"display":true,"validate":[{"type":"array","trigger":"change","mode":"required","message":"错误类型不能为空","required":true}]},{"type":"input","field":"row_num","title":"所在行数","info":"错误代码出现的行数","props":{"type":"number","placeholder":"请输入所在行数"},"_fc_drag_tag":"input","hidden":false,"display":true,"validate":[{"type":"string","trigger":"change","mode":"required","message":"所在行数不能为空","required":true}]},{"type":"select","field":"code_type","title":"代码类型","info":"出现错误的代码类型","effect":{"fetch":""},"props":{"multiple":true,"placeholder":"请选择出现错误的代码类型"},"options":[{"value":"1","label":"JavaScript文件"},{"value":"2","label":"WXML文件"},{"value":"3","label":"WXSS文件"}],"_fc_drag_tag":"select","hidden":false,"display":true,"validate":[{"type":"array","trigger":"change","mode":"required","message":"代码类型不能为空","required":true}]},{"type":"input","field":"error_information","title":"错误信息","info":"具体的错误信息，可以复制控制台输出的错误信息或自己总结","props":{"type":"textarea","placeholder":"请输入具体的错误信息","rows":8},"_fc_drag_tag":"input","hidden":false,"display":true,"validate":[{"type":"string","trigger":"change","mode":"required","message":"错误信息不能为空","required":true}]},{"type":"input","field":"slove_route","title":"解题思路","info":"你是如何发现这个错误的？写一下你的心路历程吧~","props":{"type":"textarea","rows":5,"placeholder":"请输入解题思路"},"_fc_drag_tag":"input","hidden":false,"display":true,"validate":[{"type":"string","trigger":"change","mode":"required","message":"解题思路不能为空","required":true}]},{"type":"upload","field":"error_image","title":"错误截图","info":"如描述不清楚，可以上传错误截图","props":{"action":"https://www.ourspark.org/api/uploadImg","onSuccess":"[[FORM-CREATE-PREFIX-function(e,t){t.url=e.data[0]}-FORM-CREATE-SUFFIX]]","withCredentials":true},"_fc_drag_tag":"upload","hidden":false,"display":true}]'
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
    <div id="app" style="width:300px;font-size:10px!important;margin-left:-70px">
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
module.exports={generateForm}