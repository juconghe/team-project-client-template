var token = 'eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSJ9';

var users = [
    'eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSJ9',
    'eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMiJ9',
    'eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMyJ9',
    'eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwNCJ9',
    'eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwNSJ9',
    'eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwNiJ9'
];

export function toLength24String(user_id) {
    var id = "" + user_id;
    var string24 = "";
    for (var j = 24 - id.length; j > 0; j--) {
        string24 += "0";
    }
    return (string24 + id);
}

export function tripOff0s(length24String) {
    var id = "";
    var i = 0;
    for (; i < length24String.length; i++) {
        if (length24String.charAt(i) !== '0') {
            break;
        }
    }
    return length24String.slice(i, length24String.length);
}

export function changeToken(user_id) {
    token = users[user_id - 1];
    console.log('User Id::' + user_id + ' Token::' + token);
}
/**
 * Properly configure+send an XMLHttpRequest with error handling,
 * authorization token, and other needed properties.
 */
function sendXHR(verb, resource, body, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open(verb, resource);
    // xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    // The below comment tells ESLint that FacebookError is a global.
    // Otherwise, ESLint would complain about it! (See what happens in Atom if
    // you remove the comment...)

    /*global ExServError */
    // Response received from server. It could be a failure, though!
    xhr.addEventListener('load', function() {
        var statusCode = xhr.status;
        var statusText = xhr.statusText;
        if (statusCode >= 200 && statusCode < 300) {
            // Success: Status code is in the [200, 300) range.
            // Call the callback with the final XHR object.
            cb(xhr);
        } else {
            // Client or server error.
            // The server may have included some response text with details concerning // the error.
            var responseText = xhr.responseText;
            ExServError('Could not ' + verb + " " + resource + ": Received " +
                statusCode + " " + statusText + ": " + responseText);
        }
    });
    // Time out the request if it takes longer than 10,000
    // milliseconds (10 seconds)
    xhr.timeout = 10000;
    // Network failure: Could not connect to server.
    xhr.addEventListener('error', function() {
        ExServError('Could not ' + verb + " " + resource +
            ": Could not connect to the server.");
    });

    // Network failure: request took too long to complete.
    xhr.addEventListener('timeout', function() {
        console.log('Could not ' + verb + " " + resource +
            ": Request timed out.");
    });

    switch (typeof(body)) {
        case 'undefined':
            xhr.send();
            break;
        case 'string':
            // Tell the server we are sending text.
            xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
            xhr.send(body);
            break;
        case 'object':
            // Tell the server we are sending JSON.
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            // Convert body into a JSON string.
            xhr.send(JSON.stringify(body));
            break;
        default:
            throw new Error('Unknown body type: ' + typeof(body));
    }
}

export function getFeedData(user, type, cb) {
    sendXHR('GET', '/user/' + user + '/feed/' + type, undefined, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    });
}

export function postStatusUpdate(user, contents, type, cb) {
    sendXHR('POST', '/feeditem/' + type, {
        "author": user,
        "request": contents.title,
        "contents": contents.value,
        "imgUrl": contents.imgUrl,
        "category": contents.category
    }, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    });
}


export function deleteFeed(userId, feedItemId, type, cb) {
    sendXHR('DELETE', '/user/' + userId + '/feed/' + type + '/' + feedItemId, undefined, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    });
}
/**
 * Searches for feed items with the given text.
 */
export function searchForFeedItems(userId, queryText, cb) {
    // userID is not needed; it's included in the JSON web token.
    sendXHR('POST', '/search', queryText, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    });
}


export function likeFeedItem(feedItemId, userId, cb) {
    sendXHR('PUT', '/feeditem/' + feedItemId + '/likelist/' + userId, undefined, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    });
}

export function unlikeFeedItem(feedItemId, userId, cb) {
    sendXHR('DELETE', '/feeditem/' + feedItemId + '/likelist/' + userId, undefined, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    });
}

export function increaseViewCount(feedItemId, cb) {
    sendXHR('PUT', '/feeditem/' + feedItemId, undefined, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    });
}


