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
          if(result.rows.length)
            return result.rows.item(0);
          return null
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
    .factory('Tasks', function(DB,$q) {
      var self = this;

      self.all = function() {
        return DB.query('SELECT * FROM Tasks')
            .then(function(result){
              return DB.fetchAll(result);
            });
      };
      self.changedItems = function(){
          return DB.query('SELECT * FROM Tasks WHERE flag != 0')
              .then(function(result){
                  return DB.fetchAll(result);
              });
      }
      self.synced = function(_v){
          DB.query("UPDATE Tasks SET flag = ?,_v = ? WHERE flag = ? OR flag = ?;",[0,_v,1,2])
          DB.query("DELETE FROM Tasks WHERE flag = ?",[3]);
          //return DB.query("UPDATE Tasks SET flag = ?,_v = ? WHERE flag != ?;",[0,_v,0])
      }
      self.getByProjectId = function(project_id){
        return DB.query('SELECT * FROM Tasks WHERE project_id = ? AND flag != ?',[project_id,3])
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
          //set flag to 1 "Created"
          if(task._v){//from server
              return DB.query("INSERT INTO Tasks (id,title,project_id,flag,_v) VALUES (?,?,?,?,?)",[task.id,task.title,task.project_id,0,task._v])
          }
          return DB.query("INSERT INTO Tasks (id,title,project_id,flag) VALUES (?,?,?,?)",[task.id,task.title,task.project_id,1])

      }
      self.remove = function(task){
        console.log("task",task);
          if(task._v){//Set flag to 3 "Deleted"
            return DB.query("UPDATE Tasks SET flag = ? WHERE id = ?;",[3,task.id])
          }else{//delete item completely
            return DB.query("DELETE FROM Tasks WHERE id = ?",[task.id]);
          }
      }
        self.edit = function(task){
            console.log(task);
            var defer = $q.defer();
            //if this item synchronized before them set flag to 2 "Updated" else 1 "Created"
            DB.query("UPDATE Tasks SET title = ?,flag = ? WHERE id = ?;",
                [task.title,
                    (task._v == null ? 1:2),
                    task.id])
                .then(function(res){
                    defer.resolve({res:res,task:task})
                })


            return defer.promise;

        }
        self.done = function(task){
        return DB.query("UPDATE Tasks SET done = ?,flag = ? WHERE id = ?",[task.done? 0 : 1,(task._v == null ? 1:2),task.id])
      }
        self.exportChanges = function(){
            return DB.query('SELECT * FROM Tasks WHERE flag > 0')
                .then(function(result){
                    return DB.fetchAll(result);
                });
        }
      self.drop = function(){
        return DB.query("DROP TABLE IF EXISTS Tasks")
      }

      return self;
    })

    .factory('$localstorage', ['$window', function($window) {
        return {
            set: function(key, value) {
                $window.localStorage[key] = value;
            },
            get: function(key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function(key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function(key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        }
    }]);
