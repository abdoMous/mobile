angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ProjectsCtrl', function($scope, Projects) {
      Projects.all().then(function(projects){
        $scope.projects = projects
      })
})

.controller('ProjectDetailCtrl', function($scope, $stateParams, Projects,Tasks,$ionicModal,$cordovaSQLite) {
  $scope.project_id = $stateParams.projectId;

      function refresh(){
        Tasks.getByProjectId($scope.project_id).then(function(tasks){
          $scope.Tasks = tasks;
        })
      }

      refresh();
      //return Tasks;
  //removing item modal
  $ionicModal.fromTemplateUrl('taskRemoving.html',{
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.removingModal = modal;
  });

  //editing item modal
  $ionicModal.fromTemplateUrl('taskEditing.html',{
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.editingModal = modal;
  });

  //add task modal
  $ionicModal.fromTemplateUrl('taskAdding.html',{
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.addingModal = modal;
  });

  $scope.done = function(task){
    Tasks.done(task).then(function(res){
      console.log(res);
      refresh()
    })
  }
  $scope.edit = function(task){
    if(!$scope.editingModal.isShown()){
      $scope.editingModal.show();
      $scope.editingModal.task = {id:task.id,title:task.title}
    }else{
      Tasks.edit($scope.editingModal.task).then(function(res){
        console.log("res", res);
        refresh()
        $scope.editingModal.hide();
      })
    }

  }
  $scope.remove = function(task){
    if(!$scope.removingModal.isShown()){
      $scope.removingModal.show()
      $scope.removingModal.task = {id : task.id};
    }
    else
      Tasks.remove($scope.removingModal.task).then(function(res){
        //console.log("res",res);
        $scope.removingModal.hide()
        refresh();
      });
  }

  $scope.hide = function(){
    if($scope.editingModal.isShown()) $scope.editingModal.hide();
    if($scope.removingModal.isShown()) $scope.removingModal.hide();
    if($scope.addingModal.isShown()) $scope.addingModal.hide();
  }

  $scope.add = function(task){
    if(!$scope.addingModal.isShown()){
      $scope.addingModal.show()
      $scope.addingModal.task = {project_id:$scope.project_id}
    }
    else{
      Tasks.add($scope.addingModal.task)
          .then(function(res){
            $scope.addingModal.hide()
            refresh()
          });;
    }
  }
})

.controller('AccountCtrl', function($scope,Tasks) {
  $scope.settings = {
    enableFriends: true
  };
  $scope.dropTasks = function(){
    Tasks.drop().then(function(res){
      alert("Table Tasks droped!")
    })
  }
});
