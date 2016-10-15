var IdentityDemo = function() {
}

IdentityDemo.authenticate = function(username, password, callback) {
    callback(null, {UUID: "00000000-0000-0000-0000-000000000000",
                    username: "Identity Demo"});
}

IdentityDemo.findUserByName = function(username, callback) {
    callback(null, {UUID: "00000000-0000-0000-0000-000000000000",
                    username: username});
}

IdentityDemo.findUserById = function(userId, callback) {
    callback(null, {UUID: userId,
                    username: "Identity Demo " + userId});
}

IdentityDemo.findUsersById = function(userIdList, callback) {
    var retUsers = {};

    for (var i = 0, len = userIdList.length; i < len; i++) {
        retUsers[userIdList[i]] = {UUID: userIdList[i],
                                    username: "Identity Demo " + userIdList[i]};
    }

    callback(null, retUsers);
}

module.exports = IdentityDemo;
