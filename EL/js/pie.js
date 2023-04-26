$(document).ready(function () {

	httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'http://127.0.0.1:8000/data', true);
    httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === httpRequest.DONE) {
            if(httpRequest.status === 200) {
                var jsonArray = JSON.parse(httpRequest.responseText);
                console.log(jsonArray);
				
				var bgChoice = [
					"#DEB887",
					"#A9A9A9",
					"#DC143C",
					"#F4A460",
					"#2E8B57"
				];
				var borderChoice = [
					"#CDA776",
					"#989898",
					"#CB252B",
					"#E39371",
					"#1D7A46"
				];

				var bgColor = [];
				for(var i=0;i<jsonArray[0].length;i++)
					bgColor.push(bgChoice[i%5]);
				
				var borderColor = [];
				for(var i=0;i<jsonArray[0].length;i++)
					borderColor.push(borderChoice[i%5]);
				
				var countries = [];
				var countryData = {};
				for(var i=0;i<jsonArray[0].length;i++){
					if(countries.includes(jsonArray[1][i]) == false){
						countries.push(jsonArray[1][i]);
						countryData[jsonArray[1][i]] = 0;
					}
					else {
						countryData[jsonArray[1][i]] += parseFloat(jsonArray[0][i]);
					}
				}

				dataArray = [];
				for(const [key, value] of Object.entries(countryData))
					dataArray.push(value);
				
					console.log(countries);
					console.log(countryData);

				var ctx = $("#pie-chartcanvas-1");

				var data = {
					labels : countries,
					datasets : [
						{
							label : "Value of imported goods",
							data : dataArray,
							backgroundColor : bgColor,
							borderColor : borderColor,
							borderWidth : 1
						}
					]
				};
			
				var options = {
					title : {
						display : true,
						position : "top",
						text : "Pie",
						fontSize : 18,
						fontColor : "#111"
					},
					legend : {
						display : true,
						position : "bottom"
					}
				};
			
			
				var chart = new Chart( ctx, {
					type : "pie",
					data : data,
					options : options
				});
			}
        }
    };
    httpRequest.send();

});