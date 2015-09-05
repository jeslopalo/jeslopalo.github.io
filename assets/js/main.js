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
});