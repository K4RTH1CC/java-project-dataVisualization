$(document).ready(function () {

	httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'http://127.0.0.1:8000/data', true);
    httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === httpRequest.DONE) {
            if(httpRequest.status === 200) {
                var jsonArray = JSON.parse(httpRequest.responseText);
                console.log(jsonArray);
				
				var bgColor = [];
				for(var i=0;i<jsonArray[0].length;i++)
					bgColor.push("rgba(10, 20, 30, 0.3)");
				
				var borderColor = [];
				for(var i=0;i<jsonArray[0].length;i++)
					borderColor.push("rgba(10, 20, 30, 1)");

				var ctx = $("#bar-chartcanvas");
				var data = {
					labels : jsonArray[1],
					datasets : [
						{
							label : "Value of Imported Goods",
							data : jsonArray[0],
							backgroundColor : bgColor,
							borderColor : borderColor,
							borderWidth : 1
						},
					]
				};
				var options = {
					title : {
						display : true,
						position : "top",
						text : "Histogram",
						fontSize : 18,
						fontColor : "#111"
					},
					legend : {
						display : true,
						position : "bottom"
					},
					scales : {
						yAxes : [{
							ticks : {
								min : 0
							}
						}]
					}
				};
				var chart = new Chart( ctx, {
					type : "bar",
					data : data,
					options : options
				});
			}
        }
    };
    httpRequest.send();
});