
function twitterLastTweet(id, domId) {
    var config = {
        "id": id,
        "domId": domId,
        "maxTweets": 1,
        "enableLinks": true,
        "showUser": false,
        "customCallback": handleLastTweet,
        "dateFunction": dateFormatter
    };

    twitterFetcher.fetch(config);
}

function handleLastTweet(tweets) {
    if(tweets.length == 1) {
        var timePosted= $("<div>" + tweets[0] + "</div>").find("p.timePosted a").text();
        var tweetUrl= $("<div>" + tweets[0] + "</div>").find("p.timePosted a").attr("href");

        var tweet= $("<div>" + tweets[0] + "</div>").find("p.tweet").html();

        $('#twitter-last-tweet')
            .append("<a href='" + tweetUrl + "'><time class='timePosted timeago' datetime='" + timePosted + "'>" + timePosted + "</time></a>")
            .append("<div class='tweet'>" + tweet + "</div>");

        if(jQuery.timeago) {
            $("#twitter-last-tweet time").timeago($("#twitter-last-tweet time[datetime]").val());
        }
    }
}

function dateFormatter(date) {
    return date.toISOString();
}
