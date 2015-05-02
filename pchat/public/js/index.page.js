function doMinutesGraph() {
    $('#morris-area-chart').empty();
    Morris.Area({
        element: 'morris-area-chart',
        data: morrisTimeData,
        xkey: 'period',
        ykeys: ['totalTime'],
        labels: ['Total Time'],
        pointSize: 2,
        hideHover: 'auto',
        resize: true,
        xLabels: "day",
        postUnits: " mins"
    });
}

function doEffortGraph() {
    $('#morris-area-chart').empty();
    Morris.Area({
        element: 'morris-area-chart',
        data: morrisEffortData,
        xkey: 'period',
        ykeys: ['power', 'pps'],
        labels: ['Average Power', 'Average Pulses/sec'],
        pointSize: 2,
        hideHover: 'auto',
        resize: true,
        xLabels: "day",
        yLabelFormat: function(y) { return y.toFixed(2); }
    });
}

$(document).ready(function() {

    doMinutesGraph();

    $("#minutes-graph-select").click(function (evt) {
        doMinutesGraph();
        evt.preventDefault();
    });

    $("#effort-graph-select").click(function (evt) {
        doEffortGraph();
        evt.preventDefault();
    });
});
