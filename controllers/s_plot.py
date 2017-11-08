#
#-*- coding: utf-8 -*-
# 
# -------------------------------------------------------------------------
# 
# -------------------------------------------------------------------------

from gluon.tools import Service
service = Service(globals())

import matplotlib
matplotlib.use('agg')
import numpy as np
import skrf
import os

def call():
    """
    exposes services. for example:
    http://..../[app]/s_plot/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
    # session.forget()
    return service()


@service.json
def getLogMagnitude( ):
    """
    """
    # data = request.vars.file_data
    # data = data.replace("'","").strip()

    ext = ".s1p"
    for i in range(10):     # supports up to 10 port network
        if "S" + str(i) + "1" in session.file_data:
            ext = ".s" +str(i) + "p"
    fname = "temp_file" + ext
    fo = open(fname, "wb")
    fo.write( session.file_data )
    fo.close()
    try:
        n = skrf.Network( fname )   # pass in the file you just created
    except Exception as e:
        print(e)
    os.remove( fname )          # delete this file

    d = { 'f':                  n.f.tolist(),
          'number_of_ports':    int(n.number_of_ports)
          }
    for j in range(n.number_of_ports):      # j is second port
        for k in range(n.number_of_ports):  # k is first port
            tmp = []
            d["s"+str(j+1)+str(k+1)+"db"] = n.s_db[:,j,k].tolist()
    return response.json(d)


