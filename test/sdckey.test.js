// Copyright (c) 2014, Joyent, Inc. All rights reserved.

var transform = require('../lib/replicator/transforms/sdckey.js');

var redis = require('fakeredis');
var REDIS;

var nodeunit = require('nodeunit-plus');
var test = nodeunit.test;

test('setup', function (t) {
    REDIS = redis.createClient();
    t.done();
});

test('add', function (t) {
    var entry = {
        'dn': 'changenumber=14, cn=changelog',
        'controls': [],
        'targetdn': 'fingerprint=fp, ' +
            'uuid=1a940615-65e9-4856-95f9-f4c530e86ca4, ' +
            'ou=users, o=smartdc',
        'changetype': 'add',
        'objectclass': 'changeLogEntry',
        'changetime': '2013-12-11T20:28:22.273Z',
        'changes': {
            'name': [
                ''
            ],
            'objectclass': [
                'sdckey'
            ],
            'openssh': [
                'elided-openssh'
            ],
            'pkcs': [
                'elided-pkcs'
            ],
            'fingerprint': [
                '7b:a4:7c:6c:c7:2f:d9:a6:bd:ec:1b:2f:e8:3d:40:18'
            ],
            '_owner': [
                '1a940615-65e9-4856-95f9-f4c530e86ca4'
            ],
            '_parent': [
                'uuid=1a940615-65e9-4856-95f9-f4c530e86ca4, ' +
                    'ou=users, o=smartdc'
            ]
        },
        'changenumber': '14'
    };

    var args = {
        changes: entry.changes,
        entry: entry,
        log: this.log,
        redis: REDIS
    };

    var key = '/uuid/1a940615-65e9-4856-95f9-f4c530e86ca4';
    var value = {
        keys: {
            '7b:a4:7c:6c:c7:2f:d9:a6:bd:ec:1b:2f:e8:3d:40:18': 'elided-pkcs'
        }
    };

    transform.add(args, function (err, res) {
        t.strictEqual(2, res.queue.length);
        res.exec(function () {
            REDIS.get(key, function (err, res) {
                t.deepEqual(value, JSON.parse(res));
                t.done();
            });
        });
    });
});


test('delete', function (t) {
    var entry = {
        'dn': 'changenumber=37, cn=changelog',
        'controls': [],
        'targetdn': 'fingerprint=fp, ' +
            'uuid=1a940615-65e9-4856-95f9-f4c530e86ca4, ' +
            'ou=users, o=smartdc',
        'changetype': 'delete',
        'objectclass': 'changeLogEntry',
        'changetime': '2013-12-19T00:58:06.772Z',
        'changes': {
            'name': [
                'newkeyname'
            ],
            'objectclass': [
                'sdckey'
            ],
            'openssh': [
                'elided-openssh'
            ],
            'pkcs': [
                'elided-pkcs'
            ],
            'fingerprint': [
                '7b:a4:7c:6c:c7:2f:d9:a6:bd:ec:1b:2f:e8:3d:40:18'
            ],
            '_owner': [
                '1a940615-65e9-4856-95f9-f4c530e86ca4'
            ],
            '_parent': [
                'uuid=1a940615-65e9-4856-95f9-f4c530e86ca4, ou=users, o=smartdc'
            ]
        },
        'changenumber': '37'
    };

    var args = {
        changes: entry.changes,
        entry: entry,
        log: this.log,
        redis: REDIS
    };

    var key = '/uuid/1a940615-65e9-4856-95f9-f4c530e86ca4';
    transform.delete(args, function (err, res) {
        t.strictEqual(2, res.queue.length);
        res.exec(function () {
            REDIS.get(key, function (err, res) {
                t.equal(JSON.parse(res).keys.fp, undefined);
                t.done();
            });
        });
    });
});