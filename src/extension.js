const vscode = require('vscode')
const ProjectListProvider = require('./view/projectList')
const controller = require('./controller/index')

function toast(text) {
  return vscode.window.showInformationMessage(text)
}
module.exports = {
  activate: function(context) {
    const projectListProvider = new ProjectListProvider(context)
    vscode.window.registerTreeDataProvider(
      'projectQListView',
      projectListProvider
    )
    // 添加新分组
    vscode.commands.registerCommand('projectQ.addCategory', () => {
      vscode.window
        .showInputBox({
          prompt: 'category name',
          placeHolder: 'input category name here',
          value: ''
        })
        .then(label => {
          if (!label) {
            vscode.window.showWarningMessage(
              'must provide a name for category!'
            )
          } else {
            controller.category.add({ label })
            projectListProvider.refresh()
          }
        })
    })
    // 重命名分组
    vscode.commands.registerCommand('projectQ.renameCategory', payload => {
      vscode.window
        .showInputBox({
          prompt: 'category name',
          placeHolder: 'input category name here',
          value: payload.label
        })
        .then(newName => {
          if (!newName) {
            vscode.window.showWarningMessage(
              'must provide a name for category!'
            )
          } else {
            controller.category.edit({ id: payload.id, label: newName })
            projectListProvider.refresh()
          }
        })
    })
    // 删除选中分组，该分组下的项目转移至default分组
    vscode.commands.registerCommand('projectQ.deleteCategory', payload => {
      if (payload.id === 'default') {
        toast('can not delete the default category')
      } else {
        controller.category.delete(payload)
        toast('projectQ: delete a  category success!')
        projectListProvider.refresh()
      }
    })
    // 当前打开的文件夹添加至项目列表
    vscode.commands.registerCommand('projectQ.addProject', () => {
      const categoryList = controller.category.getList()
      vscode.window
        .showQuickPick(categoryList.map(o => o.label + ' - ' + o.id), {
          placeHolder: 'choose category'
        })
        .then(res => {
          const categoryId = res.split(' - ')[1]
          controller.project.add(categoryId)
          toast('projectQ: add new project success!')
          projectListProvider.refresh()
        })
    })
    // 从列表中删除选中类别
    vscode.commands.registerCommand('projectQ.deleteProject', payload => {
      controller.project.delete(payload)
      toast('projectQ: delete project success!')
      projectListProvider.refresh()
    })
    // 打开项目（切换项目）
    vscode.commands.registerCommand('projectQ.openProject', payload => {
      controller.project.open(payload)
    })
    // 打开项目（新窗口）
    vscode.commands.registerCommand(
      'projectQ.openProjectInNewWindow',
      payload => {
        controller.project.openInNewWindow(payload)
      }
    )
    // 重命名项目
    vscode.commands.registerCommand('projectQ.renameProject', payload => {
      vscode.window
        .showInputBox({
          prompt: 'project name',
          placeHolder: 'input project name here',
          value: payload.label
        })
        .then(newName => {
          if (!newName) {
            vscode.window.showWarningMessage('must provide a name for project!')
          } else {
            controller.project.edit({ ...payload, label: newName })
            projectListProvider.refresh()
          }
        })
    })
    // 修改项目分组
    vscode.commands.registerCommand('projectQ.changeCategory', project => {
      const categoryList = controller.category.getList()
      vscode.window
        .showQuickPick(categoryList.map(o => o.label + ' - ' + o.id), {
          placeHolder: 'choose category'
        })
        .then(res => {
          const categoryId = res.split(' - ')[1]
          controller.project.changeCategory(project.id, categoryId)
          projectListProvider.refresh()
        })
    })
    // 刷新视图
    vscode.commands.registerCommand('projectQ.refresh', () => {
      vscode.commands.executeCommand('workbench.action.reloadWindow')
      projectListProvider.refresh()
    })
  }
}
