import mysql.connector
from sklearn.preprocessing import MinMaxScaler
from keras import models, layers, callbacks
from keras.optimizers.legacy.adam import adam
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
from tinydb import TinyDB, Query
import os
from keras.models import load_model
import datetime
from decimal import Decimal

DATABASE = 'generic_db'
TABLE = 'data'
#TABLE = 'canada_covid'
BATCH_SIZE = 10
NUM_COUNTRIES_FOR_LINE = 10
pred_attr = 'value'
#pred_attr = 'totalcases'
group_attr = 'country'
#group_attr = 'prname'

db_connection = mysql.connector.connect(host="localhost", user="root", password="12345", database=DATABASE)
db_cursor = db_connection.cursor()

Path(f"{DATABASE}").mkdir(parents=True, exist_ok=True)
db = TinyDB(f'{DATABASE}/models.json')
predictions = {}
time_col = None

db_cursor.execute(f"describe {TABLE}")
res = db_cursor.fetchall()
for attribute in res:
    name = attribute[0].casefold()
    if name=='year' or name=='date' or name=='time' or name=='t' or name =='hours' or name=='hour' or name=='hr' \
       or name=='h' or name =='minutes' or name =='minute' or name =='min' or name =='m' or name =='seconds' \
       or name =='second' or name =='sec' or name =='s' or name=='years' or name=='day':
        print("Found time series data. Performing predictive analysis")
        time_col = name
        '''pred_attr_list = []
        for attr in res:
            attr_dtype = attr[1]
            if attr_dtype == 'float':
                pred_attr_list.append(attr[0])'''
        db_cursor.execute(f'select count(*) from {TABLE}')
        res = db_cursor.fetchall()
        db_len = res[0][0]

        col = pred_attr
        '''for attr in pred_attr_list:
            cols = cols + ', ' + attr
        cols = cols[2:]'''
        #db_cursor.execute(f'select {cols} from {TABLE}')

        db_cursor.execute(f'select distinct {group_attr} from {TABLE}')
        global groups
        groups = db_cursor.fetchall()
        groups = [x[0] for x in groups]
        groups.insert(0, 'ALL')

        i = 0
        for group in groups:
            if i>NUM_COUNTRIES_FOR_LINE:
                break
            i = i+1

            pred = None
            q = Query()
            prev_pred = db.search((q.group==group) & (q.is_pred==True))
            print("PREVIOUS PREDICTION: ", prev_pred)
            if len(prev_pred)>0:
                pred = prev_pred[0]['pred']
            
            else:

                if group=='ALL':
                    db_cursor.execute(f'select sum({col}) from {TABLE} group by {name} order by {name};')
                else:
                    db_cursor.execute(f'select sum({col}) from {TABLE} where {group_attr}="{group}" group by {name} order by {name};')
                
                xt_train = db_cursor.fetchall()
                xt_train_temp = [list(ele) for ele in xt_train]
                xt_train = [ele[0] for ele in xt_train_temp]

                # we fit the scaler on only the train set
                scaler = MinMaxScaler()
                scaler.fit(xt_train_temp)
                xt_train = scaler.transform(xt_train_temp)
                xt_train = [x[0] for x in xt_train]

                timestep = 4
                num_features = 1
                sliding_window = 1

                xt_train_temp = []
                y_train_temp = []
                for index in range(0, len(xt_train)-timestep, sliding_window):
                    xt_train_temp.append(np.array(xt_train[index: index+timestep]))
                    y_train_temp.append(xt_train[index+timestep])
                xt_train = np.array(xt_train_temp)
                xt_train = xt_train.reshape(xt_train.shape[0], xt_train.shape[1], 1)
                y_train = np.array(y_train_temp)

                print("Length of training data: ", len(y_train))

                model = None
                if os.path.exists(f'{DATABASE}/{group}'):
                    model = load_model(f'{DATABASE}/{group}')
                
                else:

                    model = models.Sequential()
                    model.add(layers.GRU(1, return_sequences=True, input_shape=(timestep, num_features)))
                    model.add(layers.GRU(1))
                    model.add(layers.Dense(1, activation='elu'))

                    print("Model summary")
                    model.summary()
                    optimizer = adam.Adam()
                    model.compile(optimizer=optimizer, loss='mse')

                    early_stop_callback = callbacks.EarlyStopping(monitor='loss',
                                                                min_delta=1e-7,
                                                                patience=5,
                                                                verbose=1,
                                                                mode="min",
                                                                restore_best_weights=True)
                    history = model.fit(x=xt_train,
                                        y=y_train,
                                        epochs=100,
                                        callbacks=[early_stop_callback])
                    
                    #plotting loss
                    '''loss = history.history['loss']
                    epochs = range(len(loss))
                    plt.figure()
                    plt.plot(epochs, loss, 'b', label='Training loss')
                    plt.title('Training loss')
                    plt.legend()
                    plt.show()'''

                    model.save(f'{DATABASE}/{group}', overwrite=True, include_optimizer=True)
                    db.insert({'group': f'{group}', 'model': f'{DATABASE}/{group}'})

                pred = scaler.inverse_transform(model.predict(xt_train[-1]))
                pred = pred.tolist()
                db.insert({'group': f'{group}', 'pred': pred, 'is_pred': True})

            predictions[group] = pred

        break

print("Predictive Analysis Complete")

og_data = {}
i=0
for group in groups:
    if i>NUM_COUNTRIES_FOR_LINE:
        break
    i = i+1
    if group=='ALL':
        db_cursor.execute(f'select {time_col}, sum({col}) from {TABLE} group by {name} order by {name};')
    else:
        db_cursor.execute(f'select {time_col}, sum({col}) from {TABLE} where {group_attr}="{group}" group by {name} order by {name};')
    retval = db_cursor.fetchall()
    og_data[group] = retval

returned_data = {'pred': predictions, 'data': og_data}

def serialize_datetime(obj):
    if isinstance(obj, datetime.datetime) or isinstance(obj, datetime.date):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return str(obj)
    raise TypeError(f"Type not serializable. Object is of type {type(obj)}")

from http.server import BaseHTTPRequestHandler, HTTPServer
import json

class CustomRequestHandler(BaseHTTPRequestHandler):
    server_data = returned_data

    def _set_response(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

    def do_GET(self):
        print(f"GET request,\nPath: {str(self.path)}\nHeaders:\n{str(self.headers)}\n")
        self._set_response()
        
        if CustomRequestHandler.server_data is not None:
            self.wfile.write(json.dumps(CustomRequestHandler.server_data, default=serialize_datetime).encode('utf-8'))
        else:
            self.wfile.write("".encode('utf-8'))

def run(server_class=HTTPServer, handler_class=CustomRequestHandler, port=8080):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print('Starting http server at port', port)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    print("\n")
    print('Stopping http server\n')

run()