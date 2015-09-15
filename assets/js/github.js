
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

function trim(comment, size) {

    if (comment != null) {
        if (comment.length > size) {
            return comment.substring(0, size) + '...';
        }
    }
    return comment;
}

function composeMessage(pushEvent) {

    var message= "<time class='timeago' datetime='" + pushEvent.created_at + "'>" + pushEvent.created_at + "</time>";
    message+= "<div>" + pushEvent.actor.login + " pushed to " + branch(pushEvent) + " at " + pushEvent.repo.name + "</div>";
    message+= "<ul id='commits'>";

    $.each(pushEvent.payload.commits, function(index, commit) {
        message+= "<li><span class='sha'>" + commit.sha.substring(0, 6) + "</span> <span title='" + commit.message + "'>" + trim(commit.message, 35) + "</span></li>";
    });
    message+="</ul>";
    return message;

    /*
     pushed to {{{branchLink}}}{{{repoLink}}}<br>\
     <ul class="gha-commits">{{#payload.commits}}<li><small>{{{committerGravatar}}} {{{shaLink}}} {{message}}</small></li>{{/payload.commits}}</ul>\
     <small class="gha-message-commits">{{{commitsMessage}}}</small>
     */
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
