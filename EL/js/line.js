$(document).ready(function() {

	httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'http://127.0.0.1:8080', true);
    httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === httpRequest.DONE) {
            if(httpRequest.status === 200) {
                var jsonArray = JSON.parse(httpRequest.responseText);
                console.log("Received JSON Array", jsonArray);

				/*function loadScript(event){
					datasets = event.datasets
					var script2 = document.createElement("script");
					script2.src = "./newjs/line.js";
					document.body.appendChild(script2);
					for(const [key, value] of Object.entries(processed_pred)){
						datasets.push({
							label: key+"_PRED",
							data: value,
							backgroundColor : "#000000",
							borderColor : "#000000",
							fill : false,
							lineTension : 0,
							pointRadius : 5
						});
						i = i + 1;
					}
					var chart = new Chart( ctx, {
						type : "line",
						data : data,
						options : options
					});
					location.reload();
				}

				var button = document.querySelector("Predict");
				button.addEventListener("click", loadScript);
				button.dataset = datasets*/

				received_data = jsonArray['data']
				received_pred = jsonArray['pred']
				processed_data = {}
				processed_pred = {}
				time_start = received_data['ALL'][0][0]
				time_end = received_data['ALL'].at(-1)[0] //+ received_pred['ALL'].length
				data_time_end = received_data['ALL'].at(-1)[0]

				labels = []
				for(sample of received_data['ALL']){
					labels.push(sample[0])
				}
				console.log("Labels: ", labels)

				delete received_data['ALL']
				delete received_pred['ALL']

				for(const [key, time_series] of Object.entries(received_data)){
					processed_data[key] = []
					for(const [time_attr, value] of time_series){
						processed_data[key].push(value)
					}
				}

				for(const [key, time_series] of Object.entries(received_pred)){
					processed_pred[key] = []
					for(let i=0; i<data_time_end-time_start; i++){
						processed_pred[key].push(null)
					}
					processed_pred[key].push(processed_data[key].at(-1))
					for(const value of time_series){
						processed_pred[key].push(value[0])
					}
				}

				console.log("Processed Data: ", processed_data)
				console.log("Processed Predictions: ", processed_pred)
				
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
				for(var i=0;i<Object.keys(processed_data).length;i++)
					bgColor.push(bgChoice[i%5]);
				
				var borderColor = [];
				for(var i=0;i<Object.keys(processed_data).length;i++)
					borderColor.push(borderChoice[i%5]);
				
				/*var countries = [];
				var countryData = {};
				for(var i=0;i<jsonArray[0].length;i++){
					if(countries.includes(jsonArray[1][i]) == false){
						countries.push(jsonArray[1][i]);
						countryData[jsonArray[1][i]] = [];
					}
					else {
						countryData[jsonArray[1][i]].push(parseFloat(jsonArray[0][i]));
					}
				}*/

				var dataArray = [];
				var datasets = [];
				var i = 0;

				for(const [key, value] of Object.entries(processed_data)){
					datasets.push({
						label: key,
						data: value,
						backgroundColor : bgColor[i],
						borderColor : borderColor[i],
						fill : false,
						lineTension : 0,
						pointRadius : 5
					})
					i = i + 1;
				}

				/*for(const [key, value] of Object.entries(processed_pred)){
					datasets.push({
						label: key+"_PRED",
						data: value,
						backgroundColor : "#000000",
						borderColor : "#000000",
						fill : false,
						lineTension : 0,
						pointRadius : 5
					})
					i = i + 1;
				}*/

				console.log("Dataset: ", datasets)
				
				/*labels= [];
				for(var i=time_start;i<=time_end;i++)
					labels.push(i);*/
				var ctx = $("#line-chartcanvas");

				var data = {
					labels : labels,
					datasets : datasets
				};

			
				var options = {
					title : {
						display : true,
						position : "top",
						text : "Time Series",
						fontSize : 18,
						fontColor : "#111"
					},
					legend : {
						display : true,
						position : "bottom"
					}
				};
			
			
				var chart = new Chart( ctx, {
					type : "line",
					data : data,
					options : options
				} );
			}
        }
    };
    httpRequest.send();

});