angular.module('starter.services', [])

.factory('Projects', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var Projects = [{
    id: 0,
    title: 'chapter 2',
    todo:5
  },{
    id: 1,
    title: 'chapter 3',
    todo:2
  },{
    id: 2,
    title: 'Mobile App',
    todo:20
  }];

  return {
    all: function() {
      return Projects;
    },
    get: function(projectId) {
      for (var i = 0; i < Projects.length; i++) {
        if (Projects[i].id === parseInt(projectId)) {
          return Projects[i];
        }
      }
      return null;
    }
  };
});
