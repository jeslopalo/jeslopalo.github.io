
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

function pushedCommitsLink(pushEvent) {
    var size= pushEvent.payload.commits.length;
    var url= "https://github.com/" + pushEvent.repo.name + "/compare/" + pushEvent.payload.before.substring(0, 10) + "..." + pushEvent.payload.commits[size - 1].sha.substring(0, 10);
    var count= size - COMMOT_LIMIT;

    return "<a href='" + url + "'>" + count + " more commit &gt;&gt;</a>";
}

var COMMOT_LIMIT= 2;
function composeMessage(pushEvent) {

    var message= "<time class='timeago' datetime='" + pushEvent.created_at + "'>" + pushEvent.created_at + "</time>";
    message+= "<div><span class='prompt'>" + repositoryLink(pushEvent) + " $ </span>git log --oneline</div>";

    message+= "<ul id='commits'>";
    $.each(pushEvent.payload.commits,
        function(index, commit) {
            if(index < COMMOT_LIMIT) {
                message+= "<li><span class='sha'>" + commitLink(pushEvent, commit) + "</span>&nbsp;<span title='" + _.escape(commit.message) + "'>" + _.escape(trim(commit.message, 50)) + "</span></li>";
            }
        }
    );
    if( pushEvent.payload.commits.length > COMMOT_LIMIT ) {
        message+= "<li>" + pushedCommitsLink(pushEvent) + "</li>";
    }
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
