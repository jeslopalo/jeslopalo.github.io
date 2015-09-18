
function trim(comment, size) {

    if (comment != null) {
        if (comment.length > size) {
            return comment.substring(0, size) + '...';
        }
    }
    return comment;
}

function userLink(username) {
    return "<a href='https://github.com/" + username + "'>" + username + "</a>";
}

function branch(pushEvent) {
    // Get the branch name if it exists.
    if (pushEvent.payload.ref) {
        if (pushEvent.payload.ref.substring(0, 11) === 'refs/heads/') {
            return pushEvent.payload.ref.substring(11);
        } else {
            return pushEvent.payload.ref;
        }
    }
}

function branchLink(pushEvent) {
    var branchName= branch(pushEvent);
    var url= "https://github.com/" + pushEvent.repo.name + "/tree/" + branchName;

    return "<a href='" + url + "'>" + branchName + "</a>"
}

function repositoryLink(pushEvent) {
    var url= "https://github.com/" + pushEvent.repo.name;

    return "<a href='" + url + "'>" + pushEvent.repo.name + "</a>"
}

function commitLink(pushEvent, commit) {
    var url= "https://github.com/" + pushEvent.repo.name + "/commit/" + commit.sha;

    return "<a href='" + url + "'>" + commit.sha.substring(0, 6) + "</a>"
}

function composeMessage(pushEvent) {

    var message= "<time class='timeago' datetime='" + pushEvent.created_at + "'>" + pushEvent.created_at + "</time>";
    message+= "<div><span class='prompt'>" + repositoryLink(pushEvent) + " $ </span>git log --oneline</div>";

    message+= "<ul id='commits'>";
    $.each(pushEvent.payload.commits, function(index, commit) {
        message+= "<li><span class='sha'>" + commitLink(pushEvent, commit) + "</span>&nbsp;<span title='" + commit.message + "'>" + trim(commit.message, 35) + "</span></li>";
    });
    message+="</ul>";
    return message;
}

function githubLastCommit(username, selector) {

    var userEvents= "https://api.github.com/users/" + username + "/events";
    $.getJSON(userEvents, function(events) {

        var pushEvents= $(events).filter(function(index, event) {
            return event.type == 'PushEvent';
        });

        if(pushEvents.length) {
            $(selector).append("<div>" + composeMessage(pushEvents[0]) + "</div>");

            if(jQuery.timeago) {
                $(selector + " time").timeago($(selector + " time[datetime]").val());
            }
        }
    });
}
