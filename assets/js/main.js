$(document).foundation();


function animateNavbar() {

    var masthead = $('.masthead');
    var scrollTopThreshold= 60;

    if(masthead.length == 0) {
        setOpacity(true);
        $('main').animate({ 'padding-top': '80px' }, 500);
    }
    else{
        $(window).scroll(function() {
            var scrolled = $(window).scrollTop() > scrollTopThreshold;

            setOpacity(scrolled);
            blurMasthead(scrolled)
        });
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
}


//
function activateTimeAgo() {
    jQuery.timeago.settings.allowFuture = true;
    $("time.timeago").timeago();
}


function calculateBackgroundHeight() {
    var $w = $(window),
        $background = $('#background');

    // Fix background image jump on mobile
    if ((/Android|iPhone|iPad|iPod|BlackBerry/i).test(navigator.userAgent || navigator.vendor || window.opera)) {
        $background.css({'top': 'auto', 'bottom': 0});
        $w.resize(sizeBackground);
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
    githubLastCommit("jeslopalo", "#github-last-push");
    activateTimeAgo();
});
