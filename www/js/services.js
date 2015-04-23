angular.module('starter.services', [])
    .factory('DB',function($q,DB_CONFIG){
      var self = this;
      self.db = null;
      self.init = function(){
        // Use self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name}); in production
        self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', -1);

        angular.forEach(DB_CONFIG.tables, function(table) {
          var columns = [];

          angular.forEach(table.columns, function(column) {
            columns.push(column.name + ' ' + column.type);
          });

          var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
          self.query(query);
          console.log('Table ' + table.name + ' initialized');
        });
      };
      self.query = function(query, bindings) {
        bindings = typeof bindings !== 'undefined' ? bindings : [];
        var deferred = $q.defer();

        self.db.transaction(function(transaction) {
          transaction.executeSql(query, bindings, function(transaction, result) {
            deferred.resolve(result);
          }, function(transaction, error) {
            deferred.reject(error);
          });
        });

        return deferred.promise;
      };
      self.fetchAll = function(result) {
        var output = [];

        for (var i = 0; i < result.rows.length; i++) {
          output.push(result.rows.item(i));
        }

        return output;
      };

      self.fetch = function(result) {
        return result.rows.item(0);
      };
      self.drop = function(){

      }
      return self;
    })
.factory('Projects', function(DB) {
      var self = this;

      self.all = function() {
        return DB.query('SELECT * FROM Projects')
            .then(function(result){
              return DB.fetchAll(result);
            });
      };

      self.getById = function(id) {
        return DB.query('SELECT * FROM Projects WHERE id = ?', [id])
            .then(function(result){
              return DB.fetch(result);
            });
      };
      self.add = function(project){
        return DB.query("INSERT INTO Projects (title) VALUES (?)",[project.title])
      }
      return self;
})
    .factory('Tasks', function(DB) {
      var self = this;

      self.all = function() {
        return DB.query('SELECT * FROM Tasks')
            .then(function(result){
              return DB.fetchAll(result);
            });
      };
      self.getByProjectId = function(project_id){
        return DB.query('SELECT * FROM Tasks WHERE project_id = ?',[project_id])
            .then(function(res){
              return DB.fetchAll(res)
            })
      }
      self.getById = function(id) {
        return DB.query('SELECT * FROM Tasks WHERE id = ?', [id])
            .then(function(result){
              return DB.fetch(result);
            });
      };
      self.add = function(task){
        return DB.query("INSERT INTO Tasks (title,project_id) VALUES (?,?)",[task.title,task.project_id])
      }
      self.remove = function(task){
        console.log("task",task);
        return DB.query("DELETE FROM Tasks WHERE id = ?",[task.id]);
      }
      self.edit = function(task){
        return DB.query("UPDATE Tasks SET title = ? WHERE id = ?;",[task.title,task.id])
      }
      self.done = function(task){
        return DB.query("UPDATE Tasks SET done = ? WHERE id = ?",[task.done? 0 : 1,task.id])
      }
      self.drop = function(){
        return DB.query("DROP TABLE IF EXISTS Tasks")
      }
      return self;
    });
