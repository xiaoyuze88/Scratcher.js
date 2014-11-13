require.config({
    paths: {
        'Scratcher': '../src/scratcher'
    }
});

require(['Scratcher'], function(Scratcher) {
    var scratcher = new Scratcher({
        selector: '#canvas',
        imgUrl: 'cat2.jpg',
        onLoadFinish: function() {
            console.log("load finish");
        },
        onScratch: function() {
            console.log("scratching");
        },
        onScratchFinish: function() {
            console.log("finish");
        },
        // useFakeCaculate : true
        // weight : 
        // startRightNow : true
    });

    scratcher.start();

})
