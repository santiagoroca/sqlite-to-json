var format = require('util').format;
var sqlite3 = require('sqlite3');

var INSERT = 'INSERT INTO %s (%s) VALUES (%s)';
var UPDATE = 'UPDATE %s SET %s WHERE %s';

module.exports = function (database_name, done) {
    var _self = this;

    var db = new sqlite3.Database(database_name);

    var buildPromise = function (columns, table_name, queryId) {

        var promises = Object.keys(columns).map(function (column) {
            if (!Array.isArray(columns[column]) && typeof columns[column] == 'object') {
                return new Promise (function (done, reject) {
                    insert(column, columns[column], done, reject, table_name, queryId);
                });
            }

            return {};
        });

        Object.keys(columns).forEach(function (column) {
            if (Array.isArray(columns[column])) {

                Array.prototype.push.apply(
                    promises,
                    columns[column].map(function (aData) {
                        return new Promise(function (done, reject) {
                            insert(column, aData, done, reject, table_name, queryId);
                        });
                    })
                );

            }
        });

        return promises;
    }

    var insert = function (table_name, columns, done, reject, parentTable, parentId) {
        if (parentTable && parentId) {
            columns[parentTable + '_id'] = parentId;
        }

        var columNames = Object.keys(columns);

        //Adding Main Object
        var mainObjectColumns = columNames.filter(function (columName) {
            return typeof columns[columName] != 'object' && !Array.isArray(columns[columName]);
        });

        var stmt = db.prepare(format(
            INSERT,
            table_name,
            mainObjectColumns.join(','),
            (mainObjectColumns.map(function (columnName) {
                return "?";
            }).join(','))
        ));

        var arguments = mainObjectColumns.map(function (columnName) {
            return columns[columnName];
        });

        stmt.run( ...arguments, function (err, result) {
            if (err) {
                reject(err);
            }

            Promise
                .all(buildPromise(columns, table_name, this.lastID))
                .then(done)
                .catch(reject);
        });
    }

    var facade = function (tablename, data, done, execute) {

        if (typeof data == 'object') {
            db.run ('BEGIN TRANSACTION;');

            execute(tablename, data, function () {
                db.run('END TRANSACTION;');
                done ();
            }, function (err) {
                db.run('ROLLBACK;');
                done (err);
            });
        } else if (Array.isArray(data)) {

            Promise.all(data.map(function (sData) {
                return new Promise(function (resolve) {
                    facade(tablename, sData, resolve, execute);
                });
            })).then(done);

        }

    }

    _self.insert = function (tablename, data, done) {
        facade (tablename, data, done, insert);
    }

    _self.update = function () {
        facade (tablename, data, done, update);
    }


}