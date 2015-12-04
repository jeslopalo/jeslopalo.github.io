$(document).foundation();

function throttle(func) {
    return _.throttle(func, 300);
}

function animateNavbar() {

    var masthead = $('.masthead');
    var scrollTopThreshold= 30;

    if(masthead.length == 0) {
        setOpacity(true);
        $('main').animate({ 'padding-top': '80px' }, 500);
    }
    else{

        var throttledScroll= throttle(function() {
            var scrolled = $(window).scrollTop() > scrollTopThreshold;

            setOpacity(scrolled);
            blurMasthead(scrolled)
        });
        $(window).scroll(throttledScroll);

        var scrolled = $(window).scrollTop() > scrollTopThreshold;
        setOpacity(scrolled);
        blurMasthead(scrolled)
    }
}

function blurMasthead(blur) {
    if (blur) {
        $("#background").addClass("blurred");
    } else {
        $("#background").removeClass("blurred");
    }
}

function setOpacity(opaque) {
    if (opaque) {
        $('#navigation').addClass('opaque').removeClass('transparent');
    } else {
        $('#navigation').removeClass('opaque').addClass('transparent');
    }
}

//
function upToTopButton() {

    var scrollThreshold= 100;
    // hide or show #up-to-top first
    if( $(window).scrollTop() > scrollThreshold ) {
        $("#up-to-top").fadeIn();
    } else {
        $("#up-to-top").fadeOut();
    }

    // fade in #up-to-top
    $(function () {

        var throttledScroll = throttle(function () {
            if ($(this).scrollTop() > scrollThreshold) {
                $('#up-to-top').fadeIn();
            } else {
                $('#up-to-top').fadeOut();
            }
        });
        $(window).scroll(throttledScroll);

        // scroll body to 0px on click
        $('#up-to-top').click(function () {
            $('body,html').animate({
                scrollTop: 0
            }, 800);
            return false;
        });
    });

    $(window).scroll();
}

function downToContentButton() {
    $("#down-to-content a").click(function() {
        var navigationHeight= $("#navigation").height();
        var position= $("#content").offset().top - navigationHeight;

        $('body,html').animate({
            scrollTop: position > 0 ? position : 0
        }, 800);
        return false;
    });
}

//
function activateTimeAgo() {
    jQuery.timeago.settings.allowFuture = true;
    $("time.timeago").timeago();
}


function calculateBackgroundHeight() {
    var $w = $(window);
    var $background = $('#background');

    // Fix background image jump on mobile
    if ((/Android|iPhone|iPad|iPod|BlackBerry/i).test(navigator.userAgent || navigator.vendor || window.opera)) {
        $background.css({'top': 'auto', 'bottom': 0});
        $w.resize(throttle(sizeBackground));
        sizeBackground();
    }

    function sizeBackground() {
        $background.height(screen.height);
    }
}

$(function() {
    calculateBackgroundHeight();
    animateNavbar();

    upToTopButton();
    downToContentButton();

    _.defer(function() {
        githubLastCommit("jeslopalo", "#github-last-push");
        twitterLastTweet("644878478307893249", "twitter-last-tweet");
        activateTimeAgo();
    });
});
