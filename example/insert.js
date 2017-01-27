var jSqlite = require ('../index');

var jsqlite = new jSqlite('insert.sqlite');

jsqlite.insert(
    'artist',
    {
        name: 'Pearl Jam',
        year: '1991',

        album: {
            name: 'Lightning Bolt',
            live: [
                {
                    year: 1991,
                    place: [
                        {
                            name: 'Seattle'
                        },
                        {
                            name: 'California'
                        }
                    ]
                },
                {
                    year: 2005,
                    place: [
                        {
                            name: 'New Jersey'
                        },
                        {
                            names: 'Nevada'
                        }
                    ]
                }
            ]
        }

    }, function (err) {
        console.log (err);
    }
);