var sqlite3 = require('sqlite3');

module.exports = function (database_name, done) {
    var _self = this;

    var db = new sqlite3.Database(database_name);

    var buildPromise = function () {
        var promises = columns.map(function (data, column) {

            return new Promise (function (done) {
                if (typeof columns[columName] == 'object') {
                    insert(column, data, done, table_name, queryResult.lastID);
                }
            });

        });

        columns.forEach(function (data, column) {
            if (Array.isArray(columns[columName])) {

                Array.prototype.push.apply(
                    promises,
                    columns[columName].map(function (aData) {
                        return function (done) {
                            insert(column, aData, done, table_name, queryResult.lastID);
                        }
                    })
                );

            }
        });

        return promises;
    }

    var insert = function (table_name, columns, done, parentTable, parentId) {
        if (parentTable && parentId) {
            columns.parentTable = parentId;
        }

        var columNames = Object.key(columns);

        //Adding Main Object
        var mainObjectColumns = columNames.filter(function (columName) {
            return typeof columns[columName] != 'object' && !Array.isArray(columns[columName]);
        });

        var stm = db.prepare('INSERT INTO ? (?) VALUES (?)');

        db.run (
            table_name,
            mainObject.join(','),
            mainObjectColumns.map(function (columnName) {
                return columns[columnName];
            }), function () {
                Promise.all(promises).then(done);
            }
        );
    }

    var update = function (table_name, columns, done, parentTable, parentId) {
        if (parentTable && parentId) {
            columns.parentTable = parentId;
        }

        var columNames = Object.key(columns);

        //Adding Main Object
        var mainObjectColumns = columNames.filter(function (columName) {
            return typeof columns[columName] != 'object' && !Array.isArray(columns[columName]);
        });

        var stm = db.prepare('INSERT INTO ? (?) VALUES (?)');

        db.run (
            table_name,
            mainObject.join(','),
            mainObjectColumns.map(function (columnName) {
                return columns[columnName];
            }), function () {
                var queryResult = this;

                var promises = columns.map(function (data, column) {

                    return new Promise (function (done) {
                        if (typeof columns[columName] == 'object') {
                            insert(column, data, done, table_name, queryResult.lastID);
                        }
                    });

                });

                columns.forEach(function (data, column) {
                    if (Array.isArray(columns[columName])) {

                        Array.prototype.push.apply(
                            promises,
                            columns[columName].map(function (aData) {
                                return function (done) {
                                    insert(column, aData, done, table_name, queryResult.lastID);
                                }
                            })
                        );

                    }
                });

                Promise.all(promises).then(done);
            }
        );
    }

    var facade = function (tablename, data, done, execute) {
        if (typeof data == 'object') {

            execute(tablename, data, done);

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