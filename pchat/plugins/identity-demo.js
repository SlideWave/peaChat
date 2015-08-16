var IdentityDemo = function() {
}

IdentityDemo._staticUser = {UUID: "00000000-0000-0000-0000-000000000000",
                            username: "Identity Demo"};

IdentityDemo.authenticate = function(username, password, callback) {
    callback(null, IdentityDemo._staticUser);
}

IdentityDemo.findUserByName = function(username, callback) {
    callback(null, IdentityDemo._staticUser);
}

IdentityDemo.findUserById = function(userId, callback) {
    callback(null, IdentityDemo._staticUser);
}

IdentityDemo.findUsersById = function(userIdList, callback) {
    var retUsers = {};

    for (var i = 0, len = userIdList.length; i < len; i++) {
        retUsers[i] = IdentityDemo._staticUser;
    }

    callback(null, retUsers);
}

module.exports = IdentityDemo;
