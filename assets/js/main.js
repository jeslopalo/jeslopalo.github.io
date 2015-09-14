$(document).foundation();

$(document).ready(function(){

    var scrollThreshold= 100;
    // hide or show #up-to-top first
    if( $(window).scrollTop() > scrollThreshold ) {
        $("#up-to-top").fadeIn();
    } else {
        $("#up-to-top").fadeOut();
    }

    // fade in #up-to-top
    $(function () {
        $(window).scroll(function () {
            if ($(this).scrollTop() > scrollThreshold) {
                $('#up-to-top').fadeIn();
            } else {
                $('#up-to-top').fadeOut();
            }
        });

        // scroll body to 0px on click
        $('#up-to-top').click(function () {
            $('body,html').animate({
                scrollTop: 0
            }, 800);
            return false;
        });
    });

    $(window).scroll();

    //Sticky footer
    $(window).bind("load resize", function () {
        var footer = $("#footer-content");
        var pos = footer.position();
        var height = $(window).height();
        height = height - pos.top;
        height = height - footer.height();
        if (height > 0) {
            footer.css({
                'margin-top': height + 'px'
            });
        }
    });
});

$(function() {
   $("time.timeago").timeago();
});

// Github last commits
$(function() {

    var userEvents= "https://api.github.com/users/jeslopalo/events";
    var selector= "#github-lastcommit code";

    $.getJSON(userEvents, function(events) {

        var pushEvents= $(events).filter(function(index, event) {
            return event.type == 'PushEvent';
        });

        if(pushEvents.length) {
            var commit= pushEvents[0].payload.commits[0];
            //$.each(pushEvents[0].payload.commits, function(index, commit) {
                $(selector).append("\n<span class='sha'>" + commit.sha.substring(0, 6) + "</span> " + commit.message.substring(0, 140));
            //});
        }
    });
});