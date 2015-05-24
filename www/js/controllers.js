angular.module('starter.controllers', [])

.controller('DashCtrl', function($rootScope,$scope,$http,Tasks,$localstorage,$q) {

      $scope.sync = function(){

        Tasks.changedItems().then(function(tasks){
          console.log("getting mobile changed item");
          $http.post('http://'+$rootScope.hostname+':3000/sync',{tasks:tasks,lastSync:$localstorage.get('lastSync')})
              .then(function(res){
                var serverTasks = res.data.changes;
                console.log(res.data);
                  Tasks.synced(res.data._v);
                  $localstorage.set('lastSync',res.data._v)

                for(var i in serverTasks){
                  serverTasks[i].id = serverTasks[i]._id
                    console.log("serverTasks[i].deleted");
                    console.log(serverTasks[i].deleted);
                  if (serverTasks[i].deleted) {
                      delete serverTasks[i]._v
                     Tasks.remove(serverTasks[i])
                  }else{
                    Tasks.edit(serverTasks[i]).then(function(res){
                      if(!res.res.rowAffected){
                        Tasks.add(res.task)
                      }
                    })
                  }
                }
              })
        });

      }
})

.controller('ProjectsCtrl', function($rootScope,$scope, Projects,$http) {
      $http.get('http://'+$rootScope.hostname+':3000/sync/projects').then(function(res){
        console.log(res.data);
        $scope.projects = res.data
      })
      //Projects.all().then(function(projects){
      //  $scope.projects = projects
      //})
})

.controller('ProjectDetailCtrl', function($scope, $stateParams, Projects,Tasks,$ionicModal,$ionicPopup) {
      $scope.$on('$viewContentLoading',function(event){
             refresh()
          });
  $scope.project_id = $stateParams.projectId;

      var guid = function() {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
      }

      var refresh = function (){
        Tasks.getByProjectId($scope.project_id).then(function(tasks){
          $scope.Tasks = tasks;
        })
      }

      refresh();
      //return Tasks;

      $scope.AddPopup = function(data)
      {
         var id = guid()
        console.log(id);
          $scope.data = {id:id,project_id: $scope.project_id}

        // An elaborate, custom popup
        $ionicPopup.show({
          template: '<input type="text" ng-model="data.title">',
          title: 'Task Title',
          subTitle: 'Add a task offline ',
          scope: $scope,
          buttons: [
            { text: 'Cancel' },
            {
              text: 'Add',
              type: 'button-positive',
              onTap: function(e) {
                Tasks.add($scope.data);
                refresh()
                return $scope.data;
              }
            }
          ]
        });
      };
      $scope.editPopup = function(data) {
        $scope.editedItem = {id:data.id,title:data.title,project_id:data.id,_v:data._v};
        // An elaborate, custom popup
        $ionicPopup.show({
          template: '<input type="text" ng-model="editedItem.title">',
          title: 'Edit Task Title',
          subTitle: 'Edit a task offline ',
          scope: $scope,
          buttons: [
            { text: 'Cancel' },
            {
              text: 'Edit',
              type: 'button-positive',
              onTap: function(e) {
                Tasks.edit($scope.editedItem);
                refresh()
                return $scope.editedItem;
              }
            }
          ]
        });
      };
      $scope.deletePopup = function(data){
        console.log(data);
        $ionicPopup.confirm({
          title: 'Consume Ice Cream',
          template: 'Are you sure you want to eat this ice cream?'
        }).then(function(res) {
          if(res) {
            Tasks.remove(data);
            refresh()
          }
        });
      }
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
    $scope.showPopup
  }
  //$scope.edit = function(task){
  //  if(!$scope.editingModal.isShown()){
  //    $scope.editingModal.show();
  //    $scope.editingModal.task = {id:task.id,title:task.title}
  //  }else{
  //    Tasks.edit($scope.editingModal.task).then(function(res){
  //      console.log("res", res);
  //      refresh()
  //      $scope.editingModal.hide();
  //    })
  //  }
  //
  //}
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


      $scope.$on('$destroy', function() {
        $scope.popover.remove();
      });
      // Execute action on hide popover
      $scope.$on('popover.hidden', function() {
        // Execute action
      });
      // Execute action on remove popover
      $scope.$on('popover.removed', function() {
        // Execute action
      });

  $scope.add = function($event){

    //if(!$scope.addingModal.isShown()){
    //  $scope.addingModal.show()
    //  $scope.addingModal.task = {project_id:$scope.project_id}
    //}
    //else{
    //  Tasks.add($scope.addingModal.task)
    //      .then(function(res){
    //        $scope.addingModal.hide()
    //        refresh()
    //      });;
    //}
  }
})

.controller('AccountCtrl', function($scope,$rootScope,Tasks,$ionicPopup) {
  $scope.settings = {
    enableFriends: true
  };
   $rootScope.hostname ="sdsd"
  $scope.dropTasks = function(){
    Tasks.drop().then(function(res){
      alert("Table Tasks droped!")
    })
  }
  $scope.editHostPopup = function() {
    $scope.edite = $rootScope.hostname
  };
});
