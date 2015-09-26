$(document).foundation();


function animateNavbar() {

    var masthead = $('.masthead').add('.masthead-home');

    if(masthead.length == 0) {
        setOpacity(true);
        $('main').animate({ 'padding-top': '80px' }, 500);
    }
    else{
        $(window).scroll(function() {
            setOpacity( $(window).scrollTop() > 80 );
        });
        setOpacity( $(window).scrollTop() > 80 );
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

//Sticky footer
function stickyFooter() {

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
}

//Main min height
function mainMinHeight() {

    $(window).bind("load resize", function () {
        var main = $("main");
        var navigationHeight= $("#navigation").height();
        var windowHeight= $(window).height();

        var height= windowHeight - navigationHeight;
        if ( height > 0 ) {
            main.css({
                "min-height" : height + "px"
            });
        }
    });
}

//
function activateTimeAgo() {
    jQuery.timeago.settings.allowFuture = true;
    $("time.timeago").timeago();
}

$(function() {
    animateNavbar();
    upToTopButton();
    mainMinHeight();

    stickyFooter();
    githubLastCommit("jeslopalo", "#github-last-push");
    activateTimeAgo();
});
