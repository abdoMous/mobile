angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ProjectsCtrl', function($scope, Projects) {
  $scope.projects = Projects.all();
  $scope.remove = function(project) {
    Projects.remove(project);
  }
})

.controller('ProjectDetailCtrl', function($scope, $stateParams, Projects,$ionicModal) {
  $scope.project = Projects.get($stateParams.projectId);

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

  $scope.done = function(project){
    alert(project.title + " Done!")
  }
  $scope.edit = function(project){
    if(!$scope.editingModal.isShown())
      $scope.editingModal.show()
    else
      alert(project.title + " Edited!")

  }
  $scope.remove = function(project){
    if(!$scope.removingModal.isShown())
      $scope.removingModal.show()
    else
      alert(project.title + " Removed!")
  }

  $scope.hide = function(){
    if($scope.editingModal.isShown()) $scope.editingModal.hide();
    if($scope.removingModal.isShown()) $scope.removingModal.hide();
    if($scope.addingModal.isShown()) $scope.addingModal.hide();
  }

  $scope.add = function(){
    $scope.addingModal.show()
  }
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
