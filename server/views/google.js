module.exports = function render(content) {

    if (!content || !content["pageInfo"]) {
        return {
            up: false,
            url: ""
        }
    }

    return {
        up: content["pageInfo"]["totalResults"] > 0 ? true : false || false,
        url: content['items'].length > 0 ?
            `https://youtube.com/watch?v=${content["items"][0]["id"]["videoId"]}` : ""
    };
}