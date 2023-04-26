httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', 'http://127.0.0.1:5000/', true);
        httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        httpRequest.onreadystatechange = function(){
            if(httpRequest.readyState === httpRequest.DONE) {
                if(httpRequest.status === 200) {
                    console.log(httpRequest.responseText)
                }
            }
        };
        httpRequest.send();