// Get user's setting.
export function getUserSetting(userId, cb) {
    sendXHR('GET', '/config/' + userId, undefined, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    });
}

// Update user's setting.
export function updateUserSetting(data, cb) {
    sendXHR('PUT', '/config/' + data.user_id, {
        "userId": data.user_id,
        "username": data.username,
        "password": data.password,
        "email": data.email
    }, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    });
}


// Get all information about the user.
export function getUserData(user_id, cb) {
    sendXHR('GET', '/user/' + user_id + '/profile/', undefined, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    });
}

export function getClassData(classId) {
    sendXHR('GET', '/user/1/class/' + classId, undefined, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    });
}

// Save new user profile information.
export function saveUserData(info, cb) {
    sendXHR('PUT', '/user/' + info.user_id + '/profile', {
        "first_name": info.first_name,
        "last_name": info.last_name,
        "profilepic": info.profilepic,
        "favorite_quote": info.favorite_quote,
        "areas_of_interest": info.areas_of_interest,
        "classes_taken": info.classes_taken,
        "education_level": info.education_level,
        "academic_institution": info.academic_institution
    }, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    });
}




/*
function getScheduleItemSync(scheduleItem) {
//  console.log(scheduleItem);
  scheduleItem._id = readDocument('users',scheduleItem._id);
  var userData = readDocument('users', scheduleItem.contents.party);
  scheduleItem.contents.party = userData.first_name;
    return scheduleItem;
}
*/

export function getScheduleData(userId, cb) {
    sendXHR('GET', '/schedule/' + userId, undefined, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    });
}

export function postSchedule(contents, cb) {
    //  console.log(contents);
    sendXHR('POST', '/schedule', {
        "completed": "COMPLETED",
        "author": contents.author,
        "time": contents.time,
        "subscriber": contents.subscriber,
        "date": contents.date,
        "serviceContents": contents.serviceContents
    }, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    });
}

export function deleteSchedule(userId, scheduleId, cb) {
    sendXHR('DELETE', '/schedule/' + userId + '/' + scheduleId, undefined, (xhr) => {
        cb();
    });
}



// Get a list of user's short profiles.
export function getParticipantProfiles(box_msg_id, cb) {
    sendXHR('GET', '/messagebox/' + box_msg_id + '/participantlist', undefined, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    });
}

// Get the message box by its id.
export function getMessageBoxServer(box_msg_id, cb) {
    sendXHR('GET', '/messagebox/' + box_msg_id, undefined, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    });
}

// Client send message to the message box.
export function sendMessageServer(box_msg_id, user_id, content, cb) {
    sendXHR('POST', '/messagebox/' + box_msg_id + '/send/' + user_id, {
        "content": content
    }, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    });
}

// Get numberOfBoxes recent message boxes participated by the user.
export function getRecentMessageBoxes(userId, numberOfBoxes, cb) {
    sendXHR('GET', '/users/' + userId + '/recentmsgboxes/' + numberOfBoxes, undefined, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    });
}

// Create a new message box.
export function createMessageBox(userId, cb) {
    // console.log("Created!!!");
    sendXHR('PUT', '/messagebox/create/' + userId, undefined, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    });
}

// Add a user into a message box.
export function joinMessageBox(box_msg_id, userId, cb) {
    sendXHR('PUT', '/messagebox/' + box_msg_id + '/add/' + userId, undefined, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    });
}

export function resetDatabase() {
    sendXHR('POST', "/resetdb", undefined, () => {
        location.reload(true);
    });
}

export function getCommentData(commentId, userId, cb) {
    sendXHR('GET', '/comment/' + commentId + '/' + userId, undefined, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    })
}

export function postComment(feedItemId, content, userId, cb) {
    sendXHR('POST', '/feed/' + feedItemId + '/comment/' + userId, content, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    })
}

export function getRequstFeeds(user, cb) {
    console.log("getting feed for request page");
    sendXHR('GET', '/user/' + user + '/requests', undefined, (xhr) => {
        cb(JSON.parse(xhr.responseText));
    })
}
